const STORAGE_KEY = 'bytehex_portal_v1';
const AVATAR_COLORS = [
    ['#c4ff3d', '#9eff00'], ['#ff6b4a', '#ff8e6f'], ['#4dd0e1', '#80deea'],
    ['#a78bfa', '#c4b5fd'], ['#fbbf24', '#fcd34d'], ['#60a5fa', '#93c5fd'],
    ['#f472b6', '#f9a8d4'], ['#34d399', '#6ee7b7']
];
const DEPARTMENTS = ['Engineering', 'Design', 'Product', 'Marketing', 'Data Science', 'Operations', 'QA', 'DevOps'];
const STATUSES = ['active', 'completed', 'terminated'];
let state = { interns: [], tasks: [], attendance: {}, announcements: [], certificates: [] };
let taskFilter = 'all';
let charts = {};

function uid() { return 'id_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4) }
function todayStr() { return new Date().toISOString().split('T')[0] }
function fmtDate(d) { if (!d) return '—'; const x = new Date(d); if (isNaN(x)) return '—'; return x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
function escapeHtml(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])) }
function highlight(text, term) { const s = escapeHtml(text); if (!term) return s; const t = escapeHtml(term); const re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'); return s.replace(re, '<mark>$1</mark>') }
function getInitials(name) { return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() }
function getAvatarColor(id) { const i = state.interns.findIndex(x => x.id === id); return AVATAR_COLORS[(i < 0 ? 0 : i) % AVATAR_COLORS.length] }
function toast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--info)' };
    el.innerHTML = `<i class="fa-solid ${icons[type]}" style="color:${colors[type]}"></i><div class="flex-1 text-sm">${escapeHtml(msg)}</div><button class="text-[var(--fg-d)] hover:text-[var(--fg)]" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>`;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; el.style.transition = 'all 0.3s'; setTimeout(() => el.remove(), 300) }, 3500);
}
function togglePass(id, btn) {
    const inp = document.getElementById(id);
    if (inp.type === 'password') { inp.type = 'text'; btn.innerHTML = '<i class="fa-regular fa-eye-slash"></i>' }
    else { inp.type = 'password'; btn.innerHTML = '<i class="fa-regular fa-eye"></i>' }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }
function load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { try { state = JSON.parse(raw) } catch (e) { seedSampleData() } }
    else { seedSampleData() }
}
function seedSampleData() {
    const samples = [
        { name: 'Aarav Sharma', email: 'aarav.s@bytehex.io', phone: '+91 98765 43210', department: 'Engineering', position: 'Frontend Intern', mentor: 'Rahul Mehta', startDate: '2024-06-01', endDate: '2024-12-01', status: 'active' },
        { name: 'Priya Nair', email: 'priya.n@bytehex.io', phone: '+91 98123 45678', department: 'Design', position: 'UI/UX Intern', mentor: 'Sara Khan', startDate: '2024-07-01', endDate: '2025-01-01', status: 'active' },
        { name: 'Marcus Chen', email: 'marcus.c@bytehex.io', phone: '+1 555-0142', department: 'Data Science', position: 'ML Intern', mentor: 'David Park', startDate: '2024-05-15', endDate: '2024-11-15', status: 'active' },
        { name: 'Elena Volkov', email: 'elena.v@bytehex.io', phone: '+7 916 1234567', department: 'Product', position: 'PM Intern', mentor: 'James Lee', startDate: '2024-03-01', endDate: '2024-09-01', status: 'completed' },
        { name: 'Diego Ramirez', email: 'diego.r@bytehex.io', phone: '+52 55 1234 5678', department: 'DevOps', position: 'Cloud Intern', mentor: 'Sofia Garcia', startDate: '2024-08-01', endDate: '2025-02-01', status: 'active' },
        { name: 'Yuki Tanaka', email: 'yuki.t@bytehex.io', phone: '+81 90-1234-5678', department: 'QA', position: 'QA Intern', mentor: 'Hiro Sato', startDate: '2024-06-15', endDate: '2024-12-15', status: 'active' },
        { name: 'Aisha Okafor', email: 'aisha.o@bytehex.io', phone: '+234 802 123 4567', department: 'Marketing', position: 'Growth Intern', mentor: 'Olivia Brown', startDate: '2024-04-01', endDate: '2024-10-01', status: 'completed' },
        { name: 'Lukas Mueller', email: 'lukas.m@bytehex.io', phone: '+49 151 12345678', department: 'Operations', position: 'Ops Intern', mentor: 'Anna Schmidt', startDate: '2024-09-01', endDate: '2025-03-01', status: 'active' }
    ];
    state.interns = samples.map((s, i) => ({ ...s, id: uid(), avatarColor: i, performance: Math.floor(60 + Math.random() * 38), tasksCompleted: Math.floor(Math.random() * 8), tasksAssigned: Math.floor(8 + Math.random() * 6) }));
    const taskTitles = [
        'Build dashboard component library', 'Onboard new design tokens',
        'Analyze user churn data', 'Wire up authentication flow',
        'Document API endpoints', 'Optimize image pipeline',
        'Write E2E test suite', 'Research cohort retention',
        'Migrate legacy forms', 'Set up CI/CD pipeline',
        'Create brand guidelines deck', 'Audit accessibility issues'
    ];
    state.tasks = taskTitles.map((t, i) => {
        const intern = state.interns[i % state.interns.length];
        const statuses = ['pending', 'in-progress', 'completed', 'completed', 'pending', 'in-progress', 'completed', 'pending', 'in-progress', 'completed', 'pending', 'in-progress'];
        const prios = ['high', 'medium', 'low', 'high', 'medium', 'high', 'low', 'medium', 'high', 'low', 'medium', 'high'];
        return { id: uid(), internId: intern.id, title: t, description: 'Detailed task description for ' + t + '.', assignedDate: todayStr(), dueDate: new Date(Date.now() + (i - 3) * 86400000).toISOString().split('T')[0], priority: prios[i % 3], status: statuses[i % statuses.length], progress: statuses[i % statuses.length] === 'completed' ? 100 : statuses[i % statuses.length] === 'in-progress' ? Math.floor(40 + Math.random() * 40) : 0 };
    });
    const today = todayStr();
    state.attendance[today] = state.interns.slice(0, 6).map((intern, i) => {
        const sts = ['present', 'present', 'late', 'present', 'absent', 'present'];
        return { internId: intern.id, status: sts[i], checkIn: sts[i] === 'present' ? '09:0' + (i + 2) : sts[i] === 'late' ? '10:15' : '', checkOut: sts[i] === 'absent' ? '' : '18:0' + (i % 3) }
    });
    state.announcements = [
        { id: uid(), title: 'Welcome to Winter Cohort 2024', content: 'All interns must complete onboarding by Friday. Mentorship assignments have been sent to your emails.', date: todayStr(), priority: 'important', author: 'Admin' },
        { id: uid(), title: 'System Maintenance Window', content: 'Portal will be unavailable Saturday 2-4 AM IST for scheduled maintenance.', date: todayStr(), priority: 'info', author: 'IT Team' },
        { id: uid(), title: 'Mid-term Reviews Next Week', content: 'Please prepare your progress decks. Schedule slots via the dashboard.', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], priority: 'urgent', author: 'HR' }
    ];
    state.certificates = [
        { id: uid(), internId: state.interns[3].id, type: 'Completion', issueDate: '2024-09-05', score: 92, status: 'issued' },
        { id: uid(), internId: state.interns[6].id, type: 'Excellence', issueDate: '2024-10-08', score: 96, status: 'issued' },
        { id: uid(), internId: state.interns[0].id, type: 'Recommendation', issueDate: '', score: 88, status: 'pending' },
        { id: uid(), internId: state.interns[1].id, type: 'Completion', issueDate: '', score: 0, status: 'pending' }
    ];
    save();
}

