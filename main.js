pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";
console.log('PDF.js loaded:', typeof pdfjsLib !== 'undefined');

// Global store for extracted file text
let fileTexts = {};

// Document metadata
const docs = [
  {
    name: "Doubts-in-XML-and-segment.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Doubts-in-XML-and-segment.docx",
    summary: "HL7 XML and segmenting basics"
  },
  {
    name: "EPI-MPI-AND-EMPI.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/EPI-MPI-AND-EMPI.docx",
    summary: "EPI, MPI, and EMPI explained"
  },
  {
    name: "FHIR-MPI-and-MRN.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/FHIR-MPI-and-MRN.docx",
    summary: "FHIR, MPI, and MRN interoperability"
  },
  {
    name: "Formats-HL7-records.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Formats-HL7-records.docx",
    summary: "HL7 record types and formats"
  },
  {
    name: "HL7-Error-Handling-Guide.pdf",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-Error-Handling-Guide.pdf",
    summary: "Handling negative acks and HL7 errors"
  },
  {
    name: "Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf",
    summary: "Patient ADT interface technical spec"
  },
  {
    name: "Interface-Design-Document.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Interface-Design-Document.docx",
    summary: "Designing healthcare interface workflows"
  }
];

// DOM Ready: Populate file list + event listeners
document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('fileList');
  docs.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = doc.summary;
    fileList.appendChild(li);
  });

  const toggleButton = document.getElementById('toggleSummary');
  const summaryBox = document.getElementById('fileSummary');
  toggleButton.addEventListener('click', () => {
    summaryBox.style.display = summaryBox.style.display === 'none' ? 'block' : 'none';
    toggleButton.textContent = summaryBox.style.display === 'none' ? 'Show' : 'Hide';
  });

  document.getElementById('themeToggle').addEventListener('change', (e) => {
    document.body.classList.toggle('dark', e.target.checked);
  });
});

// Helper to show chat messages
function addMessage(content, sender = 'bot') {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerHTML = content;
  document.getElementById('messages').appendChild(msgDiv);
  msgDiv.scrollIntoView();
}

// Highlight matched terms
function highlightTerms(sentence, terms) {
  let result = sentence;
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });
  return result;
}

// Extract text from file
async function extractText(name, buffer) {
  if (name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(i => i.str).join(" ") + " ";
    }
    return text;
  } else if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }
  return "";
}

// Preload all docs
async function loadFiles() {
  for (const file of docs) {
    if (!fileTexts[file.name]) {
      try {
        const res = await fetch(file.url);
        if (!res.ok) throw new Error(`Error ${res.status} loading ${file.name}`);
        const buffer = await res.arrayBuffer();
        fileTexts[file.name] = await extractText(file.name, buffer);
        console.log(`✅ Loaded: ${file.name}`);
      } catch (e) {
        console.error(e.message);
        fileTexts[file.name] = null;
      }
    }
  }
}

// Search function
async function searchDocs() {
  const queryInput = document.getElementById('searchQuery');
  const query = queryInput.value.trim().toLowerCase();
  if (!query) return;

  addMessage(queryInput.value, 'user');
  queryInput.value = '';
  document.getElementById('loading').style.display = 'block';

  await loadFiles();
  let foundSomething = false;
  const terms = query.split(/\s+/).filter(Boolean);

  for (const file of docs) {
    const text = fileTexts[file.name];
    if (!text) continue;

    const sentences = text.split(/[.!?]\s+/).map(s => s.trim()).filter(s => s.length);
    const matches = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();
      return terms.every(term =>
        term === "ack" ? lower.includes('ack') || lower.includes('acknowledg') : lower.includes(term)
      );
    });

    if (matches.length > 0) {
      foundSomething = true;
      let botMessage = `<h4>${file.name}</h4><ul>`;
      matches.slice(0, 5).forEach(sentence => {
        botMessage += `<li>${highlightTerms(sentence, terms)}</li>`;
      });
      botMessage += `</ul><a href="${file.url}" target="_blank">📂 View full file</a>`;
      addMessage(botMessage, 'bot');
    }
  }

  if (!foundSomething) {
    let bestMatch = null, bestScore = 0;
    for (const doc of docs) {
      const score = similarity(query, doc.summary.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestMatch = doc;
      }
    }

    if (bestScore >= 0.6 && bestMatch) {
      const suggestion = `
        🤖 Did you mean: <strong>${bestMatch.summary}</strong>?<br><br>
        📄 HL7 messages are composed of segments and records that follow a defined format. These formats allow systems to exchange patient and medical data reliably.<br><br>
        📂 <a href="${bestMatch.url}" target="_blank">View related doc</a>
      `;
      addMessage(suggestion, 'bot');
    }

    addMessage(`No matches found for <strong>${query}</strong>.`, 'bot');
  }

  document.getElementById('loading').style.display = 'none';
}

// Basic word-overlap similarity
function similarity(a, b) {
  const aWords = new Set(a.split(/\s+/));
  const bWords = new Set(b.split(/\s+/));
  const common = [...aWords].filter(word => bWords.has(word));
  return common.length / Math.max(aWords.size, bWords.size);
}
