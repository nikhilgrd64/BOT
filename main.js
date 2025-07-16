// PDF.js worker setup
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

let fileTexts = {};
let recentActivity = [];

// List of document URLs (without predefined summaries)
const docs = [
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Doubts-in-XML-and-segment.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/EPI-MPI-AND-EMPI.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/FHIR-MPI-and-MRN.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Formats-HL7-records.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-Error-Handling-Guide.pdf",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Interface-Design-Document.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HIE-Monitoring-Tool-SOP.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/J2-Ops-Monitor-Thresholds-and-Management.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/InterfaceInf-from-GMS-Amin-2022-08-05-Series-Specific.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/IntelliBridge-Enterprise-IBE-Support-SOP.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/GoAnyWhere-Trobleshooting-Guide.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Elink-and-Capsule.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Charge-Interface-Issues_Operation-Support-Document.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-HIE-Training.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/inactive-interfaces.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Aborting-Message-in-HIE.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Checkpoints-IBE-reboot.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/SOP-for-unplanned-failovers.docx",
  "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-SOP-and-FAQs.docx"
];

const fileSummaries = {}; // sentence-based summaries per file

function splitIntoSentences(txt) {
  return (txt.match(/[^.!?]+[.!?]+/g) || []).map(s => s.trim());
}

function extractKeywords(text, count = 5) {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  return Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,count).map(([w])=>w);
}

async function extractText(name, buf) {
  if (name.endsWith('.pdf')) {
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let out = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const ct = await (await pdf.getPage(i)).getTextContent();
      out += ct.items.map(i => i.str).join(' ') + ' ';
    }
    return out;
  } else {
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }
}

async function loadFiles() {
  for (const url of docs) {
    const name = url.split('/').pop();
    if (!fileTexts[name]) {
      try {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const text = await extractText(name, buf);
        fileTexts[name] = text;
        const sentences = splitIntoSentences(text);
        fileSummaries[name] = sentences.slice(0,3).join(' ');
      } catch (e) {
        fileTexts[name] = '';
        fileSummaries[name] = '';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadFiles();
  populateSummaryList();
  generateDynamicSidebar();
});

function populateSummaryList() {
  const fileList = document.getElementById('fileList');
  fileList.innerHTML = '';
  Object.entries(fileSummaries).forEach(([name, summary]) => {
    const li = document.createElement('li');
    li.textContent = `${name}: ${summary}`;
    fileList.appendChild(li);
  });
}

function generateDynamicSidebar() {
  const keywordMap = new Map();
  Object.entries(fileTexts).forEach(([name, text]) => {
    const keywords = extractKeywords(text);
    keywords.forEach(word => {
      if (!keywordMap.has(word)) keywordMap.set(word, []);
      keywordMap.get(word).push(name);
    });
  });
  
  const sorted = Array.from(keywordMap.entries()).sort((a,b)=>b[1].length - a[1].length).slice(0,6);
  const catEl = document.querySelector('.category-list');
  catEl.innerHTML = '';
  sorted.forEach(([word, files]) => {
    const li = document.createElement('li');
    li.innerHTML = `📁 ${word} (${files.length})`;
    li.onclick = ()=>searchDocs(word);
    catEl.appendChild(li);
  });
  const tipsEl = document.querySelector('.tips-list');
  tipsEl.innerHTML = '';
  sorted.slice(0,4).forEach(([word]) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.innerHTML = `💡 Explore "${word}"`;
    btn.onclick = ()=>searchDocs(word);
    li.appendChild(btn);
    tipsEl.appendChild(li);
  });
}

function searchDocs(term) {
  const results = Object.entries(fileTexts).filter(([name, text]) => text.toLowerCase().includes(term.toLowerCase()));
  const messages = document.getElementById('messages');
  messages.innerHTML = '';
  results.forEach(([name, text]) => {
    const sents = splitIntoSentences(text).filter(s => s.toLowerCase().includes(term.toLowerCase())).slice(0,5);
    const div = document.createElement('div');
    div.className = 'message bot';
    div.innerHTML = `<h4>${name}</h4><ul>${sents.map(s=>`<li>${s}</li>`).join('')}</ul>`;
    messages.appendChild(div);
  });
}