function recomputeInternStats() {
    state.interns.forEach(intern => {
        const tasks = state.tasks.filter(t => t.internId === intern.id);
        intern.tasksAssigned = tasks.length;
        intern.tasksCompleted = tasks.filter(t => t.status === 'completed').length;
        const attRecords = Object.values(state.attendance).flat().filter(a => a.internId === intern.id);
        if (attRecords.length) {
            const present = attRecords.filter(a => a.status === 'present' || a.status === 'late').length;
            intern.attendance = Math.round(present / attRecords.length * 100);
        } else { intern.attendance = 100 }
        const completionRate = intern.tasksAssigned ? intern.tasksCompleted / intern.tasksAssigned : 0;
        const base = intern.performance || 70;
        intern.performance = Math.min(100, Math.round(base * 0.5 + completionRate * 30 + intern.attendance * 0.2));
    });
}

function login(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    if (email === 'admin@bytehex.io' && pass === 'admin123') {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden-view');
        initApp();
        toast('Welcome back, Admin!', 'success');
    } else {
        toast('Invalid credentials. Use admin@bytehex.io / admin123', 'error');
        const card = document.getElementById('login-form');
        card.style.animation = 'shake 0.4s'; setTimeout(() => card.style.animation = '', 400);
    }
}
function logout() {
    document.getElementById('app').classList.add('hidden-view');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-pass').value = 'admin123';
    toast('Signed out successfully', 'info');
}
function initApp() {
    recomputeInternStats();
    populateDeptFilters();
    document.getElementById('attendance-date').value = todayStr();
    switchView('dashboard');
    startClock();
    updateNavCounts();
}
function startClock() {
    const update = () => {
        const d = new Date();
        document.getElementById('header-time').textContent = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };
    update(); setInterval(update, 1000);
}
function updateNavCounts() {
    document.getElementById('nav-intern-count').textContent = state.interns.length;
    document.getElementById('nav-task-count').textContent = state.tasks.filter(t => t.status !== 'completed').length;
    document.getElementById('nav-ann-count').textContent = state.announcements.length;
    document.getElementById('login-stat-1').textContent = state.interns.filter(i => i.status === 'active').length;
    document.getElementById('login-stat-2').textContent = state.tasks.filter(t => t.status !== 'completed').length;
    document.getElementById('login-stat-3').textContent = state.certificates.filter(c => c.status === 'issued').length;
}
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
}
function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden-view'));
    document.getElementById('view-' + view).classList.remove('hidden-view');
    document.querySelectorAll('.nav-link').forEach(n => n.classList.toggle('active', n.dataset.view === view));
    const titles = { dashboard: ['Dashboard', 'Real-time overview of your internship program'], interns: ['Interns', 'Manage all intern records and registrations'], tasks: ['Tasks', 'Assign and track intern tasks'], attendance: ['Attendance', 'Daily attendance tracking'], performance: ['Performance', 'Analyze intern performance metrics'], announcements: ['Announcements', 'Broadcast updates to your cohort'], certificates: ['Certificates', 'Issue and track completion certificates'] };
    document.getElementById('page-title').textContent = titles[view][0];
    document.getElementById('page-subtitle').textContent = titles[view][1];
    if (window.innerWidth < 1024) { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebar-overlay').classList.remove('open') }
    if (view === 'dashboard') renderDashboard();
    if (view === 'interns') renderInterns();
    if (view === 'tasks') renderTasks();
    if (view === 'attendance') renderAttendance();
    if (view === 'performance') renderPerformance();
    if (view === 'announcements') renderAnnouncements();
    if (view === 'certificates') renderCertificates();
}
function populateDeptFilters() {
    const sel = document.getElementById('intern-filter-dept');
    sel.innerHTML = '<option value="">All Departments</option>' + DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('');
}
function renderDashboard() {
    const total = state.interns.length;
    const active = state.interns.filter(i => i.status === 'active').length;
    const openTasks = state.tasks.filter(t => t.status !== 'completed').length;
    const certs = state.certificates.filter(c => c.status === 'issued').length;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-tasks').textContent = openTasks;
    document.getElementById('stat-certs').textContent = certs;
    const deptCounts = {}; DEPARTMENTS.forEach(d => deptCounts[d] = 0);
    state.interns.forEach(i => { if (deptCounts[i.department] !== undefined) deptCounts[i.department]++ });
    renderChart('chart-dept', 'bar', { labels: DEPARTMENTS, datasets: [{ label: 'Interns', data: DEPARTMENTS.map(d => deptCounts[d]), backgroundColor: 'rgba(196,255,61,0.7)', borderColor: '#c4ff3d', borderWidth: 1, borderRadius: 6 }] }, { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#8a92a6', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a92a6', font: { size: 10 }, stepSize: 1 } } } });
    const statusCounts = { active: 0, completed: 0, terminated: 0 };
    state.interns.forEach(i => statusCounts[i.status]++);
    renderChart('chart-status', 'doughnut', { labels: ['Active', 'Completed', 'Terminated'], datasets: [{ data: [statusCounts.active, statusCounts.completed, statusCounts.terminated], backgroundColor: ['#c4ff3d', '#60a5fa', '#f87171'], borderColor: '#0f1320', borderWidth: 3 }] }, { plugins: { legend: { position: 'bottom', labels: { color: '#8a92a6', font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } } }, cutout: '65%' });
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const completedData = days.map((_, i) => Math.floor(3 + Math.random() * 8));
    renderChart('chart-tasks', 'line', { labels: days, datasets: [{ label: 'Completed', data: completedData, borderColor: '#c4ff3d', backgroundColor: 'rgba(196,255,61,0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#c4ff3d', pointBorderColor: '#0a0d18', pointBorderWidth: 2, pointRadius: 4 }] }, { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#8a92a6', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a92a6', font: { size: 10 } } } } });
    const attData = days.map(() => Math.floor(82 + Math.random() * 15));
    renderChart('chart-attendance', 'line', { labels: days, datasets: [{ label: 'Attendance %', data: attData, borderColor: '#4dd0e1', backgroundColor: 'rgba(77,208,225,0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#4dd0e1', pointBorderColor: '#0a0d18', pointBorderWidth: 2, pointRadius: 4 }] }, { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#8a92a6', font: { size: 10 } } }, y: { min: 60, max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a92a6', font: { size: 10 }, callback: v => v + '%' } } } });
    const top = [...state.interns].sort((a, b) => b.performance - a.performance).slice(0, 5);
    document.getElementById('top-performers').innerHTML = top.map((i, idx) => {
        const [c1, c2] = getAvatarColor(i.id);
        return `<div class="flex items-center gap-3">
      <div class="avatar w-8 h-8 text-xs" style="background:linear-gradient(135deg,${c1},${c2});color:#0a0d18">${idx + 1}</div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium truncate">${escapeHtml(i.name)}</div>
        <div class="progress mt-1"><div class="progress-fill" style="width:${i.performance}%;background:linear-gradient(90deg,${c1},${c2})"></div></div>
      </div>
      <div class="text-sm font-bold mono text-[var(--accent)]">${i.performance}</div>
    </div>`;
    }).join('');
}
function renderChart(id, type, data, options) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, { type, data, options: { ...options, responsive: true, maintainAspectRatio: false } });
}
function renderInterns() {
    const term = document.getElementById('intern-search').value.trim().toLowerCase();
    const dept = document.getElementById('intern-filter-dept').value;
    const status = document.getElementById('intern-filter-status').value;
    const filtered = state.interns.filter(i => {
        const matchTerm = !term || (i.name + i.email + i.department + i.mentor + i.position).toLowerCase().includes(term);
        return matchTerm && (!dept || i.department === dept) && (!status || i.status === status);
    });
    const tbody = document.getElementById('intern-tbody');
    document.getElementById('intern-empty').classList.toggle('hidden-view', filtered.length > 0);
    tbody.innerHTML = filtered.map(i => {
        const [c1, c2] = AVATAR_COLORS[i.avatarColor % AVATAR_COLORS.length];
        const statusBadge = { active: 'badge-success', completed: 'badge-info', terminated: 'badge-danger' }[i.status] || 'badge-muted';
        const duration = `${fmtDate(i.startDate)} → ${fmtDate(i.endDate)}`;
        const perfColor = i.performance >= 85 ? 'var(--success)' : i.performance >= 70 ? 'var(--warning)' : 'var(--danger)';
        return `<tr class="fade-in">
      <td data-label="Intern">
        <div class="flex items-center gap-3">
          <div class="avatar w-10 h-10" style="background:linear-gradient(135deg,${c1},${c2});color:#0a0d18">${getInitials(i.name)}</div>
          <div>
            <div class="font-medium">${highlight(i.name, term)}</div>
            <div class="text-xs text-[var(--fg-m)]">${highlight(i.email, term)}</div>
          </div>
        </div>
      </td>
      <td data-label="Department"><span class="text-sm">${highlight(i.department, term)}</span><div class="text-xs text-[var(--fg-d)]">${escapeHtml(i.position)}</div></td>
      <td data-label="Mentor">${highlight(i.mentor || '—', term)}</td>
      <td data-label="Duration" class="text-xs mono text-[var(--fg-m)]">${duration}</td>
      <td data-label="Performance">
        <div class="flex items-center gap-2 min-w-[120px]">
          <div class="progress flex-1"><div class="progress-fill" style="width:${i.performance}%;background:${perfColor}"></div></div>
          <span class="text-xs mono font-semibold" style="color:${perfColor}">${i.performance}</span>
        </div>
      </td>
      <td data-label="Status"><span class="badge ${statusBadge}">${i.status}</span></td>
      <td data-label="Actions" class="text-right">
        <div class="flex justify-end gap-1">
          <button class="btn btn-ghost btn-icon" onclick="viewIntern('${i.id}')" title="View"><i class="fa-regular fa-eye"></i></button>
          <button class="btn btn-ghost btn-icon" onclick="openInternModal('${i.id}')" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn btn-danger btn-icon" onclick="deleteIntern('${i.id}')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </td>
    </tr>`;
    }).join('');
}
function viewIntern(id) {
    const i = state.interns.find(x => x.id === id); if (!i) return;
    const tasks = state.tasks.filter(t => t.internId === id);
    const certs = state.certificates.filter(c => c.internId === id);
    const [c1, c2] = AVATAR_COLORS[i.avatarColor % AVATAR_COLORS.length];
    const attRecords = Object.values(state.attendance).flat().filter(a => a.internId === id);
    const present = attRecords.filter(a => a.status === 'present').length;
    const late = attRecords.filter(a => a.status === 'late').length;
    const absent = attRecords.filter(a => a.status === 'absent').length;
    const modalHTML = `<div class="modal-bd" onclick="if(event.target===this)closeModal()">
    <div class="modal modal-lg">
      <div class="p-6 border-b border-white/5 flex items-start justify-between">
        <div class="flex items-center gap-4">
          <div class="avatar w-16 h-16 text-xl" style="background:linear-gradient(135deg,${c1},${c2});color:#0a0d18">${getInitials(i.name)}</div>
          <div>
            <h2 class="text-xl font-bold">${escapeHtml(i.name)}</h2>
            <p class="text-sm text-[var(--fg-m)]">${escapeHtml(i.position)} · ${escapeHtml(i.department)}</p>
            <div class="flex gap-2 mt-2">
              <span class="badge ${i.status === 'active' ? 'badge-success' : i.status === 'completed' ? 'badge-info' : 'badge-danger'}">${i.status}</span>
              <span class="badge badge-accent">Perf: ${i.performance}</span>
            </div>
          </div>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="p-6 space-y-5">
        <div class="grid grid-cols-2 gap-4">
          <div class="glass rounded-xl p-4">
            <div class="text-xs text-[var(--fg-m)] uppercase tracking-wider mb-1">Email</div>
            <div class="text-sm mono">${escapeHtml(i.email)}</div>
          </div>
          <div class="glass rounded-xl p-4">
            <div class="text-xs text-[var(--fg-m)] uppercase tracking-wider mb-1">Phone</div>
            <div class="text-sm mono">${escapeHtml(i.phone || '—')}</div>
          </div>
          <div class="glass rounded-xl p-4">
            <div class="text-xs text-[var(--fg-m)] uppercase tracking-wider mb-1">Mentor</div>
            <div class="text-sm">${escapeHtml(i.mentor || '—')}</div>
          </div>
          <div class="glass rounded-xl p-4">
            <div class="text-xs text-[var(--fg-m)] uppercase tracking-wider mb-1">Duration</div>
            <div class="text-sm mono">${fmtDate(i.startDate)} → ${fmtDate(i.endDate)}</div>
          </div>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <div class="glass rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-[var(--accent)] mono">${i.tasksCompleted}/${i.tasksAssigned}</div>
            <div class="text-xs text-[var(--fg-m)] mt-1">Tasks</div>
          </div>
          <div class="glass rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-[var(--success)] mono">${present}</div>
            <div class="text-xs text-[var(--fg-m)] mt-1">Present</div>
          </div>
          <div class="glass rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-[var(--warning)] mono">${late}</div>
            <div class="text-xs text-[var(--fg-m)] mt-1">Late</div>
          </div>
          <div class="glass rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-[var(--danger)] mono">${absent}</div>
            <div class="text-xs text-[var(--fg-m)] mt-1">Absent</div>
          </div>
        </div>
        ${tasks.length ? `<div>
          <h3 class="font-semibold mb-2 text-sm uppercase tracking-wider text-[var(--fg-m)]">Assigned Tasks</h3>
          <div class="space-y-2">
            ${tasks.map(t => `<div class="glass rounded-lg p-3 flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">${escapeHtml(t.title)}</div>
                <div class="text-xs text-[var(--fg-d)] mono">Due ${fmtDate(t.dueDate)}</div>
              </div>
              <span class="badge ${t.status === 'completed' ? 'badge-success' : t.status === 'in-progress' ? 'badge-warning' : 'badge-muted'}">${t.status}</span>
            </div>`).join('')}
          </div>
        </div>`: ''}
        ${certs.length ? `<div>
          <h3 class="font-semibold mb-2 text-sm uppercase tracking-wider text-[var(--fg-m)]">Certificates</h3>
          <div class="space-y-2">
            ${certs.map(c => `<div class="glass rounded-lg p-3 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <i class="fa-solid fa-certificate text-[var(--accent)]"></i>
                <div>
                  <div class="text-sm font-medium">${escapeHtml(c.type)} Certificate</div>
                  <div class="text-xs text-[var(--fg-d)] mono">${c.issueDate ? fmtDate(c.issueDate) : 'Pending issue'}</div>
                </div>
              </div>
              <span class="badge ${c.status === 'issued' ? 'badge-success' : c.status === 'pending' ? 'badge-warning' : 'badge-danger'}">${c.status}</span>
            </div>`).join('')}
          </div>
        </div>`: ''}
      </div>
    </div>
  </div>`;
    document.getElementById('modal-root').innerHTML = modalHTML;
}
function openInternModal(id) {
    const i = id ? state.interns.find(x => x.id === id) : null;
    const modalHTML = `<div class="modal-bd" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">${i ? 'Edit Intern' : 'Register New Intern'}</h2>
          <p class="text-xs text-[var(--fg-m)] mt-0.5">${i ? 'Update intern information' : 'Add a new intern to the cohort'}</p>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form onsubmit="saveIntern(event,'${id || ''}')" class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Full Name *</label>
            <input class="inp" name="name" required value="${i ? escapeHtml(i.name) : ''}" placeholder="Jane Doe">
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Email *</label>
            <input class="inp" name="email" type="email" required value="${i ? escapeHtml(i.email) : ''}" placeholder="jane@bytehex.io">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Phone</label>
            <input class="inp" name="phone" value="${i ? escapeHtml(i.phone || '') : ''}" placeholder="+1 555-0100">
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Department *</label>
            <select class="inp" name="department" required>
              ${DEPARTMENTS.map(d => `<option ${i && i.department === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Position *</label>
            <input class="inp" name="position" required value="${i ? escapeHtml(i.position) : ''}" placeholder="Frontend Intern">
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Mentor</label>
            <input class="inp" name="mentor" value="${i ? escapeHtml(i.mentor || '') : ''}" placeholder="Mentor name">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Start Date *</label>
            <input class="inp" name="startDate" type="date" required value="${i ? i.startDate : todayStr()}">
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">End Date *</label>
            <input class="inp" name="endDate" type="date" required value="${i ? i.endDate : ''}">
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Status</label>
          <select class="inp" name="status">
            ${STATUSES.map(s => `<option value="${s}" ${i && i.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary flex-1"><i class="fa-solid fa-${i ? 'floppy-disk' : 'user-plus'}"></i>${i ? 'Save Changes' : 'Register Intern'}</button>
        </div>
      </form>
    </div>
  </div>`;
    document.getElementById('modal-root').innerHTML = modalHTML;
}
function saveIntern(e, id) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { name: fd.get('name').trim(), email: fd.get('email').trim(), phone: fd.get('phone').trim(), department: fd.get('department'), position: fd.get('position').trim(), mentor: fd.get('mentor').trim(), startDate: fd.get('startDate'), endDate: fd.get('endDate'), status: fd.get('status') };
    if (id) {
        const i = state.interns.find(x => x.id === id);
        Object.assign(i, data);
        toast('Intern updated successfully', 'success');
    } else {
        const newIntern = { ...data, id: uid(), avatarColor: state.interns.length, performance: 70, tasksAssigned: 0, tasksCompleted: 0, attendance: 100 };
        state.interns.push(newIntern);
        const today = todayStr();
        if (!state.attendance[today]) state.attendance[today] = [];
        state.attendance[today].push({ internId: newIntern.id, status: 'present', checkIn: '09:00', checkOut: '18:00' });
        toast('Intern registered successfully', 'success');
    }
    save(); recomputeInternStats(); updateNavCounts(); renderInterns(); closeModal();
}
function deleteIntern(id) {
    const i = state.interns.find(x => x.id === id); if (!i) return;
    const modalHTML = `<div class="modal-bd" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="max-width:420px">
      <div class="p-6 text-center">
        <div class="w-16 h-16 rounded-full bg-[rgba(248,113,113,0.15)] flex items-center justify-center mx-auto mb-4">
          <i class="fa-solid fa-triangle-exclamation text-2xl text-[var(--danger)]"></i>
        </div>
        <h2 class="text-lg font-bold mb-2">Delete Intern?</h2>
        <p class="text-sm text-[var(--fg-m)] mb-6">This will permanently remove <strong class="text-[var(--fg)]">${escapeHtml(i.name)}</strong> and all associated tasks, attendance, and certificates. This action cannot be undone.</p>
        <div class="flex gap-3">
          <button class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button>
          <button class="btn btn-danger flex-1" onclick="confirmDeleteIntern('${id}')"><i class="fa-regular fa-trash-can"></i>Delete</button>
        </div>
      </div>
    </div>
  </div>`;
    document.getElementById('modal-root').innerHTML = modalHTML;
}
function confirmDeleteIntern(id) {
    state.interns = state.interns.filter(x => x.id !== id);
    state.tasks = state.tasks.filter(t => t.internId !== id);
    state.certificates = state.certificates.filter(c => c.internId !== id);
    Object.keys(state.attendance).forEach(d => { state.attendance[d] = state.attendance[d].filter(a => a.internId !== id) });
    save(); recomputeInternStats(); updateNavCounts(); renderInterns(); closeModal();
    toast('Intern and related records deleted', 'success');
}
function setTaskFilter(f) {
    taskFilter = f;
    document.querySelectorAll('#task-tabs .tab-pill').forEach(t => t.classList.toggle('active', t.dataset.filter === f));
    renderTasks();
}
function renderTasks() {
    const term = document.getElementById('task-search').value.trim().toLowerCase();
    const filtered = state.tasks.filter(t => {
        const matchTerm = !term || t.title.toLowerCase().includes(term);
        const matchFilter = taskFilter === 'all' || t.status === taskFilter;
        return matchTerm && matchFilter;
    });
    const grid = document.getElementById('task-grid');
    document.getElementById('task-empty').classList.toggle('hidden-view', filtered.length > 0);
    grid.innerHTML = filtered.map(t => {
        const intern = state.interns.find(i => i.id === t.internId);
        const [c1, c2] = intern ? AVATAR_COLORS[intern.avatarColor % AVATAR_COLORS.length] : ['#5a6378', '#8a92a6'];
        const priBadge = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-muted' }[t.priority];
        const statusBadge = { pending: 'badge-muted', 'in-progress': 'badge-warning', completed: 'badge-success' }[t.status];
        const statusIcon = { pending: 'fa-circle-pause', 'in-progress': 'fa-spinner', completed: 'fa-circle-check' }[t.status];
        return `<div class="glass rounded-2xl p-5 lift fade-in">
      <div class="flex items-start justify-between mb-3">
        <span class="badge ${priBadge}">${t.priority}</span>
        <span class="badge ${statusBadge}"><i class="fa-solid ${statusIcon} text-[9px]"></i>${t.status}</span>
      </div>
      <h3 class="font-semibold mb-2">${highlight(t.title, term)}</h3>
      <p class="text-sm text-[var(--fg-m)] mb-4 line-clamp-2">${escapeHtml(t.description)}</p>
      <div class="flex items-center gap-2 mb-4">
        <div class="avatar w-7 h-7 text-[10px]" style="background:linear-gradient(135deg,${c1},${c2});color:#0a0d18">${intern ? getInitials(intern.name) : '?'}</div>
        <div class="flex-1 min-w-0">
          <div class="text-xs font-medium truncate">${intern ? escapeHtml(intern.name) : 'Unassigned'}</div>
          <div class="text-[10px] text-[var(--fg-d)] mono">${intern ? escapeHtml(intern.department) : ''}</div>
        </div>
      </div>
      <div class="mb-3">
        <div class="flex justify-between text-xs mb-1.5">
          <span class="text-[var(--fg-m)]">Progress</span>
          <span class="mono font-semibold">${t.progress}%</span>
        </div>
        <div class="progress"><div class="progress-fill" style="width:${t.progress}%;background:linear-gradient(90deg,${c1},${c2})"></div></div>
      </div>
      <div class="flex items-center justify-between text-xs text-[var(--fg-d)] mono mb-4">
        <span><i class="fa-regular fa-calendar"></i> Due ${fmtDate(t.dueDate)}</span>
        <span class="${new Date(t.dueDate) < new Date() && t.status !== 'completed' ? 'text-[var(--danger)]' : ''}">${new Date(t.dueDate) < new Date() && t.status !== 'completed' ? 'Overdue' : 'On track'}</span>
      </div>
      <div class="flex gap-2">
        ${t.status !== 'completed' ? `<button class="btn btn-ghost btn-icon flex-1" onclick="cycleTaskStatus('${t.id}')" title="Advance status"><i class="fa-solid fa-forward-step"></i></button>` : ''}
        <button class="btn btn-ghost btn-icon flex-1" onclick="openTaskModal('${t.id}')" title="Edit"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="btn btn-danger btn-icon flex-1" onclick="deleteTask('${t.id}')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
      </div>
    </div>`;
    }).join('');
}
function cycleTaskStatus(id) {
    const t = state.tasks.find(x => x.id === id); if (!t) return;
    const order = ['pending', 'in-progress', 'completed'];
    const next = order[(order.indexOf(t.status) + 1) % order.length];
    t.status = next;
    t.progress = next === 'completed' ? 100 : next === 'in-progress' ? Math.max(t.progress, 50) : t.progress;
    save(); recomputeInternStats(); updateNavCounts(); renderTasks();
    toast(`Task moved to ${next}`, 'success');
}
function openTaskModal(id) {
    const t = id ? state.tasks.find(x => x.id === id) : null;
    const modalHTML = `<div class="modal-bd" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">${t ? 'Edit Task' : 'Assign New Task'}</h2>
          <p class="text-xs text-[var(--fg-m)] mt-0.5">${t ? 'Update task details' : 'Assign a task to an intern'}</p>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form onsubmit="saveTask(event,'${id || ''}')" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Title *</label>
          <input class="inp" name="title" required value="${t ? escapeHtml(t.title) : ''}" placeholder="Build landing page">
        </div>
        <div>
          <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Description</label>
          <textarea class="inp" name="description" rows="3" placeholder="Task details...">${t ? escapeHtml(t.description || '') : ''}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Assign To *</label>
            <select class="inp" name="internId" required>
              ${state.interns.map(i => `<option value="${i.id}" ${t && t.internId === i.id ? 'selected' : ''}>${escapeHtml(i.name)} — ${escapeHtml(i.department)}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Priority</label>
            <select class="inp" name="priority">
              ${['low', 'medium', 'high'].map(p => `<option value="${p}" ${t && t.priority === p ? 'selected' : ''}>${p.charAt(0).toUpperCase() + p.slice(1)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Due Date *</label>
            <input class="inp" name="dueDate" type="date" required value="${t ? t.dueDate : todayStr()}">
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Status</label>
            <select class="inp" name="status">
              ${['pending', 'in-progress', 'completed'].map(s => `<option value="${s}" ${t && t.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Progress: <span id="progress-val" class="mono text-[var(--accent)]">${t ? t.progress : 0}</span>%</label>
          <input type="range" name="progress" min="0" max="100" step="5" value="${t ? t.progress : 0}" class="w-full accent-[var(--accent)]" oninput="document.getElementById('progress-val').textContent=this.value">
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary flex-1"><i class="fa-solid fa-${t ? 'floppy-disk' : 'plus'}"></i>${t ? 'Save Changes' : 'Assign Task'}</button>
        </div>
      </form>
    </div>
  </div>`;
    document.getElementById('modal-root').innerHTML = modalHTML;
}
function saveTask(e, id) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { title: fd.get('title').trim(), description: fd.get('description').trim(), internId: fd.get('internId'), priority: fd.get('priority'), dueDate: fd.get('dueDate'), status: fd.get('status'), progress: parseInt(fd.get('progress')) };
    if (data.status === 'completed') data.progress = 100;
    if (id) {
        const t = state.tasks.find(x => x.id === id);
        Object.assign(t, data);
        toast('Task updated successfully', 'success');
    } else {
        state.tasks.push({ ...data, id: uid(), assignedDate: todayStr() });
        toast('Task assigned successfully', 'success');
    }
    save(); recomputeInternStats(); updateNavCounts(); renderTasks(); closeModal();
}
function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    save(); recomputeInternStats(); updateNavCounts(); renderTasks();
    toast('Task deleted', 'success');
}
function renderAttendance() {
    const date = document.getElementById('attendance-date').value || todayStr();
    if (!state.attendance[date]) state.attendance[date] = state.interns.map(i => ({ internId: i.id, status: 'present', checkIn: '09:00', checkOut: '18:00' }));
    const records = state.attendance[date];
    const tbody = document.getElementById('attendance-tbody');
    tbody.innerHTML = state.interns.map(i => {
        const rec = records.find(r => r.internId === i.id) || { status: 'present', checkIn: '09:00', checkOut: '18:00' };
        const [c1, c2] = AVATAR_COLORS[i.avatarColor % AVATAR_COLORS.length];
        return `<tr>
      <td data-label="Intern">
        <div class="flex items-center gap-3">
          <div class="avatar w-9 h-9 text-xs" style="background:linear-gradient(135deg,${c1},${c2});color:#0a0d18">${getInitials(i.name)}</div>
          <div>
            <div class="font-medium text-sm">${escapeHtml(i.name)}</div>
            <div class="text-xs text-[var(--fg-d)]">${escapeHtml(i.department)}</div>
          </div>
        </div>
      </td>
      <td data-label="Department">${escapeHtml(i.department)}</td>
      <td data-label="Status">
        <select class="inp w-auto text-xs" onchange="updateAttendance('${i.id}','status',this.value)">
          <option value="present" ${rec.status === 'present' ? 'selected' : ''}>Present</option>
          <option value="late" ${rec.status === 'late' ? 'selected' : ''}>Late</option>
          <option value="absent" ${rec.status === 'absent' ? 'selected' : ''}>Absent</option>
          <option value="leave" ${rec.status === 'leave' ? 'selected' : ''}>On Leave</option>
        </select>
      </td>
      <td data-label="Check-in"><input type="time" class="inp w-auto" value="${rec.checkIn || ''}" onchange="updateAttendance('${i.id}','checkIn',this.value)" ${rec.status === 'absent' || rec.status === 'leave' ? 'disabled' : ''}></td>
      <td data-label="Check-out"><input type="time" class="inp w-auto" value="${rec.checkOut || ''}" onchange="updateAttendance('${i.id}','checkOut',this.value)" ${rec.status === 'absent' || rec.status === 'leave' ? 'disabled' : ''}></td>
    </tr>`;
    }).join('');
    const counts = { present: 0, late: 0, absent: 0, leave: 0 };
    records.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++ });
    document.getElementById('att-present').textContent = counts.present;
    document.getElementById('att-late').textContent = counts.late;
    document.getElementById('att-absent').textContent = counts.absent;
    document.getElementById('att-leave').textContent = counts.leave;
}
function updateAttendance(internId, field, value) {
    const date = document.getElementById('attendance-date').value || todayStr();
    if (!state.attendance[date]) state.attendance[date] = [];
    let rec = state.attendance[date].find(r => r.internId === internId);
    if (!rec) { rec = { internId, status: 'present', checkIn: '09:00', checkOut: '18:00' }; state.attendance[date].push(rec) }
    rec[field] = value;
    if (field === 'status' && (value === 'absent' || value === 'leave')) { rec.checkIn = ''; rec.checkOut = '' }
    if (field === 'status' && (value === 'present' || value === 'late') && !rec.checkIn) { rec.checkIn = '09:00'; rec.checkOut = '18:00' }
    renderAttendance();
}
function markAllPresent() {
    const date = document.getElementById('attendance-date').value || todayStr();
    state.attendance[date] = state.interns.map(i => ({ internId: i.id, status: 'present', checkIn: '09:00', checkOut: '18:00' }));
    renderAttendance();
    toast('All interns marked present', 'success');
}
function saveAttendance() {
    save(); recomputeInternStats();
    toast('Attendance saved for ' + document.getElementById('attendance-date').value, 'success');
}
function renderPerformance() {
    const dist = { excellent: 0, good: 0, average: 0, poor: 0 };
    state.interns.forEach(i => {
        if (i.performance >= 85) dist.excellent++;
        else if (i.performance >= 70) dist.good++;
        else if (i.performance >= 50) dist.average++;
        else dist.poor++;
    });
    renderChart('chart-perf-dist', 'bar', { labels: ['Excellent (85+)', 'Good (70-84)', 'Average (50-69)', 'Poor (<50)'], datasets: [{ label: 'Interns', data: [dist.excellent, dist.good, dist.average, dist.poor], backgroundColor: ['#4ade80', '#c4ff3d', '#fbbf24', '#f87171'], borderRadius: 6 }] }, { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#8a92a6', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8a92a6', font: { size: 10 }, stepSize: 1 } } } });
    const deptPerf = {}; DEPARTMENTS.forEach(d => deptPerf[d] = []);
    state.interns.forEach(i => { if (deptPerf[i.department]) deptPerf[i.department].push(i.performance) });
    const deptAvg = DEPARTMENTS.map(d => deptPerf[d].length ? Math.round(deptPerf[d].reduce((a, b) => a + b, 0) / deptPerf[d].length) : 0);
    renderChart('chart-perf-dept', 'radar', { labels: DEPARTMENTS, datasets: [{ label: 'Avg Score', data: deptAvg, backgroundColor: 'rgba(196,255,61,0.2)', borderColor: '#c4ff3d', pointBackgroundColor: '#c4ff3d', pointBorderColor: '#0a0d18', pointBorderWidth: 2, pointRadius: 4 }] }, { plugins: { legend: { display: false } }, scales: { r: { beginAtZero: true, max: 100, ticks: { color: '#5a6378', backdropColor: 'transparent', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.08)' }, angleLines: { color: 'rgba(255,255,255,0.08)' }, pointLabels: { color: '#8a92a6', font: { size: 11 } } } } });
    const tbody = document.getElementById('performance-tbody');
    tbody.innerHTML = state.interns.map(i => {
        const [c1, c2] = AVATAR_COLORS[i.avatarColor % AVATAR_COLORS.length];
        const perfColor = i.performance >= 85 ? 'var(--success)' : i.performance >= 70 ? 'var(--warning)' : 'var(--danger)';
        const rating = i.performance >= 85 ? { t: 'Excellent', b: 'badge-success' } : i.performance >= 70 ? { t: 'Good', b: 'badge-accent' } : i.performance >= 50 ? { t: 'Average', b: 'badge-warning' } : { t: 'Needs Improvement', b: 'badge-danger' };
        const taskRate = i.tasksAssigned ? Math.round(i.tasksCompleted / i.tasksAssigned * 100) : 0;
        return `<tr>
      <td data-label="Intern">
        <div class="flex items-center gap-3">
          <div class="avatar w-9 h-9 text-xs" style="background:linear-gradient(135deg,${c1},${c2});color:#0a0d18">${getInitials(i.name)}</div>
          <div>
            <div class="font-medium text-sm">${escapeHtml(i.name)}</div>
            <div class="text-xs text-[var(--fg-d)]">${escapeHtml(i.position)}</div>
          </div>
        </div>
      </td>
      <td data-label="Department">${escapeHtml(i.department)}</td>
      <td data-label="Tasks"><span class="mono">${i.tasksCompleted}/${i.tasksAssigned}</span> <span class="text-xs text-[var(--fg-d)]">(${taskRate}%)</span></td>
      <td data-label="Attendance"><span class="mono">${i.attendance}%</span></td>
      <td data-label="Performance">
        <div class="flex items-center gap-2 min-w-[120px]">
          <div class="progress flex-1"><div class="progress-fill" style="width:${i.performance}%;background:${perfColor}"></div></div>
          <span class="text-xs mono font-semibold" style="color:${perfColor}">${i.performance}</span>
        </div>
      </td>
      <td data-label="Rating"><span class="badge ${rating.b}">${rating.t}</span></td>
    </tr>`;
    }).join('');
}
function renderAnnouncements() {
    const list = document.getElementById('announcement-list');
    document.getElementById('announcement-empty').classList.toggle('hidden-view', state.announcements.length > 0);
    list.innerHTML = state.announcements.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(a => {
        const priBadge = { urgent: 'badge-danger', important: 'badge-warning', info: 'badge-info' }[a.priority];
        const priIcon = { urgent: 'fa-circle-exclamation', important: 'fa-circle-info', info: 'fa-bullhorn' }[a.priority];
        const priColor = { urgent: 'var(--danger)', important: 'var(--warning)', info: 'var(--info)' }[a.priority];
        return `<div class="glass rounded-2xl p-5 lift fade-in" style="border-left:3px solid ${priColor}">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background:rgba(255,255,255,0.04)">
            <i class="fa-solid ${priIcon}" style="color:${priColor}"></i>
          </div>
          <div>
            <h3 class="font-semibold">${escapeHtml(a.title)}</h3>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="badge ${priBadge}">${a.priority}</span>
              <span class="text-xs text-[var(--fg-d)] mono">${fmtDate(a.date)} · ${escapeHtml(a.author)}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-icon" onclick="openAnnouncementModal('${a.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
          <button class="btn btn-danger btn-icon" onclick="deleteAnnouncement('${a.id}')"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>
      <p class="text-sm text-[var(--fg-m)] leading-relaxed">${escapeHtml(a.content)}</p>
    </div>`;
    }).join('');
}
function openAnnouncementModal(id) {
    const a = id ? state.announcements.find(x => x.id === id) : null;
    const modalHTML = `<div class="modal-bd" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">${a ? 'Edit Announcement' : 'New Announcement'}</h2>
          <p class="text-xs text-[var(--fg-m)] mt-0.5">${a ? 'Update announcement' : 'Broadcast to all interns'}</p>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form onsubmit="saveAnnouncement(event,'${id || ''}')" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Title *</label>
          <input class="inp" name="title" required value="${a ? escapeHtml(a.title) : ''}" placeholder="Important update">
        </div>
        <div>
          <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Content *</label>
          <textarea class="inp" name="content" rows="4" required placeholder="Announcement details...">${a ? escapeHtml(a.content) : ''}</textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Priority</label>
            <select class="inp" name="priority">
              <option value="info" ${a && a.priority === 'info' ? 'selected' : ''}>Info</option>
              <option value="important" ${a && a.priority === 'important' ? 'selected' : ''}>Important</option>
              <option value="urgent" ${a && a.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Author</label>
            <input class="inp" name="author" required value="${a ? escapeHtml(a.author) : 'Admin'}" placeholder="Your name">
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary flex-1"><i class="fa-solid fa-${a ? 'floppy-disk' : 'bullhorn'}"></i>${a ? 'Save' : 'Publish'}</button>
        </div>
      </form>
    </div>
  </div>`;
    document.getElementById('modal-root').innerHTML = modalHTML;
}
function saveAnnouncement(e, id) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { title: fd.get('title').trim(), content: fd.get('content').trim(), priority: fd.get('priority'), author: fd.get('author').trim() };
    if (id) {
        const a = state.announcements.find(x => x.id === id);
        Object.assign(a, data);
        toast('Announcement updated', 'success');
    } else {
        state.announcements.push({ ...data, id: uid(), date: todayStr() });
        toast('Announcement published', 'success');
    }
    save(); updateNavCounts(); renderAnnouncements(); closeModal();
}
function deleteAnnouncement(id) {
    state.announcements = state.announcements.filter(a => a.id !== id);
    save(); updateNavCounts(); renderAnnouncements();
    toast('Announcement deleted', 'success');
}
function renderCertificates() {
    document.getElementById('cert-total').textContent = state.certificates.length;
    document.getElementById('cert-issued').textContent = state.certificates.filter(c => c.status === 'issued').length;
    document.getElementById('cert-pending').textContent = state.certificates.filter(c => c.status === 'pending').length;
    document.getElementById('cert-revoked').textContent = state.certificates.filter(c => c.status === 'revoked').length;
    const tbody = document.getElementById('certificate-tbody');
    tbody.innerHTML = state.certificates.map(c => {
        const intern = state.interns.find(i => i.id === c.internId);
        const [c1, c2] = intern ? AVATAR_COLORS[intern.avatarColor % AVATAR_COLORS.length] : ['#5a6378', '#8a92a6'];
        const typeBadge = { Completion: 'badge-accent', Excellence: 'badge-purple', Recommendation: 'badge-info' }[c.type] || 'badge-muted';
        const statusBadge = { issued: 'badge-success', pending: 'badge-warning', revoked: 'badge-danger' }[c.status];
        return `<tr>
      <td data-label="Intern">
        <div class="flex items-center gap-3">
          <div class="avatar w-9 h-9 text-xs" style="background:linear-gradient(135deg,${c1},${c2});color:#0a0d18">${intern ? getInitials(intern.name) : '?'}</div>
          <div>
            <div class="font-medium text-sm">${intern ? escapeHtml(intern.name) : 'Unknown'}</div>
            <div class="text-xs text-[var(--fg-d)]">${intern ? escapeHtml(intern.department) : ''}</div>
          </div>
        </div>
      </td>
      <td data-label="Type"><span class="badge ${typeBadge}">${c.type}</span></td>
      <td data-label="Issue Date" class="mono text-sm">${c.issueDate ? fmtDate(c.issueDate) : '—'}</td>
      <td data-label="Score"><span class="mono font-semibold ${c.score >= 85 ? 'text-[var(--success)]' : c.score >= 70 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'}">${c.score || '—'}${c.score ? '/100' : ''}</span></td>
      <td data-label="Status"><span class="badge ${statusBadge}">${c.status}</span></td>
      <td data-label="Actions" class="text-right">
        <div class="flex justify-end gap-1">
          ${c.status !== 'issued' ? `<button class="btn btn-ghost btn-icon" onclick="issueCertificate('${c.id}')" title="Issue"><i class="fa-solid fa-check"></i></button>` : ''}
          ${c.status === 'issued' ? `<button class="btn btn-danger btn-icon" onclick="revokeCertificate('${c.id}')" title="Revoke"><i class="fa-solid fa-ban"></i></button>` : ''}
          <button class="btn btn-danger btn-icon" onclick="deleteCertificate('${c.id}')" title="Delete"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </td>
    </tr>`;
    }).join('');
}
function openCertificateModal() {
    if (!state.interns.length) { toast('Add interns first before issuing certificates', 'error'); return }
    const modalHTML = `<div class="modal-bd" onclick="if(event.target===this)closeModal()">
    <div class="modal">
      <div class="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">Issue Certificate</h2>
          <p class="text-xs text-[var(--fg-m)] mt-0.5">Award a certificate to an intern</p>
        </div>
        <button class="btn btn-ghost btn-icon" onclick="closeModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <form onsubmit="saveCertificate(event)" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Intern *</label>
          <select class="inp" name="internId" required>
            ${state.interns.map(i => `<option value="${i.id}">${escapeHtml(i.name)} — ${escapeHtml(i.department)}</option>`).join('')}
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Type *</label>
            <select class="inp" name="type" required>
              <option value="Completion">Completion</option>
              <option value="Excellence">Excellence</option>
              <option value="Recommendation">Recommendation</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Score (0-100)</label>
            <input class="inp" name="score" type="number" min="0" max="100" value="85">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Status</label>
            <select class="inp" name="status">
              <option value="pending">Pending</option>
              <option value="issued" selected>Issued</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium text-[var(--fg-m)] mb-2 uppercase tracking-wider">Issue Date</label>
            <input class="inp" name="issueDate" type="date" value="${todayStr()}">
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="button" class="btn btn-ghost flex-1" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary flex-1"><i class="fa-solid fa-certificate"></i>Issue Certificate</button>
        </div>
      </form>
    </div>
  </div>`;
    document.getElementById('modal-root').innerHTML = modalHTML;
}
function saveCertificate(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = { internId: fd.get('internId'), type: fd.get('type'), score: parseInt(fd.get('score')) || 0, status: fd.get('status'), issueDate: fd.get('status') === 'issued' ? fd.get('issueDate') : '' };
    state.certificates.push({ ...data, id: uid() });
    save(); updateNavCounts(); renderCertificates(); closeModal();
    toast('Certificate issued', 'success');
}
function issueCertificate(id) {
    const c = state.certificates.find(x => x.id === id); if (!c) return;
    c.status = 'issued'; c.issueDate = todayStr();
    save(); updateNavCounts(); renderCertificates();
    toast('Certificate issued', 'success');
}
function revokeCertificate(id) {
    const c = state.certificates.find(x => x.id === id); if (!c) return;
    c.status = 'revoked';
    save(); updateNavCounts(); renderCertificates();
    toast('Certificate revoked', 'warning');
}
function deleteCertificate(id) {
    state.certificates = state.certificates.filter(c => c.id !== id);
    save(); updateNavCounts(); renderCertificates();
    toast('Certificate deleted', 'success');
}
function closeModal() { document.getElementById('modal-root').innerHTML = '' }

document.addEventListener('DOMContentLoaded', () => {
    load();
    document.getElementById('login-form').addEventListener('submit', login);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() });
});