class NotificationManager {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);
    }

    showToast(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const content = document.createElement('div');
        content.className = 'notification-content';
        
        const icon = document.createElement('span');
        icon.className = 'notification-icon';
        icon.innerHTML = this.getIconForType(type);
        
        const messageElement = document.createElement('span');
        messageElement.className = 'notification-message';
        messageElement.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.removeNotification(notification);
        
        content.appendChild(icon);
        content.appendChild(messageElement);
        notification.appendChild(content);
        notification.appendChild(closeButton);
        
        this.container.appendChild(notification);
        
        // Add show class after a small delay for animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300); // Match the CSS transition duration
    }

    getIconForType(type) {
        switch (type) {
            case 'success':
                return '<i class="fas fa-check-circle"></i>';
            case 'error':
                return '<i class="fas fa-exclamation-circle"></i>';
            case 'warning':
                return '<i class="fas fa-exclamation-triangle"></i>';
            default:
                return '<i class="fas fa-info-circle"></i>';
        }
    }

    // Request notification permission
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    // Show system notification
    async showSystemNotification(title, options = {}) {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission !== 'granted') {
            const granted = await this.requestPermission();
            if (!granted) return false;
        }

        try {
            const notification = new Notification(title, {
                icon: '/assets/icons/icon-192.png',
                badge: '/assets/icons/badge-72.png',
                ...options
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return true;
        } catch (error) {
            console.error('Error showing system notification:', error);
            return false;
        }
    }
} 