document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const card3mkfxg = document.getElementById('card-3mkfxg');
    const cardDalal = document.getElementById('card-dalal');
    const logoutBtn = document.getElementById('logout-btn');

    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Story Card interactions
    card3mkfxg.addEventListener('click', () => {
        createRipple(card3mkfxg);
        setTimeout(() => {
            window.location.href = '3mkfxg.html';
        }, 400);
    });

    cardDalal.addEventListener('click', () => {
        createRipple(cardDalal);
        setTimeout(() => {
            window.location.href = 'dalal.html';
        }, 400);
    });
    
    // Aesthetic click effect
    function createRipple(element) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.background = 'rgba(255,255,255,0.4)';
        ripple.style.borderRadius = '50%';
        ripple.style.animation = 'ripple-effect 0.6s linear';
        ripple.style.zIndex = '10';
        ripple.style.pointerEvents = 'none';
        
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.innerHTML = `
                @keyframes ripple-effect {
                    0% { width: 10px; height: 10px; opacity: 1; }
                    100% { width: 500px; height: 500px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});
