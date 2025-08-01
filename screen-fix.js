// ARREGLO RÁPIDO PARA NAVEGACIÓN DE PANTALLAS
// Añadir este script después del script.js principal

// Función global para navegación forzada
function forceShowScreen(screenName) {
    console.log('Mostrando pantalla:', screenName);
    
    // Ocultar TODAS las pantallas
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(screen => {
        screen.style.display = 'none';
        screen.classList.add('hidden');
    });
    
    // Mostrar solo la pantalla solicitada
    const targetScreen = document.getElementById(screenName + '-screen');
    if (targetScreen) {
        targetScreen.style.display = 'flex';
        targetScreen.classList.remove('hidden');
        console.log('Pantalla mostrada:', screenName);
    } else {
        console.error('Pantalla no encontrada:', screenName);
    }
}

// Sobrescribir las funciones de navegación
window.showMenu = function() {
    forceShowScreen('start');
};

window.showRecords = function() {
    forceShowScreen('records');
};

// Sobrescribir el método showScreen del ScreenManager después de que se cargue
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.game && window.game.screenManager) {
            const originalShowScreen = window.game.screenManager.showScreen.bind(window.game.screenManager);
            window.game.screenManager.showScreen = function(screenName) {
                console.log('ScreenManager showScreen llamado:', screenName);
                forceShowScreen(screenName);
            };
        }
    }, 500);
});

// También sobrescribir después de que el juego se inicialice completamente
window.addEventListener('load', function() {
    setTimeout(() => {
        if (window.game && window.game.screenManager) {
            window.game.screenManager.showScreen = function(screenName) {
                console.log('ScreenManager showScreen (load) llamado:', screenName);
                forceShowScreen(screenName);
            };
        }
    }, 1000);
});

// Asegurar que cuando la página cargue, solo se vea el login o el menú
window.addEventListener('load', function() {
    setTimeout(() => {
        // Verificar si hay usuario logueado
        const currentUser = localStorage.getItem('circleTapCurrentUser');
        const users = JSON.parse(localStorage.getItem('circleTapUsers') || '{}');
        
        if (currentUser && users[currentUser]) {
            forceShowScreen('start');
            if (document.getElementById('current-user')) {
                document.getElementById('current-user').textContent = 'Usuario: ' + currentUser;
            }
        } else {
            forceShowScreen('login');
        }
    }, 100);
});

// Función de logout mejorada
window.gameLogout = function() {
    localStorage.removeItem('circleTapCurrentUser');
    forceShowScreen('login');
};

console.log('🔧 Arreglo de navegación cargado - las pantallas ahora deberían funcionar correctamente');
