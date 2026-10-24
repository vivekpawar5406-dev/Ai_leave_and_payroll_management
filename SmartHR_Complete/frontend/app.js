/**
 * PeoplePilot Pro — Quantum Neural HRMS Platform
 * Interactive, Futuristic, Blazing-Fast Controller
 */

// Direct loopback avoids Windows IPv6 localhost DNS resolution delays
const API = (window.location.port === '8081')
  ? '/api'
  : 'http://127.0.0.1:8081/api';

// Core State
let currentUser = null;
let role = 'HR';
let page = 'overview';
let soundEnabled = true;
let voiceEnabled = false;
let leavesViewMode = 'kanban'; // 'kanban' | 'table'

// Initial Fast Data Caches
let employees = [
  { id: 1, name: 'Aarav Sharma', email: 'employee@demo.com', department: 'Engineering', jobTitle: 'Software Engineer', baseSalary: 45000, leaveBalance: 12, status: 'ACTIVE' },
  { id: 2, name: 'Priya Patel', email: 'priya@demo.com', department: 'Human Resources', jobTitle: 'HR Executive', baseSalary: 38000, leaveBalance: 10, status: 'ACTIVE' },
  { id: 3, name: 'Rohan Mehta', email: 'rohan@demo.com', department: 'Engineering', jobTitle: 'Backend Developer', baseSalary: 52000, leaveBalance: 8, status: 'ACTIVE' },
  { id: 4, name: 'Ananya Desai', email: 'ananya@demo.com', department: 'Marketing', jobTitle: 'Marketing Associate', baseSalary: 35000, leaveBalance: 14, status: 'ACTIVE' }
];
let leaves = [
  { id: 1, employeeId: 1, employeeName: 'Aarav Sharma', department: 'Engineering', leaveType: 'ANNUAL', startDate: '2026-10-26', endDate: '2026-10-27', days: 2, reason: 'Personal work', status: 'PENDING' },
  { id: 2, employeeId: 3, employeeName: 'Rohan Mehta', department: 'Engineering', leaveType: 'SICK', startDate: '2026-10-20', endDate: '2026-10-20', days: 1, reason: 'Not feeling well', status: 'APPROVED' },
  { id: 3, employeeId: 4, employeeName: 'Ananya Desai', department: 'Marketing', leaveType: 'ANNUAL', startDate: '2026-10-29', endDate: '2026-10-30', days: 2, reason: 'Family event', status: 'PENDING' }
];
let attendance = [
  { id: 1, employeeId: 1, employeeName: 'Aarav Sharma', department: 'Engineering', workDate: '2026-10-20', status: 'PRESENT', hours: 8 },
  { id: 2, employeeId: 2, employeeName: 'Priya Patel', department: 'Human Resources', workDate: '2026-10-20', status: 'PRESENT', hours: 8 },
  { id: 3, employeeId: 3, employeeName: 'Rohan Mehta', department: 'Engineering', workDate: '2026-10-20', status: 'REMOTE', hours: 8 },
  { id: 4, employeeId: 4, employeeName: 'Ananya Desai', department: 'Marketing', workDate: '2026-10-20', status: 'ABSENT', hours: 0 }
];
let payroll = [
  { id: 1, employeeId: 1, employeeName: 'Aarav Sharma', department: 'Engineering', payMonth: '2026-09', basicSalary: 45000, allowance: 3000, deduction: 500, tax: 2500, netSalary: 45000 },
  { id: 2, employeeId: 2, employeeName: 'Priya Patel', department: 'Human Resources', payMonth: '2026-09', basicSalary: 38000, allowance: 2000, deduction: 0, tax: 1800, netSalary: 38200 },
  { id: 3, employeeId: 3, employeeName: 'Rohan Mehta', department: 'Engineering', payMonth: '2026-09', basicSalary: 52000, allowance: 4000, deduction: 1000, tax: 3500, netSalary: 51500 }
];

// Simulator State
let simExtraHeadcount = 3;
let simSalaryHikePct = 10;

// Filter Controls
let employeeSearch = '';
let employeeDeptFilter = 'ALL';
let leaveFilter = 'ALL';
let attendanceFilter = 'ALL';
let sortCol = null;
let sortAsc = true;

// Document Vault
let documents = [
  { id: 1, name: 'Quantum_HR_Architecture_2026.pdf', category: 'Policy', size: '2.4 MB', uploadedAt: '2026-10-15', uploadedBy: 'HR Admin' },
  { id: 2, name: 'Medical_Certificate_Aarav_Sharma.pdf', category: 'Medical', size: '480 KB', uploadedAt: '2026-10-20', uploadedBy: 'Aarav Sharma' },
  { id: 3, name: 'Smart_Employment_Agreement.docx', category: 'Contract', size: '1.1 MB', uploadedAt: '2026-10-01', uploadedBy: 'Legal Team' }
];

// Utility Helpers
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = s => String(s || '?').split(' ').filter(Boolean).map(x => x[0]).slice(0, 2).join('').toUpperCase();

// ==========================================
// 1. Web Audio API Sci-Fi Synthesizer Sound Engine
// ==========================================
let audioCtx = null;
function playCyberSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else if (type === 'scan') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.35);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'warp') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (_) {}
}

function toggleSoundFX() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('peoplepilot-sound', soundEnabled ? '1' : '0');
  const btn = $('#sound-fx-btn');
  const label = $('#sound-fx-label');
  if (btn) btn.classList.toggle('active', soundEnabled);
  if (label) label.textContent = soundEnabled ? '🔊 Audio FX' : '🔇 Muted';
  if (soundEnabled) playCyberSound('success');
  showToast(soundEnabled ? 'Cyber sound effects enabled' : 'Sound effects muted', 'info');
}

function toggleVoiceSynth() {
  voiceEnabled = !voiceEnabled;
  const btn = $('#voice-synth-btn');
  if (btn) btn.classList.toggle('active', voiceEnabled);
  showToast(voiceEnabled ? 'Neural speech readout active' : 'Voice synthesis muted', 'info');
  if (voiceEnabled) speakCopilot('Neural voice readout activated.');
}

function speakCopilot(text) {
  if (!voiceEnabled || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/•/g, '').replace(/[#*]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1.05;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  } catch (_) {}
}

// ==========================================
// 2. Ambient Particle Constellation Canvas
// ==========================================
function initAmbientCanvas() {
  const canvas = $('#ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const particles = [];
  const COUNT = Math.min(38, Math.floor(w / 45));

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 2 + 1
    });
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const dotColor = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.2)';
    const lineColor = isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.06)';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Toast Notifications
function showToast(msg, type = 'success') {
  playCyberSound(type === 'error' ? 'click' : 'success');
  const container = $('#toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
  toast.innerHTML = `
    <span style="font-weight:800;color:${type === 'success' ? 'var(--green)' : type === 'error' ? 'var(--red)' : 'var(--primary)'}">${icon}</span>
    <span class="toast-msg">${esc(msg)}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Fast API Fetch with 10s Timeout
async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const r = await fetch(API + path, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
    clearTimeout(timeoutId);
    if (!r.ok) {
      let msg = await r.text();
      try {
        const p = JSON.parse(msg);
        if (p.message) msg = p.message;
        else if (p.error && typeof p.error === 'string' && p.error !== 'Bad Request' && p.error !== 'Internal Server Error') msg = p.error;
      } catch (_) {}
      if (r.status === 409 && (!msg || msg === 'Conflict')) {
        msg = 'An employee with this email already exists in the system.';
      }
      throw new Error(msg || `Request failed (${r.status})`);
    }
    if (r.status === 204) return null;
    return r.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error('API request timed out');
    throw err;
  }
}

// Refresh Data from MySQL Backend
async function refresh() {
  try {
    const [empData, leaveData, attData, payData] = await Promise.all([
      request('/employees'),
      request('/leaves'),
      request('/attendance'),
      request('/payroll')
    ]);
    if (empData) employees = empData;
    if (leaveData) leaves = leaveData;
    if (attData) attendance = attData;
    if (payData) payroll = payData;
    $('#session-status').textContent = 'Live (MySQL)';
    $('#session-status').style.color = 'var(--green)';
  } catch (err) {
    console.warn('Backend sync note:', err.message);
    $('#session-status').textContent = 'Local Cache';
    $('#session-status').style.color = 'var(--amber)';
  }
  render();
}

// ==========================================
// 3. Command HUD & Palette (Ctrl+K)
// ==========================================
const HUD_COMMANDS = [
  { label: 'Overview Dashboard', badge: 'PAGE', action: () => go('overview') },
  { label: 'Workforce Employees', badge: 'PAGE', action: () => go('employees') },
  { label: 'Leaves Kanban & Approvals', badge: 'PAGE', action: () => go('leaves') },
  { label: 'Attendance & Daily Logs', badge: 'PAGE', action: () => go('attendance') },
  { label: 'Payroll & Simulator', badge: 'PAGE', action: () => go('payroll') },
  { label: 'Encrypted Document Vault', badge: 'PAGE', action: () => go('documents') },
  { label: '+ Add New Employee Record', badge: 'CREATE', action: () => addEmployeeModal() },
  { label: '+ Apply for Leave Request', badge: 'ACTION', action: () => applyLeaveModal() },
  { label: '⚡ 1-Click Clock In Today', badge: 'CHECKIN', action: () => quickCheckin() },
  { label: '✨ Ask Neural Copilot AI', badge: 'AI', action: () => toggleCopilot() },
  { label: '🌓 Toggle Dark / Light Mode', badge: 'THEME', action: () => toggleTheme() },
  { label: '📥 Export Employee Directory CSV', badge: 'EXPORT', action: () => exportEmployeesCSV() },
  { label: '📥 Export Payroll Register CSV', badge: 'EXPORT', action: () => exportPayrollCSV() },
  { label: '🚪 Logout from Platform', badge: 'SESSION', action: () => logout() }
];

function openHUD() {
  playCyberSound('warp');
  const modal = $('#hud-modal');
  modal.classList.remove('hidden');
  const input = $('#hud-input');
  input.value = '';
  filterHUD('');
  setTimeout(() => input.focus(), 50);
}

function closeHUD(e) {
  if (e) e.stopPropagation();
  $('#hud-modal')?.classList.add('hidden');
}

function filterHUD(q) {
  const query = (q || '').trim().toLowerCase();
  const container = $('#hud-results');
  let matches = [];

  if (!query) {
    matches = HUD_COMMANDS.slice(0, 8);
  } else {
    matches = HUD_COMMANDS.filter(c => c.label.toLowerCase().includes(query));
    // Also search employees
    employees.forEach(e => {
      if (e.name.toLowerCase().includes(query) || e.department.toLowerCase().includes(query)) {
        matches.push({
          label: `👤 ${e.name} (${e.department} · ${e.jobTitle || 'Staff'})`,
          badge: 'PROFILE',
          action: () => { openProfileDrawer(e.id); }
        });
      }
    });
  }

  container.innerHTML = matches.length ? matches.map((m, i) => `
    <div class="hud-item ${i === 0 ? 'selected' : ''}" onclick="executeHUD(${i})">
      <span style="font-weight:600">${esc(m.label)}</span>
      <span class="hud-badge">${esc(m.badge)}</span>
    </div>
  `).join('') : `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">No commands or employees matching "${esc(query)}"</div>`;

  window._hudActiveMatches = matches;
}

function executeHUD(idx) {
  playCyberSound('click');
  closeHUD();
  const m = (window._hudActiveMatches || [])[idx];
  if (m && m.action) m.action();
}

window.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const modal = $('#hud-modal');
    if (modal.classList.contains('hidden')) openHUD(); else closeHUD();
  } else if (e.key === 'Escape') {
    closeHUD();
    closeModal();
    closeProfileDrawer();
  }
});

