// GitHub Pages Path Helper
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    const repoName = 'Bradley-Health';
    
    if (isGitHubPages) {
        console.log('Running on GitHub Pages - updating paths');
        
        // Update favicons
        document.querySelectorAll('link[rel="icon"]').forEach(link => {
            if (link.href.startsWith('/')) {
                link.href = `/${repoName}${link.href}`;
            } else if (!link.href.startsWith('http') && !link.href.includes(repoName)) {
                link.href = `/${repoName}/${link.href}`;
            }
        });
        
        // Update manifest
        document.querySelectorAll('link[rel="manifest"]').forEach(link => {
            if (!link.href.includes(repoName)) {
                link.href = `/${repoName}/${link.href.split('/').pop()}`;
            }
        });
        
        // Update images
        document.querySelectorAll('img').forEach(img => {
            if (img.src.startsWith('/')) {
                img.src = `/${repoName}${img.src}`;
            } else if (!img.src.startsWith('http') && !img.src.includes(repoName)) {
                img.src = `/${repoName}/${img.src}`;
            }
        });
        
        // Update links
        document.querySelectorAll('a').forEach(a => {
            if (a.href.includes(window.location.origin) && 
                !a.href.includes(repoName) && 
                !a.href.endsWith('#') && 
                !a.href.startsWith('http')) {
                const path = a.href.split(window.location.origin)[1];
                if (path && path.startsWith('/')) {
                    a.href = `/${repoName}${path}`;
                } else if (path) {
                    a.href = `/${repoName}/${path}`;
                }
            }
        });
        
        console.log('Paths updated for GitHub Pages');
    }
}); 