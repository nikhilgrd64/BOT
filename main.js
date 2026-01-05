pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

let fileTexts = {};
let recentActivity = [];
let docs = []; // dynamic docs
let categories = {}; // categoryName -> [doc objects]

/* ---------------------- PDF RENDER ---------------------- */
async function renderPDFfromURL(url) {
  const viewer = document.getElementById('pdfViewer');
  if (!viewer) return;

  viewer.innerHTML = '<p>📄 Loading PDF…</p>';
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  viewer.innerHTML = '';

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.3 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto 20px';
    viewer.appendChild(canvas);

    await page.render({ canvasContext: ctx, viewport }).promise;
  }
}

/* ---------------------- FILE UPLOAD ---------------------- */
document.getElementById('fileUpload')?.addEventListener('change', async (e) => {
  const files = e.target.files;
  for (const file of files) {
    const buf = await file.arrayBuffer();
    const text = await extractText(file.name, buf);

    fileTexts[file.name] = text;

    // Auto summary: first 2 meaningful lines
    let summary = text.split('\n').map(l => l.trim()).filter(l => l).slice(0, 2).join(' ');
    if (!summary) summary = file.name;

    // Auto category: first keyword in summary or "General"
    let category = summary.split(/\s+/)[0] || "General";

    if (!categories[category]) categories[category] = [];

    const docObj = {
      name: file.name,
      summary: summary.length > 50 ? summary.slice(0, 50) + '...' : summary,
      url: URL.createObjectURL(file),
      category
    };

    docs.push(docObj);
    categories[category].push(docObj);
  }
  generateFileList();
  generateDynamicSidebar();
  addMessage(`📂 ${files.length} file(s) uploaded and categorized.`, 'bot');
});

/* ---------------------- FILE LIST ---------------------- */
function generateFileList() {
  const fileList = document.getElementById('fileList');
  if (!fileList) return;
  fileList.innerHTML = '';
  docs.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = doc.summary;
    fileList.appendChild(li);
  });
}

/* ---------------------- EXTRACTION ---------------------- */
async function extractText(name, buf) {
  try {
    if (name.endsWith('.pdf')) {
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let out = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const ct = await page.getTextContent();
        out += ct.items.map(it => it.str).join(' ') + ' ';
      }
      return out;
    }

    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value || '';
  } catch (e) {
    console.error('Extraction failed:', name, e);
    return '';
  }
}

/* ---------------------- SEARCH ---------------------- */
async function searchDocs(rawQuery = null, labelOverride = null) {
  const input = document.getElementById('searchQuery');
  const query = (rawQuery || input.value).trim().toLowerCase();
  if (!query) return;

  addMessage(labelOverride || query, 'user');
  input.value = '';
  document.getElementById('loading').style.display = 'block';

  const terms = query.split(/\s+/);
  let found = false;

  for (const doc of docs) {
    const text = (fileTexts[doc.name] || '').toLowerCase();
    if (!text) continue;

    const hits = splitIntoSentences(text).filter(s =>
      terms.some(t => s.includes(t))
    );

    if (hits.length) {
      found = true;
      const isPDF = doc.name.endsWith('.pdf');
      addMessage(`
        <h4>${doc.name}</h4>
        <ul>${hits.slice(0, 5).map(s => `<li>${highlightTerms(s, terms)}</li>`).join('')}</ul>
        ${
          isPDF
            ? `<button onclick="renderPDFfromURL('${doc.url}')">📄 View PDF</button>`
            : `<a href="${doc.url}" target="_blank">📂 View file</a>`
        }
      `);
    }
  }

  if (!found) {
    addMessage(`No document content found for <strong>${query}</strong>.`);
  }

  document.getElementById('loading').style.display = 'none';
}

/* ---------------------- SIDEBAR ---------------------- */
function generateDynamicSidebar() {
  const categoryEl = document.querySelector('.category-list');
  const tipsEl = document.querySelector('.tips-list');
  if (!categoryEl || !tipsEl) return;

  categoryEl.innerHTML = '';
  Object.keys(categories).forEach(cat => {
    const li = document.createElement('li');
    li.textContent = cat;
    li.style.fontWeight = 'bold';
    categoryEl.appendChild(li);
    categories[cat].forEach(doc => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-btn';
      btn.textContent = doc.summary;
      btn.onclick = () => searchDocs(doc.name, doc.summary);
      li.appendChild(btn);
    });
  });
}

/* ---------------------- RECENT ---------------------- */
function renderRecentActivity() {
  const ul = document.querySelector('.recent-activity ul');
  if (!ul) return;
  ul.innerHTML = '';
  recentActivity.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.label;
    ul.appendChild(li);
  });
}

/* ---------------------- UI HELPERS ---------------------- */
function addMessage(html, sender = 'bot') {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.innerHTML = html;
  document.getElementById('messages').appendChild(msg);
  msg.scrollIntoView();
}

function highlightTerms(text, terms) {
  terms.forEach(t => {
    const rx = new RegExp(`(${t})`, 'gi');
    text = text.replace(rx, '<mark>$1</mark>');
  });
  return text;
}

function splitIntoSentences(txt) {
  return txt
    .replace(/\s+/g, ' ')
    .split(/(?<=\.)|(?<=\?)|(?<=!)|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 40);
}

/* ---------------------- INIT ---------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchQuery')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchDocs();
    }
  });

  generateDynamicSidebar();
  renderRecentActivity();

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark', themeToggle.checked);
  });
});
