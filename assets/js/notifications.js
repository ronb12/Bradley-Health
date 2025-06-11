// Notification system
const notificationSystem = {
  init() {
    this.container = document.createElement('div');
    this.container.className = 'notification-container';
    document.body.appendChild(this.container);
  },

  show(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icon = this.getIcon(type);
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
      </div>
      <button class="notification-close" aria-label="Close notification">×</button>
    `;

    this.container.appendChild(notification);

    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => this.close(notification));

    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => this.close(notification), duration);
    }

    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
  },

  close(notification) {
    notification.classList.remove('show');
    notification.addEventListener('transitionend', () => {
      notification.remove();
    });
  },

  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }
};

// Initialize notification system
document.addEventListener('DOMContentLoaded', () => {
  notificationSystem.init();
}); 