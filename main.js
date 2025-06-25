// main.js

// 📝 List your files here:
const docs = [
  { name: "HL7-Error-Handling-Guide.pdf", url: "https://raw.githubusercontent.com/YOUR_USERNAME/document-bot-files/main/docs/HL7-Error-Handling-Guide.pdf" },
  { name: "EPI-MPI-AND-EMPI.docx", url: "https://raw.githubusercontent.com/YOUR_USERNAME/document-bot-files/main/docs/EPI-MPI-AND-EMPI.docx" }
];

// 📂 Pre-extracted text cache
let fileTexts = {};

// 🧠 Extract text from a file buffer
async function extractText(name, buffer) {
  if (name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ") + "\n";
    }
    return text;
  } else if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }
}

// 🔄 Fetch and cache file contents
async function loadFiles() {
  for (const file of docs) {
    if (!fileTexts[file.name]) {
      const resp = await fetch(file.url);
      const buffer = await resp.arrayBuffer();
      fileTexts[file.name] = await extractText(file.name, buffer);
    }
  }
}

// 🔍 Search docs
async function searchDocs() {
  const query = document.getElementById('searchQuery').value.trim().toLowerCase();
  if (!query) return alert('Please enter a search term.');

  // Make sure files are loaded
  await loadFiles();

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  for (const file of docs) {
    const text = fileTexts[file.name].toLowerCase();
    if (text.includes(query)) {
      resultsDiv.innerHTML += `<p>${file.name}: <a href="${file.url}" target="_blank">View file</a></p>`;
    }
  }
}
