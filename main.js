// Libraries: PDF.js and Mammoth.js must be included in your HTML
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

let fileTexts = {};
let recentActivity = [];

const docs = [
  {
   
    name: "Doubts-in-XML-and-segment.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Doubts-in-XML-and-segment.docx",
  },
  {
    name: "EPI-MPI-AND-EMPI.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/EPI-MPI-AND-EMPI.docx",
  },
  {
    name: "FHIR-MPI-and-MRN.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/FHIR-MPI-and-MRN.docx",
  },
  {
    name: "Formats-HL7-records.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Formats-HL7-records.docx",
  },
  {
    name: "HL7-Error-Handling-Guide.pdf",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-Error-Handling-Guide.pdf",
  },
  {
    name: "Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf",
  },
  {
    name: "Interface-Design-Document.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Interface-Design-Document.docx",
  },
  {
    name: "HIE-Monitoring-Tool-SOP.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HIE-Monitoring-Tool-SOP.docx",
  },
  {
    name: "J2-Ops-Monitor-Thresholds-and-Management.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/J2-Ops-Monitor-Thresholds-and-Management.docx",
  },
  {
    name: "InterfaceInf-from-GMS-Amin-2022-08-05-Series-Specific.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/InterfaceInf-from-GMS-Amin-2022-08-05-Series-Specific.docx",
  },
  {
    name: "IntelliBridge-Enterprise-IBE-Support-SOP.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/IntelliBridge-Enterprise-IBE-Support-SOP.docx",
  },
  {
    name: "GoAnyWhere-Trobleshooting-Guide.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/GoAnyWhere-Trobleshooting-Guide.docx",
  },
  {
    name: "Elink-and-Capsule.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Elink-and-Capsule.docx",
  },
  {
    name: "Charge-Interface-Issues_Operation-Support-Document.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Charge-Interface-Issues_Operation-Support-Document.docx",
  },
  {
    name: "Ensemble-HIE-Training.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-HIE-Training.docx",
  },
  {
    name: "Ensemble-SOP-and-FAQs.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-SOP-and-FAQs.docx",
  },
  {
    name: "inactive-interfaces.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/inactive-interfaces.docx",
  },
  {
    name: "Aborting-Message-in-HIE.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Aborting-Message-in-HIE.docx",
  },
  {
    name: "Checkpoints-IBE-reboot.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Checkpoints-IBE-reboot.docx",
    
  },
  {
    name: "SOP-for-unplanned-failovers.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/SOP-for-unplanned-failovers.docx",
  }

  // Add more documents as needed
];

document.addEventListener('DOMContentLoaded', async () => {
  await loadFiles();
  generateSidebar();
});

async function extractText(name, buf) {
  if (name.endsWith('.pdf')) {
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let out = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      out += content.items.map(i => i.str).join(' ') + ' ';
    }
    return out;
  } else {
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }
}

async function loadFiles() {
  for (const f of docs) {
    const res = await fetch(f.url);
    const buf = await res.arrayBuffer();
    fileTexts[f.name] = await extractText(f.name, buf);
  }
}

function extractSummary(text) {
  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).map(s => s.trim());
  return sentences.slice(0, 1).join(' ');
}

function getCategoryIcon(text) {
  const mapping = [
    { regex: /\bxml|segment|hl7\b/i, icon: "📄" },
    { regex: /\bmpi|empi|fhir|mrn|interoperability\b/i, icon: "🧠" },
    { regex: /\badt|registration|patient\b/i, icon: "🏥" },
    { regex: /\berror|ack|handling\b/i, icon: "⚠️" },
    { regex: /\binterface|specification|design\b/i, icon: "⚙️" },
    { regex: /\bsop|procedure|steps|guide\b/i, icon: "📘" },
  ];
  for (const m of mapping) {
    if (m.regex.test(text)) return m.icon;
  }
  return "📁"; // default icon
}

function generateSidebar() {
  const summaryList = document.querySelector('.summary-list');
  summaryList.innerHTML = '';
  
  docs.forEach(doc => {
    const text = fileTexts[doc.name] || "";
    const summary = extractSummary(text);
    const icon = getCategoryIcon(text);
    
    const li = document.createElement('li');
    li.innerHTML = `${icon} <a href="${doc.url}" target="_blank">${summary}</a>`;
    summaryList.appendChild(li);
  });
}

// Suggestions: Top keywords from text
function generateSuggestions() {
  const suggestions = document.querySelector('.suggestions-list');
  suggestions.innerHTML = '';

  let allWords = [];
  Object.values(fileTexts).forEach(text => {
    const words = text.match(/\b\w{5,}\b/g);
    if (words) allWords.push(...words.map(w => w.toLowerCase()));
  });
  const freq = {};
  allWords.forEach(w => freq[w] = (freq[w] || 0) + 1);

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  sorted.forEach(([word]) => {
    const icon = getCategoryIcon(word);
    const li = document.createElement('li');
    li.innerHTML = `${icon} <button onclick="searchDocs('${word}')">${word}</button>`;
    suggestions.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', generateSuggestions);

function searchDocs(query) {
  console.log("Search triggered for:", query);
  // Implement search logic here if needed
}