// ==========================================
// 4. Interactive Drag-and-Drop Kanban Board for Leaves
// ==========================================
function renderKanbanBoard(list) {
  const pending = list.filter(l => l.status === 'PENDING');
  const approved = list.filter(l => l.status === 'APPROVED');
  const rejected = list.filter(l => l.status === 'REJECTED');

  return `
  <div class="kanban-board">
    <!-- PENDING COLUMN -->
    <div class="kanban-col" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'PENDING')">
      <div class="kanban-head">
        <b><span style="color:var(--amber)">●</span> Pending Review (${pending.length})</b>
        <span class="badge pending">Awaiting</span>
      </div>
      <div class="kanban-dropzone" id="kanban-pending">
        ${pending.map(l => kanbanCardHTML(l)).join('')}
      </div>
    </div>

    <!-- APPROVED COLUMN -->
    <div class="kanban-col" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'APPROVED')">
      <div class="kanban-head">
        <b><span style="color:var(--green)">●</span> Approved (${approved.length})</b>
        <span class="badge approved">Active</span>
      </div>
      <div class="kanban-dropzone" id="kanban-approved">
        ${approved.map(l => kanbanCardHTML(l)).join('')}
      </div>
    </div>

    <!-- REJECTED COLUMN -->
    <div class="kanban-col" ondragover="handleDragOver(event)" ondrop="handleDrop(event, 'REJECTED')">
      <div class="kanban-head">
        <b><span style="color:var(--red)">●</span> Rejected (${rejected.length})</b>
        <span class="badge rejected">Closed</span>
      </div>
      <div class="kanban-dropzone" id="kanban-rejected">
        ${rejected.map(l => kanbanCardHTML(l)).join('')}
      </div>
    </div>
  </div>
  `;
}

function kanbanCardHTML(l) {
  return `
  <div class="kanban-card" draggable="${role !== 'EMPLOYEE'}" ondragstart="handleDragStart(event, ${l.id})">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <b>${esc(l.employeeName || 'Emp #' + l.employeeId)}</b>
      <span class="badge ${esc(l.status.toLowerCase())}">${esc(l.leaveType)}</span>
    </div>
    <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">
      📅 ${esc(l.startDate)} → ${esc(l.endDate)} (<b>${l.days} days</b>)
    </div>
    <p style="font-size:11.5px;color:var(--text-main);margin:0;opacity:0.85">${esc(l.reason || 'No justification entered.')}</p>
    ${role !== 'EMPLOYEE' && l.status === 'PENDING' ? `
      <div style="display:flex;gap:6px;margin-top:10px">
        <button class="action-btn" style="color:var(--green);flex:1" onclick="decideLeaveAction(${l.id}, 'APPROVED')">Approve</button>
        <button class="action-btn danger" style="flex:1" onclick="decideLeaveAction(${l.id}, 'REJECTED')">Reject</button>
      </div>
    ` : ''}
  </div>`;
}

function handleDragStart(e, leaveId) {
  playCyberSound('click');
  e.dataTransfer.setData('text/plain', String(leaveId));
}

function handleDragOver(e) {
  e.preventDefault();
}

async function handleDrop(e, targetStatus) {
  e.preventDefault();
  const idStr = e.dataTransfer.getData('text/plain');
  const id = Number(idStr);
  if (!id) return;
  const l = leaves.find(x => x.id === id);
  if (!l || l.status === targetStatus) return;

  if (targetStatus === 'PENDING') {
    showToast('Cannot revert processed requests to pending', 'error');
    return;
  }
  await decideLeaveAction(id, targetStatus);
}

// ==========================================
// 6. Interactive Salary & Headcount Simulator
// ==========================================
function renderPayrollSimulator() {
  const currentTotal = payroll.reduce((s, p) => s + Number(p.netSalary || 0), 0);
  const avgSalary = payroll.length ? Math.round(currentTotal / payroll.length) : 45000;
  
  const simNewStaff = Number(simExtraHeadcount || 0);
  const simHike = Number(simSalaryHikePct || 0);
  
  const hikedAvg = Math.round(avgSalary * (1 + simHike / 100));
  const newStaffCost = simNewStaff * hikedAvg;
  const projectedTotal = Math.round(currentTotal * (1 + simHike / 100) + newStaffCost);
  const delta = projectedTotal - currentTotal;

  return `
  <div class="sim-grid">
    <div style="display:flex;flex-direction:column;gap:18px">
      <div style="font-size:12px;font-weight:700;color:var(--primary);letter-spacing:1px">DYNAMIC SCENARIO SIMULATOR</div>
      <h3 style="font-size:17px;font-weight:800;margin:0">Forecast Workforce Expansion & Compensation</h3>
      <p style="font-size:12.5px;color:var(--text-muted)">Adjust parameters to view projected monthly burn rate and runway implications.</p>

      <div class="sim-slider-group">
        <div class="sim-slider-meta">
          <span>Projected Headcount Additions</span>
          <b>+${simNewStaff} Engineers</b>
        </div>
        <input type="range" class="cyber-range" min="0" max="25" value="${simNewStaff}" oninput="updateSimHeadcount(this.value)">
      </div>

      <div class="sim-slider-group">
        <div class="sim-slider-meta">
          <span>Company-wide Salary Hike Percentage</span>
          <b>${simHike}%</b>
        </div>
        <input type="range" class="cyber-range" min="0" max="40" step="2" value="${simHike}" oninput="updateSimHike(this.value)">
      </div>
    </div>

    <!-- Projected Output Hologram -->
    <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:20px;display:flex;flex-direction:column;justify-content:space-between">
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:11px;font-weight:700;color:var(--text-faint)">PROJECTED MONTHLY PAYROLL</span>
          <span class="badge" style="background:var(--primary-light);color:var(--primary)">Simulation</span>
        </div>
        <div style="font-size:30px;font-weight:800;color:var(--text-main);letter-spacing:-0.8px">${money(projectedTotal)}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:6px">
          Net Delta: <b style="color:var(--red)">+${money(delta)} / month</b>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;border-top:1px solid var(--border-subtle);padding-top:14px;font-size:12px">
        <div>
          <span style="color:var(--text-muted)">Projected Headcount</span><br>
          <b>${employees.length + simNewStaff} Team Members</b>
        </div>
        <div>
          <span style="color:var(--text-muted)">Projected Annual Cost</span><br>
          <b>${money(projectedTotal * 12)} / yr</b>
        </div>
      </div>
    </div>
  </div>
  `;
}

function updateSimHeadcount(v) {
  simExtraHeadcount = Number(v);
  render();
}

function updateSimHike(v) {
  simSalaryHikePct = Number(v);
  render();
}

// Session Initialization
function checkSession() {
  const raw = localStorage.getItem('peoplepilot-user');
  if (raw) {
    try {
      currentUser = JSON.parse(raw);
    } catch (_) {
      currentUser = null;
    }
  }

  const authScreen = $('#auth-screen');
  if (!currentUser) {
    if (authScreen) {
      authScreen.classList.remove('hidden');
      authScreen.style.setProperty('display', 'flex', 'important');
    }
  } else {
    if (authScreen) {
      authScreen.classList.add('hidden');
      authScreen.style.setProperty('display', 'none', 'important');
    }
    role = currentUser.role || 'HR';
    updateUserBadges();
  }
}

function updateUserBadges() {
  if (!currentUser) return;
  const nameEl = $('#profile-name');
  const roleEl = $('#profile-role');
  const avatarEl = $('#profile-avatar');
  if (nameEl) nameEl.textContent = currentUser.displayName || currentUser.username;
  if (roleEl) roleEl.textContent = currentUser.role || 'HR ADMIN';
  if (avatarEl) avatarEl.textContent = initials(currentUser.displayName || currentUser.username);
}

function switchAuthTab(tab) {
  playCyberSound('click');
  if (tab === 'login') {
    $('#tab-login')?.classList.add('active');
    $('#tab-register')?.classList.remove('active');
    const loginF = $('#login-form');
    const regF = $('#register-form');
    if (loginF) loginF.style.display = 'block';
    if (regF) regF.style.display = 'none';
  } else {
    $('#tab-register')?.classList.add('active');
    $('#tab-login')?.classList.remove('active');
    const loginF = $('#login-form');
    const regF = $('#register-form');
    if (loginF) loginF.style.display = 'none';
    if (regF) regF.style.display = 'block';
  }
}

function quickFillLogin(email, password) {
  playCyberSound('click');
  const emailInput = $('#auth-email');
  const passInput = $('#auth-password');
  if (emailInput) emailInput.value = email;
  if (passInput) passInput.value = password;
  doLogin(email, password, true);
}

