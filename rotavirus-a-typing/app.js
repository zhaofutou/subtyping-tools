/*  Rotavirus A Genotyping Tool  –  pure front-end implementation
 *  Architecture mirrors nov-typing but targets VP7 (G-type) + VP4 (P-type)
 */

const REF_FILES = [
  // VP7 genotypes
  { segment: "VP7", genotype: "G1",  file: "reference/rva-vp7-G1.fa" },
  { segment: "VP7", genotype: "G2",  file: "reference/rva-vp7-G2.fa" },
  { segment: "VP7", genotype: "G3",  file: "reference/rva-vp7-G3.fa" },
  { segment: "VP7", genotype: "G4",  file: "reference/rva-vp7-G4.fa" },
  { segment: "VP7", genotype: "G8",  file: "reference/rva-vp7-G8.fa" },
  { segment: "VP7", genotype: "G9",  file: "reference/rva-vp7-G9.fa" },
  { segment: "VP7", genotype: "G10", file: "reference/rva-vp7-G10.fa" },
  { segment: "VP7", genotype: "G11", file: "reference/rva-vp7-G11.fa" },
  { segment: "VP7", genotype: "G12", file: "reference/rva-vp7-G12.fa" },
  // VP4 genotypes
  { segment: "VP4", genotype: "P[4]",  file: "reference/rva-vp4-P[4].fa" },
  { segment: "VP4", genotype: "P[6]",  file: "reference/rva-vp4-P[6].fa" },
  { segment: "VP4", genotype: "P[8]",  file: "reference/rva-vp4-P[8].fa" },
  { segment: "VP4", genotype: "P[9]",  file: "reference/rva-vp4-P[9].fa" },
  { segment: "VP4", genotype: "P[11]", file: "reference/rva-vp4-P[11].fa" },
  { segment: "VP4", genotype: "P[14]", file: "reference/rva-vp4-P[14].fa" },
  { segment: "VP4", genotype: "P[19]", file: "reference/rva-vp4-P[19].fa" },
];

const APP_VERSION = "v1.0.0";
const DATABASE_VERSION = "RVA-Ref 2026.06.04";

