window.addEventListener('load', () => {
    // Check if the URL contains our specific hash
    if (window.location.hash === '#scroll-target') {
        // Calculate 150vh
        const scrollDistance = window.innerHeight * 1.5;

        // Perform the scroll
        window.scrollTo({
            top: scrollDistance,
            behavior: 'smooth' // Use 'auto' for instant jump
        });

        // Clean up the URL hash without refreshing
        history.replaceState(null, null, ' ');
    }
});
