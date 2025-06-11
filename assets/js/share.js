// Share functionality
class ShareFeatures {
  constructor() {
    this.shareButtons = [];
  }

  init() {
    this.addShareButtons();
    this.handleShareEvents();
  }

  handleShareEvents() {
    this.shareButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const section = e.target.closest('[data-share-section]');
        if (section) {
          await this.shareSection(section.dataset.shareSection);
        }
      });
    });
  }

  addShareButtons() {
    const sections = document.querySelectorAll('[data-share-section]');
    sections.forEach(section => {
      const button = document.createElement('button');
      button.className = 'share-button';
      button.innerHTML = '📤 Share';
      button.setAttribute('aria-label', 'Share this section');
      section.appendChild(button);
      this.shareButtons.push(button);
    });
  }

  async shareSection(section) {
    try {
      const text = this.getShareableText(section);
      if (navigator.share) {
        await navigator.share({
          title: 'Bradley Health',
          text: text,
          url: window.location.href
        });
      } else {
        await this.copyToClipboard(text);
        this.showMessage('Copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      this.showMessage('Failed to share. Please try again.');
    }
  }

  getShareableText(section) {
    const title = document.querySelector('h1')?.textContent || 'Bradley Health';
    const content = document.querySelector(`[data-share-section="${section}"]`)?.textContent || '';
    return `${title}\n\n${content}`;
  }

  async copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
  }

  showMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize share features
document.addEventListener('DOMContentLoaded', () => {
  const shareFeatures = new ShareFeatures();
  shareFeatures.init();
}); 