const I18N = {
  zh: {
    pageTitle: "轮状病毒A分型工具",
    eyebrow: "Rotavirus A Genotyping Platform",
    appTitle: "轮状病毒A分型分析系统",
    localLibrary: "本地参考库",
    loading: "加载中",
    inputTitle: "序列提交",
    inputSubtitle: "FASTA / 多条序列 / 原始核酸序列",
    loadExample: "载入示例",
    chooseFile: "选择文件",
    runTyping: "开始分型",
    updateRef: "更新参考库",
    paramsTitle: "参数设置",
    minOverlap: "最小重叠长度",
    vp7Threshold: "VP7 身份阈值",
    vp4Threshold: "VP4 身份阈值",
    kmerSize: "k-mer 大小",
    candidateLimit: "候选数上限",
    rebuildIndex: "重建索引",
    resultTitle: "分型结果",
    waiting: "等待序列提交",
    downloadCsv: "下载 CSV",
    sample: "样本",
    dualType: "G/P 分型",
    colSample: "样本",
    colDualType: "G/P 分型",
    colVP7: "VP7 (G型)",
    colVP4: "VP4 (P型)",
    colDirection: "方向",
    colStatus: "状态",
    direction: "方向",
    decision: "判定",
    submitAfterLibrary: "参考库加载完成后提交序列",
    libraryReady: "参考库已就绪",
    libraryFailed: "参考库加载失败",
    serverHint: "请通过本地服务器访问页面。",
    noValidSequence: "未检测到有效核酸序列",
    database: "参考数据库",
    totalSequences: "总序列数",
    coveredGenotypes: "覆盖型别",
    softwareVersion: "软件版本",
    completed: (count) => `${count} 条序列完成分型`,
    typing: "正在分型...",
    undetermined: "未定型",
    notApplicable: "不适用",
    pass: "通过",
    singleSegmentPass: "单片段通过",
    insufficientOverlap: "重叠不足",
    lowSimilarity: "低相似度",
    forward: "正向",
    reverse: "反向互补",
    noHit: (segment) => `${segment} 未命中`,
    candidates: (segment) => `${segment} 候选`,
    noCandidates: "无候选",
    signatureTitle: "最佳命中局部一致性概览",
    copyrightOwner: "Rotavirus A Genotyping Tool - Local Implementation",
  },
  en: {
    pageTitle: "Rotavirus A Genotyping Tool",
    eyebrow: "Rotavirus A Genotyping Platform",
    appTitle: "Rotavirus A Genotyping Analysis System",
    localLibrary: "Local reference library",
    loading: "Loading",
    inputTitle: "Sequence Submission",
    inputSubtitle: "FASTA / multi-FASTA / raw nucleotide sequence",
    loadExample: "Load Example",
    chooseFile: "Choose File",
    runTyping: "Run Typing",
    updateRef: "Update References",
    paramsTitle: "Parameters",
    minOverlap: "Minimum overlap",
    vp7Threshold: "VP7 identity threshold",
    vp4Threshold: "VP4 identity threshold",
    kmerSize: "k-mer size",
    candidateLimit: "Candidate limit",
    rebuildIndex: "Rebuild Index",
    resultTitle: "Typing Results",
    waiting: "Waiting for sequence input",
    downloadCsv: "Download CSV",
    sample: "Sample",
    dualType: "G/P Type",
    colSample: "Sample",
    colDualType: "G/P Type",
    colVP7: "VP7 (G-type)",
    colVP4: "VP4 (P-type)",
    colDirection: "Direction",
    colStatus: "Status",
    direction: "Direction",
    decision: "Decision",
    submitAfterLibrary: "Submit sequences after the reference library is loaded",
    libraryReady: "Reference library ready",
    libraryFailed: "Reference library failed to load",
    serverHint: "Please access this page through a local server.",
    noValidSequence: "No valid nucleotide sequence detected",
    database: "Reference database",
    totalSequences: "Total sequences",
    coveredGenotypes: "Covered genotypes",
    softwareVersion: "Software version",
    completed: (count) => `${count} sequence${count === 1 ? "" : "s"} typed`,
    typing: "Typing...",
    undetermined: "Undetermined",
    notApplicable: "N/A",
    pass: "Pass",
    singleSegmentPass: "Single segment pass",
    insufficientOverlap: "Insufficient overlap",
    lowSimilarity: "Low similarity",
    forward: "Forward",
    reverse: "Reverse complement",
    noHit: (segment) => `${segment} no hit`,
    candidates: (segment) => `${segment} candidates`,
    noCandidates: "No candidates",
    signatureTitle: "Best-hit local identity overview",
    copyrightOwner: "Rotavirus A Genotyping Tool - Local Implementation",
  },
};

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

const state = {
  references: [],
  results: [],
  selected: 0,
  lang: localStorage.getItem("rvaTypingLang") || "en",
  emptyKey: "submitAfterLibrary",
  emptyMessage: "",
};

const els = {
  libraryStatus: document.querySelector("#libraryStatus"),
  libraryStrip: document.querySelector("#libraryStrip"),
  sequenceInput: document.querySelector("#sequenceInput"),
  fileInput: document.querySelector("#fileInput"),
  runButton: document.querySelector("#runButton"),
  loadExample: document.querySelector("#loadExample"),
  downloadButton: document.querySelector("#downloadButton"),
  resultBody: document.querySelector("#resultBody"),
  summaryLine: document.querySelector("#summaryLine"),
  detailArea: document.querySelector("#detailArea"),
  minOverlap: document.querySelector("#minOverlap"),
  vp7Threshold: document.querySelector("#vp7Threshold"),
  vp4Threshold: document.querySelector("#vp4Threshold"),
  languageButtons: document.querySelectorAll("[data-lang]"),
  kSize: document.querySelector("#kSize"),
  candidateLimit: document.querySelector("#candidateLimit"),
  rebuildIndex: document.querySelector("#rebuildIndex"),
  updateButton: document.querySelector("#updateButton"),
  updateStatus: document.querySelector("#updateStatus"),
};

/* ---- Web Worker for parallel ranking ---- */
const workerAvailable = typeof Worker !== "undefined";
let worker = null;
let workerReady = false;
const pendingResponses = new Map();

