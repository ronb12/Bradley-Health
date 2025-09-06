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
    // High contrast mode is available but toggle button removed for cleaner UI
    // Users can still access high contrast via browser settings or accessibility tools
  }

  addSkipLinks() {
    // Skip links removed for cleaner UI - accessibility features still work via keyboard navigation
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
