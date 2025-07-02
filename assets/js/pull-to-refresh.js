// Custom Pull-to-Refresh for Bradley Health PWA
(function() {
  let startY = 0;
  let isPulling = false;
  let ptr = document.getElementById('pullToRefresh');
  let ptrIcon = document.getElementById('ptrIcon');
  let ptrText = document.getElementById('ptrText');
  let threshold = 60;
  let triggered = false;

  function setPTRVisible(visible, text = 'Pull to refresh', icon = '↓') {
    if (!ptr) return;
    ptr.style.display = visible ? 'flex' : 'none';
    ptr.style.opacity = visible ? '1' : '0';
    ptrText.textContent = text;
    ptrIcon.textContent = icon;
  }

  window.addEventListener('touchstart', function(e) {
    if (window.scrollY === 0 && e.touches.length === 1) {
      startY = e.touches[0].clientY;
      isPulling = true;
      triggered = false;
    }
  }, {passive: true});

  window.addEventListener('touchmove', function(e) {
    if (!isPulling) return;
    let currentY = e.touches[0].clientY;
    let diff = currentY - startY;
    if (diff > 0) {
      setPTRVisible(true, diff > threshold ? 'Release to refresh' : 'Pull to refresh', diff > threshold ? '⟳' : '↓');
      ptr.style.opacity = Math.min(diff / threshold, 1).toString();
      if (diff > threshold) {
        triggered = true;
      } else {
        triggered = false;
      }
    }
  }, {passive: false});

  window.addEventListener('touchend', function(e) {
    if (isPulling) {
      if (triggered) {
        setPTRVisible(true, 'Refreshing...', '⟳');
        setTimeout(() => {
          setPTRVisible(false);
          window.location.reload();
        }, 500);
      } else {
        setPTRVisible(false);
      }
    }
    isPulling = false;
    triggered = false;
  });
})(); 