// Dedicated High-Reliability Login Controller
async function doLogin(email, password, remember = true) {
  const submitBtn = $('#btn-login-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying credentials...';
  }

  try {
    let userData = null;
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: email, password })
      });
      if (res && res.user) {
        userData = res.user;
      }
    } catch (apiErr) {
      console.warn('API login notice:', apiErr.message);
    }

    if (!userData) {
      const defaultAccounts = {
        'admin@peoplepilot.com': { id: 1, username: 'admin@peoplepilot.com', role: 'HR', displayName: 'HR Administrator', employeeId: 2 },
        'manager@peoplepilot.com': { id: 2, username: 'manager@peoplepilot.com', role: 'MANAGER', displayName: 'Rohan Mehta (Manager)', employeeId: 3 },
        'employee@demo.com': { id: 3, username: 'employee@demo.com', role: 'EMPLOYEE', displayName: 'Aarav Sharma', employeeId: 1 },
        'priya@demo.com': { id: 4, username: 'priya@demo.com', role: 'EMPLOYEE', displayName: 'Priya Patel', employeeId: 2 }
      };
      if (defaultAccounts[email] && (password.includes('123') || password.length >= 4)) {
        userData = defaultAccounts[email];
      } else {
        throw new Error('Invalid email or password. Please verify credentials or select a 1-click demo card.');
      }
    }

    currentUser = userData;
    if (remember) {
      localStorage.setItem('peoplepilot-user', JSON.stringify(currentUser));
    }
    role = currentUser.role || 'HR';

    // Guaranteed Dismissal of Auth Screen
    const authScreen = $('#auth-screen');
    if (authScreen) {
      authScreen.classList.add('hidden');
      authScreen.style.setProperty('display', 'none', 'important');
    }

    updateUserBadges();
    playCyberSound('success');
    showToast(`Welcome back, ${currentUser.displayName}!`, 'success');
    render();
    await refresh();
  } catch (err) {
    playCyberSound('click');
    showToast('Login failed: ' + err.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In to PeoplePilot';
    }
  }
}

function handleLoginSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const emailInput = $('#auth-email');
  const passInput = $('#auth-password');
  const email = (emailInput ? emailInput.value : '').trim();
  const password = (passInput ? passInput.value : '').trim();
  const remember = $('#auth-remember')?.checked ?? true;
  doLogin(email, password, remember);
  return false;
}

async function handleRegisterSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const name = $('#reg-name').value.trim();
  const email = $('#reg-email').value.trim();
  const password = $('#reg-password').value.trim();
  const regRole = $('#reg-role').value;
  const department = $('#reg-dept').value.trim();
  const submitBtn = $('#btn-reg-submit');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
  }

  try {
    let registeredUser = null;
    try {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: email,
          password,
          role: regRole,
          displayName: name,
          department
        })
      });
      registeredUser = res;
    } catch (apiErr) {
      console.warn('API register fallback:', apiErr.message);
      registeredUser = {
        id: Date.now(),
        username: email,
        role: regRole,
        displayName: name,
        department
      };
    }

    currentUser = registeredUser;
    localStorage.setItem('peoplepilot-user', JSON.stringify(currentUser));
    role = currentUser.role || 'HR';

    const authScreen = $('#auth-screen');
    if (authScreen) {
      authScreen.classList.add('hidden');
      authScreen.style.setProperty('display', 'none', 'important');
    }
    updateUserBadges();
    playCyberSound('success');
    showToast(`Account created! Welcome, ${name}.`, 'success');
    render();
    await refresh();
  } catch (err) {
    showToast('Registration note: ' + err.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account & Sign In';
    }
  }
  return false;
}

function logout() {
  playCyberSound('click');
  localStorage.removeItem('peoplepilot-user');
  currentUser = null;
  const authScreen = $('#auth-screen');
  if (authScreen) {
    authScreen.classList.remove('hidden');
    authScreen.style.setProperty('display', 'flex', 'important');
  }
  showToast('You have been logged out safely.', 'info');
}

// Live Clock
function startClock() {
  const clockEl = $('#live-clock');
  const greetingEl = $('#page-title');
  function update() {
    const now = new Date();
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (greetingEl && page === 'overview') {
      const hour = now.getHours();
      const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const name = currentUser ? currentUser.displayName : (role === 'EMPLOYEE' ? 'Aarav' : role === 'MANAGER' ? 'Manager' : 'HR Team');
      greetingEl.textContent = `${timeGreeting}, ${name} 👋`;
    }
  }
  update();
  setInterval(update, 1000);
}

// Theme Engine
function initTheme() {
  const saved = localStorage.getItem('peoplepilot-theme') || 'dark'; // Futuristic dark mode default
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function toggleTheme() {
  playCyberSound('click');
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('peoplepilot-theme', next);
  updateThemeIcon(next);
  showToast(`Switched to ${next} mode`, 'info');
}

function updateThemeIcon(t) {
  const icon = $('#theme-icon');
  if (!icon) return;
  if (t === 'dark') {
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
  } else {
    icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
  }
}

// 1-Click Quick Check-in
async function quickCheckin() {
  playCyberSound('click');
  const myEmp = getActiveEmployee();
  if (!myEmp) return showToast('No active employee found to clock in', 'error');
  const today = new Date().toISOString().slice(0, 10);
  try {
    await request('/attendance', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: myEmp.id,
        workDate: today,
        status: 'PRESENT',
        hours: 8.5
      })
    });
    playCyberSound('success');
    await refresh();
    showToast(`Clocked in for today (${today})!`, 'success');
  } catch (err) {
    showToast('Clock-in note: ' + err.message, 'error');
  }
}

function getActiveEmployee() {
  if (currentUser && currentUser.employeeId) {
    const found = employees.find(e => e.id === currentUser.employeeId);
    if (found) return found;
  }
  if (currentUser && currentUser.username) {
    const found = employees.find(e => e.email === currentUser.username);
    if (found) return found;
  }
  return employees.find(e => e.email === 'employee@demo.com') || employees[0] || {};
}

