// Mobile Enhancement for Bradley Health
if (typeof MobileEnhancer === 'undefined') {
class MobileEnhancer {
  constructor() {
    this.touchStartY = 0;
    this.touchStartX = 0;
    this.isScrolling = false;
    this.init();
  }

  init() {
    this.optimizeTouchTargets();
    this.addHapticFeedback();
    this.implementPullToRefresh();
    this.optimizeViewport();
  }

  optimizeTouchTargets() {
    // Ensure all interactive elements meet minimum touch target size (44px)
    const interactiveElements = document.querySelectorAll('button, input, select, textarea, a, [role="button"]');
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const minSize = 44;
      
      if (rect.width < minSize || rect.height < minSize) {
        element.style.minWidth = `${minSize}px`;
        element.style.minHeight = `${minSize}px`;
        element.style.padding = '8px';
      }
    });
  }

  addHapticFeedback() {
    // Add haptic feedback for supported devices
    if ('vibrate' in navigator) {
      const buttons = document.querySelectorAll('button, .tab-button');
      buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
          navigator.vibrate(10); // Short vibration
        });
      });
    }
  }

  implementPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;
    let isPulling = false;
    let refreshIndicator = null;

    // Create refresh indicator
    const createRefreshIndicator = () => {
      const indicator = document.createElement('div');
      indicator.className = 'pull-to-refresh-indicator';
      indicator.innerHTML = `
        <div class="refresh-icon">↻</div>
        <div class="refresh-text">Pull to refresh</div>
      `;
      indicator.style.cssText = `
        position: fixed;
        top: -60px;
        left: 50%;
        transform: translateX(-50%);
        background: #3b82f6;
        color: white;
        padding: 10px 20px;
        border-radius: 0 0 20px 20px;
        z-index: 1000;
        transition: top 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
      `;
      document.body.appendChild(indicator);
      return indicator;
    };

    document.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
        if (!refreshIndicator) {
          refreshIndicator = createRefreshIndicator();
        }
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isPulling) return;
      
      currentY = e.touches[0].clientY;
      pullDistance = currentY - startY;
      
      if (pullDistance > 0) {
        e.preventDefault();
        const progress = Math.min(pullDistance / 100, 1);
        refreshIndicator.style.top = `${-60 + (pullDistance * 0.5)}px`;
        refreshIndicator.style.opacity = progress;
        
        if (pullDistance > 100) {
          refreshIndicator.querySelector('.refresh-text').textContent = 'Release to refresh';
          refreshIndicator.querySelector('.refresh-icon').style.transform = 'rotate(180deg)';
        } else {
          refreshIndicator.querySelector('.refresh-text').textContent = 'Pull to refresh';
          refreshIndicator.querySelector('.refresh-icon').style.transform = 'rotate(0deg)';
        }
      }
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (!isPulling) return;
      
      isPulling = false;
      
      if (pullDistance > 100) {
        // Trigger refresh
        refreshIndicator.querySelector('.refresh-text').textContent = 'Refreshing...';
        refreshIndicator.querySelector('.refresh-icon').style.animation = 'spin 1s linear infinite';
        
        // Simulate refresh
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // Reset indicator
        refreshIndicator.style.top = '-60px';
        refreshIndicator.style.opacity = '0';
      }
      
      pullDistance = 0;
    });
  }

  optimizeViewport() {
    // Add viewport meta tag if not present
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(viewport);
    }
  }

  // Add mobile-specific CSS
  addMobileStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .pull-to-refresh-indicator {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        font-weight: 500;
      }
      
      .refresh-icon {
        font-size: 18px;
        transition: transform 0.3s ease;
      }
      
      /* Improve touch targets */
      @media (max-width: 768px) {
        .tab-button {
          min-height: 44px;
          padding: 8px 12px;
        }
        
        .btn {
          min-height: 44px;
          padding: 12px 20px;
        }
        
        input, select, textarea {
          min-height: 44px;
          font-size: 16px; /* Prevents zoom on iOS */
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .card {
          margin-bottom: 16px;
          border-radius: 12px;
        }
        
        .tab-navigation {
          padding: 8px;
          gap: 4px;
        }
        
        .tab-text {
          font-size: 12px;
        }
        
        .tab-icon {
          font-size: 20px;
        }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .pull-to-refresh-indicator {
          background: #1f2937;
          color: #f9fafb;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize mobile enhancer
document.addEventListener('DOMContentLoaded', () => {
  window.mobileEnhancer = new MobileEnhancer();
});
}
