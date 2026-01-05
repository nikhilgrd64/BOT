pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

let fileTexts = {};
let recentActivity = [];

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
  },
  {
    name: "HIE-Monitoring-Tool-SOP.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/HIE-Monitoring-Tool-SOP.docx",
    summary: "Standard operating procedure for HIE monitoring tool"
  },
  {
    name: "J2-Ops-Monitor-Thresholds-and-Management.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/J2-Ops-Monitor-Thresholds-and-Management.docx",
    summary: "Operations monitoring thresholds and management for J2"
  },
  {
    name: "InterfaceInf-from-GMS-Amin-2022-08-05-Series-Specific.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/InterfaceInf-from-GMS-Amin-2022-08-05-Series-Specific.docx",
    summary: "Series-specific GMS Amin interface information"
  },
  {
    name: "IntelliBridge-Enterprise-IBE-Support-SOP.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/IntelliBridge-Enterprise-IBE-Support-SOP.docx",
    summary: "Support SOP for IntelliBridge Enterprise (IBE)"
  },
  {
    name: "GoAnyWhere-Trobleshooting-Guide.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/GoAnyWhere-Trobleshooting-Guide.docx",
    summary: "Troubleshooting guide for GoAnywhere"
  },
  {
    name: "Elink-and-Capsule.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Elink-and-Capsule.docx",
    summary: "Integration guide for Elink and Capsule"
  },
  {
    name: "Charge-Interface-Issues_Operation-Support-Document.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Charge-Interface-Issues_Operation-Support-Document.docx",
    summary: "Support doc for charge interface issues"
  },
  {
    name: "Ensemble-HIE-Training.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-HIE-Training.docx",
    summary: "Training document for Ensemble HIE"
  },
  {
    name: "Ensemble-SOP-and-FAQs.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Ensemble-SOP-and-FAQs.docx",
    summary: "Standard procedures and FAQs for Ensemble"
  },
  {
    name: "inactive-interfaces.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/inactive-interfaces.docx",
    summary: "List and details of inactive interfaces"
  },
  {
    name: "Aborting-Message-in-HIE.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Aborting-Message-in-HIE.docx",
    summary: "Guide on aborting messages in HIE"
  },
  {
    name: "Checkpoints-IBE-reboot.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/Checkpoints-IBE-reboot.docx",
    summary: "Checklist and steps for IBE reboot"
  },
  {
    name: "SOP-for-unplanned-failovers.docx",
    url: "https://raw.githubusercontent.com/nikhilgrd64/BOT/main/Files/SOP-for-unplanned-failovers.docx",
    summary: "SOP for managing unplanned failovers"
  }
];


document.addEventListener('DOMContentLoaded', () => {
  const fileList = document.getElementById('fileList');
  docs.forEach(doc => {
    const li = document.createElement('li');
    li.textContent = doc.summary;
    fileList.appendChild(li);
  });

  document.getElementById('toggleLeftSidebar').onclick = () =>
    document.querySelector('.sidebar-left').classList.toggle('active');
  document.getElementById('toggleRightSidebar').onclick = () =>
    document.querySelector('.sidebar-right').classList.toggle('active');

  document.getElementById('toggleSummary').onclick = () => {
    const sb = document.getElementById('fileSummary');
    sb.style.display = sb.style.display === 'none' ? 'block' : 'none';
    document.getElementById('toggleSummary').textContent = sb.style.display === 'none' ? 'Show' : 'Hide';
  };

  document.getElementById('themeToggle').onchange = e =>
    document.body.classList.toggle('dark', e.target.checked);

  document.getElementById('searchQuery').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchDocs();
    }
  });

  generateDynamicSidebar();
  renderRecentActivity();
});

function addMessage(html, sender = 'bot') {
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;
  msg.innerHTML = html;
  document.getElementById('messages').appendChild(msg);
  msg.scrollIntoView();
}

function highlightTerms(text, terms) {
  terms.forEach(t => {
    const rx = new RegExp(`(${t})`, 'gi');
    text = text.replace(rx, '<mark>$1</mark>');
  });
  return text;
}

function splitIntoSentences(txt) {
  if (!txt) return [];
  return txt
    .replace(/\s+/g, ' ')
    .split(/(?<=\.)|(?<=\?)|(?<=!)|\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 40);
}

async function extractText(name, buf) {
  try {
    if (name.endsWith('.pdf')) {
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      let out = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const ct = await page.getTextContent();
        out += ct.items.map(it => it.str).join(' ') + ' ';
      }
      return out;
    }

    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value || '';
  } catch (e) {
    console.error('Extraction failed:', name, e);
    return '';
  }
}


