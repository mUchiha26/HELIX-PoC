/* =============================================================
   HELIX PLATFORM — FIM.JS
   File Integrity Monitor — baseline, verify, results
   ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth();
  if (!user) return;
  Auth.updateSidebarUser(user);
  Auth.buildSidebar(user.role);
  Auth.setActiveNav();
  setupSidebar();
  loadHistory();
});

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  toggle?.addEventListener('click', () => { sidebar?.classList.toggle('open'); overlay?.classList.toggle('active'); });
  overlay?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); });
}

async function handleBaseline(e) {
  e.preventDefault();
  const btn = document.getElementById('baselineBtn');
  const target = document.getElementById('fimTarget').value.trim();
  const progress = document.getElementById('baselineProgress');

  btn.disabled = true;
  progress.innerHTML = `
    <div class="scan-progress">
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="loader-spinner" style="width: 18px; height: 18px; border-width: 2px;"></div>
        <span class="font-mono text-xs" style="color: var(--blue-accent);">Hashing files in ${target}...</span>
      </div>
    </div>
  `;

  const result = await fimApi.baseline(target);

  btn.disabled = false;

  if (result?.success) {
    progress.innerHTML = `<div class="parse-status status-done"><i class="bi bi-check-circle me-2"></i>Baseline #${result.data.baseline_id} created — ${result.data.file_count} files hashed</div>`;
    loadHistory();
  } else {
    progress.innerHTML = `<div class="parse-status status-error"><i class="bi bi-x-circle me-2"></i>${result?.error || 'Baseline creation failed'}</div>`;
  }
}

async function handleVerify(e) {
  e.preventDefault();
  const btn = document.getElementById('verifyBtn');
  const baselineId = document.getElementById('fimBaselineId').value.trim();
  const progress = document.getElementById('verifyProgress');
  const resultsDiv = document.getElementById('verifyResults');

  btn.disabled = true;
  progress.innerHTML = `
    <div class="scan-progress">
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="loader-spinner" style="width: 18px; height: 18px; border-width: 2px;"></div>
        <span class="font-mono text-xs" style="color: var(--blue-accent);">Verifying integrity...</span>
      </div>
    </div>
  `;

  const result = await fimApi.verify(parseInt(baselineId));

  btn.disabled = false;

  if (result?.success) {
    const c = result.data.changes;
    progress.innerHTML = `<div class="parse-status status-done"><i class="bi bi-check-circle me-2"></i>Integrity check complete</div>`;
    resultsDiv.innerHTML = `
      <div class="fim-changes-summary">
        <div class="change-card change-added"><i class="bi bi-plus-circle"></i> <span>${c.added || 0} Added</span></div>
        <div class="change-card change-modified"><i class="bi bi-pencil-square"></i> <span>${c.modified || 0} Modified</span></div>
        <div class="change-card change-deleted"><i class="bi bi-trash"></i> <span>${c.deleted || 0} Deleted</span></div>
        <div class="change-card change-unchanged"><i class="bi bi-check2-circle"></i> <span>${c.unchanged || 0} Unchanged</span></div>
      </div>
      <div class="helix-table-wrap mt-4">
        <table class="helix-table">
          <thead><tr><th>Status</th><th>File Path</th><th>Size</th></tr></thead>
          <tbody>
            ${(result.data.results || []).filter(r => r.status !== 'unchanged').map(r => `
              <tr>
                <td class="mono fim-status-${r.status}">${r.status.toUpperCase()}</td>
                <td class="mono text-truncate" style="max-width: 400px;">${r.path}</td>
                <td class="mono">${r.size > 0 ? r.size + ' B' : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    loadHistory();
  } else {
    progress.innerHTML = `<div class="parse-status status-error"><i class="bi bi-x-circle me-2"></i>${result?.error || 'Verification failed'}</div>`;
    resultsDiv.innerHTML = '';
  }
}

async function loadHistory() {
  const tbody = document.getElementById('historyBody');
  if (!tbody) return;

  const data = await fimApi.history();
  if (!data?.success || !data.data || data.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No baselines created yet</td></tr>`;
    return;
  }

  tbody.innerHTML = data.data.map(b => `
    <tr>
      <td class="mono">#${b.id}</td>
      <td class="mono text-truncate" style="max-width: 250px;">${b.target_path}</td>
      <td class="mono">${b.file_count}</td>
      <td class="mono">${b.total_changes || 0}</td>
      <td class="mono">${formatDate(b.created_at)}</td>
    </tr>
  `).join('');
}

/* =============================================================
   FIM API Client
   ============================================================= */

const fimApi = {
  baseline: (targetDir) => api.post('/fim/baseline', { target_dir: targetDir }),
  verify: (baselineId) => api.post('/fim/verify', { baseline_id: baselineId }),
  history: () => api.get('/fim/history'),
};
