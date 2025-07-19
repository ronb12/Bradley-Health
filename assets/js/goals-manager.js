// Goals Management System
class GoalsManager {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.goals = [];
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentUser = null;
          this.goals = [];
          this.init();
        } else {
          console.error('Firebase not available for goals manager');
        }
      }, 1000);
    }
  }

  init() {
    // Wait for authentication
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          this.setupEventListeners();
          this.loadGoals();
        }
      });
    }
  }

  setupEventListeners() {
    // Goals form
    const addGoalForm = document.getElementById('addGoalForm');
    if (addGoalForm) {
      addGoalForm.addEventListener('submit', (e) => this.addGoal(e));
    }

    // Export data button
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportData());
    }
  }

  async addGoal(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to set goals', 'error');
      return;
    }
    
    const formData = new FormData(e.target);
    
    const goal = {
      title: formData.get('title'),
      category: formData.get('category'),
      target: formData.get('target'),
      deadline: formData.get('deadline'),
      status: 'active',
      progress: 0,
      createdAt: new Date(),
      userId: this.currentUser.uid
    };

    try {
      this.showLoading('Setting goal...');
      await this.db.collection('goals').add(goal);
      this.showToast('Goal set successfully!', 'success');
      this.loadGoals();
      e.target.reset();
    } catch (error) {
      console.error('Error setting goal:', error);
      this.showToast('Error setting goal', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadGoals() {
    if (!this.currentUser) {
      console.log('User not authenticated yet, skipping goals load');
      return;
    }

    try {
      const snapshot = await this.db
        .collection('goals')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

      this.goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.renderGoals();
    } catch (error) {
      console.error('Error loading goals:', error);
      // Handle Firestore permissions error gracefully
      if (error.code === 'permission-denied') {
        console.log('Firestore permissions not set up yet - this is normal for new users');
        this.renderEmptyState();
      }
    }
  }

  renderGoals() {
    const goalsList = document.getElementById('goalsList');
    if (!goalsList) return;

    if (this.goals.length === 0) {
      goalsList.innerHTML = `
        <div class="empty-state">
          <p>No goals set yet</p>
          <p>Set your first health goal to get started!</p>
        </div>
      `;
      return;
    }

    goalsList.innerHTML = this.goals.map(goal => `
      <div class="goal-item ${goal.status}">
        <div class="goal-header">
          <h3>${goal.title}</h3>
          <span class="category ${goal.category}">${goal.category}</span>
        </div>
        <div class="goal-details">
          <p><strong>Target:</strong> ${goal.target}</p>
          <p><strong>Deadline:</strong> ${new Date(goal.deadline).toLocaleDateString()}</p>
          <p><strong>Progress:</strong> ${goal.progress}%</p>
        </div>
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${goal.progress}%"></div>
          </div>
        </div>
        <div class="goal-actions">
          <button class="btn btn-small" onclick="window.goalsManager.updateProgress('${goal.id}')">Update Progress</button>
          <button class="btn btn-small" onclick="window.goalsManager.editGoal('${goal.id}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="window.goalsManager.deleteGoal('${goal.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  renderEmptyState() {
    const goalsList = document.getElementById('goalsList');
    if (goalsList) {
      goalsList.innerHTML = `
        <div class="empty-state">
          <p>Welcome to Bradley Health!</p>
          <p>Set your first health goal to get started.</p>
        </div>
      `;
    }
  }

  async updateProgress(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    const progress = prompt(`Update progress for "${goal.title}" (0-100%):`, goal.progress);
    if (progress === null) return;

    const newProgress = parseInt(progress);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      this.showToast('Please enter a valid percentage (0-100)', 'error');
      return;
    }

    try {
      this.showLoading('Updating goal progress...');
      await this.db.collection('goals').doc(goalId).update({
        progress: newProgress,
        status: newProgress >= 100 ? 'completed' : 'active',
        updatedAt: new Date()
      });
      this.showToast('Goal progress updated!', 'success');
      this.loadGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
      this.showToast('Error updating goal progress', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async editGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Edit Goal</h3>
        <form id="editGoalForm">
          <input type="hidden" name="goalId" value="${goal.id}">
          <div class="form-group">
            <label for="editGoalTitle">Goal Title</label>
            <input type="text" id="editGoalTitle" name="title" value="${goal.title}" required>
          </div>
          <div class="form-group">
            <label for="editGoalCategory">Category</label>
            <select id="editGoalCategory" name="category" required>
              <option value="blood-pressure" ${goal.category === 'blood-pressure' ? 'selected' : ''}>Blood Pressure</option>
              <option value="medication" ${goal.category === 'medication' ? 'selected' : ''}>Medication</option>
              <option value="exercise" ${goal.category === 'exercise' ? 'selected' : ''}>Exercise</option>
              <option value="diet" ${goal.category === 'diet' ? 'selected' : ''}>Diet</option>
              <option value="mental-health" ${goal.category === 'mental-health' ? 'selected' : ''}>Mental Health</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editGoalTarget">Target</label>
            <input type="text" id="editGoalTarget" name="target" value="${goal.target}" required>
          </div>
          <div class="form-group">
            <label for="editGoalDeadline">Deadline</label>
            <input type="date" id="editGoalDeadline" name="deadline" value="${goal.deadline}" required>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Update Goal</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#editGoalForm');
    form.addEventListener('submit', (e) => this.updateGoal(e));
  }

  async updateGoal(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const goalId = formData.get('goalId');
    
    const updateData = {
      title: formData.get('title'),
      category: formData.get('category'),
      target: formData.get('target'),
      deadline: formData.get('deadline'),
      updatedAt: new Date()
    };

    try {
      this.showLoading('Updating goal...');
      await this.db.collection('goals').doc(goalId).update(updateData);
      this.showToast('Goal updated successfully!', 'success');
      this.loadGoals();
      e.target.closest('.modal').remove();
    } catch (error) {
      console.error('Error updating goal:', error);
      this.showToast('Error updating goal', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      this.showLoading('Deleting goal...');
      await this.db.collection('goals').doc(goalId).delete();
      this.showToast('Goal deleted successfully!', 'success');
      this.loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      this.showToast('Error deleting goal', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async exportData() {
    if (window.exportManager) {
      window.exportManager.exportAllData();
    } else {
      this.showToast('Export functionality not available', 'error');
    }
  }

  showLoading(message) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.textContent = message;
      loadingEl.style.display = 'block';
    }
  }

  hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Remove toast after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);

    // Also remove on click
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }
}

// Initialize goals manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.goalsManager = new GoalsManager();
}); 