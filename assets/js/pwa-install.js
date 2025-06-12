let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show the install button
    const installButton = document.querySelector('.install-button');
    if (installButton) {
        installButton.style.display = 'block';
    }
});

async function installPWA() {
    if (!deferredPrompt) {
        console.log('Install prompt not available');
        return;
    }

    try {
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        // We no longer need the prompt. Clear it up
        deferredPrompt = null;
        // Hide the install button
        const installButton = document.querySelector('.install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Error during PWA installation:', error);
    }
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Get the base path for the site
        const basePath = window.location.pathname.includes('/Bradley-Health/') ? '/Bradley-Health/' : '/';
        
        // Register service worker with the correct path
        navigator.serviceWorker.register(`${basePath}service-worker.js`)
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
} 