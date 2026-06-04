"""Rotavirus A Genotyping Tool — local server with reference update capability."""

import os
import re
import json
import urllib.request
import urllib.parse
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
from threading import Thread

PORT = 8089
BASE_DIR = Path(__file__).parent
REF_DIR = BASE_DIR / "reference"

# Genotypes to fetch
VP7_GENOTYPES = ["G1", "G2", "G3", "G4", "G8", "G9", "G10", "G11", "G12"]
VP4_GENOTYPES = ["P[4]", "P[6]", "P[8]", "P[9]", "P[10]", "P[11]", "P[14]", "P[19]"]


def ncbi_search(term, retmax=5):
    """Search NCBI nucleotide database."""
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = urllib.parse.urlencode({
        "db": "nucleotide",
        "term": term,
        "retmax": str(retmax),
        "retmode": "json",
    })
    url = f"{base}?{params}"
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = json.loads(resp.read())
            return data.get("esearchresult", {}).get("idlist", [])
    except Exception as e:
        print(f"  Search failed for '{term}': {e}")
        return []


def ncbi_fetch_fasta(ids):
    """Fetch FASTA sequences by NCBI accession IDs."""
    if not ids:
        return ""
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    params = urllib.parse.urlencode({
        "db": "nucleotide",
        "id": ",".join(ids),
        "rettype": "fasta",
        "retmode": "text",
    })
    url = f"{base}?{params}"
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  Fetch failed: {e}")
        return ""


def parse_genotype_from_header(header, segment):
    """Extract genotype from NCBI sequence header."""
    if segment == "VP7":
        m = re.search(r'(G\d+)', header)
        return m.group(1) if m else None
    else:  # VP4
        m = re.search(r'P\[(\d+)\]', header)
        return f"P[{m.group(1)}]" if m else None


def update_references():
    """Download and organize reference sequences from NCBI."""
    REF_DIR.mkdir(parents=True, exist_ok=True)
    log = []

    # --- VP7 ---
    log.append("=== Updating VP7 references ===")
    vp7_all = {}
    for g in VP7_GENOTYPES:
        queries = [
            f"rotavirus+A+{g}+VP7+gene+complete",
            f"rotavirus+{g}+VP7+human",
        ]
        ids = []
        for q in queries:
            ids.extend(ncbi_search(q, 3))
            if len(ids) >= 3:
                break
        ids = list(dict.fromkeys(ids))  # dedupe, preserve order

        if not ids:
            log.append(f"  {g}: no sequences found")
            continue

        fasta = ncbi_fetch_fasta(ids[:5])
        seq_count = fasta.count(">")
        if seq_count == 0:
            log.append(f"  {g}: download failed")
            continue

        # Parse and organize
        current_header = None
        current_seq = ""
        for line in fasta.split("\n"):
            if line.startswith(">"):
                if current_header:
                    parsed = parse_genotype_from_header(current_header, "VP7")
                    if parsed:
                        vp7_all.setdefault(parsed, []).append((current_header, current_seq))
                current_header = line[1:].strip()
                current_seq = ""
            elif line.strip():
                current_seq += line.strip()
        if current_header:
            parsed = parse_genotype_from_header(current_header, "VP7")
            if parsed:
                vp7_all.setdefault(parsed, []).append((current_header, current_seq))

        log.append(f"  {g}: {seq_count} sequences downloaded")

    # Save VP7 files
    total_vp7 = 0
    for g, seqs in vp7_all.items():
        safe_g = g.replace("[", "").replace("]", "")
        filepath = REF_DIR / f"rva-vp7-{safe_g}.fa"
        with open(filepath, "w") as f:
            for h, s in seqs:
                f.write(f">{h}\n{s}\n")
        total_vp7 += len(seqs)
    log.append(f"  VP7 total: {total_vp7} sequences across {len(vp7_all)} genotypes")

    # --- VP4 ---
    log.append("=== Updating VP4 references ===")
    vp4_all = {}
    for p in VP4_GENOTYPES:
        p_num = re.search(r'\d+', p).group()
        queries = [
            f"rotavirus+VP4+P{p_num}+gene+complete",
            f"rotavirus+P[{p_num}]+VP4+human",
        ]
        ids = []
        for q in queries:
            ids.extend(ncbi_search(q, 3))
            if len(ids) >= 3:
                break
        ids = list(dict.fromkeys(ids))

        if not ids:
            log.append(f"  {p}: no sequences found")
            continue

        fasta = ncbi_fetch_fasta(ids[:5])
        seq_count = fasta.count(">")
        if seq_count == 0:
            log.append(f"  {p}: download failed")
            continue

        current_header = None
        current_seq = ""
        for line in fasta.split("\n"):
            if line.startswith(">"):
                if current_header:
                    parsed = parse_genotype_from_header(current_header, "VP4")
                    if parsed:
                        vp4_all.setdefault(parsed, []).append((current_header, current_seq))
                current_header = line[1:].strip()
                current_seq = ""
            elif line.strip():
                current_seq += line.strip()
        if current_header:
            parsed = parse_genotype_from_header(current_header, "VP4")
            if parsed:
                vp4_all.setdefault(parsed, []).append((current_header, current_seq))

        log.append(f"  {p}: {seq_count} sequences downloaded")

    # Save VP4 files
    total_vp4 = 0
    for p, seqs in vp4_all.items():
        safe_p = p.replace("[", "").replace("]", "")
        filepath = REF_DIR / f"rva-vp4-{safe_p}.fa"
        with open(filepath, "w") as f:
            for h, s in seqs:
                f.write(f">{h}\n{s}\n")
        total_vp4 += len(seqs)
    log.append(f"  VP4 total: {total_vp4} sequences across {len(vp4_all)} genotypes")

    # Generate manifest for the frontend
    manifest = {
        "vp7": [],
        "vp4": [],
    }
    for g in sorted(vp7_all.keys()):
        safe_g = g.replace("[", "").replace("]", "")
        manifest["vp7"].append({
            "genotype": g,
            "file": f"reference/rva-vp7-{safe_g}.fa",
            "count": len(vp7_all[g]),
        })
    for p in sorted(vp4_all.keys()):
        safe_p = p.replace("[", "").replace("]", "")
        manifest["vp4"].append({
            "genotype": p,
            "file": f"reference/rva-vp4-{safe_p}.fa",
            "count": len(vp4_all[p]),
        })
    with open(BASE_DIR / "manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)

    log.append(f"\nDone. Manifest written to manifest.json")
    log.append(f"Total: {total_vp7} VP7 + {total_vp4} VP4 = {total_vp7 + total_vp4} sequences")
    return "\n".join(log)


class UpdateHandler(SimpleHTTPRequestHandler):
    """Serves static files + handles /api/update endpoint."""

    def do_GET(self):
        if self.path.startswith("/api/update"):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            try:
                log = update_references()
                self.wfile.write(json.dumps({"ok": True, "log": log}).encode())
            except Exception as e:
                self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode())
            return
        super().do_GET()

    def log_message(self, format, *args):
        # quieter logging
        pass


if __name__ == "__main__":
    print(f"Rotavirus A Genotyping Tool")
    print(f"  http://localhost:{PORT}")
    print(f"  Reference dir: {REF_DIR}")
    print(f"  To update references: http://localhost:{PORT}/api/update")
    server = HTTPServer(("0.0.0.0", PORT), UpdateHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
