pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

let fileTexts = {};

// keep your exposure layer exactly as you built
Object.defineProperty(window, "fileTexts", {
  get: () => fileTexts
});

let recentActivity = [];

const WORKER_URL = "https://hybrid-bot-worker.hybridbot.workers.dev"; // GPT Worker endpoint

const docs = [
  { name: "Doubts-in-XML-and-segment.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Doubts-in-XML-and-segment.docx", summary: "HL7 XML and segmenting basics" },
  { name: "EPI-MPI-AND-EMPI.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/EPI-MPI-AND-EMPI.docx", summary: "EPI, MPI, and EMPI explained" },
  { name: "FHIR-MPI-and-MRN.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/FHIR-MPI-and-MRN.docx", summary: "FHIR, MPI, and MRN interoperability" },
  { name: "Formats-HL7-records.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Formats-HL7-records.docx", summary: "HL7 record types and formats" },
  { name: "HL7-Error-Handling-Guide.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HL7-Error-Handling-Guide.pdf", summary: "Handling negative acks and HL7 errors" },
  { name: "Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Incoming-Patient-Administration-Registration-and-ADT-Interface-Technical-Specification.pdf", summary: "Patient ADT interface technical spec" },
  { name: "Interface-Design-Document.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Interface-Design-Document.docx", summary: "Designing healthcare interface workflows" },
  { name: "HIE-Monitoring-Tool-SOP.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HIE-Monitoring-Tool-SOP.docx", summary: "Standard operating procedure for HIE monitoring tool" },
  { name: "J2-Ops-Monitor-Thresholds-and-Management.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/J2-Ops-Monitor-Thresholds-and-Management.docx", summary: "Operations monitoring thresholds and management for J2" },
  { name: "InterfaceInf-from-GMS-Amin-2022-08-05-Series-Specific.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/InterfaceInf-from-GMS-Amin-2022-08-05-Series-Specific.docx", summary: "Series-specific GMS Amin interface information" },
  { name: "IntelliBridge-Enterprise-IBE-Support-SOP.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/IntelliBridge-Enterprise-IBE-Support-SOP.docx", summary: "Support SOP for IntelliBridge Enterprise (IBE)" },
  { name: "GoAnyWhere-Trobleshooting-Guide.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/GoAnyWhere-Trobleshooting-Guide.docx", summary: "Troubleshooting guide for GoAnywhere" },
  { name: "Elink-and-Capsule.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Elink-and-Capsule.docx", summary: "Integration guide for Elink and Capsule" },
  { name: "Charge-Interface-Issues_Operation-Support-Document.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Charge-Interface-Issues_Operation-Support-Document.docx", summary: "Support doc for charge interface issues" },
  { name: "Ensemble-HIE-Training.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-HIE-Training.docx", summary: "Training document for Ensemble HIE" },
  { name: "Ensemble-SOP-and-FAQs.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-SOP-and-FAQs.docx", summary: "Standard procedures and FAQs for Ensemble" },
  { name: "inactive-interfaces.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/inactive-interfaces.docx", summary: "List and details of inactive interfaces" },
  { name: "Aborting-Message-in-HIE.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Aborting-Message-in-HIE.docx", summary: "Guide on aborting messages in HIE" },
  { name: "Checkpoints-IBE-reboot.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Checkpoints-IBE-reboot.docx", summary: "Checklist and steps for IBE reboot" },
  { name: "SOP-for-unplanned-failovers.docx", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/SOP-for-unplanned-failovers.docx", summary: "SOP for managing unplanned failovers" },
  { name: "AppendixA-Segments-info.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/AppendixA-Segments-info.pdf", summary: "Data Definition Tables" },
  { name: "AppendixC.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/AppendixC.pdf", summary: "BNF of HL7 2.5 abstract messages" },
  { name: "AppendixD.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/AppendixD.pdf", summary: "Short Forms and Description" },
  { name: "CH01.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH01.pdf", summary: "HL7 Introduction" },
  { name: "CH02.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH02.pdf", summary: "HL7 Control" },
  { name: "CH02A.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH02A.pdf", summary: "HL7 Supplemental Control" },
  { name: "CH03.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH03.pdf", summary: "Patient Administration" },
  { name: "CH04.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH04.pdf", summary: "Order Entry" },
  { name: "CH05.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH05.pdf", summary: "Query" },
  { name: "CH06.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH06.pdf", summary: "Financial Management" },
  { name: "CH07.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH07.pdf", summary: "Observation Reporting" },
  { name: "CH08.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH08.pdf", summary: "Master Files" },
  { name: "CH09.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH09.pdf", summary: "Document Management" },
  { name: "CH10.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH10.pdf", summary: "Scheduling" },
  { name: "CH11.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH11.pdf", summary: "Patient Referral" },
  { name: "CH12.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH12.pdf", summary: "Patient Care" },
  { name: "CH13.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH13.pdf", summary: "Patient Care" },
  { name: "CH14.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH14.pdf", summary: "Application Management" },
  { name: "CH15.pdf", url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/CH15.pdf", summary: "Personnel Management" }
];


// ---------------- PDF WORKER ----------------
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js";

// ---------------- DATA ----------------
let fileTexts = {};
Object.defineProperty(window, "fileTexts", { get: () => fileTexts });

let recentActivity = [];

const WORKER_URL = "https://hybrid-bot-worker.hybridbot.workers.dev";

// docs array stays the same as before

// ---------------- HELPERS ----------------

function addMessage(html, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = html;
  document.getElementById("messages").appendChild(msg);
  msg.scrollIntoView();
}

function highlightTerms(text, terms) {
  if (!text || typeof text !== "string") return "";

  terms.forEach(t => {
    const rx = new RegExp(`(${t})`, "gi");
    text = text.replace(rx, "<mark>$1</mark>");
  });

  return text;
}

// ---------------- SENTENCE SPLITTER ----------------

function splitIntoSentences(txt) {
  if (!txt) return [];
  txt = String(txt);

  const parts = txt.match(/[^.!?]+[.!?]+/g);
  if (!parts) return [txt.trim()];

  return parts.map(s => s.trim());
}

// ---------------- FILE LOADING ----------------

async function extractText(name, buf) {
  if (name.endsWith(".pdf")) {
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

    let out = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const ct = await page.getTextContent();
      out += ct.items.map(it => it.str).join(" ") + " ";
    }

    return out;
  }

  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return String(result.value || "");
}

async function loadFiles() {
  for (const f of docs) {
    try {
      const res = await fetch(f.url);
      const buf = await res.arrayBuffer();

      fileTexts[f.name] = await extractText(f.name, buf);
    } catch {
      fileTexts[f.name] = "";
    }
  }
}

// ---------------- LOADING INDICATOR HANDLER ----------------

function setLoading(state) {
  const el = document.getElementById("loading");
  if (!el) return;

  el.style.display = state ? "block" : "none";
}

// ---------------- GPT WORKER ----------------

async function askWorker(question, chunks) {
  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        docContext: chunks.join(" ")
      })
    });

    const data = await res.json();

    // graceful fallback instead of quota scream
    if (data.error) return "AI service sleeping until quota wakes.";

    return data.answer || "No GPT response";
  } catch {
    return "AI worker unreachable.";
  }
}