function initWorker() {
  if (!workerAvailable) return;
  try {
    worker = new Worker(`worker.js?v=${encodeURIComponent(DATABASE_VERSION)}`);
    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "initDone") workerReady = true;
      if (msg.type === "rankResult") {
        const { requestId, matches } = msg;
        const resolve = pendingResponses.get(requestId);
        if (resolve) { pendingResponses.delete(requestId); resolve(matches); }
      }
    };
  } catch (_) { /* worker unavailable */ }
}

function workerRankReferences(sequence, segment, options) {
  if (!worker || !workerReady) return Promise.resolve(rankReferences(sequence, segment, options));
  const requestId = `${Date.now()}-${Math.random()}`;
  const promise = new Promise((resolve) => { pendingResponses.set(requestId, resolve); });
  worker.postMessage({ type: "rank", requestId, sequence, segment, options });
  return promise;
}

initWorker();
init();

async function init() {
  bindEvents();
  await loadReferences();
}

async function updateReferences() {
  if (!els.updateButton || !els.updateStatus) return;
  els.updateButton.disabled = true;
  els.updateStatus.style.display = "inline";
  els.updateStatus.textContent = "Downloading from NCBI...";
  els.updateStatus.className = "library-badge";

  try {
    const resp = await fetch("/api/update");
    const data = await resp.json();
    if (data.ok) {
      els.updateStatus.textContent = "Update complete — reloading...";
      els.updateStatus.className = "library-badge";
      els.updateStatus.style.background = "rgba(74,222,128,0.2)";
      els.updateStatus.style.color = "#4ade80";
      // Reload references
      state.references = [];
      await loadReferences();
      setTimeout(() => { els.updateStatus.style.display = "none"; }, 3000);
    } else {
      els.updateStatus.textContent = `Failed: ${data.error}`;
      els.updateStatus.style.background = "rgba(248,113,113,0.2)";
      els.updateStatus.style.color = "#f87171";
    }
  } catch (err) {
    els.updateStatus.textContent = `Error: ${err.message}`;
    els.updateStatus.style.background = "rgba(248,113,113,0.2)";
    els.updateStatus.style.color = "#f87171";
  } finally {
    els.updateButton.disabled = false;
  }
}

function bindEvents() {
  els.runButton.addEventListener("click", runTyping);
  els.loadExample.addEventListener("click", loadExampleSequence);
  els.fileInput.addEventListener("change", readFile);
  els.downloadButton.addEventListener("click", downloadCsv);
  document.querySelector("#updateRefButton").addEventListener("click", updateReferences);
  els.languageButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
  if (els.kSize) {
    els.kSize.addEventListener("change", () => {
      localStorage.setItem("rva_k", els.kSize.value);
    });
  }
  if (els.candidateLimit) {
    els.candidateLimit.addEventListener("change", () => {
      localStorage.setItem("rva_candidateLimit", els.candidateLimit.value);
    });
  }
  if (els.rebuildIndex) {
    els.rebuildIndex.addEventListener("click", () => {
      const k = Number(els.kSize.value) || 13;
      const candidateLimit = Number(els.candidateLimit.value) || 20;
      if (worker && typeof worker.postMessage === "function") {
        worker.postMessage({ type: "init", references: state.references, options: { k, candidateLimit } });
      }
    });
  }
  if (els.updateButton) {
    els.updateButton.addEventListener("click", updateReferences);
  }
}

async function loadReferences() {
  try {
    applyLanguage();
    const groups = await Promise.all(
      REF_FILES.map(async (meta) => {
        const res = await fetch(`${meta.file}?v=${encodeURIComponent(DATABASE_VERSION)}`);
        if (!res.ok) throw new Error(`${meta.file} load failed`);
        const records = parseFasta(await res.text()).map((record) => ({
          ...record,
          segment: meta.segment,
          genotype: meta.genotype,
        }));
        return records;
      }),
    );
    state.references = groups.flat();
    renderLibraryStatus();
    renderLibraryStrip();
    const kFromStorage = Number(localStorage.getItem("rva_k")) || 13;
    const candFromStorage = Number(localStorage.getItem("rva_candidateLimit")) || 20;
    if (els.kSize) els.kSize.value = kFromStorage;
    if (els.candidateLimit) els.candidateLimit.value = candFromStorage;
    if (worker && typeof worker.postMessage === "function") {
      worker.postMessage({ type: "init", references: state.references, options: { k: kFromStorage, candidateLimit: candFromStorage } });
    }
    setEmptyMessage("libraryReady");
  } catch (err) {
    els.libraryStatus.textContent = t("libraryFailed");
    setEmptyMessage("", `${err.message}; ${t("serverHint")}`);
  }
}

