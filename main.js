pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

let fileTexts = {};
let recentActivity = [];

/* ---------------------- PDF RENDER FIX ---------------------- */

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

    await page.render({
      canvasContext: ctx,
      viewport
    }).promise;
  }
}

/* ---------------------- DOCUMENT LIST ---------------------- */

const docs = [
  { name: "Doubts-in-XML-and-segment.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Doubts-in-XML-and-segment.docx", summary: "HL7 XML and segmenting basics" },
  { name: "EPI-MPI-AND-EMPI.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/EPI-MPI-AND-EMPI.docx", summary: "EPI, MPI, and EMPI explained" },
  { name: "FHIR-MPI-and-MRN.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/FHIR-MPI-and-MRN.docx", summary: "FHIR, MPI, and MRN interoperability" },
  { name: "Formats-HL7-records.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Formats-HL7-records.docx", summary: "HL7 record types and formats" },
  { name: "HL7-Error-Handling-Guide.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-Error-Handling-Guide.pdf", summary: "Handling negative acks and HL7 errors" },
  { name: "Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf", summary: "Patient ADT interface technical spec" }
];

/* ---------------------- INIT ---------------------- */

document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('fileList');
  docs.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = doc.summary;
    fileList.appendChild(li);
  });

  document.getElementById('searchQuery').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchDocs();
    }
  });

  generateDynamicSidebar();
  renderRecentActivity();
});

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

async function loadFiles() {
  for (const f of docs) {
    if (!fileTexts[f.name]) {
      const res = await fetch(f.url);
      const buf = await res.arrayBuffer();
      fileTexts[f.name] = await extractText(f.name, buf);
      console.log(`Loaded: ${f.name} (${fileTexts[f.name].length} chars)`);
    }
  }
}

/* ---------------------- SEARCH ---------------------- */

async function searchDocs(rawQuery = null, labelOverride = null) {
  const input = document.getElementById('searchQuery');
  const query = (rawQuery || input.value).trim().toLowerCase();
  if (!query) return;

  addMessage(labelOverride || query, 'user');
  input.value = '';

  await loadFiles();

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
}

/* ---------------------- SIDEBAR ---------------------- */

function generateDynamicSidebar() {
  const tipsEl = document.querySelector('.tips-list');
  if (!tipsEl) return;

  tipsEl.innerHTML = '';
  const btn = document.createElement('button');
  btn.textContent = '📄 HL7 ACK Handling';
  btn.onclick = () => searchDocs('hl7 ack handling', '📄 HL7 ACK Handling');
  tipsEl.appendChild(btn);
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
