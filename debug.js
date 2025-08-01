// DEBUG SCRIPT - Cargar después de script.js
console.log('🔧 Script de debug cargado');

// Función para forzar game over manualmente
window.forceGameOver = function() {
    console.log('🔥 FORZANDO GAME OVER MANUALMENTE');
    if (window.game) {
        window.game.endGame();
    } else {
        console.error('❌ Game no está disponible');
    }
};

// Función para mostrar pantalla manualmente
window.forceScreen = function(screenName) {
    console.log('🔥 FORZANDO PANTALLA:', screenName);
    
    // Ocultar todas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
        screen.classList.add('hidden');
    });
    
    // Mostrar la solicitada
    const target = document.getElementById(screenName + '-screen');
    if (target) {
        target.style.display = 'flex';
        target.classList.remove('hidden');
        console.log('✅ Pantalla mostrada:', screenName);
    } else {
        console.error('❌ Pantalla no encontrada:', screenName);
    }
};

// Monitorear el estado del juego
setInterval(() => {
    if (window.game && window.game.gameState) {
        const gameState = window.game.gameState;
        if (gameState.running && gameState.timeLeft !== undefined) {
            if (gameState.timeLeft <= 3) {
                console.log('⚠️ ÚLTIMOS SEGUNDOS:', gameState.timeLeft);
            }
        }
    }
}, 500);

console.log('🎮 Comandos disponibles:');
console.log('- forceGameOver() - Forzar fin de juego');
console.log('- forceScreen("gameOver") - Mostrar pantalla específica');