function parseFasta(text) {
  const records = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith(">")) {
      if (current) records.push(current);
      current = { name: line.slice(1).trim(), sequence: "" };
    } else if (current) {
      current.sequence += cleanSequence(line);
    } else {
      current = { name: "sequence-1", sequence: cleanSequence(line) };
    }
  }
  if (current) records.push(current);
  return records.filter((r) => r.sequence.length);
}

function cleanSequence(value) {
  return value.toUpperCase().replace(/[^ACGTURYSWKMBDHVN-]/g, "").replace(/U/g, "T");
}

function renderLibraryStrip() {
  if (!state.references.length) return;
  const vp7Count = state.references.filter((r) => r.segment === "VP7").length;
  const vp4Count = state.references.filter((r) => r.segment === "VP4").length;
  const vp7Types = [...new Set(state.references.filter((r) => r.segment === "VP7").map((r) => r.genotype))].sort();
  const vp4Types = [...new Set(state.references.filter((r) => r.segment === "VP4").map((r) => r.genotype))].sort();
  els.libraryStrip.innerHTML = `
    <div class="database-card">
      <div><span class="metric-label">${t("database")}</span> <strong>${DATABASE_VERSION}</strong></div>
      <div><span class="metric-label">${t("totalSequences")}</span> <strong>${state.references.length}</strong></div>
      <div><span class="metric-label">${t("coveredGenotypes")}</span> <strong>VP7(${vp7Count}): ${vp7Types.join(", ")} | VP4(${vp4Count}): ${vp4Types.join(", ")}</strong></div>
      <div><span class="metric-label">${t("softwareVersion")}</span> <strong>${APP_VERSION}</strong></div>
    </div>`;
}

async function runTyping() {
  const queries = parseFasta(els.sequenceInput.value);
  if (!queries.length) { setEmptyMessage("noValidSequence"); return; }

  const k = Number(els.kSize?.value) || 13;
  const candidateLimit = Number(els.candidateLimit?.value) || 20;
  const options = {
    minOverlap: Number(els.minOverlap.value) || 100,
    thresholds: {
      VP7: Number(els.vp7Threshold.value) || 80,
      VP4: Number(els.vp4Threshold.value) || 85,
    },
    k,
    candidateLimit,
  };

  els.runButton.disabled = true;
  let processed = 0;
  els.summaryLine.textContent = `${t("typing")} (0/${queries.length})`;

  try {
    const results = [];
    for (let i = 0; i < queries.length; i++) {
      const res = await typeQuery(queries[i], i, options);
      results.push(res);
      processed += 1;
      els.summaryLine.textContent = `${t("typing")} (${processed}/${queries.length})`;
    }
    state.results = results;
    state.selected = 0;
    renderResults();
    renderDetails(state.results[0]);
    els.downloadButton.disabled = false;
    els.summaryLine.textContent = t("completed", state.results.length);
  } catch (err) {
    setEmptyMessage("", String(err.message || err));
  } finally {
    els.runButton.disabled = false;
  }
}

