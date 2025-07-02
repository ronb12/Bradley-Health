// Legal and Policy Functions for Bradley Health
class LegalManager {
  constructor() {
    this.init();
  }

  init() {
    // Setup legal link handlers
    this.setupLegalLinks();
  }

  setupLegalLinks() {
    // These functions are called from onclick handlers in HTML
    window.showPrivacyPolicy = () => this.showPrivacyPolicy();
    window.showTermsOfService = () => this.showTermsOfService();
    window.showDataUsage = () => this.showDataUsage();
  }

  showPrivacyPolicy() {
    const content = `
      <div class="legal-modal">
        <h2>Privacy Policy</h2>
        <div class="legal-content">
          <h3>Data Collection</h3>
          <p>Bradley Health collects only the health data you choose to input, including:</p>
          <ul>
            <li>Blood pressure readings</li>
            <li>Medication information</li>
            <li>Mood tracking data</li>
            <li>Health goals and progress</li>
            <li>Profile information</li>
          </ul>
          
          <h3>Data Storage</h3>
          <p>Your data is stored securely in Firebase Firestore with the following protections:</p>
          <ul>
            <li>End-to-end encryption</li>
            <li>User-specific access controls</li>
            <li>Secure authentication</li>
            <li>Regular security audits</li>
          </ul>
          
          <h3>Data Usage</h3>
          <p>Your health data is used solely for:</p>
          <ul>
            <li>Providing health insights and trends</li>
            <li>Generating reports and charts</li>
            <li>Setting and tracking health goals</li>
            <li>Medication reminders</li>
          </ul>
          
          <h3>Data Sharing</h3>
          <p>We do not share your personal health data with third parties. You have full control over your data and can export or delete it at any time.</p>
          
          <h3>Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access all your stored data</li>
            <li>Export your data in various formats</li>
            <li>Delete your account and all associated data</li>
            <li>Request data corrections</li>
          </ul>
        </div>
      </div>
    `;
    
    this.showLegalModal('Privacy Policy', content);
  }

  showTermsOfService() {
    const content = `
      <div class="legal-modal">
        <h2>Terms of Service</h2>
        <div class="legal-content">
          <h3>Acceptance of Terms</h3>
          <p>By using Bradley Health, you agree to these terms of service.</p>
          
          <h3>Service Description</h3>
          <p>Bradley Health is a health monitoring application that helps you track:</p>
          <ul>
            <li>Blood pressure readings</li>
            <li>Medication schedules</li>
            <li>Mood and wellness</li>
            <li>Health goals</li>
          </ul>
          
          <h3>User Responsibilities</h3>
          <p>As a user, you agree to:</p>
          <ul>
            <li>Provide accurate health information</li>
            <li>Maintain the security of your account</li>
            <li>Use the app for personal health monitoring only</li>
            <li>Not share your account credentials</li>
          </ul>
          
          <h3>Medical Disclaimer</h3>
          <p>Bradley Health is not a substitute for professional medical advice. Always consult with healthcare professionals for medical decisions.</p>
          
          <h3>Limitation of Liability</h3>
          <p>Bradley Health is provided "as is" without warranties. We are not liable for any damages arising from the use of this application.</p>
          
          <h3>Account Termination</h3>
          <p>You may terminate your account at any time. We may terminate accounts that violate these terms.</p>
        </div>
      </div>
    `;
    
    this.showLegalModal('Terms of Service', content);
  }

  showDataUsage() {
    const content = `
      <div class="legal-modal">
        <h2>Data Usage Information</h2>
        <div class="legal-content">
          <h3>How We Use Your Data</h3>
          <p>Bradley Health uses your health data to provide personalized insights and improve your health monitoring experience.</p>
          
          <h3>Data Processing</h3>
          <ul>
            <li><strong>Analytics:</strong> Generate health trends and patterns</li>
            <li><strong>Reminders:</strong> Send medication and health check reminders</li>
            <li><strong>Reports:</strong> Create health reports and summaries</li>
            <li><strong>Goals:</strong> Track progress toward health objectives</li>
          </ul>
          
          <h3>Data Security</h3>
          <p>We implement industry-standard security measures:</p>
          <ul>
            <li>Encryption in transit and at rest</li>
            <li>Regular security audits</li>
            <li>Access controls and authentication</li>
            <li>Secure data centers</li>
          </ul>
          
          <h3>Data Retention</h3>
          <p>Your data is retained until you delete your account or specific data entries. You can export your data at any time.</p>
          
          <h3>Third-Party Services</h3>
          <p>We use Firebase (Google) for data storage and authentication. Firebase adheres to strict security standards and privacy policies.</p>
          
          <h3>Your Control</h3>
          <p>You have complete control over your data:</p>
          <ul>
            <li>View all stored data</li>
            <li>Edit or delete individual entries</li>
            <li>Export data in multiple formats</li>
            <li>Delete your entire account</li>
          </ul>
        </div>
      </div>
    `;
    
    this.showLegalModal('Data Usage Information', content);
  }

  showLegalModal(title, content) {
    // Remove existing modal if present
    const existingModal = document.getElementById('legalModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'legalModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content legal-modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
        </div>
      </div>
    `;

    // Add modal styles if not already present
    if (!document.getElementById('legalModalStyles')) {
      const styles = document.createElement('style');
      styles.id = 'legalModalStyles';
      styles.textContent = `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }
        
        .legal-modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .modal-header h2 {
          margin: 0;
          color: #333;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          text-align: right;
        }
        
        .legal-content h3 {
          color: #333;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        
        .legal-content ul {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .legal-content li {
          margin-bottom: 5px;
        }
        
        @media (max-width: 768px) {
          .legal-modal-content {
            width: 95%;
            max-height: 90vh;
          }
        }
      `;
      document.head.appendChild(styles);
    }

    // Add modal to page
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// Initialize legal manager
document.addEventListener('DOMContentLoaded', () => {
  window.legalManager = new LegalManager();
}); 