// ---------------- FUSE SEARCH ----------------

function fuseSearch(query) {
  const fuse = new Fuse(
    Object.keys(fileTexts).map(name => ({
      name,
      text: fileTexts[name]
    })),
    {
      keys: ["text","name"],
      includeScore: true,
      threshold: 0.4
    }
  );

  return fuse.search(query);
}

// ---------------- HYBRID SEARCH ----------------

async function searchDocsHybrid(rawQuery = null, labelOverride = null) {

  const queryInput = document.getElementById("searchQuery");
  const query = rawQuery || queryInput.value.trim();

  if (!query) return;

  addMessage(labelOverride || query, "user");
  queryInput.value = "";

  setLoading(true);

  await loadFiles();

  const terms = query.toLowerCase().split(/\s+/);

  let docMatchesHtml = "";

  // classic term based sentence scan
  for (const f of docs) {
    const txt = fileTexts[f.name] || "";
    const sents = splitIntoSentences(txt);

    const matches = sents.filter(s =>
      terms.every(t => s.toLowerCase().includes(t))
    );

    if (matches.length) {
      docMatchesHtml +=
        `<h4>${f.name}</h4><ul>` +
        matches.slice(0, 5)
          .map(s => `<li>${highlightTerms(s, terms)}</li>`)
          .join("") +
        `</ul>`;
    }
  }

  // Fuse semantic armor
  const fuseHits = fuseSearch(query);

  if (fuseHits.length) {
    docMatchesHtml += `<h4>Fuse Semantic Hits</h4><ul>` +
      fuseHits.slice(0,5)
        .map(h => `<li>${h.item.name}</li>`)
        .join("") +
      `</ul>`;
  }

  // build chunks for worker
  const allText = Object.values(fileTexts).join(" ");

  const chunks = [];
  for (let i = 0; i < allText.length; i += 2000) {
    chunks.push(allText.slice(i, i + 2000));
  }

  const aiAnswer = await askWorker(query, chunks);

  const answerBlock =
    `<div><strong>AI Response</strong><br>` +
    aiAnswer +
    `</div>` +
    (docMatchesHtml
      ? `<div><strong>Relevant</strong><br>` + docMatchesHtml + `</div>`
      : "");

  displayAnswerViewer(answerBlock);

  setLoading(false);

}

