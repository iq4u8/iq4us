
(function() {
    function fixLinks() {
        const keywords = ['Login', 'Sign In', 'Sign Up', 'Dashboard', 'Get Started', 'Start Hosting', 'Access Terminal'];
        const elements = document.querySelectorAll('a, button');
        elements.forEach(el => {
            const text = el.innerText || el.textContent;
            if (keywords.some(k => text.trim().toLowerCase() === k.toLowerCase())) {
                // Remove existing listeners if possible (clone)
                // el.replaceWith(el.cloneNode(true)); // risky for React
                el.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = '/browse/';
                };
                // Also set href for anchors
                if (el.tagName === 'A') {
                    el.href = '/browse/';
                }
                el.style.cursor = 'pointer';
            }
        });
    }

    // Run on load
    window.addEventListener('load', fixLinks);
    // Run periodically for React
    setInterval(fixLinks, 1000);
})();
