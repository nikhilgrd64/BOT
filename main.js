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
  return (txt.match(/[^.!?]+[.!?]+/g) || []).map(s => s.trim());
}

async function extractText(name, buf) {
  if (name.endsWith('.pdf')) {
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let out = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const ct = await (await pdf.getPage(i)).getTextContent();
      out += ct.items.map(i => i.str).join(' ') + ' ';
    }
    return out;
  }
  const result = await mammoth.extractRawText({ arrayBuffer: buf });
  return result.value;
}

async function loadFiles() {
  for (const f of docs) {
    if (!fileTexts[f.name]) {
      try {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error();
        const buf = await res.arrayBuffer();
        fileTexts[f.name] = await extractText(f.name, buf);
      } catch {
        fileTexts[f.name] = '';
      }
    }
  }
}

async function searchDocs(rawQuery = null, labelOverride = null) {
  const queryInput = document.getElementById('searchQuery');
  const query = rawQuery || queryInput.value.trim().toLowerCase();
  if (!query) return;

  if (!labelOverride) {
    addMessage(query, 'user');
    queryInput.value = '';
  } else {
    addMessage(labelOverride, 'user');
  }

  logRecentActivity('Searched', query); // 👈 NEW: log query regardless of result

  document.getElementById('loading').style.display = 'block';
  await loadFiles();

  const terms = query.toLowerCase().split(/\s+/);
  let found = false;

  for (const f of docs) {
    const txt = fileTexts[f.name] || '';
    const sents = splitIntoSentences(txt);
    const matches = sents.filter(s => terms.every(t =>
      t === 'ack' ? /ack|acknowledg/i.test(s) : s.toLowerCase().includes(t)
    ));
    if (matches.length) {
      found = true;
      const html = `<h4>${f.name}</h4><ul>${matches.slice(0, 5).map(s => `<li>${highlightTerms(s, terms)}</li>`).join('')}</ul><a href="${f.url}" target="_blank">📂 View file</a>`;
      addMessage(html);
      logRecentActivity('Viewed', f.name, f.url);
    }
  }

  if (!found) {
    const fuse = new Fuse(docs, { keys: ['summary'], threshold: 0.4 });
    const res = fuse.search(query);
    if (res.length) {
      const b = res[0].item;
      const txt = fileTexts[b.name] || '';
      const preview = splitIntoSentences(txt)
        .filter(s => terms.some(t => s.toLowerCase().includes(t)))
        .slice(0, 5)
        .map(s => `<li>${highlightTerms(s, terms)}</li>`)
        .join('');
      addMessage(`🤖 Did you mean <strong>${b.summary}</strong>?<ul>${preview}</ul><a href="${b.url}" target="_blank">📂 View file</a>`);
      logRecentActivity('Suggested', b.name, b.url);
    } else {
      addMessage(`No matches found for <strong>${labelOverride || rawQuery}</strong>.`);
    }
  }

  document.getElementById('loading').style.display = 'none';
}

function generateDynamicSidebar() {
  const categoryMap = new Map();

  docs.forEach(doc => {
    const words = doc.summary
      .toLowerCase()
      .match(/\b\w{4,}\b/g); // get words with 4+ letters to ignore common ones

    if (!words) return;

    for (let word of words) {
      if (!categoryMap.has(word)) categoryMap.set(word, []);
      categoryMap.get(word).push(doc);
    }
  });

  // Sort categories by frequency
  const sortedCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6); // Limit to top 6 categories

  const catEl = document.querySelector('.category-list');
  catEl.innerHTML = '';
  for (const [word, items] of sortedCategories) {
    const li = document.createElement('li');
    li.textContent = `#${word} (${items.length})`;
    li.onclick = () => searchDocs(word, `Category: ${word}`);
    catEl.appendChild(li);
  }

  // Suggestions (based on most frequent terms across summaries)
  const tipsEl = document.querySelector('.tips-list');
  tipsEl.innerHTML = '';
  for (const [word, docs] of sortedCategories.slice(0, 4)) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = `🔍 Related to "${word}"`;
    btn.onclick = () => searchDocs(word, `Explore "${word}"`);
    li.appendChild(btn);
    tipsEl.appendChild(li);
  }
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