// ---------------- CENTER VIEWER ----------------

function displayAnswerViewer(html) {
  const viewer = document.getElementById("docResult");
  const area = document.getElementById("answerViewer");

  if (!viewer || !area) return;

  viewer.innerHTML = html;
  area.style.display = "block";
}

// ---------------- VIEW FILE ----------------
function viewFile(fileName) {
  const file = docs.find(d => d.name === fileName);
  if (!file) return;
  window.open(file.url, "_blank");
}


// ---------------- CATEGORIES ONLY SIDEBAR ----------------

function generateDynamicSidebar() {
  const cats = {};

  docs.forEach(d => {
    const c = d.summary || "General";
    if (!cats[c]) cats[c] = 0;
    cats[c]++;
  });

  const ul = document.querySelector(".category-list");
  if (!ul) return;

  ul.innerHTML = "";

  Object.keys(cats).forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c} (${cats[c]})`;
    ul.appendChild(li);
  });
}

function populateFilesByCategory(category) {
  const fileList = document.getElementById("fileList");
  fileList.innerHTML = "";

  const files = docs.filter(d => (d.summary || "General") === category);
  files.forEach(f => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" onclick="viewFile('${f.name}')">${f.name}</a>`;
    fileList.appendChild(li);
  });
}


// ---------------- RECENT ----------------

function renderRecentActivity() {
  const ul = document.getElementById("recentList");
  if (!ul) return;

  ul.innerHTML = "";

  recentActivity.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });
}

function logRecentActivity(action, content) {
  recentActivity.unshift(action + ": " + content);
  renderRecentActivity();
}

// ---------------- INIT ----------------

document.addEventListener("DOMContentLoaded", () => {

  setLoading(false);
  generateDynamicSidebar();
  renderRecentActivity();

  const themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    themeToggle.addEventListener("change", () => {

      document.body.classList.toggle("dark", themeToggle.checked);

      // knob animation support even if selector changes later
      const knob = document.querySelector(".slider-knob");
      if (knob) {
        knob.style.transform = themeToggle.checked ? "translateX(24px)" : "none";
      }

    });
  }

});


// expose for onclick shield
window.logRecentActivity = logRecentActivity;
window.viewFile = viewFile;
window.searchDocsHybrid = searchDocsHybrid;
window.populateFilesByCategory = populateFilesByCategory;


