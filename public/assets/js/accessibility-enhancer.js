// Accessibility Enhancer for Bradley Health
if (typeof AccessibilityEnhancer === 'undefined') {
class AccessibilityEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.enhanceTabNavigation();
    this.enhanceForms();
    this.enhanceButtons();
    this.enhanceImages();
    this.enhanceFocusManagement();
    this.enhanceColorContrast();
    this.addSkipLinks();
  }

  enhanceTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-content');

    tabButtons.forEach((button, index) => {
      // Add ARIA attributes
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
      button.setAttribute('aria-controls', button.dataset.tab);
      button.setAttribute('tabindex', button.classList.contains('active') ? '0' : '-1');

      // Add keyboard navigation
      button.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const currentIndex = Array.from(tabButtons).indexOf(button);
          const nextIndex = e.key === 'ArrowRight' 
            ? (currentIndex + 1) % tabButtons.length
            : (currentIndex - 1 + tabButtons.length) % tabButtons.length;
          
          this.switchTab(tabButtons[nextIndex]);
        } else if (e.key === 'Home') {
          e.preventDefault();
          this.switchTab(tabButtons[0]);
        } else if (e.key === 'End') {
          e.preventDefault();
          this.switchTab(tabButtons[tabButtons.length - 1]);
        }
      });
    });

    tabPanels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-hidden', panel.classList.contains('active') ? 'false' : 'true');
    });
  }

  switchTab(button) {
    // Update button states
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });

    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    button.setAttribute('tabindex', '0');

    // Update panel states
    document.querySelectorAll('.tab-content').forEach(panel => {
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
    });

    const targetPanel = document.getElementById(button.dataset.tab);
    if (targetPanel) {
      targetPanel.classList.add('active');
      targetPanel.setAttribute('aria-hidden', 'false');
    }

    // Focus the panel content
    const firstFocusable = targetPanel?.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  enhanceForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      // Add form labels and ARIA attributes
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
          const label = form.querySelector(`label[for="${input.id}"]`);
          if (label) {
            input.setAttribute('aria-labelledby', label.id || input.id + '-label');
            if (!label.id) {
              label.id = input.id + '-label';
            }
          }
        }

        // Add required indicator
        if (input.hasAttribute('required')) {
          input.setAttribute('aria-required', 'true');
        }

        // Add validation states
        input.addEventListener('invalid', () => {
          input.setAttribute('aria-invalid', 'true');
        });

        input.addEventListener('input', () => {
          input.setAttribute('aria-invalid', 'false');
        });
      });
    });
  }

  enhanceButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      // Add ARIA labels for icon-only buttons
      if (button.querySelector('.tab-icon') && !button.getAttribute('aria-label')) {
        const text = button.querySelector('.tab-text')?.textContent;
        if (text) {
          button.setAttribute('aria-label', text);
        }
      }

      // Add loading states
      button.addEventListener('click', () => {
        if (button.type === 'submit') {
          button.setAttribute('aria-busy', 'true');
          setTimeout(() => {
            button.setAttribute('aria-busy', 'false');
          }, 2000);
        }
      });
    });
  }

  enhanceImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        img.setAttribute('alt', '');
      }
    });
  }

  enhanceFocusManagement() {
    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      *:focus {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      .tab-button:focus {
        outline: 3px solid #3b82f6 !important;
        outline-offset: 2px !important;
      }
      
      .btn:focus {
        outline: 2px solid #ffffff !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);

    // Add focus trap for modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal[aria-hidden="false"]');
        if (activeModal) {
          this.closeModal(activeModal);
        }
      }
    });
  }

  enhanceColorContrast() {
    // Add high contrast mode toggle
    const contrastToggle = document.createElement('button');
    contrastToggle.textContent = 'High Contrast';
    contrastToggle.className = 'contrast-toggle';
    contrastToggle.setAttribute('aria-label', 'Toggle high contrast mode');
    contrastToggle.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: #000;
      color: #fff;
      border: 2px solid #fff;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
    `;

    contrastToggle.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
      const isHighContrast = document.body.classList.contains('high-contrast');
      contrastToggle.textContent = isHighContrast ? 'Normal Contrast' : 'High Contrast';
    });

    document.body.appendChild(contrastToggle);

    // Add high contrast styles
    const contrastStyle = document.createElement('style');
    contrastStyle.textContent = `
      .high-contrast {
        filter: contrast(150%) brightness(120%);
      }
      
      .high-contrast .card {
        border: 2px solid #000 !important;
        background: #fff !important;
        color: #000 !important;
      }
      
      .high-contrast .btn {
        border: 2px solid #000 !important;
        background: #000 !important;
        color: #fff !important;
      }
      
      .high-contrast .tab-button {
        border: 2px solid #000 !important;
      }
      
      .high-contrast .tab-button.active {
        background: #000 !important;
        color: #fff !important;
      }
    `;
    document.head.appendChild(contrastStyle);
  }

  addSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#tabNav" class="skip-link">Skip to navigation</a>
    `;
    
    skipLinks.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000;
    `;
    
    const skipLinkStyle = document.createElement('style');
    skipLinkStyle.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
        transition: top 0.3s;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;
    document.head.appendChild(skipLinkStyle);
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }

  closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    const focusableElements = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
}

// Initialize accessibility enhancer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.accessibilityEnhancer = new AccessibilityEnhancer();
});
}
