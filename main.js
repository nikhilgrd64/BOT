// Test pdf.js loaded
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";
console.log('PDF.js loaded:', typeof pdfjsLib !== 'undefined');

// List your files
const docs = [
  { name: "Abbrevation.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Abbrevation.PDF" },
  { name: "Doubts-in-XML-and-segment.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Doubts-in-XML-and-segment.docx" },
  { name: "EPI-MPI-AND-EMPI.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/EPI-MPI-AND-EMPI.docx" },
  { name: "FHIR-MPI-and-MRN.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/FHIR-MPI-and-MRN.docx" },
  { name: "Formats-HL7-records.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Formats-HL7-records.docx" },
  { name: "HL7-Error-Handling-Guide.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-Error-Handling-Guide.pdf" },
  { name: "HL7-course.pptx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-course.pptx" },
  { name: "Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf" },
  { name: "HL7-course.pptx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Interface-Design-Document.docx" },
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
  let resultsHtml = '';
  let foundSomething = false;

  for (const file of docs) {
    const text = fileTexts[file.name];
    const lower = text.toLowerCase();

    // Extract first paragraph as summary
    const summary = text.trim().split(/\n|\r|\r\n/)[0].substring(0,200) + '...';
    let matches = [];
    terms.forEach(term => {
      let idx = lower.indexOf(term);
      while (idx !== -1) {
        matches.push(idx);
        idx = lower.indexOf(term, idx + term.length);
      }
    });

    matches = matches.sort((a,b)=>a-b).slice(0,3); // up to 3 matches
    if (matches.length) {
      foundSomething = true;
      resultsHtml += `<strong>${file.name}</strong><br><em>${summary}</em><ul>`;

      matches.forEach((index) => {
        let sentenceStart = text.lastIndexOf('.', index) + 1;
        let sentenceEnd = text.indexOf('.', index) + 1;
        if (sentenceEnd === 0) sentenceEnd = text.length;
        let sentence = text.substring(sentenceStart, sentenceEnd).trim();

        terms.forEach(term => {
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
