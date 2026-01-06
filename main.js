pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

let fileTexts = {};
Object.defineProperty(window, 'fileTexts', {
  get: () => fileTexts
});

let recentActivity = [];

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"; // ⚠️ exposed in frontend

const docs = [
  // ... your docs array as-is
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
      searchDocsHybrid();
    }
  });

  generateDynamicSidebar();
  renderRecentActivity();
});

// ---------------- Basic Helpers ----------------

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

// ---------------- OpenAI Hybrid Function ----------------

async function askOpenAIHybrid(question, docContext) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful assistant for healthcare interface documentation and HL7/FHIR/MPI/EMPI guidance." },
          { role: "user", content: `Answer the question using the context below. Highlight the source document references if applicable.\n\nQuestion: ${question}\nContext: ${docContext}` }
        ],
        temperature: 0.3
      })
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "AI could not generate a response.";
  } catch (err) {
    console.error(err);
    return "Error contacting OpenAI API.";
  }
}

// ---------------- Hybrid Search + GPT ----------------

async function searchDocsHybrid(rawQuery = null, labelOverride = null) {
  const queryInput = document.getElementById('searchQuery');
  const query = rawQuery || queryInput.value.trim();
  if (!query) return;

  if (!labelOverride) {
    addMessage(query, 'user');
    queryInput.value = '';
  } else {
    addMessage(labelOverride, 'user');
  }

  logRecentActivity('Searched', query);

  document.getElementById('loading').style.display = 'block';
  await loadFiles();

  const terms = query.toLowerCase().split(/\s+/);
  let docMatchesHtml = '';
  let found = false;

  for (const f of docs) {
    const txt = fileTexts[f.name] || '';
    const sents = splitIntoSentences(txt);
    const matches = sents.filter(s => terms.every(t =>
      t === 'ack' ? /ack|acknowledg/i.test(s) : s.toLowerCase().includes(t)
    ));
    if (matches.length) {
      found = true;
      docMatchesHtml += `<h4>${f.name}</h4><ul>${matches.slice(0, 5).map(s => `<li>${highlightTerms(s, terms)}</li>`).join('')}</ul><a href="${f.url}" target="_blank">📂 View file</a>`;
      logRecentActivity('Viewed', f.name, f.url);
    }
  }

  // Combine all docs text (5000 chars max) for GPT context
  const contextText = Object.values(fileTexts).join(' ').slice(0, 5000);

  const aiAnswer = await askOpenAIHybrid(query, contextText);

  const finalHtml = `<div style="margin-bottom:1em;"><strong>AI Response:</strong><br>${aiAnswer}</div>${docMatchesHtml ? `<div><strong>Relevant Document Sentences:</strong><br>${docMatchesHtml}</div>` : ''}`;
  addMessage(finalHtml);

  document.getElementById('loading').style.display = 'none';
}

// ---------------- Sidebar, Activity, Theme ----------------

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
    btn.onclick = () => searchDocsHybrid(q, label);
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
      btn.onclick = () => searchDocsHybrid(item.searchTerm, item.label);
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
