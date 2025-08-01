class CircleTapGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameRunning = false;
        this.circles = [];
        this.gameTimer = null;
        this.spawnTimer = null;
        this.difficulty = 1;
        this.maxCircles = 3; // Siempre 3 círculos en modo clásico
        
        // Variables para modo VS Máquina
        this.gameMode = 'classic'; // 'classic' o 'vs-machine'
        this.playerScore = 0;
        this.machineScore = 0;
        this.machineDifficulty = 1; // bps (burbujas por segundo)
        this.machineTimer = null;
        this.vsTimeLeft = 60;
        
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        // Pantallas
        this.startScreen = document.getElementById('start-screen');
        this.difficultyScreen = document.getElementById('difficulty-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.vsGameScreen = document.getElementById('vs-game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.vsResultScreen = document.getElementById('vs-result-screen');
        
        // Botones principales
        this.classicBtn = document.getElementById('classic-btn');
        this.vsMachineBtn = document.getElementById('vs-machine-btn');
        this.backBtn = document.getElementById('back-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.vsRestartBtn = document.getElementById('vs-restart-btn');
        this.vsMenuBtn = document.getElementById('vs-menu-btn');
        
        // Botones de dificultad
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // UI del juego clásico
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameArea = document.getElementById('game-area');
        
        // UI del modo VS
        this.playerScoreElement = document.getElementById('player-score');
        this.machineScoreElement = document.getElementById('machine-score');
        this.vsTimeElement = document.getElementById('vs-time');
        this.difficultyNameElement = document.getElementById('difficulty-name');
        this.difficultyRateElement = document.getElementById('difficulty-rate');
        this.vsGameArea = document.getElementById('vs-game-area');
        this.playerFinalScoreElement = document.getElementById('player-final-score');
        this.machineFinalScoreElement = document.getElementById('machine-final-score');
        this.vsResultTitleElement = document.getElementById('vs-result-title');
        this.vsResultMessageElement = document.getElementById('vs-result-message');
    }

    initElements() {
        // Pantallas
        this.startScreen = document.getElementById('start-screen');
        this.difficultyScreen = document.getElementById('difficulty-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.vsGameScreen = document.getElementById('vs-game-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.vsResultScreen = document.getElementById('vs-result-screen');
        
        // Botones principales
        this.classicBtn = document.getElementById('classic-btn');
        this.vsMachineBtn = document.getElementById('vs-machine-btn');
        this.backBtn = document.getElementById('back-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.vsRestartBtn = document.getElementById('vs-restart-btn');
        this.vsMenuBtn = document.getElementById('vs-menu-btn');
        
        // Botones de dificultad
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        // UI del juego clásico
        this.scoreElement = document.getElementById('score');
        this.timeElement = document.getElementById('time');
        this.finalScoreElement = document.getElementById('final-score');
        this.gameArea = document.getElementById('game-area');
        
        // UI del modo VS
        this.playerScoreElement = document.getElementById('player-score');
        this.machineScoreElement = document.getElementById('machine-score');
        this.vsTimeElement = document.getElementById('vs-time');
        this.difficultyNameElement = document.getElementById('difficulty-name');
        this.difficultyRateElement = document.getElementById('difficulty-rate');
        this.vsGameArea = document.getElementById('vs-game-area');
        this.playerFinalScoreElement = document.getElementById('player-final-score');
        this.machineFinalScoreElement = document.getElementById('machine-final-score');
        this.vsResultTitleElement = document.getElementById('vs-result-title');
        this.vsResultMessageElement = document.getElementById('vs-result-message');
    }

    bindEvents() {
        this.classicBtn.addEventListener('click', () => this.startClassicGame());
        this.vsMachineBtn.addEventListener('click', () => this.showDifficultyScreen());
        this.backBtn.addEventListener('click', () => this.showStartScreen());
        this.restartBtn.addEventListener('click', () => this.startClassicGame());
        this.menuBtn.addEventListener('click', () => this.showStartScreen());
        this.vsRestartBtn.addEventListener('click', () => this.restartVsGame());
        this.vsMenuBtn.addEventListener('click', () => this.showStartScreen());
        
        // Botones de dificultad
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = parseInt(btn.dataset.difficulty);
                this.startVsMachineGame(difficulty);
            });
        });
        
        // Prevenir el comportamiento por defecto del touch
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    showStartScreen() {
        this.startScreen.classList.remove('hidden');
        this.difficultyScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.vsGameScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.vsResultScreen.classList.add('hidden');
    }

    showDifficultyScreen() {
        this.startScreen.classList.add('hidden');
        this.difficultyScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.vsGameScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.vsResultScreen.classList.add('hidden');
    }

    showGameScreen() {
        this.startScreen.classList.add('hidden');
        this.difficultyScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.vsGameScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.vsResultScreen.classList.add('hidden');
    }

    showVsGameScreen() {
        this.startScreen.classList.add('hidden');
        this.difficultyScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.vsGameScreen.classList.remove('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.vsResultScreen.classList.add('hidden');
    }

    showGameOverScreen() {
        this.startScreen.classList.add('hidden');
        this.difficultyScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.vsGameScreen.classList.add('hidden');
        this.gameOverScreen.classList.remove('hidden');
        this.vsResultScreen.classList.add('hidden');
        this.finalScoreElement.textContent = this.score;
    }

    showVsResultScreen() {
        this.startScreen.classList.add('hidden');
        this.difficultyScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.vsGameScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        this.vsResultScreen.classList.remove('hidden');
        
        this.playerFinalScoreElement.textContent = this.playerScore;
        this.machineFinalScoreElement.textContent = this.machineScore;
        
        // Determinar resultado
        let resultTitle, resultMessage, messageClass;
        if (this.playerScore > this.machineScore) {
            resultTitle = "🎉 ¡VICTORIA!";
            resultMessage = "¡Excelente! ¡Has derrotado a la máquina!";
            messageClass = "win-message";
        } else if (this.playerScore < this.machineScore) {
            resultTitle = "😔 Derrota";
            resultMessage = "La máquina fue más rápida esta vez. ¡Inténtalo de nuevo!";
            messageClass = "lose-message";
        } else {
            resultTitle = "🤝 ¡Empate!";
            resultMessage = "¡Increíble! Empataste con la máquina.";
            messageClass = "tie-message";
        }
        
        this.vsResultTitleElement.textContent = resultTitle;
        this.vsResultMessageElement.textContent = resultMessage;
        this.vsResultMessageElement.className = messageClass;
    }

    startClassicGame() {
        this.gameMode = 'classic';
        this.score = 0;
        this.lives = 3;
        this.timeLeft = 30;
        this.gameRunning = true;
        this.difficulty = 1;
        this.circles = [];
        
        this.updateClassicUI();
        this.showGameScreen();
        this.clearGameArea();
        
        // Iniciar timers
        this.startGameTimer();
        this.startSpawnTimer();
    }

    startVsMachineGame(difficulty) {
        this.gameMode = 'vs-machine';
        this.machineDifficulty = difficulty;
        this.playerScore = 0;
        this.machineScore = 0;
        this.vsTimeLeft = 60;
        this.gameRunning = true;
        this.circles = [];
        
        // Configurar UI de dificultad
        const difficultyNames = {
            1: "🟢 Fácil",
            2: "🟡 Medio", 
            3: "🟠 Difícil",
            5: "🔴 Extremo"
        };
        
        this.difficultyNameElement.textContent = difficultyNames[difficulty];
        this.difficultyRateElement.textContent = `${difficulty} bps`;
        
        this.updateVsUI();
        this.showVsGameScreen();
        this.clearVsGameArea();
        
        // Iniciar timers
        this.startVsGameTimer();
        this.startVsSpawnTimer();
        this.startMachineTimer();
    }

    restartVsGame() {
        this.startVsMachineGame(this.machineDifficulty);
    }

    startGameTimer() {
        this.gameTimer = setInterval(() => {
            if (this.gameMode === 'classic') {
                this.timeLeft--;
                this.updateUI();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
                
                // Aumentar dificultad cada 10 segundos
                if (this.timeLeft % 10 === 0 && this.timeLeft < 30) {
                    this.difficulty += 0.3;
                }
            }
        }, 1000);
    }

    startVsGameTimer() {
        this.gameTimer = setInterval(() => {
            this.vsTimeLeft--;
            this.updateVsUI();
            
            if (this.vsTimeLeft <= 0) {
                this.endVsGame();
            }
        }, 1000);
    }

    startMachineTimer() {
        const machineInterval = 1000 / this.machineDifficulty; // Convertir bps a milisegundos
        
        const machineAction = () => {
            if (!this.gameRunning) return;
            
            // La máquina "toca" un círculo aleatorio existente
            const availableCircles = this.circles.filter(circle => 
                !circle.classList.contains('hit') && 
                !circle.classList.contains('machine-circle')
            );
            
            if (availableCircles.length > 0) {
                const randomCircle = availableCircles[Math.floor(Math.random() * availableCircles.length)];
                this.machineHitCircle(randomCircle);
            }
            
            this.machineTimer = setTimeout(machineAction, machineInterval);
        };
        
        // Esperar un poco antes de que la máquina empiece
        setTimeout(() => {
            if (this.gameRunning) {
                machineAction();
            }
        }, 2000);
    }

    startSpawnTimer() {
        const maintainCircles = () => {
            if (!this.gameRunning || this.gameMode !== 'classic') return;
            
            // Filtrar círculos activos (no eliminados)
            const activeCircles = this.circles.filter(circle => 
                circle.parentNode && 
                !circle.classList.contains('hit') && 
                !circle.classList.contains('miss')
            );
            
            const circlesNeeded = this.maxCircles - activeCircles.length;
            
            // Solo crear círculos si realmente faltan
            if (circlesNeeded > 0) {
                for (let i = 0; i < circlesNeeded; i++) {
                    this.createCircle();
                }
            }
            
            // Revisar cada 200ms para mantener consistencia sin ser demasiado agresivo
            this.spawnTimer = setTimeout(maintainCircles, 200);
        };
        
        // Crear los primeros 3 círculos inmediatamente en modo clásico
        if (this.gameMode === 'classic') {
            for (let i = 0; i < this.maxCircles; i++) {
                this.createCircle();
            }
            maintainCircles();
        }
    }

    startVsSpawnTimer() {
        const spawnCircle = () => {
            if (!this.gameRunning) return;
            
            this.createVsCircle();
            // Spawn rate constante para VS mode
            const spawnRate = 800;
            this.spawnTimer = setTimeout(spawnCircle, spawnRate);
        };
        
        spawnCircle();
    }

    createCircle() {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        
        // Tamaño aleatorio basado en dificultad
        const minSize = Math.max(60 - (this.difficulty * 5), 40);
        const maxSize = Math.max(100 - (this.difficulty * 3), 70);
        const size = Math.random() * (maxSize - minSize) + minSize;
        
        // Posición aleatoria (evitar bordes)
        const margin = size / 2 + 20;
        const maxX = window.innerWidth - margin * 2;
        const maxY = window.innerHeight - margin * 2 - 100; // Espacio para la UI
        
        const x = Math.random() * maxX + margin;
        const y = Math.random() * maxY + margin + 100;
        
        // Estilo del círculo
        const colors = [
            'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            'linear-gradient(45deg, #74b9ff, #0984e3)',
            'linear-gradient(45deg, #00b894, #00a085)',
            'linear-gradient(45deg, #fdcb6e, #e17055)',
            'linear-gradient(45deg, #fd79a8, #e84393)',
            'linear-gradient(45deg, #a29bfe, #6c5ce7)'
        ];
        
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        circle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Puntos basados en tamaño (círculos más pequeños dan más puntos)
        const points = Math.round((100 - size) / 10) + 1;
        circle.textContent = points;
        circle.dataset.points = points;
        
        // Tiempo de vida basado en dificultad - Más tiempo para el modo clásico con 3 círculos
        const lifetime = Math.max(4000 - (this.difficulty * 300), 2000);
        
        // Eventos
        circle.addEventListener('click', (e) => this.hitCircle(e, circle));
        circle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.hitCircle(e, circle);
        });
        
        // Añadir al DOM
        this.gameArea.appendChild(circle);
        this.circles.push(circle);
        
        // Remover después del tiempo de vida
        setTimeout(() => {
            if (circle.parentNode && !circle.classList.contains('hit')) {
                this.missCircle(circle);
            }
        }, lifetime);
    }

    createVsCircle() {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        
        // Tamaño fijo para VS mode
        const size = 80;
        
        // Posición aleatoria (evitar bordes)
        const margin = size / 2 + 20;
        const maxX = window.innerWidth - margin * 2;
        const maxY = window.innerHeight - margin * 2 - 120; // Más espacio para la UI del VS
        
        const x = Math.random() * maxX + margin;
        const y = Math.random() * maxY + margin + 120;
        
        // Estilo del círculo
        const colors = [
            'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            'linear-gradient(45deg, #74b9ff, #0984e3)',
            'linear-gradient(45deg, #00b894, #00a085)',
            'linear-gradient(45deg, #fdcb6e, #e17055)',
            'linear-gradient(45deg, #fd79a8, #e84393)',
            'linear-gradient(45deg, #a29bfe, #6c5ce7)'
        ];
        
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.left = x + 'px';
        circle.style.top = y + 'px';
        circle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Puntos fijos para VS mode
        const points = 10;
        circle.textContent = points;
        circle.dataset.points = points;
        
        // Tiempo de vida más largo para VS mode
        const lifetime = 4000;
        
        // Eventos
        circle.addEventListener('click', (e) => this.hitVsCircle(e, circle, 'player'));
        circle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.hitVsCircle(e, circle, 'player');
        });
        
        // Añadir al DOM
        this.vsGameArea.appendChild(circle);
        this.circles.push(circle);
        
        // Remover después del tiempo de vida
        setTimeout(() => {
            if (circle.parentNode && !circle.classList.contains('hit')) {
                this.removeVsCircle(circle);
            }
        }, lifetime);
    }

    machineHitCircle(circle) {
        if (!circle || circle.classList.contains('hit') || circle.classList.contains('machine-circle')) {
            return;
        }
        
        // Marcar como círculo de la máquina
        circle.classList.add('machine-circle');
        circle.classList.add('hit');
        
        const points = parseInt(circle.dataset.points);
        this.machineScore += points;
        
        // Mostrar efecto visual
        this.showVsScorePopup(points, 
            parseInt(circle.style.left) + parseInt(circle.style.width) / 2, 
            parseInt(circle.style.top) + parseInt(circle.style.height) / 2, 
            'machine');
        
        this.updateVsUI();
        
        // Remover después de la animación
        setTimeout(() => {
            if (circle.parentNode) {
                this.vsGameArea.removeChild(circle);
                this.circles = this.circles.filter(c => c !== circle);
            }
        }, 300);
    }

    hitVsCircle(event, circle, player) {
        if (!this.gameRunning || circle.classList.contains('hit')) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        circle.classList.add('hit');
        
        const points = parseInt(circle.dataset.points);
        
        if (player === 'player') {
            this.playerScore += points;
            
            // Mostrar popup de puntuación
            this.showVsScorePopup(points, 
                event.clientX || event.touches[0].clientX, 
                event.clientY || event.touches[0].clientY, 
                'player');
        }
        
        this.updateVsUI();
        
        // Remover después de la animación
        setTimeout(() => {
            if (circle.parentNode) {
                this.vsGameArea.removeChild(circle);
                this.circles = this.circles.filter(c => c !== circle);
            }
        }, 300);
    }

    removeVsCircle(circle) {
        circle.classList.add('miss');
        
        // Remover después de la animación
        setTimeout(() => {
            if (circle.parentNode) {
                this.vsGameArea.removeChild(circle);
                this.circles = this.circles.filter(c => c !== circle);
            }
        }, 500);
    }

    showVsScorePopup(points, x, y, player) {
        const popup = document.createElement('div');
        popup.classList.add('score-popup');
        popup.textContent = '+' + points;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        
        if (player === 'machine') {
            popup.style.color = '#ff6b6b';
            popup.textContent = '🤖 +' + points;
        }
        
        this.vsGameArea.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                this.vsGameArea.removeChild(popup);
            }
        }, 1000);
    }

    hitCircle(event, circle) {
        if (!this.gameRunning || circle.classList.contains('hit')) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        circle.classList.add('hit');
        
        const points = parseInt(circle.dataset.points);
        this.score += points;
        
        // Mostrar popup de puntuación
        this.showScorePopup(points, event.clientX || event.touches[0].clientX, 
                           event.clientY || event.touches[0].clientY);
        
        // Actualizar UI según el modo
        if (this.gameMode === 'classic') {
            this.updateUI();
        } else {
            this.updateVsUI();
        }
        
        // Remover después de la animación
        setTimeout(() => {
            if (circle.parentNode) {
                this.gameArea.removeChild(circle);
                this.circles = this.circles.filter(c => c !== circle);
            }
        }, 300);
        
        // No crear círculos manualmente aquí - dejarlo al sistema de mantenimiento
    }

    missCircle(circle) {
        circle.classList.add('miss');
        
        // Solo quitar vidas en modo clásico
        if (this.gameMode === 'classic') {
            this.lives--;
            this.updateUI();
            
            if (this.lives <= 0) {
                this.endGame();
                return; // Salir temprano si el juego terminó
            }
        }
        
        // Remover después de la animación
        setTimeout(() => {
            if (circle.parentNode) {
                this.gameArea.removeChild(circle);
                this.circles = this.circles.filter(c => c !== circle);
            }
        }, 500);
        
        // No crear círculos manualmente aquí - dejarlo al sistema de mantenimiento
    }

    showScorePopup(points, x, y) {
        const popup = document.createElement('div');
        popup.classList.add('score-popup');
        popup.textContent = '+' + points;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        
        this.gameArea.appendChild(popup);
        
        setTimeout(() => {
            if (popup.parentNode) {
                this.gameArea.removeChild(popup);
            }
        }, 1000);
    }

    updateClassicUI() {
        this.scoreElement.textContent = this.score;
        this.timeElement.textContent = this.timeLeft;
        this.livesElement.textContent = this.lives;
    }

    updateVsUI() {
        this.playerScoreElement.textContent = this.playerScore;
        this.machineScoreElement.textContent = this.machineScore;
        this.vsTimeElement.textContent = this.vsTimeLeft;
    }

    clearVsGameArea() {
        this.circles.forEach(circle => {
            if (circle.parentNode) {
                this.vsGameArea.removeChild(circle);
            }
        });
        this.circles = [];
        
        // Limpiar popups también
        const popups = this.vsGameArea.querySelectorAll('.score-popup');
        popups.forEach(popup => popup.remove());
    }

    endVsGame() {
        this.gameRunning = false;
        
        // Limpiar timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
        
        if (this.machineTimer) {
            clearTimeout(this.machineTimer);
            this.machineTimer = null;
        }
        
        // Limpiar círculos restantes
        this.clearVsGameArea();
        
        // Mostrar pantalla de resultado
        setTimeout(() => {
            this.showVsResultScreen();
        }, 500);
    }

    updateUI() {
        this.scoreElement.textContent = this.score;
        this.timeElement.textContent = this.timeLeft;
        this.livesElement.textContent = this.lives;
    }

    clearGameArea() {
        // Limpiar todos los círculos
        this.circles.forEach(circle => {
            if (circle.parentNode) {
                circle.parentNode.removeChild(circle);
            }
        });
        this.circles = [];
        
        // Limpiar popups también
        const gameArea = this.gameMode === 'classic' ? this.gameArea : this.vsGameArea;
        const popups = gameArea.querySelectorAll('.score-popup');
        popups.forEach(popup => popup.remove());
        
        // Limpiar cualquier círculo suelto que pueda haber quedado
        const allCircles = gameArea.querySelectorAll('.circle');
        allCircles.forEach(circle => circle.remove());
    }

    endGame() {
        this.gameRunning = false;
        
        // Limpiar timers
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.spawnTimer) {
            clearTimeout(this.spawnTimer);
            this.spawnTimer = null;
        }
        
        // Limpiar círculos restantes
        this.clearGameArea();
        
        // Mostrar pantalla de game over
        setTimeout(() => {
            this.showGameOverScreen();
        }, 500);
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    const game = new CircleTapGame();
    
    // Registrar service worker si está disponible (para PWA)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {
            // Service worker no disponible, continuar sin él
        });
    }
});

// Prevenir el zoom con pellizco en iOS
document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

// Mantener la orientación y evitar scroll
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

// Prevenir el scroll
document.body.addEventListener('touchstart', (e) => {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchend', (e) => {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });

document.body.addEventListener('touchmove', (e) => {
    if (e.target === document.body) {
        e.preventDefault();
    }
}, { passive: false });
