// Test pdf.js loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";
console.log('PDF.js loaded:', typeof pdfjsLib !== 'undefined');

// List your files
const docs = [
  { name: "Doubts-in-XML-and-segment.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Doubts-in-XML-and-segment.docx" },
  { name: "EPI-MPI-AND-EMPI.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/EPI-MPI-AND-EMPI.docx" },
  { name: "FHIR-MPI-and-MRN.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/FHIR-MPI-and-MRN.docx" },
  { name: "Formats-HL7-records.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Formats-HL7-records.docx" },
  { name: "HL7-Error-Handling-Guide.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-Error-Handling-Guide.pdf" },
  { name: "Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf" },
  { name: "Interface-Design-Document.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Interface-Design-Document.docx" }
];

let fileTexts = {};

function addMessage(content, sender='bot') {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.innerHTML = content;
  document.getElementById('messages').appendChild(msgDiv);
  msgDiv.scrollIntoView();
}

// Extract text
async function extractText(name, buffer) {
  if (name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ") + " ";
    }
    return text;
  } else if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  } else {
    console.warn(`Skipping unsupported file format: ${name}`);
    return null;
  }
}

// Fetch files
async function loadFiles() {
  for (const file of docs) {
    if (!fileTexts[file.name]) {
      try {
        const resp = await fetch(file.url);
        if (!resp.ok) throw new Error(`Failed to load ${file.name}: ${resp.status}`);
        const buffer = await resp.arrayBuffer();
        fileTexts[file.name] = await extractText(file.name, buffer);
        console.log(`✅ Loaded file: ${file.name}`);
      } catch (err) {
        fileTexts[file.name] = null; // explicitly mark as failed
        console.error(err.message);
      }
    }
  }
}

// Search
async function searchDocs() {
  const queryInput = document.getElementById('searchQuery');
  const query = queryInput.value.trim().toLowerCase();
  if (!query) return;

  addMessage(queryInput.value, 'user'); 
  queryInput.value = '';
  document.getElementById('loading').style.display = 'block';
  await loadFiles();

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  let foundSomething = false;

  for (const file of docs) {
    const text = fileTexts[file.name];
    if (!text) continue;

    const sentences = text
      .split(/[.!?]\s+/)
      .map(s => s.trim())
      .filter(s => s.length);

    let matches = sentences.filter(sentence => {
      const lower = sentence.toLowerCase();

      // Split the query into words
      const terms = query.split(/\s+/).filter(Boolean);

      // Check each term against variations
      return terms.every(term => {
        if (term === 'ack') {
          return lower.includes('ack') || lower.includes('acknowledg');
        } else if (term === 'negative') {
          return lower.includes('negative');
        } else {
          return lower.includes(term); // generic terms like epi, mpi, fhir
        }
      });
    });

    if (matches.length > 0) {
      foundSomething = true;
      resultsDiv.innerHTML += `<h3>${file.name}</h3><ul>`;
      matches.slice(0, 5).forEach(sentence => {
        resultsDiv.innerHTML += `<li>${sentence}</li>`;
      });
      resultsDiv.innerHTML += `</ul><a href="${file.url}" target="_blank">📂 View full file</a><hr>`;
    }
  }

  if (!foundSomething) {
    resultsDiv.innerHTML = `No matches found for <strong>${query}</strong>.`;
  }

  document.getElementById('loading').style.display = 'none';
}
