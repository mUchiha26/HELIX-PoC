/* =============================================================
   HELIX PLATFORM — SCANNER.JS
   Port scan form handling and results rendering
   ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth();
  if (!user) return;
  Auth.updateSidebarUser(user);
  Auth.buildSidebar(user.role);
  Auth.setActiveNav();
  setupSidebar();
  loadScanResults();
});

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  toggle?.addEventListener('click', () => { sidebar?.classList.toggle('open'); overlay?.classList.toggle('active'); });
  overlay?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); });
}

async function handleScan(e) {
  e.preventDefault();
  const btn = document.getElementById('scanBtn');
  const target = document.getElementById('scanTarget').value.trim();
  const port = document.getElementById('scanPort').value.trim();
  const protocol = document.getElementById('scanProtocol').value;
  const progress = document.getElementById('scanProgress');

  btn.disabled = true;
  progress.innerHTML = `
    <div class="scan-progress">
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="loader-spinner" style="width: 18px; height: 18px; border-width: 2px;"></div>
        <span class="font-mono text-xs" style="color: var(--red-team);">Scanning ${target}...</span>
      </div>
      <div class="helix-progress"><div class="helix-progress-bar bar-red" style="width: 0%; transition: width 0.3s;" id="scanProgressBar"></div></div>
    </div>
  `;

  // Simulate progress
  let pct = 0;
  const interval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 15, 90);
    const bar = document.getElementById('scanProgressBar');
    if (bar) bar.style.width = `${pct}%`;
  }, 500);

  const result = await scannerApi.scan(target, port, protocol);
  clearInterval(interval);

  btn.disabled = false;

  if (result?.success) {
    progress.innerHTML = `<div class="parse-status status-done"><i class="bi bi-check-circle me-2"></i>Scan complete — ${result.data.count || 0} ports scanned</div>`;
    loadScanResults();
  } else {
    progress.innerHTML = `<div class="parse-status status-error"><i class="bi bi-x-circle me-2"></i>Scan failed</div>`;
  }
}

async function loadScanResults() {
  showLoader('#scanResultsBody');
  const data = await scannerApi.results();
  if (!data || !data.success) {
    showEmpty('#scanResultsBody', 'bi-crosshair', 'No scan results', 'Run a scan to see results here.');
    return;
  }
  renderResults(data.data || []);
}

function renderResults(results) {
  const tbody = document.getElementById('scanResultsBody');
  if (!tbody) return;
  if (results.length === 0) {
    showEmpty('#scanResultsBody', 'bi-search', 'No results', 'No scans have been performed yet.');
    return;
  }
  tbody.innerHTML = results.map(r => {
    const statusClass = r.status === 'open' ? 'port-open' : r.status === 'closed' ? 'port-closed' : 'port-filtered';
    return `
      <tr>
        <td class="mono">${r.target}</td>
        <td class="mono">${r.port}</td>
        <td class="mono">${r.protocol}</td>
        <td class="mono ${statusClass}">${r.status.toUpperCase()}</td>
        <td class="mono">${formatDate(r.scanned_at)}</td>
      </tr>
    `;
  }).join('');
}
