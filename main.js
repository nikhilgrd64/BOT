pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";
console.log('PDF.js loaded:', typeof pdfjsLib !== 'undefined');

let fileTexts = {};

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

function addMessage(content, sender = 'bot') {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerHTML = content;
  document.getElementById('messages').appendChild(msgDiv);
  msgDiv.scrollIntoView();
}

function highlightTerms(sentence, terms) {
  let result = sentence;
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  });
  return result;
}

function splitIntoSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [];
}

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

    const sentences = splitIntoSentences(text);
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
    const fuse = new Fuse(docs, {
      keys: ['summary'],
      threshold: 0.4,
      includeScore: true,
    });

    const fuseResults = fuse.search(query);
    const bestMatch = fuseResults[0]?.item;

    if (bestMatch) {
      const text = fileTexts[bestMatch.name];
      const terms = query.split(/\s+/).filter(Boolean);

      if (text) {
        const sentences = splitIntoSentences(text);
        const preview = sentences
          .filter(s => terms.some(t => s.toLowerCase().includes(t)))
          .slice(0, 5);

        const suggestion = `
          🤖 Did you mean: <strong>${bestMatch.summary}</strong>?<br><br>
          <ul>${preview.map(s => `<li>${highlightTerms(s, terms)}</li>`).join('')}</ul>
          📂 <a href="${bestMatch.url}" target="_blank">View related doc</a>
        `;
        addMessage(suggestion, 'bot');
      } else {
        addMessage(`🤖 Did you mean: <strong>${bestMatch.summary}</strong>?<br><br>📂 <a href="${bestMatch.url}" target="_blank">View related doc</a>`, 'bot');
      }
    }

    addMessage(`No matches found for <strong>${query}</strong>.`, 'bot');
  }

  document.getElementById('loading').style.display = 'none';
}

function normalize(word) {
  return word.toLowerCase().replace(/s$/, '');
}

function similarity(a, b) {
  const aWords = new Set(a.split(/\s+/).map(normalize));
  const bWords = new Set(b.split(/\s+/).map(normalize));
  const common = [...aWords].filter(word => bWords.has(word));
  return common.length / Math.max(aWords.size, bWords.size);
}
