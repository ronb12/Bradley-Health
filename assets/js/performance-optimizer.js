// Performance Optimizer for Bradley Health
if (typeof PerformanceOptimizer === 'undefined') {
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.implementLazyLoading();
    this.optimizeImages();
    this.implementCodeSplitting();
    this.optimizeCharts();
    this.implementVirtualScrolling();
    this.optimizeFirebaseQueries();
  }

  implementLazyLoading() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Lazy load tab content
    const tabContents = document.querySelectorAll('.tab-content');
    const contentObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadTabContent(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    tabContents.forEach(content => contentObserver.observe(content));
  }

  loadTabContent(tabContent) {
    const tabId = tabContent.id;
    
    // Load JavaScript modules on demand
    switch(tabId) {
      case 'blood-pressure':
        this.loadModule('blood-pressure.js');
        break;
      case 'medications':
        this.loadModule('medication-manager.js');
        break;
      case 'mood':
        this.loadModule('mood-tracker.js');
        break;
      case 'womens-health':
        this.loadModule('womens-health.js');
        break;
      case 'goals':
        this.loadModule('goals-manager.js');
        break;
      case 'limb-care':
        this.loadModule('limb-care.js');
        break;
      case 'dme':
        this.loadModule('dme-manager.js');
        break;
      case 'health-insights':
        this.loadModule('health-insights.js');
        break;
      case 'nutrition':
        this.loadModule('nutrition-tracker.js');
        break;
      case 'weight-loss':
        this.loadModule('weight-loss.js');
        break;
      case 'profile':
        this.loadModule('profile-manager.js');
        break;
    }
  }

  loadModule(moduleName) {
    if (window[`${moduleName.replace('.js', '')}Loaded`]) return;
    
    const script = document.createElement('script');
    script.src = `assets/js/${moduleName}`;
    script.async = true;
    script.onload = () => {
      window[`${moduleName.replace('.js', '')}Loaded`] = true;
    };
    document.head.appendChild(script);
  }

  optimizeImages() {
    // Convert images to WebP format if supported
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (this.supportsWebP()) {
        const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const webpImg = new Image();
        webpImg.onload = () => {
          img.src = webpSrc;
        };
        webpImg.src = webpSrc;
      }
    });
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  implementCodeSplitting() {
    // Split large modules into smaller chunks
    const modules = {
      'charts': ['charts.js'],
      'export': ['export.js'],
      'notifications': ['notifications.js', 'pwa-update.js'],
      'theme': ['theme-manager.js']
    };

    Object.keys(modules).forEach(moduleName => {
      const moduleScript = document.createElement('script');
      moduleScript.src = `assets/js/${moduleName}.js`;
      moduleScript.async = true;
      moduleScript.onload = () => {
        modules[moduleName].forEach(dep => {
          this.loadModule(dep);
        });
      };
      document.head.appendChild(moduleScript);
    });
  }

  optimizeCharts() {
    // Lazy load Chart.js only when needed
    const chartContainers = document.querySelectorAll('.chart-container');
    if (chartContainers.length > 0) {
      this.loadChartLibrary();
    }
  }

  loadChartLibrary() {
    if (window.Chart) return;
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
    script.async = true;
    script.onload = () => {
      this.initializeCharts();
    };
    document.head.appendChild(script);
  }

  initializeCharts() {
    // Initialize charts only when they become visible
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chartElement = entry.target;
          this.createChart(chartElement);
          chartObserver.unobserve(chartElement);
        }
      });
    });

    document.querySelectorAll('.chart-container').forEach(chart => {
      chartObserver.observe(chart);
    });
  }

  createChart(element) {
    // Chart creation logic will be implemented by individual modules
    console.log('Creating chart for:', element);
  }

  implementVirtualScrolling() {
    // Implement virtual scrolling for large lists
    const lists = document.querySelectorAll('.virtual-list');
    lists.forEach(list => {
      this.setupVirtualScrolling(list);
    });
  }

  setupVirtualScrolling(container) {
    const items = container.querySelectorAll('.list-item');
    const itemHeight = 50; // Assume 50px per item
    const visibleItems = Math.ceil(container.clientHeight / itemHeight);
    
    let startIndex = 0;
    let endIndex = Math.min(startIndex + visibleItems, items.length);
    
    const updateVisibleItems = () => {
      items.forEach((item, index) => {
        if (index >= startIndex && index < endIndex) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    };
    
    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop;
      startIndex = Math.floor(scrollTop / itemHeight);
      endIndex = Math.min(startIndex + visibleItems, items.length);
      updateVisibleItems();
    });
    
    updateVisibleItems();
  }

  optimizeFirebaseQueries() {
    // Implement query caching and pagination
    const queryCache = new Map();
    
    window.optimizedFirebaseQuery = async (collection, query, options = {}) => {
      const cacheKey = `${collection}-${JSON.stringify(query)}`;
      
      if (queryCache.has(cacheKey) && !options.forceRefresh) {
        return queryCache.get(cacheKey);
      }
      
      try {
        const result = await window.firebaseServices.db.collection(collection)
          .where(query)
          .limit(options.limit || 50)
          .get();
        
        const data = result.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        queryCache.set(cacheKey, data);
        
        // Clear cache after 5 minutes
        setTimeout(() => {
          queryCache.delete(cacheKey);
        }, 300000);
        
        return data;
      } catch (error) {
        console.error('Firebase query error:', error);
        return [];
      }
    };
  }

  // Preload critical resources
  preloadCriticalResources() {
    const criticalResources = [
      'assets/css/components.css',
      'assets/css/layout.css',
      'assets/css/theme.css',
      'assets/js/firebase-config.js',
      'assets/js/auth.js'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  }
}

// Initialize performance optimizer
document.addEventListener('DOMContentLoaded', () => {
  window.performanceOptimizer = new PerformanceOptimizer();
});
}
