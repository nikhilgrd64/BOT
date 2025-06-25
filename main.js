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

// Levenshtein Distance helper
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

// 🔍 Search Docs with synonyms + fuzzy matching
async function searchDocs() {
  const queryInput = document.getElementById('searchQuery');
  let query = queryInput.value.trim().toLowerCase();
  if (!query) return;

  addMessage(queryInput.value, 'user'); 
  queryInput.value = '';
  document.getElementById('loading').style.display = 'block';
  await loadFiles();

  // Synonyms list — add variations as needed
  const synonyms = {
    "negative ack": ["neg ack", "negative acknowledgment", "nack"]
  };
  
  let terms = query.split(/\s+/).filter(t => t.length > 0);
  let allTerms = [...terms];
  terms.forEach(t => { if (synonyms[t]) allTerms.push(...synonyms[t]); });

  let resultsHtml = '';
  let foundSomething = false;

  for (const file of docs) {
    const text = fileTexts[file.name];
    if (!text) continue;

    const lower = text.toLowerCase();
    let matches = [];

    allTerms.forEach(term => {
      // Tolerance based on length
      const tolerance = term.length <= 7 ? 2 : 3;

      // Scan all words and check fuzzy match
      const words = lower.split(/\W+/); 
      words.forEach((word, index) => {
        if (levenshtein(term, word) <= tolerance) {
          let charIndex = lower.indexOf(word); // approximate first occurrence
          matches.push(charIndex);
        }
      });
    });

    matches = matches.sort((a,b)=>a-b).slice(0,3); // top 3 matches
    if (matches.length) {
      foundSomething = true;
      const summary = text.trim().split(/\n|\r|\r\n/)[0].substring(0,200) + '...';
      resultsHtml += `<strong>${file.name}</strong><br><em>${summary}</em><ul>`;

      matches.forEach((index) => {
        let sentenceStart = text.lastIndexOf('.', index) + 1;
        let sentenceEnd = text.indexOf('.', index) + 1;
        if (sentenceEnd === 0) sentenceEnd = text.length;
        let sentence = text.substring(sentenceStart, sentenceEnd).trim();

        allTerms.forEach(term => {
          const regex = new RegExp(`(${term})`, 'gi');
          sentence = sentence.replace(regex, '<strong>$1</strong>');
        });

        resultsHtml += `<li>${sentence}</li>`;
      });

      resultsHtml += `</ul><a href="${file.url}" target="_blank">📂 View full file</a><hr>`;
    }
  }

  if (foundSomething) {
    addMessage(resultsHtml, 'bot');
  } else {
    addMessage(`No matches found for <strong>${query}</strong>.`, 'bot');
  }

  document.getElementById('loading').style.display = 'none';
}
