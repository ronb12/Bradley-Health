const fs = require('fs');
const path = require('path');

const navContent = `// Bradley Health Navigation Handler
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'home';
  
  // Create header
  const header = document.createElement('header');
  header.className = 'mobile-header';
  header.innerHTML = \`
    <div class="mobile-header-content">
      <h1 class="logo">
        <svg class="logo-icon" viewBox="0 0 24 24" width="24" height="24">
          <circle cx="12" cy="12" r="10" fill="#2B6CB0"/>
          <path d="M12 6v12M6 12h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Bradley Health
      </h1>
    </div>
  \`;
  
  // Create navigation
  const nav = document.createElement('nav');
  nav.className = 'mobile-nav';
  nav.innerHTML = \`
    <div class="mobile-nav-items">
      <a href="/" class="mobile-nav-item" data-page="home">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" fill="none" stroke-width="2"/>
          <path d="M9 22V12h6v10" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
        Home
      </a>
      <a href="/insights.html" class="mobile-nav-item" data-page="insights">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M21 21H3M3 21V3M21 3v18" stroke="currentColor" fill="none" stroke-width="2"/>
          <path d="M7 7l4 4 6-6" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
        Insights
      </a>
      <a href="/medication-management/index.html" class="mobile-nav-item" data-page="meds">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" stroke="currentColor" fill="none" stroke-width="2"/>
          <path d="M12 8v8M8 12h8" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
        Meds
      </a>
      <a href="/profile.html" class="mobile-nav-item" data-page="profile">
        <svg class="mobile-nav-icon" viewBox="0 0 24 24" width="24" height="24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" fill="none" stroke-width="2"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
        Profile
      </a>
    </div>
  \`;
  
  // Insert elements
  document.body.insertBefore(header, document.body.firstChild);
  document.body.appendChild(nav);
  
  // Set active state
  const activeNavItem = document.querySelector(\`.mobile-nav-item[data-page="\${currentPage}"]\`);
  if (activeNavItem) {
    activeNavItem.classList.add('active');
  }
  
  // Handle theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
});`;

// Ensure directory exists
const dir = path.dirname('assets/nav.js');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write file
fs.writeFileSync('assets/nav.js', navContent);
console.log('Navigation JavaScript file created successfully!'); 