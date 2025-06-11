// Theme management
const themeToggle = {
  init() {
    this.theme = localStorage.getItem('theme') || 'light';
    this.applyTheme();
    this.setupListeners();
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('theme', this.theme);
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
  },

  setupListeners() {
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
  }
};

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  themeToggle.init();
}); 