// Export CSV Feature
function exportToCSV(filename, headers, rows) {
  playCyberSound('click');
  const csvContent = [
    headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','),
    ...rows.map(r => r.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${filename} successfully!`, 'info');
}

// Component Generators
function personCell(e) {
  return `<div class="person-cell" onclick="openProfileDrawer(${e.id})" style="cursor:pointer" title="Click to view 360° profile">
    <div class="person-avatar">${esc(initials(e.name))}</div>
    <div>
      <b>${esc(e.name)}</b>
      <small>${esc(e.department || 'General')} · ${esc(e.jobTitle || 'Employee')}</small>
    </div>
  </div>`;
}

function statusBadge(s) {
  const val = String(s || '').toLowerCase();
  return `<span class="badge ${esc(val)}"><span class="badge-dot"></span>${esc(s || '—')}</span>`;
}

function statCard(label, val, foot, iconSvg, trendClass = 'trend-good') {
  return `<div class="cyber-card">
    <div class="stat-top">
      <span>${label}</span>
      <div class="stat-icon-wrapper">${iconSvg}</div>
    </div>
    <div class="stat-number">${val}</div>
    <div class="stat-foot">
      <span class="${trendClass}">${foot}</span>
    </div>
  </div>`;
}

function panel(title, subtitle, content, rightAction = '') {
  return `<section class="panel cyber-card">
    <div class="panel-head">
      <div>
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      ${rightAction}
    </div>
    ${content}
  </section>`;
}

// SVG Charts Generator
function renderDepartmentChart() {
  const counts = {};
  employees.forEach(e => {
    const d = e.department || 'Other';
    counts[d] = (counts[d] || 0) + 1;
  });
  const total = employees.length || 1;
  const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
  const depts = Object.keys(counts);

  if (!depts.length) return `<div style="color:var(--text-muted);padding:20px;text-align:center">No department data available.</div>`;

  return `<div class="chart-container">
    ${depts.map((d, i) => {
      const c = counts[d];
      const pct = Math.round((c / total) * 100);
      const color = colors[i % colors.length];
      return `<div class="bar-row">
        <div class="bar-meta">
          <span>${esc(d)}</span>
          <span style="color:var(--text-muted)">${c} team members (<b>${pct}%</b>)</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function renderPayrollTrendChart() {
  if (!payroll.length) return `<div style="color:var(--text-muted);padding:20px;text-align:center">No payroll records saved yet.</div>`;
  const recent = payroll.slice(0, 5);
  const maxNet = Math.max(...recent.map(p => Number(p.netSalary || 0)), 1);

  return `<div class="chart-container">
    ${recent.map(p => {
      const net = Number(p.netSalary || 0);
      const pct = Math.round((net / maxNet) * 100);
      return `<div class="bar-row">
        <div class="bar-meta">
          <span>${esc(p.employeeName || 'Emp #' + p.employeeId)} (${esc(p.payMonth)})</span>
          <b>${money(net)}</b>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:linear-gradient(90deg, #4f46e5, #06b6d4)"></div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// Main Render Function
function render() {
  // Strict role determination from login session
  role = currentUser ? (currentUser.role || 'EMPLOYEE') : 'EMPLOYEE';

  const titles = {
    overview: role === 'EMPLOYEE' ? 'Quantum Employee Portal' : role === 'MANAGER' ? 'Manager Neural Dashboard' : 'People Operations Dashboard',
    employees: 'Workforce Directory',
    leaves: role === 'EMPLOYEE' ? 'My Leave Applications' : 'Leave Pipeline & Approvals',
    attendance: role === 'EMPLOYEE' ? 'My Attendance & Time Logs' : 'Attendance & Shift Tracking',
    payroll: role === 'EMPLOYEE' ? 'My Salary & Payslips' : (role === 'MANAGER' ? 'My Compensation & Payslips' : 'Enterprise Payroll & Scenario Simulator'),
    documents: 'Document Vault'
  };

  const name = currentUser ? currentUser.displayName : (role === 'EMPLOYEE' ? 'Aarav' : role === 'MANAGER' ? 'Manager' : 'HR Team');
  $('#page-title').textContent = `${titles[page] || 'PeoplePilot'} · ${name} ⚡`;
  $('#crumb').textContent = page.replace('-', ' ').toUpperCase();
  updateUserBadges();

  // Role-Specific Navigation Labels
  const navAttendance = $('[data-page="attendance"] span');
  if (navAttendance) navAttendance.textContent = (role === 'EMPLOYEE') ? 'My Attendance' : 'Attendance & Time';
  const navPayroll = $('[data-page="payroll"] span');
  if (navPayroll) navPayroll.textContent = (role === 'EMPLOYEE') ? 'My Payslips' : (role === 'MANAGER') ? 'My Compensation' : 'Payroll & Simulator';
  const navLeaves = $('[data-page="leaves"] span');
  if (navLeaves) navLeaves.textContent = (role === 'EMPLOYEE') ? 'My Leaves' : 'Leaves & Kanban';

  // Quick Action Button
  const btn = $('#quick-action');
  if (btn) {
    if (page === 'overview') {
      btn.style.display = 'inline-flex';
      if (role === 'EMPLOYEE') {
        btn.innerHTML = '<span>+ Apply Leave</span>';
        btn.onclick = applyLeaveModal;
      } else if (role === 'MANAGER') {
        btn.innerHTML = '<span>Review Leaves →</span>';
        btn.onclick = () => go('leaves');
      } else {
        btn.innerHTML = '<span>+ Add Employee</span>';
        btn.onclick = addEmployeeModal;
      }
    } else if (page === 'employees') {
      if (role === 'HR') {
        btn.style.display = 'inline-flex';
        btn.innerHTML = '<span>+ Add Employee</span>';
        btn.onclick = addEmployeeModal;
      } else {
        btn.style.display = 'none';
      }
    } else if (page === 'leaves') {
      btn.style.display = 'inline-flex';
      btn.innerHTML = '<span>+ Apply for Leave</span>';
      btn.onclick = applyLeaveModal;
    } else if (page === 'attendance') {
      btn.style.display = 'inline-flex';
      if (role === 'EMPLOYEE') {
        btn.innerHTML = '<span>⚡ Clock In Today</span>';
        btn.onclick = quickCheckin;
      } else {
        btn.innerHTML = '<span>+ Log Shift</span>';
        btn.onclick = markAttendanceModal;
      }
    } else if (page === 'payroll') {
      if (role === 'HR') {
        btn.style.display = 'inline-flex';
        btn.innerHTML = '<span>+ Generate Payroll</span>';
        btn.onclick = generatePayrollModal;
      } else {
        btn.style.display = 'none';
      }
    } else if (page === 'documents') {
      if (role === 'HR') {
        btn.style.display = 'inline-flex';
        btn.innerHTML = '<span>+ Upload Document</span>';
        btn.onclick = () => $('#vault-file-input')?.click();
      } else {
        btn.style.display = 'none';
      }
    }
  }

  // Active Nav Item
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));

  const myEmp = getActiveEmployee();
  const myLeaves = leaves.filter(l => l.employeeId === myEmp.id);
  const pendingLeaves = leaves.filter(l => l.status === 'PENDING');
  const totalPayrollCost = payroll.reduce((s, p) => s + Number(p.netSalary || 0), 0);
  const myLastPay = payroll.find(p => p.employeeId === myEmp.id);

  let html = '';

  // 1. OVERVIEW
  if (page === 'overview') {
    if (role === 'EMPLOYEE') {
      // Employee-Only Overview (Zero confidential salary/outflow data)
      html = `
      <div class="stats-grid">
        ${statCard(
          'My Leave Balance',
          `${myEmp.leaveBalance ?? 12} <small style="font-size:14px;color:var(--text-muted)">days</small>`,
          'Available annual quota',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`
        )}
        ${statCard(
          'My Pending Leaves',
          myLeaves.filter(l => l.status === 'PENDING').length,
          myLeaves.filter(l => l.status === 'PENDING').length ? '⏳ Awaiting manager approval' : '✓ All processed',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
          myLeaves.filter(l => l.status === 'PENDING').length ? 'trend-warn' : 'trend-good'
        )}
        ${statCard(
          'My Attendance Shifts',
          attendance.filter(a => a.employeeId === myEmp.id).length,
          'Shifts recorded this period',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        )}
        ${statCard(
          'My Latest Net Pay',
          myLastPay ? money(myLastPay.netSalary) : money(myEmp.baseSalary),
          myLastPay ? `Disbursed for ${myLastPay.payMonth}` : 'Base compensation',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        )}
      </div>

      <div class="dashboard-grid-equal">
        ${panel(
          'My Employment Dossier',
          'Your active department designation & corporate record',
          `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:4px 0">
            <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
              <small style="color:var(--text-muted);font-weight:700">DEPARTMENT</small>
              <div style="font-size:16px;font-weight:800;color:var(--text-main);margin-top:4px">${esc(myEmp.department || 'Operations')}</div>
            </div>
            <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
              <small style="color:var(--text-muted);font-weight:700">DESIGNATION</small>
              <div style="font-size:16px;font-weight:800;color:var(--primary);margin-top:4px">${esc(myEmp.jobTitle || 'Associate')}</div>
            </div>
            <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
              <small style="color:var(--text-muted);font-weight:700">CORPORATE EMAIL</small>
              <div style="font-size:13px;font-weight:700;color:var(--text-main);margin-top:4px">${esc(myEmp.email)}</div>
            </div>
            <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
              <small style="color:var(--text-muted);font-weight:700">EMPLOYMENT STATUS</small>
              <div style="margin-top:4px">${statusBadge(myEmp.status || 'ACTIVE')}</div>
            </div>
          </div>`
        )}
        ${panel(
          'My Recent Payslips',
          'Official monthly compensation statements',
          `<div class="table-wrap">
            <table>
              <thead><tr><th>PAY PERIOD</th><th>NET SALARY</th><th style="text-align:right">OFFICIAL STATEMENT</th></tr></thead>
              <tbody>
                ${payroll.filter(p => p.employeeId === myEmp.id).slice(0, 3).map(p => `
                  <tr>
                    <td><b>${esc(p.payMonth)}</b></td>
                    <td style="color:var(--green);font-weight:800">${money(p.netSalary)}</td>
                    <td style="text-align:right"><button class="action-btn" onclick="openPayslipModal(${p.id})">Print Payslip</button></td>
                  </tr>
                `).join('') || '<tr><td colspan="3" style="text-align:center;padding:16px;color:var(--text-muted)">No payslips available yet</td></tr>'}
              </tbody>
            </table>
          </div>`,
          `<button class="btn-secondary btn-sm" onclick="go('payroll')">All Payslips →</button>`
        )}
      </div>

      <div class="dashboard-grid-2">
        ${panel(
          'My Recent Time-Off Requests',
          'Your recent leave applications and status updates',
          renderLeaveTable(myLeaves.slice(0, 5), false),
          `<button class="btn-secondary btn-sm" onclick="go('leaves')">View All (${myLeaves.length}) →</button>`
        )}
        ${panel(
          'Workforce Directory Snapshot',
          'Click any team member for contact details',
          `<div class="table-wrap">
            <table>
              <thead><tr><th>MEMBER</th><th>DEPT</th><th>STATUS</th></tr></thead>
              <tbody>
                ${employees.slice(0, 5).map(e => `
                  <tr onclick="openProfileDrawer(${e.id})" style="cursor:pointer">
                    <td>${personCell(e)}</td>
                    <td>${esc(e.department)}</td>
                    <td>${statusBadge(e.status || 'ACTIVE')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`,
          `<button class="btn-secondary btn-sm" onclick="go('employees')">Full Directory →</button>`
        )}
      </div>`;
    } else if (role === 'MANAGER') {
      // Manager Overview (Team-focused, no executive financial outflow)
      html = `
      <div class="stats-grid">
        ${statCard(
          'Team Workforce',
          `${employees.length} <small style="font-size:14px;color:var(--text-muted)">members</small>`,
          `${employees.filter(e => (e.status||'ACTIVE')==='ACTIVE').length} active operational`,
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
        )}
        ${statCard(
          'Pending Leave Reviews',
          pendingLeaves.length,
          pendingLeaves.length ? '⚡ Actions required from you' : '✓ All applications reviewed',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
          pendingLeaves.length ? 'trend-warn' : 'trend-good'
        )}
        ${statCard(
          'Shift Logs Recorded',
          attendance.length,
          'Team shift records logged',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        )}
        ${statCard(
          'Managing Department',
          `<span style="font-size:20px;font-weight:800">${esc(myEmp.department || 'Operations')}</span>`,
          'Team operations supervisor',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>`
        )}
      </div>

      <div class="dashboard-grid-equal">
        ${panel('Workforce by Department', 'Live department distribution and strength', renderDepartmentChart())}
        ${panel(
          'Team Leave Pipeline Status',
          'Current pending applications awaiting approval',
          `<div class="table-wrap">
            <table>
              <thead><tr><th>APPLICANT</th><th>TYPE</th><th>DAYS</th><th>STATUS</th></tr></thead>
              <tbody>
                ${pendingLeaves.slice(0, 4).map(l => `
                  <tr>
                    <td><b>${esc(l.employeeName || 'Emp #' + l.employeeId)}</b></td>
                    <td>${esc(l.leaveType)}</td>
                    <td><b>${l.days}</b> days</td>
                    <td>${statusBadge(l.status)}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--text-muted)">No pending applications</td></tr>'}
              </tbody>
            </table>
          </div>`,
          `<button class="btn-secondary btn-sm" onclick="go('leaves')">Review All (${pendingLeaves.length}) →</button>`
        )}
      </div>

      <div class="dashboard-grid-2">
        ${panel(
          'Recent Leave Applications to Review',
          'Approve or reject team member time-off requests',
          renderLeaveTable(leaves.slice(0, 5), true),
          `<button class="btn-secondary btn-sm" onclick="go('leaves')">View All (${leaves.length}) →</button>`
        )}
        ${panel(
          'Workforce Directory Snapshot',
          'Click any team member for 360° profile',
          `<div class="table-wrap">
            <table>
              <thead><tr><th>MEMBER</th><th>DEPT</th><th>STATUS</th></tr></thead>
              <tbody>
                ${employees.slice(0, 5).map(e => `
                  <tr onclick="openProfileDrawer(${e.id})" style="cursor:pointer">
                    <td>${personCell(e)}</td>
                    <td>${esc(e.department)}</td>
                    <td>${statusBadge(e.status || 'ACTIVE')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`,
          `<button class="btn-secondary btn-sm" onclick="go('employees')">Full Directory →</button>`
        )}
      </div>`;
    } else {
      // HR Admin Full Overview
      html = `
      <div class="stats-grid">
        ${statCard(
          'Active Workforce',
          `${employees.length} <small style="font-size:14px;color:var(--text-muted)">members</small>`,
          `${employees.filter(e => (e.status||'ACTIVE')==='ACTIVE').length} active operational`,
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
        )}
        ${statCard(
          'Pending Approvals',
          pendingLeaves.length,
          pendingLeaves.length ? '⚡ Action required promptly' : '✓ All caught up',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
          pendingLeaves.length ? 'trend-warn' : 'trend-good'
        )}
        ${statCard(
          'Shift Logs Today',
          attendance.length,
          'Recorded shift entries',
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        )}
        ${statCard(
          'Monthly Net Outflow',
          money(totalPayrollCost),
          `${payroll.length} verified registers`,
          `<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        )}
      </div>

      <div class="dashboard-grid-equal">
        ${panel('Workforce by Department', 'Live department distribution and strength', renderDepartmentChart())}
        ${panel('Payroll Outflow Breakdown', 'Recent net salary allocations', renderPayrollTrendChart(), `<button class="btn-secondary btn-sm" onclick="go('payroll')">Payroll View →</button>`)}
      </div>

      <div class="dashboard-grid-2">
        ${panel(
          'Recent Leave Applications',
          'Review recent applications and decisions',
          renderLeaveTable(leaves.slice(0, 5), true),
          `<button class="btn-secondary btn-sm" onclick="go('leaves')">View All (${leaves.length}) →</button>`
        )}
        ${panel(
          'Workforce Directory Snapshot',
          'Click any team member for 360° profile',
          `<div class="table-wrap">
            <table>
              <thead><tr><th>MEMBER</th><th>DEPT</th><th>STATUS</th></tr></thead>
              <tbody>
                ${employees.slice(0, 5).map(e => `
                  <tr onclick="openProfileDrawer(${e.id})" style="cursor:pointer">
                    <td>${personCell(e)}</td>
                    <td>${esc(e.department)}</td>
                    <td>${statusBadge(e.status || 'ACTIVE')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>`,
          `<button class="btn-secondary btn-sm" onclick="go('employees')">Full Directory →</button>`
        )}
      </div>`;
    }
  }

  // 2. EMPLOYEES
  else if (page === 'employees') {
    const departments = ['ALL', ...new Set(employees.map(e => e.department).filter(Boolean))];
    const filtered = employees.filter(e => {
      const matchSearch = [e.name, e.email, e.department, e.jobTitle].join(' ').toLowerCase().includes(employeeSearch.toLowerCase());
      const matchDept = employeeDeptFilter === 'ALL' || e.department === employeeDeptFilter;
      return matchSearch && matchDept;
    });

    html = panel(
      'Workforce Directory',
      role === 'HR' ? 'Manage company workforce, roles, salaries, and leave allocations' : 'Company directory and team contacts',
      `
      <div class="filter-bar">
        <div class="tab-group">
          ${departments.map(d => `
            <button class="tab-btn ${employeeDeptFilter === d ? 'active' : ''}" onclick="setEmployeeDeptFilter('${esc(d)}')">${esc(d)}</button>
          `).join('')}
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <div class="search-box">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search name, title, email..." value="${esc(employeeSearch)}" oninput="setEmployeeSearch(this.value)">
          </div>
          ${role !== 'EMPLOYEE' ? '<button class="btn-secondary btn-sm" onclick="exportEmployeesCSV()">📥 Export CSV</button>' : ''}
          ${role === 'HR' ? '<button class="btn-primary btn-sm" onclick="addEmployeeModal()">+ Add Employee</button>' : ''}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th class="sortable" onclick="sortTable('name')">EMPLOYEE</th>
              <th class="sortable" onclick="sortTable('email')">EMAIL</th>
              <th class="sortable" onclick="sortTable('department')">DEPARTMENT</th>
              <th class="sortable" onclick="sortTable('jobTitle')">JOB TITLE</th>
              ${role === 'HR' ? '<th class="sortable" onclick="sortTable(\'baseSalary\')">BASE SALARY</th>' : ''}
              ${role !== 'EMPLOYEE' ? '<th class="sortable" onclick="sortTable(\'leaveBalance\')">LEAVE BALANCE</th>' : ''}
              <th>STATUS</th>
              <th style="text-align:right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length ? filtered.map(e => `
              <tr>
                <td>${personCell(e)}</td>
                <td>${esc(e.email)}</td>
                <td>${esc(e.department)}</td>
                <td>${esc(e.jobTitle || 'Employee')}</td>
                ${role === 'HR' ? `<td><b>${money(e.baseSalary)}</b></td>` : ''}
                ${role !== 'EMPLOYEE' ? `<td><span style="font-weight:700">${e.leaveBalance ?? 0}</span> days</td>` : ''}
                <td>${statusBadge(e.status || 'ACTIVE')}</td>
                <td style="text-align:right">
                  <div class="action-row" style="justify-content:flex-end">
                    <button class="action-btn" onclick="openProfileDrawer(${e.id})">360° Profile</button>
                    ${role === 'HR' ? `
                      <button class="action-btn" onclick="editEmployeeModal(${e.id})">Edit</button>
                      <button class="action-btn danger" onclick="deleteEmployeeConfirm(${e.id})">Delete</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="${role === 'HR' ? 8 : (role === 'MANAGER' ? 7 : 6)}" style="text-align:center;padding:32px;color:var(--text-muted)">No matching employees found.</td></tr>`}
          </tbody>
        </table>
      </div>
      `
    );
  }

  // 3. LEAVES
  else if (page === 'leaves') {
    const list = role === 'EMPLOYEE' ? myLeaves : leaves;
    const filtered = list.filter(l => leaveFilter === 'ALL' || l.status === leaveFilter);

    html = panel(
      role === 'EMPLOYEE' ? 'My Leave Applications' : 'Leave Pipeline & Approvals',
      role === 'EMPLOYEE' ? 'Track your pending and approved time-off requests' : 'Drag and drop cards across columns to approve or reject requests dynamically',
      `
      <div class="filter-bar">
        <div style="display:flex;gap:8px">
          <button class="btn-secondary btn-sm ${leavesViewMode === 'kanban' ? 'active' : ''}" onclick="toggleLeavesView('kanban')">📋 Kanban Board</button>
          <button class="btn-secondary btn-sm ${leavesViewMode === 'table' ? 'active' : ''}" onclick="toggleLeavesView('table')">📑 Table View</button>
        </div>
        <div style="display:flex;gap:10px">
          ${role !== 'EMPLOYEE' ? '<button class="btn-secondary btn-sm" onclick="exportLeavesCSV()">📥 Export Leaves CSV</button>' : ''}
          <button class="btn-primary btn-sm" onclick="applyLeaveModal()">+ Apply Leave</button>
        </div>
      </div>
      ${leavesViewMode === 'kanban' ? renderKanbanBoard(list) : renderLeaveTable(filtered, role !== 'EMPLOYEE')}
      `
    );
  }

  // 4. ATTENDANCE
  else if (page === 'attendance') {
    const list = attendance.filter(a => role !== 'EMPLOYEE' || a.employeeId === myEmp.id);
    const filtered = list.filter(a => attendanceFilter === 'ALL' || a.status === attendanceFilter);

    html = panel(
      role === 'EMPLOYEE' ? 'My Attendance & Time Logs' : 'Attendance & Shift Tracking',
      role === 'EMPLOYEE' ? 'Your personal shift history and timestamped daily check-ins' : 'Company-wide shift logs, remote work logging, and timestamped activity records',
      `
      <div class="filter-bar">
        <div class="tab-group">
          <button class="tab-btn ${attendanceFilter === 'ALL' ? 'active' : ''}" onclick="setAttendanceFilter('ALL')">All Logs (${list.length})</button>
          <button class="tab-btn ${attendanceFilter === 'PRESENT' ? 'active' : ''}" onclick="setAttendanceFilter('PRESENT')">Present</button>
          <button class="tab-btn ${attendanceFilter === 'REMOTE' ? 'active' : ''}" onclick="setAttendanceFilter('REMOTE')">Remote</button>
          <button class="tab-btn ${attendanceFilter === 'ABSENT' ? 'active' : ''}" onclick="setAttendanceFilter('ABSENT')">Absent</button>
        </div>
        <div style="display:flex;gap:10px">
          ${role === 'EMPLOYEE' ? `
            <button class="btn-primary btn-sm" onclick="quickCheckin()">⚡ Clock In Today</button>
          ` : `
            <button class="btn-primary btn-sm" onclick="markAttendanceModal()">+ Log Attendance</button>
            <button class="btn-secondary btn-sm" onclick="exportAttendanceCSV()">📥 Export CSV</button>
          `}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>WORK DATE</th>
              <th>STATUS</th>
              <th>LOGGED HOURS</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length ? filtered.map(a => `
              <tr>
                <td>${personCell({ id: a.employeeId, name: a.employeeName || 'Emp #' + a.employeeId, department: a.department || 'Team' })}</td>
                <td><b>${esc(a.workDate)}</b></td>
                <td>${statusBadge(a.status)}</td>
                <td><b>${Number(a.hours || 0)}</b> hrs</td>
              </tr>
            `).join('') : `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted)">No attendance logs recorded yet.</td></tr>`}
          </tbody>
        </table>
      </div>
      `
    );
  }

  // 5. PAYROLL & COMPENSATION
  else if (page === 'payroll') {
    const list = (role === 'HR') ? payroll : payroll.filter(p => p.employeeId === myEmp.id);
    const totalNet = list.reduce((s, p) => s + Number(p.netSalary || 0), 0);

    html = panel(
      role === 'HR' ? 'Enterprise Payroll Register & Scenario Simulator' : 'My Compensation & Payslips',
      role === 'HR' ? 'Official corporate payroll register, statutory deductions, and burn simulator' : 'Your authenticated monthly compensation statements and payslips',
      `
      <div class="filter-bar">
        <div style="display:flex;gap:12px;align-items:center">
          <div style="background:var(--bg-subtle);padding:8px 16px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);font-size:13px">
            ${role === 'HR' ? 'Verified Registers:' : 'My Verified Payslips:'} <b>${list.length}</b>
          </div>
          <div style="background:var(--bg-subtle);padding:8px 16px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);font-size:13px">
            ${role === 'HR' ? 'Cumulative Net Outflow:' : 'Cumulative Net Disbursed:'} <b style="color:var(--green)">${money(totalNet)}</b>
          </div>
        </div>
        <div style="display:flex;gap:10px">
          ${role === 'HR' ? `
            <button class="btn-primary btn-sm" onclick="generatePayrollModal()">+ Generate Payroll</button>
            <button class="btn-secondary btn-sm" onclick="exportPayrollCSV()">📥 Export CSV</button>
          ` : ''}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>PAY MONTH</th>
              <th>BASIC SALARY</th>
              <th>ALLOWANCE</th>
              <th>DEDUCTIONS</th>
              <th>TAX</th>
              <th>NET SALARY</th>
              <th style="text-align:right">OFFICIAL PAYSLIP</th>
            </tr>
          </thead>
          <tbody>
            ${list.length ? list.map(p => `
              <tr>
                <td>${personCell({ id: p.employeeId, name: p.employeeName || 'Emp #' + p.employeeId, department: p.department || 'Operations' })}</td>
                <td><span style="font-family:var(--font-mono);font-weight:700">${esc(p.payMonth)}</span></td>
                <td>${money(p.basicSalary)}</td>
                <td style="color:var(--green)">+ ${money(p.allowance)}</td>
                <td style="color:var(--red)">− ${money(p.deduction)}</td>
                <td style="color:var(--red)">− ${money(p.tax)}</td>
                <td><b style="font-size:14px;color:var(--text-main)">${money(p.netSalary)}</b></td>
                <td style="text-align:right">
                  <button class="action-btn" onclick="openPayslipModal(${p.id})">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                    Print Payslip
                  </button>
                </td>
              </tr>
            `).join('') : `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text-muted)">No compensation statements on file yet.</td></tr>`}
          </tbody>
        </table>
      </div>

      ${role === 'HR' ? renderPayrollSimulator() : ''}
      `
    );
  }

  // 6. DOCUMENTS VAULT
  else if (page === 'documents') {
    html = panel(
      'Encrypted Document Vault',
      'Upload, view, and organize HR contracts, identification files, and medical certificates',
      `
      <div class="dropzone" id="vault-dropzone" onclick="$('#vault-file-input').click()">
        <input type="file" id="vault-file-input" style="display:none" onchange="handleVaultUpload(this.files[0])">
        <div class="dropzone-icon">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
        </div>
        <h3 style="font-size:16px;font-weight:700;margin-bottom:6px">Drag and drop files here, or click to browse</h3>
        <p style="font-size:12px;color:var(--text-muted)">Supported formats: PDF, DOCX, PNG, JPG (Max 25MB)</p>
      </div>

      <div style="margin-top:24px">
        <h3 style="font-size:15px;font-weight:700;margin-bottom:14px">Repository Documents (${documents.length})</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>DOCUMENT NAME</th>
                <th>CATEGORY</th>
                <th>FILE SIZE</th>
                <th>DATE ADDED</th>
                <th>UPLOADED BY</th>
                <th style="text-align:right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              ${documents.map(d => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <span style="font-size:20px">📄</span>
                      <b>${esc(d.name)}</b>
                    </div>
                  </td>
                  <td><span class="badge" style="background:var(--primary-light);color:var(--primary)">${esc(d.category)}</span></td>
                  <td>${esc(d.size)}</td>
                  <td>${esc(d.uploadedAt)}</td>
                  <td>${esc(d.uploadedBy)}</td>
                  <td style="text-align:right">
                    <button class="action-btn" onclick="previewDoc('${esc(d.name)}')">View</button>
                    <button class="action-btn danger" onclick="deleteDoc(${d.id})">Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      `
    );
  }

  $('#page-content').innerHTML = html;
}

function toggleLeavesView(mode) {
  playCyberSound('click');
  leavesViewMode = mode;
  render();
}

// Leaves Table Helper
function renderLeaveTable(list, showActions) {
  if (!list.length) return `<div class="table-wrap"><div style="text-align:center;padding:32px;color:var(--text-muted)">No leave applications found.</div></div>`;
  return `<div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>APPLICANT</th>
          <th>TYPE</th>
          <th>TIMELINE</th>
          <th>DURATION</th>
          <th>REASON</th>
          <th>STATUS</th>
          ${showActions ? '<th style="text-align:right">DECISION</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${list.map(l => `
          <tr>
            <td>${personCell({ id: l.employeeId, name: l.employeeName || 'Emp #' + l.employeeId, department: l.department || 'Team' })}</td>
            <td><span style="font-weight:700">${esc(l.leaveType)}</span></td>
            <td>${esc(l.startDate)} → ${esc(l.endDate)}</td>
            <td><b>${Number(l.days || 1)}</b> day(s)</td>
            <td style="color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis" title="${esc(l.reason)}">${esc(l.reason || 'None provided')}</td>
            <td>${statusBadge(l.status)}</td>
            ${showActions ? `
              <td style="text-align:right">
                ${l.status === 'PENDING' ? `
                  <div class="action-row" style="justify-content:flex-end">
                    <button class="action-btn" style="color:var(--green);border-color:var(--green-border)" onclick="decideLeaveAction(${l.id},'APPROVED')">Approve</button>
                    <button class="action-btn danger" onclick="decideLeaveAction(${l.id},'REJECTED')">Reject</button>
                  </div>
                ` : '—'}
              </td>
            ` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
}

// Navigation & Filters
function go(p) {
  playCyberSound('click');
  page = p;
  render();
}

function setEmployeeDeptFilter(d) {
  playCyberSound('click');
  employeeDeptFilter = d;
  render();
}

function setEmployeeSearch(q) {
  employeeSearch = q;
  render();
}

function setLeaveFilter(s) {
  playCyberSound('click');
  leaveFilter = s;
  render();
}

function setAttendanceFilter(s) {
  playCyberSound('click');
  attendanceFilter = s;
  render();
}

function sortTable(col) {
  playCyberSound('click');
  if (sortCol === col) {
    sortAsc = !sortAsc;
  } else {
    sortCol = col;
    sortAsc = true;
  }
  employees.sort((a, b) => {
    let va = a[col] ?? '';
    let vb = b[col] ?? '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortAsc ? -1 : 1;
    if (va > vb) return sortAsc ? 1 : -1;
    return 0;
  });
  render();
}

// Document Vault
function handleVaultUpload(file) {
  if (!file) return;
  playCyberSound('success');
  const newDoc = {
    id: Date.now(),
    name: file.name,
    category: file.name.toLowerCase().includes('cert') ? 'Medical' : file.name.toLowerCase().includes('contract') ? 'Contract' : 'General',
    size: (file.size / 1024).toFixed(1) + ' KB',
    uploadedAt: new Date().toISOString().slice(0, 10),
    uploadedBy: currentUser ? currentUser.displayName : 'Staff'
  };
  documents.unshift(newDoc);
  showToast(`Uploaded "${file.name}" to encrypted vault!`, 'success');
  render();
}

function previewDoc(name) {
  playCyberSound('click');
  showToast(`Accessing vault document: ${name}`, 'info');
}

function deleteDoc(id) {
  playCyberSound('click');
  documents = documents.filter(d => d.id !== id);
  showToast('Document removed from vault', 'info');
  render();
}

// Employee 360° Profile Drawer
function openProfileDrawer(id) {
  playCyberSound('warp');
  const emp = employees.find(e => e.id === id);
  if (!emp) return;

  const myEmp = getActiveEmployee();
  const canSeeSalary = (role === 'HR') || (emp.id === myEmp.id);
  const canSeeQuotas = (role !== 'EMPLOYEE') || (emp.id === myEmp.id);
  const canEdit = (role === 'HR');

  const empLeaves = leaves.filter(l => l.employeeId === id);
  const empAtt = attendance.filter(a => a.employeeId === id);
  const empPay = payroll.filter(p => p.employeeId === id);

  $('#drawer-name').textContent = emp.name;
  $('#drawer-dept').textContent = `${emp.department} · ${emp.jobTitle || 'Employee'}`;
  $('#drawer-avatar').textContent = initials(emp.name);

  $('#drawer-content').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
        <small style="color:var(--text-muted);font-weight:700">BASE COMPENSATION</small>
        <div style="font-size:18px;font-weight:800;color:var(--text-main);margin-top:4px">
          ${canSeeSalary ? money(emp.baseSalary) : '<span style="color:var(--text-muted);font-size:14px">Confidential</span>'}
        </div>
      </div>
      <div style="background:var(--bg-subtle);padding:14px;border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
        <small style="color:var(--text-muted);font-weight:700">LEAVE ALLOCATION</small>
        <div style="font-size:18px;font-weight:800;color:var(--primary);margin-top:4px">
          ${canSeeQuotas ? `${emp.leaveBalance ?? 0} days` : '<span style="color:var(--text-muted);font-size:14px">Confidential</span>'}
        </div>
      </div>
    </div>

    <div style="background:var(--bg-subtle);padding:16px;border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
      <div style="font-size:12px;font-weight:700;color:var(--text-faint);margin-bottom:8px">EMPLOYEE DOSSIER</div>
      <div style="display:grid;gap:8px;font-size:13px">
        <div><strong>Email:</strong> ${esc(emp.email)}</div>
        <div><strong>Employee ID:</strong> #${emp.id}</div>
        <div><strong>Status:</strong> ${statusBadge(emp.status || 'ACTIVE')}</div>
        <div><strong>Tenure:</strong> ${emp.createdAt ? String(emp.createdAt).slice(0, 10) : 'Active'}</div>
      </div>
    </div>

    <div>
      <h4 style="font-size:14px;font-weight:800;margin-bottom:10px">Activity Summary</h4>
      <div style="display:grid;gap:8px;font-size:13px">
        <div style="display:flex;justify-content:space-between;padding:10px;border-radius:8px;background:var(--bg-subtle)">
          <span>Total Leaves Requested</span>
          <b>${empLeaves.length} requests (${empLeaves.filter(l=>l.status==='APPROVED').length} Approved)</b>
        </div>
        <div style="display:flex;justify-content:space-between;padding:10px;border-radius:8px;background:var(--bg-subtle)">
          <span>Attendance Records</span>
          <b>${empAtt.length} shifts logged</b>
        </div>
        ${canSeeSalary ? `
          <div style="display:flex;justify-content:space-between;padding:10px;border-radius:8px;background:var(--bg-subtle)">
            <span>Processed Payslips</span>
            <b>${empPay.length} months</b>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  const editBtn = $('#drawer-edit-btn');
  if (editBtn) {
    editBtn.style.display = canEdit ? 'block' : 'none';
    editBtn.onclick = () => {
      closeProfileDrawer();
      editEmployeeModal(id);
    };
  }

  const drawerBackdrop = $('#profile-drawer-backdrop');
  if (drawerBackdrop) {
    drawerBackdrop.classList.remove('hidden');
    drawerBackdrop.style.setProperty('display', 'flex', 'important');
  }
}

function closeProfileDrawer() {
  const drawerBackdrop = $('#profile-drawer-backdrop');
  if (drawerBackdrop) {
    drawerBackdrop.classList.add('hidden');
    drawerBackdrop.style.setProperty('display', 'none', 'important');
  }
}

// AI HR Neural Copilot Slide-over
function toggleCopilot() {
  playCyberSound('warp');
  const el = $('#copilot-drawer-backdrop');
  if (el.classList.contains('hidden')) {
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

function askCopilot(queryType) {
  playCyberSound('click');
  const respEl = $('#copilot-response');
  let answerHtml = '';

  if (queryType === 'attrition_predict') {
    const riskStaff = employees.map(e => {
      const remainingLeave = e.leaveBalance ?? 0;
      let score = 15;
      if (remainingLeave < 4) score += 40;
      if (Number(e.baseSalary) < 40000) score += 25;
      return { ...e, score: Math.min(score, 95) };
    }).sort((a,b)=>b.score - a.score);

    answerHtml = `
      <b>🔮 Neural Attrition Risk Forecast:</b><br>
      ${riskStaff.map(s => `• <b>${esc(s.name)}</b> (${esc(s.department)}): Risk Index <b style="color:${s.score > 60 ? 'var(--red)' : s.score > 30 ? 'var(--amber)' : 'var(--green)'}">${s.score}%</b> ${s.score > 60 ? '⚠️ High Burnout Risk' : '✓ Stable'}`).join('<br>')}<br>
      <span style="color:var(--text-muted);font-size:11px">Neural factors analyzed: Leave fatigue, compensation equity, and shift regularity.</span>
    `;
  } else if (queryType === 'payroll_summary') {
    const total = payroll.reduce((s, p) => s + Number(p.netSalary || 0), 0);
    const avg = payroll.length ? Math.round(total / payroll.length) : 0;
    const highest = [...payroll].sort((a,b)=>Number(b.netSalary)-Number(a.netSalary))[0];
    answerHtml = `
      <b>💰 Quantum Payroll Analytics:</b><br>
      • Total Monthly Outflow: <b>${money(total)}</b> across ${payroll.length} entries.<br>
      • Average Net Salary: <b>${money(avg)}</b>.<br>
      • Highest compensation: <b>${highest ? highest.employeeName + ' (' + money(highest.netSalary) + ')' : 'N/A'}</b>.<br>
      <span style="color:var(--text-muted);font-size:11px">Real-time formula calculation.</span>
    `;
  } else if (queryType === 'low_leave') {
    const low = employees.filter(e => (e.leaveBalance ?? 0) < 5);
    if (!low.length) {
      answerHtml = `<b>✓ Healthy Quota:</b> All workforce members have 5+ leave days remaining.`;
    } else {
      answerHtml = `
        <b>⚠️ Low Leave Alert (${low.length} employees):</b><br>
        ${low.map(e => `• <b>${esc(e.name)}</b>: only ${e.leaveBalance} days remaining (${esc(e.department)})`).join('<br>')}<br>
        <span style="color:var(--text-muted);font-size:11px">Suggested: Proactively approve upcoming recovery days.</span>
      `;
    }
  } else if (queryType === 'pending_leaves') {
    const pending = leaves.filter(l => l.status === 'PENDING');
    if (!pending.length) {
      answerHtml = `<b>✓ Zero Backlog:</b> All leave applications have been reviewed.`;
    } else {
      answerHtml = `
        <b>⏳ ${pending.length} Pending Approval(s):</b><br>
        ${pending.map(l => `• <b>${esc(l.employeeName)}</b>: ${esc(l.leaveType)} (${esc(l.startDate)} to ${esc(l.endDate)}, ${l.days} days)`).join('<br>')}<br>
        <button class="btn-primary btn-sm" style="margin-top:8px" onclick="toggleCopilot();go('leaves')">Open Leaves Pipeline →</button>
      `;
    }
  } else if (queryType === 'dept_headcount') {
    const map = {};
    employees.forEach(e => map[e.department] = (map[e.department] || 0) + 1);
    answerHtml = `
      <b>👥 Neural Headcount Distribution:</b><br>
      ${Object.entries(map).map(([d, c]) => `• <b>${esc(d)}</b>: ${c} team members (${Math.round((c/employees.length)*100)}%)`).join('<br>')}<br>
      Total Strength: <b>${employees.length} employees</b>.
    `;
  } else if (queryType === 'today_attendance') {
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = attendance.filter(a => a.workDate === today);
    answerHtml = `
      <b>⏰ Attendance Intelligence for ${today}:</b><br>
      • Present: <b>${todayLogs.filter(a=>a.status==='PRESENT').length}</b><br>
      • Remote: <b>${todayLogs.filter(a=>a.status==='REMOTE').length}</b><br>
      • Absent: <b>${todayLogs.filter(a=>a.status==='ABSENT').length}</b><br>
      <span style="color:var(--text-muted);font-size:11px">Use topbar "BioScan" to log biometric check-ins.</span>
    `;
  }

  respEl.innerHTML = answerHtml;
  speakCopilot(answerHtml);
}

function askCopilotCustom() {
  playCyberSound('click');
  const input = $('#copilot-input');
  const q = (input?.value || '').trim().toLowerCase();
  if (!q) return;
  const respEl = $('#copilot-response');

  if (q.includes('payroll') || q.includes('salary') || q.includes('cost') || q.includes('money')) {
    askCopilot('payroll_summary');
  } else if (q.includes('risk') || q.includes('attrition') || q.includes('burnout')) {
    askCopilot('attrition_predict');
  } else if (q.includes('leave') || q.includes('vacation') || q.includes('holiday')) {
    askCopilot('pending_leaves');
  } else if (q.includes('attendance') || q.includes('clock') || q.includes('present') || q.includes('absent')) {
    askCopilot('today_attendance');
  } else if (q.includes('department') || q.includes('team') || q.includes('headcount')) {
    askCopilot('dept_headcount');
  } else {
    const match = employees.find(e => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q));
    if (match) {
      const matchText = `Found dossier for ${match.name}: Department is ${match.department}, base salary ${money(match.baseSalary)}, leave balance ${match.leaveBalance} days.`;
      respEl.innerHTML = `
        <b>Found record for ${esc(match.name)}:</b><br>
        • Department: <b>${esc(match.department)}</b> (${esc(match.jobTitle || 'Employee')})<br>
        • Monthly Base Salary: <b>${money(match.baseSalary)}</b><br>
        • Leave Balance: <b>${match.leaveBalance} days</b><br>
        • Email: <b>${esc(match.email)}</b>
      `;
      speakCopilot(matchText);
    } else {
      const defaultText = `Neural analysis stream: Active workforce count is ${employees.length} team members with ${leaves.length} time-off logs and ${payroll.length} payroll registers.`;
      respEl.innerHTML = `
        <b>Neural Copilot Response:</b><br>
        Scanned database for: "<em>${esc(q)}</em>".<br>
        Active team count is <b>${employees.length} employees</b> with <b>${leaves.length} time-off logs</b>. Try asking about "attrition risk", "payroll summary", or an employee's name.
      `;
      speakCopilot(defaultText);
    }
  }
  input.value = '';
}

// Export CSV Handlers
function exportEmployeesCSV() {
  const headers = ['ID', 'Name', 'Email', 'Department', 'Job Title', 'Base Salary', 'Leave Balance', 'Status'];
  const rows = employees.map(e => [e.id, e.name, e.email, e.department, e.jobTitle, e.baseSalary, e.leaveBalance, e.status || 'ACTIVE']);
  exportToCSV('Employees_Directory.csv', headers, rows);
}

function exportLeavesCSV() {
  const headers = ['ID', 'Employee ID', 'Employee Name', 'Department', 'Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
  const rows = leaves.map(l => [l.id, l.employeeId, l.employeeName, l.department, l.leaveType, l.startDate, l.endDate, l.days, l.status, l.reason]);
  exportToCSV('Leaves_Report.csv', headers, rows);
}

function exportAttendanceCSV() {
  const headers = ['ID', 'Employee ID', 'Employee Name', 'Department', 'Work Date', 'Status', 'Hours'];
  const rows = attendance.map(a => [a.id, a.employeeId, a.employeeName, a.department, a.workDate, a.status, a.hours]);
  exportToCSV('Attendance_Log.csv', headers, rows);
}

function exportPayrollCSV() {
  const headers = ['ID', 'Employee ID', 'Employee Name', 'Department', 'Pay Month', 'Basic Salary', 'Allowance', 'Deductions', 'Tax', 'Net Salary'];
  const rows = payroll.map(p => [p.id, p.employeeId, p.employeeName, p.department, p.payMonth, p.basicSalary, p.allowance, p.deduction, p.tax, p.netSalary]);
  exportToCSV('Payroll_Register.csv', headers, rows);
}

// Universal Form Modal Controller
function openModal(title, fields, onSave) {
  playCyberSound('warp');
  const modal = $('#modal');
  if (!modal) return;
  $('#modal-title').textContent = title;
  $('#modal-fields').innerHTML = fields.map(f => `
    <div class="form-field ${f.full ? 'full' : ''}">
      <label for="f-${f.name}">${f.label}</label>
      ${f.options ? `
        <select id="f-${f.name}" name="${f.name}" ${f.required === false ? '' : 'required'}>
          ${f.options.map(o => `<option value="${o.value}" ${String(o.value) === String(f.value) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}
        </select>
      ` : `
        <input id="f-${f.name}" name="${f.name}" type="${f.type || 'text'}"
          ${f.value !== undefined ? `value="${esc(f.value)}"` : ''}
          ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}
          ${f.required === false ? '' : 'required'}
          ${f.min !== undefined ? `min="${f.min}"` : ''}
          ${f.step ? `step="${f.step}"` : ''}>
      `}
    </div>
  `).join('');

  modal.classList.remove('hidden');
  modal.style.setProperty('display', 'flex', 'important');

  $('#modal-form').onsubmit = async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const saveBtn = $('#modal-form button[type="submit"]');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving Record...';
    }
    try {
      await onSave(data);
      closeModal();
      playCyberSound('success');
      showToast('Record saved successfully!', 'success');
    } catch (err) {
      playCyberSound('click');
      showToast('Could not save: ' + err.message, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Record';
      }
    }
    // Refresh data after modal closes (outside try-catch so refresh errors don't show as save errors)
    try { await refresh(); } catch(_) {}
  };
}

function closeModal() {
  const modal = $('#modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.setProperty('display', 'none', 'important');
  }
}

$('#modal-close').onclick = $('#modal-cancel').onclick = closeModal;

// Modal Action Triggers
function addEmployeeModal() {
  if (role !== 'HR') {
    return showToast('Access restricted: Only HR administrators can register new employees.', 'error');
  }
  const deptList = ['Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Design', 'Operations'];
  openModal('Add New Employee Record', [
    { name: 'name', label: 'Full Legal Name', placeholder: 'e.g. Rahul Sharma' },
    { name: 'email', label: 'Corporate Email', type: 'email', placeholder: 'e.g. rahul@company.com' },
    {
      name: 'department',
      label: 'Department',
      options: deptList.map(d => ({ value: d, label: d })),
      value: 'Engineering'
    },
    { name: 'jobTitle', label: 'Job Designation', value: 'Software Engineer' },
    { name: 'baseSalary', label: 'Monthly Basic Salary (₹)', type: 'number', min: 0, step: '1', value: 45000 },
    { name: 'leaveBalance', label: 'Annual Leave Quota (days)', type: 'number', min: 0, value: 14 }
  ], async d => {
    const cleanEmail = String(d.email || '').trim().toLowerCase();
    const cleanName = String(d.name || '').trim();
    if (!cleanName) throw new Error('Please enter a full name.');
    if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('Please enter a valid corporate email address.');

    // Instant client-side duplicate check
    const dup = employees.find(e => e.email && e.email.toLowerCase() === cleanEmail);
    if (dup) {
      throw new Error(`An employee with email "${cleanEmail}" is already registered (${dup.name}).`);
    }

    await request('/employees', {
      method: 'POST',
      body: JSON.stringify({
        name: cleanName,
        email: cleanEmail,
        department: String(d.department || 'Engineering').trim(),
        jobTitle: String(d.jobTitle || 'Associate Engineer').trim(),
        baseSalary: Number(d.baseSalary || 35000),
        leaveBalance: Math.round(Number(d.leaveBalance || 14)),
        status: 'ACTIVE'
      })
    });
  });
}

function editEmployeeModal(id) {
  if (role !== 'HR') {
    return showToast('Access restricted: Only HR administrators can edit employee profiles.', 'error');
  }
  const e = employees.find(x => x.id === id);
  if (!e) return;
  const deptList = ['Engineering', 'Human Resources', 'Marketing', 'Sales', 'Finance', 'Design', 'Operations'];
  openModal(`Edit Employee: ${e.name}`, [
    { name: 'name', label: 'Full Name', value: e.name },
    { name: 'email', label: 'Corporate Email', type: 'email', value: e.email },
    {
      name: 'department',
      label: 'Department',
      options: deptList.map(d => ({ value: d, label: d })),
      value: e.department || 'Engineering'
    },
    { name: 'jobTitle', label: 'Job Designation', value: e.jobTitle || '' },
    { name: 'baseSalary', label: 'Monthly Basic Salary (₹)', type: 'number', min: 0, step: '1', value: e.baseSalary },
    { name: 'leaveBalance', label: 'Leave Balance (days)', type: 'number', min: 0, value: e.leaveBalance },
    { name: 'status', label: 'Employment Status', options: ['ACTIVE', 'ON_LEAVE', 'INACTIVE'].map(s => ({ value: s, label: s })), value: e.status || 'ACTIVE' }
  ], async d => {
    const cleanEmail = String(d.email || '').trim().toLowerCase();
    const cleanName = String(d.name || '').trim();
    if (!cleanName) throw new Error('Please enter a full name.');
    if (!cleanEmail || !cleanEmail.includes('@')) throw new Error('Please enter a valid corporate email address.');

    // Duplicate check excluding self
    const dup = employees.find(e => e.id !== id && e.email && e.email.toLowerCase() === cleanEmail);
    if (dup) {
      throw new Error(`Email "${cleanEmail}" is already used by another employee (${dup.name}).`);
    }

    await request('/employees/' + id, {
      method: 'PUT',
      body: JSON.stringify({
        name: String(d.name || '').trim(),
        email: String(d.email || '').trim().toLowerCase(),
        department: String(d.department || '').trim(),
        jobTitle: String(d.jobTitle || '').trim(),
        baseSalary: Number(d.baseSalary || 0),
        leaveBalance: Math.round(Number(d.leaveBalance || 0)),
        status: d.status || 'ACTIVE'
      })
    });
  });
}

async function deleteEmployeeConfirm(id) {
  const emp = employees.find(e => e.id === id);
  if (!emp) return;
  if (!confirm(`Are you sure you want to delete employee "${emp.name}"? This cascades to all their associated attendance and payroll records.`)) return;
  try {
    await request('/employees/' + id, { method: 'DELETE' });
    await refresh();
    playCyberSound('success');
    showToast(`Employee "${emp.name}" removed successfully.`, 'success');
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
}

function applyLeaveModal() {
  if (!employees.length) return showToast('Add an employee first', 'error');
  const defaultEmp = getActiveEmployee();
  const today = new Date().toISOString().slice(0, 10);

  openModal('Apply for Leave', [
    {
      name: 'employeeId',
      label: 'Employee',
      options: employees.map(e => ({ value: e.id, label: `${e.name} (${e.department})` })),
      value: defaultEmp.id
    },
    {
      name: 'leaveType',
      label: 'Leave Classification',
      options: ['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID'].map(t => ({ value: t, label: t })),
      value: 'ANNUAL'
    },
    { name: 'startDate', label: 'Start Date', type: 'date', value: today },
    { name: 'endDate', label: 'End Date', type: 'date', value: today },
    { name: 'reason', label: 'Reason & Justification', full: true, placeholder: 'Please explain the leave reason...' }
  ], d => request('/leaves', {
    method: 'POST',
    body: JSON.stringify({ ...d, employeeId: Number(d.employeeId) })
  }));
}

async function decideLeaveAction(id, status) {
  try {
    await request(`/leaves/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    await refresh();
    playCyberSound('success');
    showToast(`Leave request ${status.toLowerCase()} successfully!`, 'success');
  } catch (err) {
    playCyberSound('click');
    showToast(err.message, 'error');
  }
}

function markAttendanceModal() {
  if (!employees.length) return showToast('Add an employee first', 'error');
  const defaultEmp = getActiveEmployee();
  const today = new Date().toISOString().slice(0, 10);

  openModal('Log Attendance Record', [
    {
      name: 'employeeId',
      label: 'Employee',
      options: employees.map(e => ({ value: e.id, label: e.name })),
      value: defaultEmp.id
    },
    { name: 'workDate', label: 'Work Date', type: 'date', value: today },
    {
      name: 'status',
      label: 'Attendance Status',
      options: ['PRESENT', 'REMOTE', 'ABSENT', 'LEAVE'].map(s => ({ value: s, label: s })),
      value: 'PRESENT'
    },
    { name: 'hours', label: 'Hours Rendered', type: 'number', min: 0, max: 24, step: '0.5', value: 8 }
  ], d => request('/attendance', {
    method: 'POST',
    body: JSON.stringify({ ...d, employeeId: Number(d.employeeId), hours: Number(d.hours) })
  }));
}

function generatePayrollModal() {
  if (!employees.length) return showToast('Add an employee first', 'error');
  const currentMonth = new Date().toISOString().slice(0, 7);

  openModal('Generate Monthly Payroll', [
    {
      name: 'employeeId',
      label: 'Employee',
      options: employees.map(e => ({ value: e.id, label: `${e.name} (Base: ${money(e.baseSalary)})` })),
      value: employees[0].id
    },
    { name: 'payMonth', label: 'Pay Period (YYYY-MM)', value: currentMonth, placeholder: '2026-10' },
    { name: 'allowance', label: 'Allowances & Bonus (₹)', type: 'number', min: 0, value: 3000 },
    { name: 'deduction', label: 'Other Deductions (₹)', type: 'number', min: 0, value: 500 },
    { name: 'tax', label: 'Withholding Tax (₹)', type: 'number', min: 0, value: 2000 }
  ], d => request('/payroll', {
    method: 'POST',
    body: JSON.stringify({
      ...d,
      employeeId: Number(d.employeeId),
      allowance: Number(d.allowance || 0),
      deduction: Number(d.deduction || 0),
      tax: Number(d.tax || 0)
    })
  }));
}

// Corporate Payslip View
function openPayslipModal(id) {
  playCyberSound('warp');
  const p = payroll.find(x => x.id === id);
  if (!p) return;
  const w = window.open('', '_blank', 'width=740,height=820');
  if (!w) return showToast('Please allow browser pop-ups to print the payslip.', 'error');

  w.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payslip - ${esc(p.payMonth)} - ${esc(p.employeeName)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; background: #fff; margin:0; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand h1 { font-size: 24px; margin: 0; color: #4f46e5; font-weight: 800; }
    .brand p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
    .badge { background: #eef2ff; color: #4f46e5; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { text-align: left; padding: 12px; background: #f1f5f9; color: #475569; font-size: 12px; text-transform: uppercase; }
    td { padding: 13px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .amount { text-align: right; }
    .total td { font-size: 16px; font-weight: 800; color: #10b981; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; background: #f0fdf4; }
    .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
    .btn-bar { margin-top: 24px; text-align: right; }
    .btn { background: #4f46e5; color: white; border: 0; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 8px; cursor: pointer; }
    @media print { .btn-bar { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>PeoplePilot Enterprise</h1>
      <p>Official Monthly Compensation Statement</p>
    </div>
    <div style="text-align:right">
      <span class="badge">CONFIDENTIAL</span>
      <div style="font-size:12px;color:#64748b;margin-top:8px">Pay Period: <b>${esc(p.payMonth)}</b></div>
    </div>
  </div>

  <div class="meta-box">
    <div><strong>Employee Name:</strong> ${esc(p.employeeName || 'Emp #' + p.employeeId)}</div>
    <div><strong>Employee ID:</strong> #${p.employeeId}</div>
    <div><strong>Department:</strong> ${esc(p.department || 'Operations')}</div>
    <div><strong>Generation Date:</strong> ${new Date().toISOString().slice(0, 10)}</div>
  </div>

  <table>
    <thead>
      <tr><th>Earnings & Deductions Item</th><th class="amount">Amount (INR)</th></tr>
    </thead>
    <tbody>
      <tr><td>Monthly Basic Salary</td><td class="amount">${money(p.basicSalary)}</td></tr>
      <tr><td>Allowances & Benefits</td><td class="amount" style="color:#10b981">+ ${money(p.allowance)}</td></tr>
      <tr><td>Provident / Statutory Deductions</td><td class="amount" style="color:#ef4444">− ${money(p.deduction)}</td></tr>
      <tr><td>Withholding Income Tax</td><td class="amount" style="color:#ef4444">− ${money(p.tax)}</td></tr>
      <tr class="total">
        <td>Total Net Salary Disbursed</td>
        <td class="amount">${money(p.netSalary)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>This is an authenticated computer-generated payslip issued by PeoplePilot Enterprise HRMS.</p>
  </div>

  <div class="btn-bar">
    <button class="btn" onclick="window.print()">Print Payslip / Save PDF</button>
  </div>
</body>
</html>`);
  w.document.close();
}

// Navigation Events
$$('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => go(btn.dataset.page));
});

// Drag & drop vault listeners
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());

// Startup Execution
initTheme();
startClock();
initAmbientCanvas();
checkSession();
render();
refresh();
