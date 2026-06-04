/*  Web Worker for Rotavirus A Genotyping Tool  –  parallel reference ranking  */

const IUPAC = {
  A:"A", C:"C", G:"G", T:"T", U:"T",
  R:"AG", Y:"CT", S:"GC", W:"AT", K:"GT", M:"AC",
  B:"CGT", D:"AGT", H:"ACT", V:"ACG", N:"ACGT",
};
const COMPLEMENT = {
  A:"T", C:"G", G:"C", T:"A", U:"A",
  R:"Y", Y:"R", S:"S", W:"W", K:"M", M:"K",
  B:"V", D:"H", H:"D", V:"B", N:"N",
};

let references = [];
let k = 13;
let candidateLimit = 20;
let kmerIndex = null;

self.onmessage = function (e) {
  const msg = e.data;
  if (msg.type === "init") {
    references = msg.references || [];
    k = msg.options?.k || 13;
    candidateLimit = msg.options?.candidateLimit || 20;
    const t0 = performance.now();
    buildKmerIndex();
    self.postMessage({ type: "initDone", duration: Math.round(performance.now() - t0) });
  }
  if (msg.type === "rank") {
    const t0 = performance.now();
    const matches = rankReferences(msg.sequence, msg.segment, msg.options);
    self.postMessage({ type: "rankResult", requestId: msg.requestId, matches, duration: Math.round(performance.now() - t0) });
  }
};

function buildKmerIndex() {
  kmerIndex = new Map();
  for (let i = 0; i < references.length; i++) {
    const seq = references[i].sequence;
    const seen = new Set();
    for (let j = 0; j <= seq.length - k; j++) {
      const kmer = seq.substring(j, j + k);
      if (seen.has(kmer)) continue;
      seen.add(kmer);
      if (!kmerIndex.has(kmer)) kmerIndex.set(kmer, []);
      kmerIndex.get(kmer).push(i);
    }
  }
}

function rankReferences(sequence, segment, options) {
  const minOverlap = options.minOverlap || 100;

  // k-mer prefilter
  let candidateSet = null;
  if (kmerIndex) {
    const hits = new Map();
    for (let j = 0; j <= sequence.length - k; j++) {
      const kmer = sequence.substring(j, j + k);
      const refs = kmerIndex.get(kmer);
      if (!refs) continue;
      for (const idx of refs) {
        const ref = references[idx];
        if (ref.segment !== segment) continue;
        hits.set(idx, (hits.get(idx) || 0) + 1);
      }
    }
    const sorted = [...hits.entries()].sort((a, b) => b[1] - a[1]);
    candidateSet = new Set(sorted.slice(0, candidateLimit * 2).map(([idx]) => idx));
  }

  const candidates = references
    .map((ref, i) => ({ ref, i }))
    .filter(({ ref, i }) => ref.segment === segment && (!candidateSet || candidateSet.has(i)));

  return candidates
    .map(({ ref }) => bestOrientation(sequence, ref))
    .filter((m) => m.overlap >= Math.min(minOverlap, sequence.length, m.ref.sequence.length))
    .sort((a, b) => b.identity - a.identity || b.matches - a.matches || b.overlap - a.overlap)
    .slice(0, candidateLimit);
}

function bestOrientation(sequence, ref) {
  const forward = bestUngappedOverlap(sequence, ref.sequence);
  const reverse = bestUngappedOverlap(reverseComplement(sequence), ref.sequence);
  const best = reverse.identity > forward.identity ? reverse : forward;
  return { ...best, ref, direction: best === reverse ? "reverse" : "forward" };
}

function bestUngappedOverlap(query, ref) {
  let best = { identity: 0, matches: 0, compared: 0, overlap: 0, offset: 0, signature: [] };
  const minUseful = Math.min(60, query.length, ref.length);
  for (let offset = -ref.length + minUseful; offset <= query.length - minUseful; offset += 1) {
    const qStart = Math.max(0, offset);
    const rStart = Math.max(0, -offset);
    const overlap = Math.min(query.length - qStart, ref.length - rStart);
    if (overlap < minUseful) continue;
    let matches = 0, compared = 0;
    const signature = [];
    for (let i = 0; i < overlap; i += 1) {
      const qBase = query[qStart + i], rBase = ref[rStart + i];
      if (qBase === "-" || rBase === "-") { signature.push("gap"); continue; }
      compared += 1;
      if (basesCompatible(qBase, rBase)) { matches += 1; signature.push("match"); }
      else { signature.push("miss"); }
    }
    const identity = compared ? (matches / compared) * 100 : 0;
    if (identity > best.identity || (identity === best.identity && compared > best.compared) ||
        (identity === best.identity && compared === best.compared && overlap > best.overlap)) {
      best = { identity, matches, compared, overlap, offset, signature };
    }
  }
  return best;
}

function basesCompatible(a, b) {
  const aSet = IUPAC[a] || "", bSet = IUPAC[b] || "";
  if (!aSet || !bSet) return false;
  return [...aSet].some((base) => bSet.includes(base));
}

function reverseComplement(sequence) {
  return [...sequence].reverse().map((base) => COMPLEMENT[base] || "N").join("");
}
