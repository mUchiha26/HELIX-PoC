/* =============================================================
   HELIX PLATFORM — AUTH.JS
   Authentication logic, session management, role-based UI
   ============================================================= */

const Auth = (() => {
  const ROLE_NAV_MAP = {
    administrator: ['dashboard', 'logs', 'alerts', 'ai', 'scanner', 'admin', 'profile'],
    blue_team: ['dashboard', 'logs', 'alerts', 'ai', 'profile'],
    red_team: ['dashboard', 'scanner', 'ai', 'profile'],
    purple_team: ['dashboard', 'logs', 'alerts', 'ai', 'scanner', 'profile'],
    learner: ['dashboard', 'ai', 'learner', 'profile'],
  };

  /**
   * Handle login form submission
   */
  async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername')?.value?.trim();
    const password = document.getElementById('loginPassword')?.value;
    const btn = document.getElementById('loginBtn');

    if (!username || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    btn?.classList.add('loading');

    try {
      const result = await authApi.login(username, password);

      btn?.classList.remove('loading');

      if (!result) return;

      if (result.success) {
        sessionStorage.setItem('userRole', result.data.role);
        sessionStorage.setItem('userId', result.data.id);
        sessionStorage.setItem('username', result.data.username);
        window.location.href = '/dashboard.html';
      } else {
        showToast(result.error || 'Login failed', 'error');
      }
    } catch (err) {
      btn?.classList.remove('loading');
      showToast('Network error. Check that the API server is running.', 'error');
      console.error('Login error:', err);
    }
  }

  /**
   * Handle register form submission
   */
  async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('regUsername')?.value?.trim();
    const email = document.getElementById('regEmail')?.value?.trim();
    const password = document.getElementById('regPassword')?.value;
    const confirm = document.getElementById('regPasswordConfirm')?.value;
    const btn = document.getElementById('registerBtn');

    if (!username || !email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (password !== confirm) {
      showToast('Passwords do not match', 'warning');
      return;
    }

    btn?.classList.add('loading');

    try {
      const result = await authApi.register(username, email, password);

      btn?.classList.remove('loading');

      if (!result) return;

      if (result.success) {
        showToast('Account created! Please login.', 'success');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 1500);
      } else {
        showToast(result.error || 'Registration failed', 'error');
      }
    } catch (err) {
      btn?.classList.remove('loading');
      showToast('Network error. Check that the API server is running.', 'error');
      console.error('Registration error:', err);
    }
  }

  /**
   * Handle logout
   */
  async function handleLogout() {
    await authApi.logout();
    sessionStorage.clear();
    window.location.href = '/login.html';
  }

  /**
   * Check if user is authenticated, redirect if not
   */
  async function requireAuth() {
    const result = await authApi.me();
    if (!result || !result.success) {
      window.location.href = '/login.html';
      return null;
    }
    return result.data;
  }

  /**
   * Build sidebar navigation based on user role
   */
  function buildSidebar(userRole) {
    const allowedPaths = ROLE_NAV_MAP[userRole] || [];
    const navItems = document.querySelectorAll('.sidebar-nav .nav-link');

    navItems.forEach(link => {
      const page = link.dataset.page;
      if (page && !allowedPaths.includes(page)) {
        link.style.display = 'none';
      }
    });

    const roleBadge = document.getElementById('sidebarRole');
    if (roleBadge) {
      roleBadge.textContent = userRole.replace('_', ' ');
      roleBadge.className = `role-indicator role-${userRole}`;
    }
  }

  /**
   * Highlight active nav link based on current page
   */
  function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    navLinks.forEach(link => {
      const page = link.dataset.page;
      link.classList.toggle('active', page === currentPage);
    });
  }

  /**
   * Update user info in sidebar
   */
  function updateSidebarUser(user) {
    const container = document.getElementById('sidebarUser');
    const nameEl = document.getElementById('sidebarUserName');
    const avatarEl = document.getElementById('sidebarAvatar');
    const roleEl = document.getElementById('sidebarRole');

    if (container) container.style.display = '';
    if (nameEl) nameEl.textContent = user.username;
    if (avatarEl) {
      const initials = user.username.substring(0, 2).toUpperCase();
      avatarEl.textContent = initials;
    }
    if (roleEl) {
      roleEl.textContent = user.role.replace('_', ' ');
      roleEl.className = `role-indicator role-${user.role}`;
    }
  }

  return {
    handleLogin,
    handleRegister,
    handleLogout,
    requireAuth,
    buildSidebar,
    setActiveNav,
    updateSidebarUser,
  };
})();
