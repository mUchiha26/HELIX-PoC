/* =============================================================
   HELIX PLATFORM — LOGS.JS
   Log upload, drag-and-drop, and table rendering
   ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth();
  if (!user) return;
  Auth.updateSidebarUser(user);
  Auth.buildSidebar(user.role);
  Auth.setActiveNav();
  setupSidebar();
  setupUpload();
  loadLogs();
});

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  toggle?.addEventListener('click', () => { sidebar?.classList.toggle('open'); overlay?.classList.toggle('active'); });
  overlay?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); });
}

function setupUpload() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('logFileInput');

  zone?.addEventListener('click', () => input?.click());

  zone?.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone?.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  input?.addEventListener('change', () => { if (input.files.length) handleFiles(input.files); });
}

async function handleFiles(files) {
  const statusEl = document.getElementById('parseStatus');
  statusEl.innerHTML = '<div class="parse-status status-parsing"><i class="bi bi-hourglass-split me-2"></i>Parsing files...</div>';

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);

    const result = await logsApi.upload(formData);
    if (result?.success) {
      statusEl.innerHTML = `<div class="parse-status status-done"><i class="bi bi-check-circle me-2"></i>${file.name} — ${result.data.count} entries ingested</div>`;
      loadLogs();
    } else {
      statusEl.innerHTML = `<div class="parse-status status-error"><i class="bi bi-x-circle me-2"></i>Failed to parse ${file.name}</div>`;
    }
  }
}

async function loadLogs() {
  showLoader('#logsBody');
  const data = await logsApi.list();
  if (!data || !data.success) {
    showEmpty('#logsBody', 'bi-journal-x', 'No logs ingested', 'Upload log files to get started.');
    return;
  }
  renderLogs(data.data || []);
}

function renderLogs(logs) {
  const tbody = document.getElementById('logsBody');
  if (!tbody) return;
  if (logs.length === 0) {
    showEmpty('#logsBody', 'bi-journal-plus', 'No logs', 'Upload log files to see them here.');
    return;
  }
  tbody.innerHTML = logs.map(l => `
    <tr>
      <td class="mono">#${l.id}</td>
      <td class="mono">${l.filename || '—'}</td>
      <td class="mono">${l.source_ip || '—'}</td>
      <td><span class="severity-badge severity-${l.severity?.toLowerCase()}">${l.severity}</span></td>
      <td class="mono">${l.event_type || '—'}</td>
      <td class="mono">${formatDate(l.ingested_at)}</td>
      <td><div class="actions-cell"><button class="btn-icon" title="View" onclick="viewLog(${l.id})"><i class="bi bi-eye"></i></button></div></td>
    </tr>
  `).join('');
}

async function viewLog(id) {
  const data = await logsApi.get(id);
  if (data?.success) {
    showToast(`Log #${id}: ${data.data.message?.substring(0, 100)}...`, 'info');
  }
}
