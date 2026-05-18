/* =============================================================
   HELIX PLATFORM — ALERTS.JS
   Alert list rendering, filtering, and detail modal
   ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth();
  if (!user) return;

  Auth.updateSidebarUser(user);
  Auth.buildSidebar(user.role);
  Auth.setActiveNav();

  setupSidebar();
  loadAlerts();
  setupFilters();
});

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');

  toggle?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', () => {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
  });
}

async function loadAlerts() {
  showLoader('#alertsBody');

  const data = await alertsApi.list();
  if (!data || !data.success) {
    showEmpty('#alertsBody', 'bi-shield-exclamation', 'No alerts found', 'Alerts will appear here when detected.');
    return;
  }

  renderAlerts(data.data || []);
}

function renderAlerts(alerts) {
  const tbody = document.getElementById('alertsBody');
  if (!tbody) return;

  if (alerts.length === 0) {
    showEmpty('#alertsBody', 'bi-shield-check', 'No alerts', 'All clear — no active alerts.');
    return;
  }

  tbody.innerHTML = alerts.map(a => `
    <tr>
      <td class="mono">#${a.id}</td>
      <td>${a.title}</td>
      <td><span class="severity-badge severity-${a.severity?.toLowerCase()}">${a.severity}</span></td>
      <td><span class="status-badge status-${a.status?.toLowerCase()}">${a.status}</span></td>
      <td class="mono">${a.assigned_to_name || 'Unassigned'}</td>
      <td class="mono">${formatDate(a.created_at)}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-icon" title="View" onclick="viewAlert(${a.id})"><i class="bi bi-eye"></i></button>
          <button class="btn-icon" title="Resolve" onclick="resolveAlert(${a.id})"><i class="bi bi-check-lg"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setupFilters() {
  const search = document.getElementById('alertSearch');
  const severity = document.getElementById('severityFilter');
  const status = document.getElementById('statusFilter');

  const applyFilters = debounce(() => {
    // Client-side filtering for now; replace with API params later
    const term = search?.value?.toLowerCase() || '';
    const sev = severity?.value || '';
    const st = status?.value || '';

    const rows = document.querySelectorAll('#alertsBody tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const showSev = !sev || text.includes(sev);
      const showStatus = !st || text.includes(st);
      const showSearch = !term || text.includes(term);
      row.style.display = (showSev && showStatus && showSearch) ? '' : 'none';
    });
  }, 300);

  search?.addEventListener('input', applyFilters);
  severity?.addEventListener('change', applyFilters);
  status?.addEventListener('change', applyFilters);
}

async function viewAlert(id) {
  const data = await alertsApi.get(id);
  if (!data || !data.success) {
    showToast('Failed to load alert details', 'error');
    return;
  }

  const a = data.data;
  document.getElementById('alertModalTitle').textContent = `Alert #${a.id}`;
  document.getElementById('alertModalBody').innerHTML = `
    <div class="mb-3">
      <label class="form-label">Title</label>
      <div class="form-input" style="background: var(--bg-card);">${a.title}</div>
    </div>
    <div class="mb-3">
      <label class="form-label">Description</label>
      <div class="form-input" style="background: var(--bg-card); min-height: 80px;">${a.description || 'No description'}</div>
    </div>
    <div class="row g-3">
      <div class="col-6">
        <label class="form-label">Severity</label>
        <div><span class="severity-badge severity-${a.severity?.toLowerCase()}">${a.severity}</span></div>
      </div>
      <div class="col-6">
        <label class="form-label">Status</label>
        <div><span class="status-badge status-${a.status?.toLowerCase()}">${a.status}</span></div>
      </div>
      <div class="col-6">
        <label class="form-label">Assigned To</label>
        <div class="mono">${a.assigned_to_name || 'Unassigned'}</div>
      </div>
      <div class="col-6">
        <label class="form-label">Created</label>
        <div class="mono">${formatDate(a.created_at)}</div>
      </div>
    </div>
  `;

  showModal('alertModal');
}

async function resolveAlert(id) {
  const result = await alertsApi.updateStatus(id, 'resolved');
  if (result?.success) {
    showToast('Alert resolved', 'success');
    loadAlerts();
  } else {
    showToast('Failed to resolve alert', 'error');
  }
}
