const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs').promises;
const path = require('path');

// Worker configuration
const NUM_WORKERS = 20;

// Define tasks to be processed
const TASKS = [
  {
    file: 'assets/nav.js',
    content: `// Bradley Health Navigation Handler
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
});`
  },
  {
    file: 'assets/css/navigation.css',
    content: `/* Bradley Health Navigation Styles */
.mobile-header {
  position: sticky;
  top: 0;
  background: var(--white);
  padding: 1rem;
  padding-top: calc(1rem + env(safe-area-inset-top));
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 40;
}

.mobile-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text);
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--white);
  padding: 0.5rem 1rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.mobile-nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-light);
  text-decoration: none;
  font-size: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  min-height: 48px;
  justify-content: center;
}

.mobile-nav-item.active {
  color: var(--primary);
  background: var(--background-secondary);
}

.mobile-nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 0.25rem;
}

/* Dark Mode */
[data-theme="dark"] .mobile-header,
[data-theme="dark"] .mobile-nav {
  background: var(--background-secondary);
}

[data-theme="dark"] .mobile-nav-item {
  color: var(--text-light);
}

[data-theme="dark"] .mobile-nav-item.active {
  color: var(--primary-light);
  background: var(--background-tertiary);
}`
  },
  {
    file: 'assets/icons/icon.svg',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="10" fill="#2B6CB0"/>
  <path d="M12 6v12M6 12h12" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>`
  },
  {
    file: 'manifest.json',
    content: `{
  "name": "Bradley Health",
  "short_name": "Bradley Health",
  "description": "Your personal health management companion",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F7FAFC",
  "theme_color": "#2B6CB0",
  "icons": [
    {
      "src": "assets/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}`
  }
];

// Worker thread code
if (!isMainThread) {
  const { task } = workerData;
  
  async function processTask() {
    try {
      // Ensure directory exists
      const dir = path.dirname(task.file);
      await fs.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.writeFile(task.file, task.content, 'utf8');
      
      // Report success
      parentPort.postMessage({
        success: true,
        file: task.file
      });
    } catch (error) {
      // Report error
      parentPort.postMessage({
        success: false,
        file: task.file,
        error: error.message
      });
    }
  }
  
  processTask();
}

// Main thread code
if (isMainThread) {
  async function runWorkers() {
    const workers = [];
    const results = [];
    
    // Create workers
    for (let i = 0; i < NUM_WORKERS; i++) {
      const worker = new Worker(__filename, {
        workerData: { task: TASKS[i % TASKS.length] }
      });
      
      worker.on('message', (result) => {
        results.push(result);
        console.log(`Worker ${i + 1} completed task for ${result.file}`);
        
        if (results.length === TASKS.length) {
          console.log('All tasks completed!');
          process.exit(0);
        }
      });
      
      worker.on('error', (error) => {
        console.error(`Worker ${i + 1} error:`, error);
      });
      
      workers.push(worker);
    }
    
    // Wait for all workers to complete
    await Promise.all(workers.map(worker => new Promise(resolve => worker.on('exit', resolve))));
    
    // Log results
    console.log('\nResults:');
    results.forEach(result => {
      if (result.success) {
        console.log(`✅ ${result.file} updated successfully`);
      } else {
        console.error(`❌ ${result.file} failed: ${result.error}`);
      }
    });
  }
  
  runWorkers().catch(console.error);
} 