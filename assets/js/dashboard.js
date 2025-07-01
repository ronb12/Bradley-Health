document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      // Remove active from all buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      // Hide all tab contents
      tabContents.forEach(tc => tc.classList.remove('active'));
      // Activate clicked button and corresponding tab
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}); 