async function typeQuery(query, index, options) {
  const vp7Promise = workerRankReferences(query.sequence, "VP7", options);
  const vp4Promise = workerRankReferences(query.sequence, "VP4", options);
  const [vp7Matches, vp4Matches] = await Promise.all([vp7Promise, vp4Promise]);
  const matches = { VP7: vp7Matches, VP4: vp4Matches };

  const topVP7 = matches.VP7[0] || null;
  const topVP4 = matches.VP4[0] || null;
  const vp7Pass = passes(topVP7, options.thresholds.VP7, options.minOverlap);
  const vp4Pass = passes(topVP4, options.thresholds.VP4, options.minOverlap);

  return {
    id: query.name || `sequence-${index + 1}`,
    length: query.sequence.length,
    matches,
    topVP7,
    topVP4,
    vp7Call: vp7Pass ? topVP7.ref.genotype : "undetermined",
    vp4Call: vp4Pass ? topVP4.ref.genotype : "undetermined",
    combinedCall: buildCombinedCall(
      vp7Pass ? topVP7.ref.genotype : "",
      vp4Pass ? topVP4.ref.genotype : "",
    ),
    status: buildStatus(vp7Pass, vp4Pass, topVP7, topVP4),
  };
}

function rankReferences(sequence, segment, options) {
  return state.references
    .filter((ref) => ref.segment === segment)
    .map((ref) => bestOrientation(sequence, ref))
    .filter((m) => m.overlap >= Math.min(options.minOverlap, sequence.length, m.ref.sequence.length))
    .sort((a, b) => b.identity - a.identity || b.matches - a.matches || b.overlap - a.overlap)
    .slice(0, 5);
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

function passes(match, threshold, minOverlap) {
  return Boolean(match && match.identity >= threshold && match.overlap >= minOverlap);
}

function buildCombinedCall(vp7, vp4) {
  if (vp7 && vp7 !== "undetermined") return `${vp7}${vp4 && vp4 !== "undetermined" ? "[" + vp4 + "]" : ""}`;
  if (vp4 && vp4 !== "undetermined") return vp4;
  return "undetermined";
}

function buildStatus(vp7Pass, vp4Pass, topVP7, topVP4) {
  if (vp7Pass && vp4Pass) return { key: "pass", tone: "good" };
  if (vp7Pass || vp4Pass) return { key: "singleSegmentPass", tone: "warn" };
  if ((topVP7?.overlap || 0) < 100 && (topVP4?.overlap || 0) < 100)
    return { key: "insufficientOverlap", tone: "bad" };
  return { key: "lowSimilarity", tone: "bad" };
}

function renderResults() {
  els.summaryLine.textContent = t("completed", state.results.length);
  els.resultBody.innerHTML = state.results
    .map((result, index) => `
      <tr data-index="${index}">
        <td><strong>${escapeHtml(result.id)}</strong><br><span class="muted">${result.length} nt</span></td>
        <td><span class="tag ${result.status.tone}">${escapeHtml(formatCall(result.combinedCall))}</span></td>
        <td>${formatMatch(result.topVP7, "VP7")}</td>
        <td>${formatMatch(result.topVP4, "VP4")}</td>
        <td>${escapeHtml(formatDirection(result.topVP7 || result.topVP4))}</td>
        <td><span class="tag ${result.status.tone}">${t(result.status.key)}</span></td>
      </tr>`)
    .join("");
  els.resultBody.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      state.selected = Number(row.dataset.index);
      renderResults();
      row.classList.add("selected");
      renderDetails(state.results[state.selected]);
    });
  });
}

function formatMatch(match, segment) {
  if (!match) return `<span class="tag bad">${t("noHit", segment)}</span>`;
  return `<strong>${escapeHtml(match.ref.genotype)}</strong>
    <br><span class="muted">${match.identity.toFixed(2)}% / ${match.overlap} nt</span>`;
}

function formatCall(call) { return call === "undetermined" ? t("undetermined") : call; }
function formatDirection(match) { return match ? (match.direction === "reverse" ? t("reverse") : t("forward")) : "-"; }

function renderDetails(result) {
  if (!result) { els.detailArea.innerHTML = ""; return; }
  els.detailArea.innerHTML = `
    <div class="detail-grid">
      ${renderMatchBox(t("candidates", "VP7"), result.matches.VP7)}
      ${renderMatchBox(t("candidates", "VP4"), result.matches.VP4)}
    </div>
    ${renderSignature(result.topVP7 || result.topVP4)}`;
}

