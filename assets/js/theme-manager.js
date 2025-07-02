// Theme Manager for Bradley Health
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.currentTheme = localStorage.getItem('theme') || 'light';
    
    this.init();
  }

  init() {
    // Set initial theme
    this.setTheme(this.currentTheme);
    
    // Set toggle state
    if (this.themeToggle) {
      this.themeToggle.checked = this.currentTheme === 'dark';
      this.themeToggle.addEventListener('change', (e) => {
        this.toggleTheme();
      });
    }

    // Listen for system theme changes
    this.watchSystemTheme();
  }

  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update meta theme color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#4f46e5');
    }

    // Update manifest theme color
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const manifest = JSON.parse(localStorage.getItem('manifest') || '{}');
      manifest.theme_color = theme === 'dark' ? '#1f2937' : '#4f46e5';
      localStorage.setItem('manifest', JSON.stringify(manifest));
    }

    console.log(`Theme set to: ${theme}`);
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    
    // Update toggle state
    if (this.themeToggle) {
      this.themeToggle.checked = newTheme === 'dark';
    }
  }

  watchSystemTheme() {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
        const systemTheme = e.matches ? 'dark' : 'light';
        this.setTheme(systemTheme);
        if (this.themeToggle) {
          this.themeToggle.checked = systemTheme === 'dark';
        }
      }
    };

    // Set initial system theme if no manual preference
    if (!localStorage.getItem('theme')) {
      handleSystemThemeChange(mediaQuery);
    }

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkMode() {
    return this.currentTheme === 'dark';
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
} 