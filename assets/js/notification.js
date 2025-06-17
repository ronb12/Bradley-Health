class NotificationManager {
  constructor() {
    this.container = document.createElement("div");
    this.container.className = "notification-container";
    document.body.appendChild(this.container);
  }

  showToast(message, type = "info", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `notification notification-${type}`;
    
    const icon = this.getIconForType(type);
    
    toast.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
      </div>
      <button class="notification-close">&times;</button>
    `;
    
    this.container.appendChild(toast);
    
    // Add show class after a small delay to trigger animation
    setTimeout(() => toast.classList.add("show"), 10);
    
    // Add click handler for close button
    const closeBtn = toast.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => this.removeToast(toast));
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => this.removeToast(toast), duration);
    }
    
    return toast;
  }
  
  removeToast(toast) {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => {
      toast.remove();
    });
  }
  
  getIconForType(type) {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  }
  
  showSuccess(message, duration = 3000) {
    return this.showToast(message, "success", duration);
  }
  
  showError(message, duration = 5000) {
    return this.showToast(message, "error", duration);
  }
  
  showWarning(message, duration = 4000) {
    return this.showToast(message, "warning", duration);
  }
  
  showInfo(message, duration = 3000) {
    return this.showToast(message, "info", duration);
  }
}
