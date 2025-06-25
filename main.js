// 📝 List your files with correct names and raw links:
const docs = [
  {
    name: "HL7-Error-Handling-Guide.pdf",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/HL7-Error-Handling-Guide.pdf"
  },
  {
    name: "EPI-MPI-AND-EMPI.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/EPI-MPI-AND-EMPI.docx"
  }
];

// Cache
let fileTexts = {};

console.log('PDF.js loaded:', typeof pdfjsLib !== 'undefined');

// Extract text helper
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
  } else {
    return "";
  }
}

// Load files one time
async function loadFiles() {
  for (const file of docs) {
    if (!fileTexts[file.name]) {
      const resp = await fetch(file.url);
      if (!resp.ok) throw new Error(`Failed to fetch ${file.name}: ${resp.status}`);
      const buffer = await resp.arrayBuffer();
      fileTexts[file.name] = await extractText(file.name, buffer);
    }
  }
}

// Search
async function searchDocs() {
  const query = document.getElementById('searchQuery').value.trim().toLowerCase();
  if (!query) return alert('Please enter a search term.');

  // Show loader
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').innerHTML = '';

  try {
    await loadFiles();
    const resultsDiv = document.getElementById('results');

    for (const file of docs) {
      const text = fileTexts[file.name].toLowerCase();
      if (text.includes(query)) {
        resultsDiv.innerHTML += `<p>${file.name}: <a href="${file.url}" target="_blank">View file</a></p>`;
      }
    }
    if (!resultsDiv.innerHTML) resultsDiv.innerHTML = '<p>No matches found.</p>';
  } catch (e) {
    console.error(e);
    alert('Error searching documents. Check console for details.');
  } finally {
    document.getElementById('loading').style.display = 'none';
  }
}
