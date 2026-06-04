#!/usr/bin/env python3
"""
Rotavirus A Reference Sequence Downloader
Downloads reference sequences from NCBI GenBank for VP7 and VP4 genotypes.
"""

import os
import re
import json
import time
import urllib.request
import urllib.parse
import sys

# Reference directory
REF_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reference")

# NCBI API settings
NCBI_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
PROXY = "socks5://127.0.0.1:10808"

# Common rotavirus A genotypes
VP7_GENOTYPES = ["G1", "G2", "G3", "G4", "G8", "G9", "G10", "G11", "G12"]
VP4_GENOTYPES = ["P[4]", "P[6]", "P[8]", "P[9]", "P[10]", "P[11]", "P[14]", "P[19]"]

def search_ncbi(term, max_results=5):
    """Search NCBI and return IDs"""
    params = urllib.parse.urlencode({
        "db": "nucleotide",
        "term": term,
        "retmax": max_results,
        "retmode": "json"
    })
    url = f"{NCBI_BASE}/esearch.fcgi?{params}"
    
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read())
            return data.get("esearchresult", {}).get("idlist", [])
    except Exception as e:
        print(f"  Search error: {e}")
        return []

def fetch_fasta(ids):
    """Fetch FASTA sequences by ID"""
    if not ids:
        return ""
    
    id_str = ",".join(ids)
    params = urllib.parse.urlencode({
        "db": "nucleotide",
        "id": id_str,
        "rettype": "fasta",
        "retmode": "text"
    })
    url = f"{NCBI_BASE}/efetch.fcgi?{params}"
    
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as response:
            return response.read().decode("utf-8")
    except Exception as e:
        print(f"  Fetch error: {e}")
        return ""

def download_vp7_references():
    """Download VP7 reference sequences"""
    print("\n=== Downloading VP7 Reference Sequences ===")
    
    for genotype in VP7_GENOTYPES:
        print(f"\nSearching for {genotype}...")
        
        # Search with different query terms
        queries = [
            f"rotavirus+A+{genotype}+VP7+gene+complete",
            f"rotavirus+{genotype}+VP7+gene",
            f"rotavirus+VP7+{genotype}",
        ]
        
        all_ids = []
        for q in queries:
            ids = search_ncbi(q, 5)
            if ids:
                all_ids.extend(ids)
                break
        
        # Deduplicate
        all_ids = list(set(all_ids))
        
        if all_ids:
            print(f"  Found {len(all_ids)} sequences")
            fasta = fetch_fasta(all_ids[:5])  # Limit to 5 sequences
            
            if fasta:
                # Save to file
                filepath = os.path.join(REF_DIR, f"rva-vp7-{genotype}.fa")
                with open(filepath, "w") as f:
                    f.write(fasta)
                print(f"  Saved to {filepath}")
            else:
                print(f"  Failed to download sequences")
        else:
            print(f"  No sequences found")
        
        time.sleep(0.5)  # Rate limiting

def download_vp4_references():
    """Download VP4 reference sequences"""
    print("\n=== Downloading VP4 Reference Sequences ===")
    
    for genotype in VP4_GENOTYPES:
        print(f"\nSearching for {genotype}...")
        
        # Extract P-type number for search
        p_num = re.search(r'\d+', genotype)
        if not p_num:
            continue
        p_num = p_num.group()
        
        # Search with different query terms
        queries = [
            f"rotavirus+A+VP4+{genotype}+gene",
            f"rotavirus+VP4+P{p_num}+gene",
            f"rotavirus+VP4+{genotype}",
        ]
        
        all_ids = []
        for q in queries:
            ids = search_ncbi(q, 5)
            if ids:
                all_ids.extend(ids)
                break
        
        # Deduplicate
        all_ids = list(set(all_ids))
        
        if all_ids:
            print(f"  Found {len(all_ids)} sequences")
            fasta = fetch_fasta(all_ids[:5])  # Limit to 5 sequences
            
            if fasta:
                # Save to file
                filepath = os.path.join(REF_DIR, f"rva-vp4-{genotype}.fa")
                with open(filepath, "w") as f:
                    f.write(fasta)
                print(f"  Saved to {filepath}")
            else:
                print(f"  Failed to download sequences")
        else:
            print(f"  No sequences found")
        
        time.sleep(0.5)  # Rate limiting

def main():
    """Main function"""
    print("Rotavirus A Reference Sequence Downloader")
    print("=" * 50)
    
    # Ensure reference directory exists
    os.makedirs(REF_DIR, exist_ok=True)
    
    # Download VP7 references
    download_vp7_references()
    
    # Download VP4 references
    download_vp4_references()
    
    print("\n" + "=" * 50)
    print("Download complete!")
    print(f"Reference files saved to: {REF_DIR}")
    
    # List files
    print("\nFiles:")
    for f in sorted(os.listdir(REF_DIR)):
        if f.endswith(".fa"):
            size = os.path.getsize(os.path.join(REF_DIR, f))
            print(f"  {f}: {size} bytes")

if __name__ == "__main__":
    main()
