// Test pdf.js loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";
console.log('PDF.js loaded:', typeof pdfjsLib !== 'undefined');

// List your files
const docs = [
  { name: "HL7-Error-Handling-Guide.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/HL7-Error-Handling-Guide.pdf" },
  { name: "EPI-MPI-AND-EMPI.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/EPI-MPI-AND-EMPI.docx" }
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
  }
}

// Fetch files
async function loadFiles() {
  for (const file of docs) {
    if (!fileTexts[file.name]) {
      const resp = await fetch(file.url);
      const buffer = await resp.arrayBuffer();
      fileTexts[file.name] = await extractText(file.name, buffer);
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

  const terms = query.split(/\s+/).filter(t => t.length > 0);
  let matches = [];

  for (const file of docs) {
    const text = fileTexts[file.name].toLowerCase();
    if (terms.every(t => text.includes(t))) {
      matches.push(file.name);
    }
  }

  document.getElementById('loading').style.display = 'none';

  if (matches.length) {
    addMessage(`Found matches in: <ul>${matches.map(m => `<li><a href="${docs.find(f => f.name===m).url}" target="_blank">${m}</a></li>`).join('')}</ul>`);
  } else {
    addMessage(`No matches found for <mark>${query}</mark>.`);
  }
}
