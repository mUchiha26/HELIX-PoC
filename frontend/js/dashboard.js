/* =============================================================
   HELIX PLATFORM — DASHBOARD.JS
   Dashboard data loading and rendering
   ============================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  // Require authentication
  const user = await Auth.requireAuth();
  if (!user) return;

  Auth.updateSidebarUser(user);
  Auth.buildSidebar(user.role);
  Auth.setActiveNav();

  // Mobile sidebar toggle
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

  // Load dashboard data
  loadDashboard();
});

async function loadDashboard() {
  const data = await dashboardApi.stats();
  if (!data || !data.success) {
    return;
  }

  const stats = data.data;

  // Update metric cards
  const openAlerts = document.getElementById('openAlerts');
  if (openAlerts) openAlerts.textContent = stats.open_alerts ?? '0';

  const totalLogs = document.getElementById('totalLogs');
  if (totalLogs) totalLogs.textContent = stats.log_count?.toLocaleString() ?? '0';

  const avgScore = document.getElementById('avgScore');
  if (avgScore) avgScore.textContent = stats.avg_anomaly_score ?? '0.00';

  const resolvedCount = document.getElementById('resolvedCount');
  if (resolvedCount) resolvedCount.textContent = stats.resolved_today ?? '0';

  // Update severity distribution
  const severityMap = {};
  (stats.alerts_by_severity || []).forEach(s => {
    severityMap[s.severity?.toLowerCase()] = s.count;
  });

  const total = Object.values(severityMap).reduce((a, b) => a + b, 0);

  if (total === 0) {
    const severityChart = document.getElementById('severityChart');
    if (severityChart) {
      severityChart.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-shield-check" style="font-size: 2rem; color: var(--blue-accent);"></i>
          <p class="font-mono text-xs mt-2 text-muted">No alerts — All systems clear</p>
        </div>
      `;
    }
  } else {
    const severities = ['critical', 'high', 'medium', 'low'];
    severities.forEach(sev => {
      const count = severityMap[sev] || 0;
      const pct = Math.round((count / total) * 100);

      const countEl = document.getElementById(`sev${sev.charAt(0).toUpperCase() + sev.slice(1)}`);
      const barEl = document.getElementById(`sev${sev.charAt(0).toUpperCase() + sev.slice(1)}Bar`);

      if (countEl) countEl.textContent = count;
      if (barEl) {
        setTimeout(() => { barEl.style.width = `${pct}%`; }, 100);
      }
    });
  }

  // Populate activity feed with mock data (replace with real API later)
  populateActivityFeed();
}

function populateActivityFeed() {
  const feedEl = document.getElementById('dashboardFeed');
  if (!feedEl) return;

  const events = [
    { color: 'red', msg: 'CRITICAL: Ransomware signature detected — endpoint WIN-SRV-042', time: '2m ago' },
    { color: 'blue', msg: 'INFO: Firewall rule updated — policy ID 1337 applied', time: '5m ago' },
    { color: 'purple', msg: 'INTEL: New IOC ingested from MISP feed — CVE-2024-3833', time: '12m ago' },
    { color: 'green', msg: 'RESOLVED: Incident INC-2041 closed — false positive', time: '18m ago' },
    { color: 'orange', msg: 'WARNING: Unusual outbound traffic — 34.2MB to 203.0.113.5', time: '25m ago' },
  ];

  feedEl.innerHTML = events.map(e => `
    <div class="feed-item">
      <div class="feed-dot feed-dot-${e.color}"></div>
      <div class="feed-content">
        <div class="feed-msg">${e.msg}</div>
        <div class="feed-time">${e.time}</div>
      </div>
    </div>
  `).join('');
}
