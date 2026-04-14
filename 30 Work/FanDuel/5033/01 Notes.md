Kong Service Mesh
- Do we use Konnect or will this be a self hosted control plane?


<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cloud Consultant — Day One Checklist</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --ink: #0d0d0d;
    --paper: #f5f2ec;
    --accent: #1a4fd6;
    --accent-light: #e8edff;
    --muted: #6b6760;
    --rule: #d8d4cc;
    --done-bg: #f0f7f0;
    --done-text: #3a7a3a;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    padding: 2rem 1rem 4rem;
  }

  .page {
    max-width: 720px;
    margin: 0 auto;
  }

  header {
    border-bottom: 2px solid var(--ink);
    padding-bottom: 1.25rem;
    margin-bottom: 2rem;
    animation: fadeDown 0.5s ease both;
  }

  .eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.4rem;
  }

  h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  h1 em {
    font-style: italic;
    color: var(--accent);
  }

  .subtitle {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: var(--muted);
    font-weight: 300;
  }

  .progress-bar-wrap {
    margin: 1.75rem 0 2.5rem;
    animation: fadeDown 0.5s 0.1s ease both;
  }

  .progress-label {
    display: flex;
    justify-content: space-between;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: var(--muted);
    margin-bottom: 0.5rem;
  }

  .bar-track {
    height: 4px;
    background: var(--rule);
    border-radius: 2px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 2px;
    transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
    width: 0%;
  }

  .section {
    margin-bottom: 2rem;
    animation: fadeUp 0.5s ease both;
  }

  .section:nth-child(1) { animation-delay: 0.15s; }
  .section:nth-child(2) { animation-delay: 0.22s; }
  .section:nth-child(3) { animation-delay: 0.29s; }
  .section:nth-child(4) { animation-delay: 0.36s; }
  .section:nth-child(5) { animation-delay: 0.43s; }
  .section:nth-child(6) { animation-delay: 0.50s; }
  .section:nth-child(7) { animation-delay: 0.57s; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .section-num {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    color: var(--muted);
    width: 1.4rem;
    flex-shrink: 0;
  }

  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
  }

  .items {
    border-left: 2px solid var(--rule);
    margin-left: 2.15rem;
    padding-left: 1rem;
  }

  .item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.55rem 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    user-select: none;
    margin-bottom: 0.1rem;
  }

  .item:hover { background: var(--accent-light); }

  .item.done {
    background: var(--done-bg);
    color: var(--done-text);
  }

  .item.done .item-text {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .checkbox {
    width: 18px;
    height: 18px;
    border: 1.5px solid var(--rule);
    border-radius: 4px;
    flex-shrink: 0;
    margin-top: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s, background 0.15s;
    background: white;
  }

  .item.done .checkbox {
    background: var(--done-text);
    border-color: var(--done-text);
  }

  .check-svg {
    display: none;
  }

  .item.done .check-svg { display: block; }

  .item-text {
    font-size: 0.88rem;
    line-height: 1.5;
    font-weight: 400;
    transition: opacity 0.15s;
  }

  .item-note {
    font-size: 0.75rem;
    color: var(--muted);
    margin-top: 0.1rem;
    font-weight: 300;
  }

  .item.done .item-note { opacity: 0.5; }

  .reset-btn {
    display: block;
    margin: 2rem auto 0;
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    background: none;
    border: 1px solid var(--rule);
    padding: 0.5rem 1.2rem;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .reset-btn:hover { color: var(--ink); border-color: var(--ink); }

  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
</style>
</head>
<body>
<div class="page">
  <header>
    <div class="eyebrow">Day One · Senior Cloud Consultant</div>
    <h1>Client Requirements <em>Checklist</em></h1>
    <p class="subtitle">Tap each item to mark it complete. Work through every section before the session ends.</p>
  </header>

  <div class="progress-bar-wrap">
    <div class="progress-label">
      <span>Progress</span>
      <span id="progress-text">0 / 0 complete</span>
    </div>
    <div class="bar-track"><div class="bar-fill" id="bar-fill"></div></div>
  </div>

  <div id="checklist"></div>
  <button class="reset-btn" onclick="resetAll()">↺ Reset all</button>
</div>

<script>
const sections = [
  {
    title: "Project Scope & Objectives",
    items: [
      { text: "Define the primary business goal driving this cloud initiative", note: "Cost reduction? Scalability? Modernisation? Disaster recovery?" },
      { text: "Clarify the project boundaries — what is explicitly in and out of scope" },
      { text: "Identify key deliverables and success criteria" },
      { text: "Establish a high-level timeline and key milestones" },
      { text: "Understand any regulatory or compliance drivers (GDPR, HIPAA, SOC 2, etc.)" },
    ]
  },
  {
    title: "Current State (As-Is Architecture)",
    items: [
      { text: "Inventory existing infrastructure — on-premises, co-lo, or existing cloud", note: "Servers, databases, storage, networking." },
      { text: "Identify all applications in scope and their interdependencies" },
      { text: "Review current workload sizing (CPU, memory, storage, IOPS)" },
      { text: "Understand existing backup, DR, and high-availability setups" },
      { text: "Collect network diagrams and data flow documentation" },
    ]
  },
  {
    title: "Cloud Platform & Architecture",
    items: [
      { text: "Confirm target cloud provider(s) — AWS, Azure, GCP, multi-cloud, or hybrid" },
      { text: "Understand preference for IaaS / PaaS / SaaS / serverless" },
      { text: "Discuss migration strategy — lift-and-shift, re-platform, re-architect, or greenfield" },
      { text: "Identify landing zone / account structure requirements" },
      { text: "Clarify region and data residency requirements" },
    ]
  },
  {
    title: "Security & Compliance",
    items: [
      { text: "Identify data classification levels and sensitivity of workloads" },
      { text: "Review identity and access management (IAM) requirements and existing SSO/IdP" },
      { text: "Understand encryption requirements — in transit and at rest" },
      { text: "Determine network security requirements (VPN, private connectivity, WAF, DDoS)" },
      { text: "Review compliance certifications required from the cloud provider" },
      { text: "Clarify audit logging and monitoring obligations" },
    ]
  },
  {
    title: "Operations & Support Model",
    items: [
      { text: "Define operational ownership — client team, MSP, or shared responsibility" },
      { text: "Understand monitoring, alerting, and observability expectations" },
      { text: "Agree on RTO / RPO targets for each workload" },
      { text: "Identify incident management and on-call procedures" },
      { text: "Clarify patching, change management, and deployment cadences" },
    ]
  },
  {
    title: "Budget & Commercial",
    items: [
      { text: "Obtain approved project budget (CapEx and OpEx split)" },
      { text: "Discuss cloud spend targets and tagging/cost allocation strategy" },
      { text: "Understand existing cloud commitments (reserved instances, EDP, etc.)" },
      { text: "Identify financial governance and approval workflows" },
      { text: "Clarify billing contacts and preferred procurement channels" },
    ]
  },
  {
    title: "Stakeholders & Governance",
    items: [
      { text: "Map all key stakeholders — sponsors, technical leads, security, finance" },
      { text: "Agree on project governance structure and escalation path" },
      { text: "Establish preferred communication cadence and reporting format" },
      { text: "Identify any third-party vendors or partners involved" },
      { text: "Confirm sign-off process for architecture decisions and change requests" },
    ]
  },
];

const STORAGE_KEY = 'cloud-checklist-v1';

function getState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

let state = getState();

function build() {
  const container = document.getElementById('checklist');
  container.innerHTML = '';
  sections.forEach((sec, si) => {
    const div = document.createElement('div');
    div.className = 'section';
    div.innerHTML = `
      <div class="section-header">
        <span class="section-num">0${si+1}</span>
        <span class="section-title">${sec.title}</span>
      </div>
      <div class="items" id="sec-${si}"></div>
    `;
    container.appendChild(div);
    const itemsEl = div.querySelector(`#sec-${si}`);
    sec.items.forEach((item, ii) => {
      const key = `${si}-${ii}`;
      const isDone = !!state[key];
      const el = document.createElement('div');
      el.className = 'item' + (isDone ? ' done' : '');
      el.innerHTML = `
        <div class="checkbox">
          <svg class="check-svg" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <div class="item-text">${item.text}</div>
          ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
        </div>
      `;
      el.onclick = () => toggle(key, el);
      itemsEl.appendChild(el);
    });
  });
  updateProgress();
}

function toggle(key, el) {
  state[key] = !state[key];
  el.classList.toggle('done', !!state[key]);
  saveState(state);
  updateProgress();
}

function updateProgress() {
  const total = sections.reduce((a, s) => a + s.items.length, 0);
  const done = Object.values(state).filter(Boolean).length;
  document.getElementById('progress-text').textContent = `${done} / ${total} complete`;
  document.getElementById('bar-fill').style.width = `${(done / total) * 100}%`;
}

function resetAll() {
  state = {};
  saveState(state);
  build();
}

build();
</script>
</body>
</html>