function renderMatchBox(title, matches) {
  const body = matches.length
    ? matches.map((m) => `
        <li>
          <div class="score">${m.identity.toFixed(2)}%</div>
          <div class="ref-title">
            <strong>${escapeHtml(m.ref.genotype)}</strong>
            <br>${escapeHtml(m.ref.name)}
            <br>${m.overlap} nt, ${m.matches}/${m.compared}, ${formatDirection(m)}
          </div>
        </li>`).join("")
    : `<li><div class="score">-</div><div class="ref-title">${t("noCandidates")}</div></li>`;
  return `<article class="match-box"><h3>${title}</h3><ul class="match-list">${body}</ul></article>`;
}

function renderSignature(match) {
  if (!match) return "";
  const sampled = sampleSignature(match.signature, 80);
  return `<div class="mini-bars" title="${t("signatureTitle")}">
    ${sampled.map((v) => `<span class="${v}"></span>`).join("")}</div>`;
}

function sampleSignature(signature, size) {
  if (!signature.length) return Array(size).fill("gap");
  return Array.from({ length: size }, (_, i) => {
    const start = Math.floor((i / size) * signature.length);
    const end = Math.max(start + 1, Math.floor(((i + 1) / size) * signature.length));
    const slice = signature.slice(start, end);
    const matches = slice.filter((x) => x === "match").length;
    const misses = slice.filter((x) => x === "miss").length;
    if (matches >= misses && matches > 0) return "match";
    if (misses > 0) return "miss";
    return "gap";
  });
}

function setEmptyMessage(key, fallback = "") {
  state.emptyKey = key;
  state.emptyMessage = fallback;
  const message = key ? t(key) : fallback;
  els.summaryLine.textContent = message;
  els.resultBody.innerHTML = `<tr><td colspan="6" class="empty-state">${escapeHtml(message)}</td></tr>`;
  els.detailArea.innerHTML = "";
}

function loadExampleSequence() {
  const example = state.references.find((r) => r.segment === "VP7" && r.genotype === "G1") ||
    state.references.find((r) => r.segment === "VP7") || state.references[0];
  if (example) {
    els.sequenceInput.value = `>example-${example.genotype}\n${example.sequence}`;
  }
}

async function updateReferences() {
  const btn = document.querySelector("#updateRefButton");
  btn.disabled = true;
  btn.textContent = t("loading") + "...";
  
  try {
    // Force reload all reference files
    state.references = [];
    await loadReferences();
    els.summaryLine.textContent = t("libraryReady");
  } catch (err) {
    els.summaryLine.textContent = `${t("libraryFailed")}: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = t("updateRef");
  }
}

async function readFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  els.sequenceInput.value = await file.text();
}

function downloadCsv() {
  const rows = [
    ["sample", "g_p_type", "vp7", "vp7_identity", "vp7_overlap", "vp4", "vp4_identity", "vp4_overlap", "status"],
    ...state.results.map((r) => [
      r.id,
      formatCall(r.combinedCall),
      formatCall(r.vp7Call),
      r.topVP7?.identity.toFixed(2) || "",
      r.topVP7?.overlap || "",
      formatCall(r.vp4Call),
      r.topVP4?.identity.toFixed(2) || "",
      r.topVP4?.overlap || "",
      t(r.status.key),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rotavirus-a-typing-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }

function setLanguage(lang) {
  state.lang = I18N[lang] ? lang : "en";
  localStorage.setItem("rvaTypingLang", state.lang);
  applyLanguage();
  renderLibraryStatus();
  renderLibraryStrip();
  if (state.results.length) {
    renderResults();
    renderDetails(state.results[state.selected]);
  } else if (state.emptyKey || state.emptyMessage) {
    setEmptyMessage(state.emptyKey, state.emptyMessage);
  }
}

function applyLanguage() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  els.languageButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === state.lang);
  });
  if (!state.references.length) {
    els.libraryStatus.textContent = t("loading");
    els.summaryLine.textContent = t("waiting");
  }
}

function renderLibraryStatus() {
  if (!state.references.length) { els.libraryStatus.textContent = t("loading"); return; }
  els.libraryStatus.textContent = `${state.references.length} seqs · ${DATABASE_VERSION}`;
}

function t(key, ...args) {
  const value = I18N[state.lang]?.[key] ?? I18N.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
