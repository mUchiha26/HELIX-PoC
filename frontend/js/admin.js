/* =============================================================
   HELIX PLATFORM — ADMIN.JS
   Admin dashboard: user management, role changes, stats
   ============================================================= */

let allUsers = [];
let currentRoleUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = await Auth.requireAuth();
  if (!user) return;

  if (user.role !== 'administrator') {
    showToast('Access denied. Administrator privileges required.', 'error');
    setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
    return;
  }

  Auth.updateSidebarUser(user);
  Auth.buildSidebar(user.role);
  Auth.setActiveNav();

  setupSidebar();
  loadAdminStats();
  loadUsers();
  setupSearch();
  setupRoleModal();
});

function setupSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const toggle = document.getElementById('sidebarToggle');
  toggle?.addEventListener('click', () => { sidebar?.classList.toggle('open'); overlay?.classList.toggle('active'); });
  overlay?.addEventListener('click', () => { sidebar?.classList.remove('open'); overlay?.classList.remove('active'); });
}

async function loadAdminStats() {
  const data = await api.get('/users/stats');
  if (!data?.success) return;

  const stats = data.data;
  document.getElementById('statTotalUsers').textContent = stats.total_users ?? '0';
  document.getElementById('statActiveUsers').textContent = stats.active_users ?? '0';
  document.getElementById('statInactiveUsers').textContent = stats.inactive_users ?? '0';
  document.getElementById('statNewToday').textContent = stats.new_today ?? '0';

  renderRoleBars(stats.users_by_role || []);
}

function renderRoleBars(roles) {
  const container = document.getElementById('roleBars');
  if (!container) return;

  if (!roles.length) {
    container.innerHTML = `
      <div class="col text-center py-3">
        <i class="bi bi-people" style="font-size: 1.5rem; color: var(--blue-accent);"></i>
        <p class="font-mono text-xs mt-2 text-muted">No users registered yet</p>
      </div>
    `;
    return;
  }

  const total = roles.reduce((sum, r) => sum + parseInt(r.count), 0) || 1;
  const colors = {
    administrator: 'var(--blue-accent)',
    blue_team: 'var(--blue-team)',
    red_team: 'var(--red-team)',
    purple_team: 'var(--purple-team)',
    learner: 'var(--ai-gold)',
  };

  container.innerHTML = roles.map(r => {
    const pct = Math.round((parseInt(r.count) / total) * 100);
    const color = colors[r.role] || '#888';
    const label = r.role.replace('_', ' ');
    return `
      <div class="col">
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="font-mono text-xs" style="color: ${color}">${label}</span>
          <span class="font-mono text-xs">${r.count}</span>
          <span class="font-mono text-xs text-muted">${pct}%</span>
        </div>
        <div class="helix-progress">
          <div class="helix-progress-bar" style="width: ${pct}%; background: ${color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

async function loadUsers() {
  const data = await api.get('/users?limit=1000');
  if (!data?.success) {
    document.getElementById('usersTableBody').innerHTML =
      '<tr><td colspan="8" class="text-center py-4">Failed to load users</td></tr>';
    return;
  }

  allUsers = data.data;
  renderUsers(allUsers);
}

function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">No users found</td></tr>';
    return;
  }

  const roleColors = {
    administrator: 'var(--blue-accent)',
    blue_team: 'var(--blue-team)',
    red_team: 'var(--red-team)',
    purple_team: 'var(--purple-team)',
    learner: 'var(--ai-gold)',
  };

  tbody.innerHTML = users.map(u => {
    const statusClass = u.is_active == 1 ? 'text-success' : 'text-danger';
    const statusText = u.is_active == 1 ? 'Active' : 'Inactive';
    const roleColor = roleColors[u.role] || '#888';
    const lastLogin = u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never';
    const created = u.created_at ? new Date(u.created_at).toLocaleDateString() : '—';

    return `
      <tr>
        <td class="font-mono text-xs">${u.id}</td>
        <td><strong>${escapeHtml(u.username)}</strong></td>
        <td class="text-muted">${escapeHtml(u.email)}</td>
        <td><span class="font-mono text-xs" style="color: ${roleColor}">${u.role.replace('_', ' ')}</span></td>
        <td><span class="font-mono text-xs ${statusClass}">${statusText}</span></td>
        <td class="font-mono text-xs">${lastLogin}</td>
        <td class="font-mono text-xs">${created}</td>
        <td>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" onclick="openRoleModal(${u.id}, '${escapeHtml(u.username)}', '${u.role}')" title="Change role">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm ${u.is_active == 1 ? 'btn-outline-warning' : 'btn-outline-success'}" onclick="toggleUser(${u.id})" title="${u.is_active == 1 ? 'Disable' : 'Enable'}">
              <i class="bi bi-${u.is_active == 1 ? 'pause' : 'play'}-fill"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id}, '${escapeHtml(u.username)}')" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupSearch() {
  const searchInput = document.getElementById('userSearch');
  const roleFilter = document.getElementById('roleFilter');

  const filter = () => {
    const query = searchInput.value.toLowerCase();
    const role = roleFilter.value;

    let filtered = allUsers.filter(u => {
      const matchQuery = u.username.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      const matchRole = !role || u.role === role;
      return matchQuery && matchRole;
    });

    renderUsers(filtered);
  };

  searchInput?.addEventListener('input', filter);
  roleFilter?.addEventListener('change', filter);
}

function setupRoleModal() {
  const confirmBtn = document.getElementById('confirmRoleChange');
  confirmBtn?.addEventListener('click', async () => {
    if (!currentRoleUserId) return;

    const newRole = document.getElementById('roleModalSelect').value;
    const result = await api.put(`/users/${currentRoleUserId}/role`, { role: newRole });

    if (result?.success) {
      showToast('Role updated', 'success');
      bootstrap.Modal.getInstance(document.getElementById('roleModal')).hide();
      loadUsers();
      loadAdminStats();
    } else {
      showToast(result?.error || 'Failed to update role', 'error');
    }
  });
}

function openRoleModal(id, username, currentRole) {
  currentRoleUserId = id;
  document.getElementById('roleModalUsername').textContent = username;
  document.getElementById('roleModalSelect').value = currentRole;
  new bootstrap.Modal(document.getElementById('roleModal')).show();
}

async function toggleUser(id) {
  const result = await api.post(`/users/${id}/toggle`, {});
  if (result?.success) {
    showToast('User status updated', 'success');
    loadUsers();
    loadAdminStats();
  } else {
    showToast(result?.error || 'Failed to update status', 'error');
  }
}

async function deleteUser(id, username) {
  if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;

  const result = await api.delete(`/users/${id}`);
  if (result?.success) {
    showToast('User deleted', 'success');
    loadUsers();
    loadAdminStats();
  } else {
    showToast(result?.error || 'Failed to delete user', 'error');
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