async function loadFiles() {
  for (const f of docs) {
    if (!fileTexts[f.name]) {
      try {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error();
        const buf = await res.arrayBuffer();
        fileTexts[f.name] = await extractText(f.name, buf);
        console.log(`Loaded: ${f.name} (${fileTexts[f.name].length} chars)`);
      } catch {
        fileTexts[f.name] = '';
      }
    }
  }
}

async function searchDocs(rawQuery = null, labelOverride = null) {
  const input = document.getElementById('searchQuery');
  const query = (rawQuery || input.value).trim().toLowerCase();
  if (!query) return;

  addMessage(labelOverride || query, 'user');
  input.value = '';

  document.getElementById('loading').style.display = 'block';

  await loadFiles();

  const terms = query.split(/\s+/);
  let found = false;

  for (const doc of docs) {
    const text = (fileTexts[doc.name] || '').toLowerCase();
    if (!text) continue;

    const sentences = splitIntoSentences(text);
    const hits = sentences.filter(s =>
      terms.some(t =>
        t === 'ack'
          ? /ack|acknowledg/i.test(s)
          : s.includes(t)
      )
    );

    if (hits.length) {
      found = true;
      addMessage(`
        <h4>${doc.name}</h4>
        <ul>${hits.slice(0, 5).map(s => `<li>${highlightTerms(s, terms)}</li>`).join('')}</ul>
        <a href="${doc.url}" target="_blank">📂 View file</a>
      `);
    }
  }

  if (!found) {
    addMessage(`No document content found for <strong>${query}</strong>.`);
  }

  document.getElementById('loading').style.display = 'none';
}

function generateDynamicSidebar() {
  const cats = {};
  const tips = new Map();

  docs.forEach(d => {
    const txt = (d.summary + ' ' + d.name).toLowerCase();

    if (/interface|adt/.test(txt)) cats['🧩 Interface Specs'] = (cats['🧩 Interface Specs'] || 0) + 1;
    if (/error|ack/.test(txt)) cats['⚙️ HL7 Troubleshooting'] = (cats['⚙️ HL7 Troubleshooting'] || 0) + 1;
    if (/mpi|empi|fhir/.test(txt)) cats['🧠 Data Interoperability'] = (cats['🧠 Data Interoperability'] || 0) + 1;
    if (/record|patient/.test(txt)) cats['📘 Patient Record Flows'] = (cats['📘 Patient Record Flows'] || 0) + 1;

    if (/adt/.test(txt)) tips.set('🔍 Show ADT message types', 'adt message types');
    if (/ack/.test(txt)) tips.set('⚠️ HL7 ACK handling', 'hl7 ack handling');
    if (/empi/.test(txt)) tips.set('💡 Difference between MPI & EMPI', 'mpi empi difference');
    if (/xml/.test(txt)) tips.set('📄 XML structure in HL7', 'hl7 xml format');
    if (/segment/.test(txt)) tips.set('📊 Segment use in HL7', 'hl7 segment types');
    if (/fhir/.test(txt)) tips.set('🌐 FHIR usage in interoperability', 'fhir data exchange');
    if (/mrn/.test(txt)) tips.set('🧾 What is MRN?', 'mrn in hl7');
  });

  const catEl = document.querySelector('.category-list');
  catEl.innerHTML = '';
  for (const [c, n] of Object.entries(cats)) {
    const li = document.createElement('li');
    li.textContent = `${c} (${n})`;
    catEl.appendChild(li);
  }

  const tipsEl = document.querySelector('.tips-list');
  tipsEl.innerHTML = '';
  for (const [label, q] of tips.entries()) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'suggestion-btn';
    btn.onclick = () => searchDocs(q, label);
    li.appendChild(btn);
    tipsEl.appendChild(li);
  }
}

function logRecentActivity(action, content, url = null) {
  const item = {
    type: action,
    label: `${action}: ${content}`,
    url,
    searchTerm: action === 'Searched' ? content : null
  };
  recentActivity.unshift(item);
  // ❌ No limit anymore! Let it grow unlimited.
  renderRecentActivity();
}


function renderRecentActivity() {
  const ul = document.querySelector('.recent-activity ul');
  if (!ul) return;
  ul.innerHTML = '';
  recentActivity.forEach(item => {
    const li = document.createElement('li');
    if (item.url) {
      const a = document.createElement('a');
      a.textContent = item.label;
      a.href = item.url;
      a.target = "_blank";
      li.appendChild(a);
    } else if (item.searchTerm) {
      const btn = document.createElement('button');
      btn.textContent = item.label;
      btn.onclick = () => searchDocs(item.searchTerm, item.label);
      li.appendChild(btn);
    } else {
      li.textContent = item.label;
    }
    ul.appendChild(li);
  });
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  document.getElementById('themeToggle').checked = isDark;
}

