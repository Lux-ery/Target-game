/**
 * Circle Tap Game - Versión Estructurada
 * Juego móvil con modo clásico y competencia VS máquina
 */

// ============================================================================
// CONFIGURACIONES Y CONSTANTES
// ============================================================================

const GAME_CONFIG = {
    CLASSIC: {
        TIME_LIMIT: 30,
        MAX_CIRCLES: 3,
        DIFFICULTY_INCREASE_INTERVAL: 10,
        DIFFICULTY_MULTIPLIER: 0.3,
        CIRCLE_LIFETIME_BASE: 4000,
        CIRCLE_LIFETIME_REDUCTION: 300,
        CIRCLE_LIFETIME_MIN: 2000,
        MAINTENANCE_INTERVAL: 200
    },
    VS_MACHINE: {
        TIME_LIMIT: 60,
        CIRCLE_SIZE: 80,
        CIRCLE_POINTS: 10,
        CIRCLE_LIFETIME: 4000,
        SPAWN_RATE: 800,
        MACHINE_DELAY: 2000
    },
    CIRCLE: {
        MIN_SIZE_BASE: 60,
        MAX_SIZE_BASE: 100,
        SIZE_DIFFICULTY_REDUCTION: 5,
        MAX_SIZE_DIFFICULTY_REDUCTION: 3,
        MIN_SIZE_LIMIT: 40,
        MAX_SIZE_LIMIT: 70,
        MARGIN_MULTIPLIER: 0.5,
        BASE_MARGIN: 20
    },
    COLORS: [
        'linear-gradient(45deg, #ff6b6b, #ee5a24)',
        'linear-gradient(45deg, #74b9ff, #0984e3)',
        'linear-gradient(45deg, #00b894, #00a085)',
        'linear-gradient(45deg, #fdcb6e, #e17055)',
        'linear-gradient(45deg, #fd79a8, #e84393)',
        'linear-gradient(45deg, #a29bfe, #6c5ce7)'
    ],
    DIFFICULTY_NAMES: {
        1: "🟢 Fácil",
        2: "🟡 Medio", 
        3: "🟠 Difícil",
        5: "🔴 Extremo"
    }
};

// ============================================================================
// CLASE DE UTILIDADES
// ============================================================================

class GameUtils {
    static generateRandomPosition(size, excludeUI = 100) {
        const margin = size * GAME_CONFIG.CIRCLE.MARGIN_MULTIPLIER + GAME_CONFIG.CIRCLE.BASE_MARGIN;
        const maxX = window.innerWidth - margin * 2;
        const maxY = window.innerHeight - margin * 2 - excludeUI;
        
        return {
            x: Math.random() * maxX + margin,
            y: Math.random() * maxY + margin + excludeUI
        };
    }

    static calculateCirclePoints(size) {
        return Math.round((100 - size) / 10) + 1;
    }

    static getRandomColor() {
        return GAME_CONFIG.COLORS[Math.floor(Math.random() * GAME_CONFIG.COLORS.length)];
    }

    static safeRemoveElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    static preventDefaultTouch(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// ============================================================================
// CLASE DE GESTIÓN DE PANTALLAS
// ============================================================================

class ScreenManager {
    constructor(elements) {
        this.screens = {
            start: elements.startScreen,
            difficulty: elements.difficultyScreen,
            game: elements.gameScreen,
            vsGame: elements.vsGameScreen,
            gameOver: elements.gameOverScreen,
            vsResult: elements.vsResultScreen
        };
    }

    showScreen(screenName) {
        try {
            Object.values(this.screens).forEach(screen => {
                if (screen) screen.classList.add('hidden');
            });
            
            if (this.screens[screenName]) {
                this.screens[screenName].classList.remove('hidden');
            }
        } catch (error) {
            console.error('Error mostrando pantalla:', error);
        }
    }

    hideAllScreens() {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.add('hidden');
        });
    }
}

// ============================================================================
// CLASE DE GESTIÓN DE CÍRCULOS
// ============================================================================

class CircleManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.circles = [];
    }

    createClassicCircle() {
        try {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            
            // Calcular tamaño basado en dificultad
            const minSize = Math.max(
                GAME_CONFIG.CIRCLE.MIN_SIZE_BASE - (this.game.difficulty * GAME_CONFIG.CIRCLE.SIZE_DIFFICULTY_REDUCTION),
                GAME_CONFIG.CIRCLE.MIN_SIZE_LIMIT
            );
            const maxSize = Math.max(
                GAME_CONFIG.CIRCLE.MAX_SIZE_BASE - (this.game.difficulty * GAME_CONFIG.CIRCLE.MAX_SIZE_DIFFICULTY_REDUCTION),
                GAME_CONFIG.CIRCLE.MAX_SIZE_LIMIT
            );
            const size = Math.random() * (maxSize - minSize) + minSize;
            
            // Posición y estilo
            const position = GameUtils.generateRandomPosition(size, 100);
            this.setupCircleStyle(circle, size, position);
            
            // Puntos y eventos
            const points = GameUtils.calculateCirclePoints(size);
            circle.textContent = points;
            circle.dataset.points = points;
            circle.dataset.mode = 'classic';
            
            this.attachClassicEvents(circle);
            
            // Añadir al DOM y lista
            this.game.elements.gameArea.appendChild(circle);
            this.circles.push(circle);
            
            // Programar eliminación automática
            const lifetime = Math.max(
                GAME_CONFIG.CLASSIC.CIRCLE_LIFETIME_BASE - (this.game.difficulty * GAME_CONFIG.CLASSIC.CIRCLE_LIFETIME_REDUCTION),
                GAME_CONFIG.CLASSIC.CIRCLE_LIFETIME_MIN
            );
            
            setTimeout(() => this.autoRemoveCircle(circle), lifetime);
            
            return circle;
        } catch (error) {
            console.error('Error creando círculo clásico:', error);
            return null;
        }
    }

    createVsCircle() {
        try {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            
            const size = GAME_CONFIG.VS_MACHINE.CIRCLE_SIZE;
            const position = GameUtils.generateRandomPosition(size, 120);
            
            this.setupCircleStyle(circle, size, position);
            
            circle.textContent = GAME_CONFIG.VS_MACHINE.CIRCLE_POINTS;
            circle.dataset.points = GAME_CONFIG.VS_MACHINE.CIRCLE_POINTS;
            circle.dataset.mode = 'vs';
            
            this.attachVsEvents(circle);
            
            this.game.elements.vsGameArea.appendChild(circle);
            this.circles.push(circle);
            
            setTimeout(() => this.autoRemoveVsCircle(circle), GAME_CONFIG.VS_MACHINE.CIRCLE_LIFETIME);
            
            return circle;
        } catch (error) {
            console.error('Error creando círculo VS:', error);
            return null;
        }
    }

    setupCircleStyle(circle, size, position) {
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.left = position.x + 'px';
        circle.style.top = position.y + 'px';
        circle.style.background = GameUtils.getRandomColor();
    }

    attachClassicEvents(circle) {
        const clickHandler = (e) => this.game.handleCircleHit(e, circle);
        
        circle.addEventListener('click', clickHandler);
        circle.addEventListener('touchstart', (e) => {
            GameUtils.preventDefaultTouch(e);
            clickHandler(e);
        });
    }

    attachVsEvents(circle) {
        const clickHandler = (e) => this.game.handleVsCircleHit(e, circle, 'player');
        
        circle.addEventListener('click', clickHandler);
        circle.addEventListener('touchstart', (e) => {
            GameUtils.preventDefaultTouch(e);
            clickHandler(e);
        });
    }

    autoRemoveCircle(circle) {
        if (circle.parentNode && !circle.classList.contains('hit')) {
            this.removeCircle(circle, true);
        }
    }

    autoRemoveVsCircle(circle) {
        if (circle.parentNode && !circle.classList.contains('hit')) {
            this.removeCircle(circle, false, true);
        }
    }

    removeCircle(circle, isMiss = false, isVs = false) {
        try {
            if (isMiss) {
                circle.classList.add('miss');
            }
            
            const delay = isMiss ? 500 : 300;
            
            setTimeout(() => {
                GameUtils.safeRemoveElement(circle);
                this.circles = this.circles.filter(c => c !== circle);
            }, delay);
        } catch (error) {
            console.error('Error removiendo círculo:', error);
        }
    }

    hitCircle(circle) {
        if (circle.classList.contains('hit')) return false;
        
        circle.classList.add('hit');
        return true;
    }

    machineHitCircle(circle) {
        if (!circle || circle.classList.contains('hit') || circle.classList.contains('machine-circle')) {
            return false;
        }
        
        circle.classList.add('machine-circle', 'hit');
        return true;
    }

    getActiveCircles(mode = 'classic') {
        return this.circles.filter(circle => 
            circle.parentNode && 
            !circle.classList.contains('hit') && 
            !circle.classList.contains('miss') &&
            circle.dataset.mode === mode
        );
    }

    getAvailableVsCircles() {
        return this.circles.filter(circle => 
            !circle.classList.contains('hit') && 
            !circle.classList.contains('machine-circle') &&
            circle.dataset.mode === 'vs'
        );
    }

    clearAll() {
        try {
            this.circles.forEach(circle => GameUtils.safeRemoveElement(circle));
            this.circles = [];
            
            // Limpiar popups residuales
            [this.game.elements.gameArea, this.game.elements.vsGameArea].forEach(area => {
                if (area) {
                    const popups = area.querySelectorAll('.score-popup');
                    popups.forEach(popup => popup.remove());
                    
                    const circles = area.querySelectorAll('.circle');
                    circles.forEach(circle => circle.remove());
                }
            });
        } catch (error) {
            console.error('Error limpiando círculos:', error);
        }
    }
}

// ============================================================================
// CLASE DE GESTIÓN DE TIMERS
// ============================================================================

class TimerManager {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.timers = new Map();
    }

    startTimer(name, callback, interval, immediate = false) {
        this.clearTimer(name);
        
        if (immediate) callback();
        
        const timer = setInterval(callback, interval);
        this.timers.set(name, timer);
        
        return timer;
    }

    startTimeout(name, callback, delay) {
        this.clearTimer(name);
        
        const timer = setTimeout(() => {
            callback();
            this.timers.delete(name);
        }, delay);
        
        this.timers.set(name, timer);
        
        return timer;
    }

    clearTimer(name) {
        if (this.timers.has(name)) {
            const timer = this.timers.get(name);
            clearInterval(timer);
            clearTimeout(timer);
            this.timers.delete(name);
        }
    }

    clearAllTimers() {
        this.timers.forEach((timer, name) => {
            clearInterval(timer);
            clearTimeout(timer);
        });
        this.timers.clear();
    }

    hasTimer(name) {
        return this.timers.has(name);
    }
}

// ============================================================================
// CLASE DE GESTIÓN DE UI
// ============================================================================

class UIManager {
    constructor(elements) {
        this.elements = elements;
    }

    updateClassicUI(score, timeLeft) {
        try {
            if (this.elements.scoreElement) {
                this.elements.scoreElement.textContent = score;
            }
            if (this.elements.timeElement) {
                this.elements.timeElement.textContent = timeLeft;
            }
        } catch (error) {
            console.error('Error actualizando UI clásica:', error);
        }
    }

    updateVsUI(playerScore, machineScore, timeLeft) {
        try {
            if (this.elements.playerScoreElement) {
                this.elements.playerScoreElement.textContent = playerScore;
            }
            if (this.elements.machineScoreElement) {
                this.elements.machineScoreElement.textContent = machineScore;
            }
            if (this.elements.vsTimeElement) {
                this.elements.vsTimeElement.textContent = timeLeft;
            }
        } catch (error) {
            console.error('Error actualizando UI VS:', error);
        }
    }

    showScorePopup(points, x, y, container, isPlayer = true) {
        try {
            const popup = document.createElement('div');
            popup.classList.add('score-popup');
            popup.style.left = x + 'px';
            popup.style.top = y + 'px';
            
            if (isPlayer) {
                popup.textContent = '+' + points;
            } else {
                popup.style.color = '#ff6b6b';
                popup.textContent = '🤖 +' + points;
            }
            
            container.appendChild(popup);
            
            setTimeout(() => GameUtils.safeRemoveElement(popup), 1000);
        } catch (error) {
            console.error('Error mostrando popup de puntuación:', error);
        }
    }

    showFinalScore(score) {
        try {
            if (this.elements.finalScoreElement) {
                this.elements.finalScoreElement.textContent = score;
            }
        } catch (error) {
            console.error('Error mostrando puntuación final:', error);
        }
    }

    showVsResult(playerScore, machineScore) {
        try {
            if (this.elements.playerFinalScoreElement) {
                this.elements.playerFinalScoreElement.textContent = playerScore;
            }
            if (this.elements.machineFinalScoreElement) {
                this.elements.machineFinalScoreElement.textContent = machineScore;
            }
            
            let resultTitle, resultMessage, messageClass;
            
            if (playerScore > machineScore) {
                resultTitle = "🎉 ¡VICTORIA!";
                resultMessage = "¡Excelente! ¡Has derrotado a la máquina!";
                messageClass = "win-message";
            } else if (playerScore < machineScore) {
                resultTitle = "😔 Derrota";
                resultMessage = "La máquina fue más rápida esta vez. ¡Inténtalo de nuevo!";
                messageClass = "lose-message";
            } else {
                resultTitle = "🤝 ¡Empate!";
                resultMessage = "¡Increíble! Empataste con la máquina.";
                messageClass = "tie-message";
            }
            
            if (this.elements.vsResultTitleElement) {
                this.elements.vsResultTitleElement.textContent = resultTitle;
            }
            if (this.elements.vsResultMessageElement) {
                this.elements.vsResultMessageElement.textContent = resultMessage;
                this.elements.vsResultMessageElement.className = messageClass;
            }
        } catch (error) {
            console.error('Error mostrando resultado VS:', error);
        }
    }

    setupVsDifficulty(difficulty) {
        try {
            const difficultyName = GAME_CONFIG.DIFFICULTY_NAMES[difficulty];
            
            if (this.elements.difficultyNameElement) {
                this.elements.difficultyNameElement.textContent = difficultyName;
            }
            if (this.elements.difficultyRateElement) {
                this.elements.difficultyRateElement.textContent = `${difficulty} bps`;
            }
        } catch (error) {
            console.error('Error configurando dificultad VS:', error);
        }
    }
}

// ============================================================================
// CLASE PRINCIPAL DEL JUEGO
// ============================================================================

class CircleTapGame {
    constructor() {
        // Estado del juego
        this.gameState = {
            mode: 'classic',
            running: false,
            score: 0,
            timeLeft: GAME_CONFIG.CLASSIC.TIME_LIMIT,
            difficulty: 1,
            playerScore: 0,
            machineScore: 0,
            machineDifficulty: 1,
            vsTimeLeft: GAME_CONFIG.VS_MACHINE.TIME_LIMIT
        };
        
        // Inicialización
        this.initializeElements();
        this.initializeManagers();
        this.bindEvents();
        this.setupTouchHandling();
    }

    initializeElements() {
        this.elements = {
            // Pantallas
            startScreen: document.getElementById('start-screen'),
            difficultyScreen: document.getElementById('difficulty-screen'),
            gameScreen: document.getElementById('game-screen'),
            vsGameScreen: document.getElementById('vs-game-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            vsResultScreen: document.getElementById('vs-result-screen'),
            
            // Botones principales
            classicBtn: document.getElementById('classic-btn'),
            vsMachineBtn: document.getElementById('vs-machine-btn'),
            backBtn: document.getElementById('back-btn'),
            restartBtn: document.getElementById('restart-btn'),
            menuBtn: document.getElementById('menu-btn'),
            vsRestartBtn: document.getElementById('vs-restart-btn'),
            vsMenuBtn: document.getElementById('vs-menu-btn'),
            
            // Botones de dificultad
            difficultyBtns: document.querySelectorAll('.difficulty-btn'),
            
            // UI elementos
            scoreElement: document.getElementById('score'),
            timeElement: document.getElementById('time'),
            finalScoreElement: document.getElementById('final-score'),
            gameArea: document.getElementById('game-area'),
            playerScoreElement: document.getElementById('player-score'),
            machineScoreElement: document.getElementById('machine-score'),
            vsTimeElement: document.getElementById('vs-time'),
            difficultyNameElement: document.getElementById('difficulty-name'),
            difficultyRateElement: document.getElementById('difficulty-rate'),
            vsGameArea: document.getElementById('vs-game-area'),
            playerFinalScoreElement: document.getElementById('player-final-score'),
            machineFinalScoreElement: document.getElementById('machine-final-score'),
            vsResultTitleElement: document.getElementById('vs-result-title'),
            vsResultMessageElement: document.getElementById('vs-result-message')
        };
    }

    initializeManagers() {
        this.screenManager = new ScreenManager(this.elements);
        this.circleManager = new CircleManager(this);
        this.timerManager = new TimerManager(this);
        this.uiManager = new UIManager(this.elements);
    }

    bindEvents() {
        try {
            // Eventos principales
            this.elements.classicBtn?.addEventListener('click', () => this.startClassicGame());
            this.elements.vsMachineBtn?.addEventListener('click', () => this.showDifficultyScreen());
            this.elements.backBtn?.addEventListener('click', () => this.showStartScreen());
            this.elements.restartBtn?.addEventListener('click', () => this.startClassicGame());
            this.elements.menuBtn?.addEventListener('click', () => this.showStartScreen());
            this.elements.vsRestartBtn?.addEventListener('click', () => this.restartVsGame());
            this.elements.vsMenuBtn?.addEventListener('click', () => this.showStartScreen());
            
            // Botones de dificultad
            this.elements.difficultyBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const difficulty = parseInt(btn.dataset.difficulty);
                    this.startVsMachineGame(difficulty);
                });
            });
        } catch (error) {
            console.error('Error configurando eventos:', error);
        }
    }

    setupTouchHandling() {
        const touchOptions = { passive: false };
        
        document.addEventListener('touchstart', GameUtils.preventDefaultTouch, touchOptions);
        document.addEventListener('touchmove', GameUtils.preventDefaultTouch, touchOptions);
        
        // Prevenir zoom en iOS
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        
        // Mantener orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => window.scrollTo(0, 0), 100);
        });
        
        // Prevenir scroll en body
        ['touchstart', 'touchend', 'touchmove'].forEach(event => {
            document.body.addEventListener(event, (e) => {
                if (e.target === document.body) {
                    e.preventDefault();
                }
            }, touchOptions);
        });
    }

    // ========================================================================
    // MÉTODOS DE NAVEGACIÓN
    // ========================================================================

    showStartScreen() {
        this.screenManager.showScreen('start');
    }

    showDifficultyScreen() {
        this.screenManager.showScreen('difficulty');
    }

    showGameScreen() {
        this.screenManager.showScreen('game');
    }

    showVsGameScreen() {
        this.screenManager.showScreen('vsGame');
    }

    showGameOverScreen() {
        this.uiManager.showFinalScore(this.gameState.score);
        this.screenManager.showScreen('gameOver');
    }

    showVsResultScreen() {
        this.uiManager.showVsResult(this.gameState.playerScore, this.gameState.machineScore);
        this.screenManager.showScreen('vsResult');
    }

    // ========================================================================
    // MÉTODOS DE INICIO DE JUEGO
    // ========================================================================

    startClassicGame() {
        this.resetGameState('classic');
        this.showGameScreen();
        this.circleManager.clearAll();
        
        this.startClassicTimers();
        this.startCircleMaintenance();
    }

    startVsMachineGame(difficulty) {
        this.resetGameState('vs-machine', difficulty);
        this.uiManager.setupVsDifficulty(difficulty);
        this.showVsGameScreen();
        this.circleManager.clearAll();
        
        this.startVsTimers();
        this.startVsSpawning();
        this.startMachineAI();
    }

    restartVsGame() {
        this.startVsMachineGame(this.gameState.machineDifficulty);
    }

    resetGameState(mode, difficulty = 1) {
        this.gameState.mode = mode;
        this.gameState.running = true;
        this.gameState.difficulty = 1;
        
        if (mode === 'classic') {
            this.gameState.score = 0;
            this.gameState.timeLeft = GAME_CONFIG.CLASSIC.TIME_LIMIT;
        } else {
            this.gameState.playerScore = 0;
            this.gameState.machineScore = 0;
            this.gameState.machineDifficulty = difficulty;
            this.gameState.vsTimeLeft = GAME_CONFIG.VS_MACHINE.TIME_LIMIT;
        }
    }

    // ========================================================================
    // MÉTODOS DE TIMERS
    // ========================================================================

    startClassicTimers() {
        this.timerManager.startTimer('gameTimer', () => {
            if (!this.gameState.running) return;
            
            this.gameState.timeLeft--;
            this.uiManager.updateClassicUI(this.gameState.score, this.gameState.timeLeft);
            
            if (this.gameState.timeLeft <= 0) {
                this.endGame();
                return;
            }
            
            // Aumentar dificultad
            if (this.gameState.timeLeft % GAME_CONFIG.CLASSIC.DIFFICULTY_INCREASE_INTERVAL === 0 && 
                this.gameState.timeLeft < GAME_CONFIG.CLASSIC.TIME_LIMIT) {
                this.gameState.difficulty += GAME_CONFIG.CLASSIC.DIFFICULTY_MULTIPLIER;
            }
        }, 1000);
    }

    startVsTimers() {
        this.timerManager.startTimer('vsTimer', () => {
            if (!this.gameState.running) return;
            
            this.gameState.vsTimeLeft--;
            this.uiManager.updateVsUI(
                this.gameState.playerScore, 
                this.gameState.machineScore, 
                this.gameState.vsTimeLeft
            );
            
            if (this.gameState.vsTimeLeft <= 0) {
                this.endVsGame();
            }
        }, 1000);
    }

    startCircleMaintenance() {
        this.timerManager.startTimer('maintenance', () => {
            if (!this.gameState.running || this.gameState.mode !== 'classic') return;
            
            const activeCircles = this.circleManager.getActiveCircles('classic');
            const needed = GAME_CONFIG.CLASSIC.MAX_CIRCLES - activeCircles.length;
            
            for (let i = 0; i < needed; i++) {
                this.circleManager.createClassicCircle();
            }
        }, GAME_CONFIG.CLASSIC.MAINTENANCE_INTERVAL, true);
    }

    startVsSpawning() {
        const spawnCircle = () => {
            if (!this.gameState.running) return;
            
            this.circleManager.createVsCircle();
            this.timerManager.startTimeout('vsSpawn', spawnCircle, GAME_CONFIG.VS_MACHINE.SPAWN_RATE);
        };
        
        spawnCircle();
    }

    startMachineAI() {
        const machineInterval = 1000 / this.gameState.machineDifficulty;
        
        const machineAction = () => {
            if (!this.gameState.running) return;
            
            const availableCircles = this.circleManager.getAvailableVsCircles();
            
            if (availableCircles.length > 0) {
                const randomCircle = availableCircles[Math.floor(Math.random() * availableCircles.length)];
                this.handleMachineHit(randomCircle);
            }
            
            this.timerManager.startTimeout('machineAI', machineAction, machineInterval);
        };
        
        this.timerManager.startTimeout('machineStart', () => {
            if (this.gameState.running) {
                machineAction();
            }
        }, GAME_CONFIG.VS_MACHINE.MACHINE_DELAY);
    }

    // ========================================================================
    // MÉTODOS DE MANEJO DE EVENTOS
    // ========================================================================

    handleCircleHit(event, circle) {
        if (!this.gameState.running || !this.circleManager.hitCircle(circle)) return;
        
        GameUtils.preventDefaultTouch(event);
        
        const points = parseInt(circle.dataset.points);
        this.gameState.score += points;
        
        this.uiManager.showScorePopup(
            points,
            event.clientX || event.touches?.[0]?.clientX || 0,
            event.clientY || event.touches?.[0]?.clientY || 0,
            this.elements.gameArea
        );
        
        this.uiManager.updateClassicUI(this.gameState.score, this.gameState.timeLeft);
        this.circleManager.removeCircle(circle);
    }

    handleVsCircleHit(event, circle, player) {
        if (!this.gameState.running || !this.circleManager.hitCircle(circle)) return;
        
        GameUtils.preventDefaultTouch(event);
        
        const points = parseInt(circle.dataset.points);
        
        if (player === 'player') {
            this.gameState.playerScore += points;
            
            this.uiManager.showScorePopup(
                points,
                event.clientX || event.touches?.[0]?.clientX || 0,
                event.clientY || event.touches?.[0]?.clientY || 0,
                this.elements.vsGameArea,
                true
            );
        }
        
        this.uiManager.updateVsUI(
            this.gameState.playerScore, 
            this.gameState.machineScore, 
            this.gameState.vsTimeLeft
        );
        
        this.circleManager.removeCircle(circle);
    }

    handleMachineHit(circle) {
        if (!this.circleManager.machineHitCircle(circle)) return;
        
        const points = parseInt(circle.dataset.points);
        this.gameState.machineScore += points;
        
        const circleRect = circle.getBoundingClientRect();
        this.uiManager.showScorePopup(
            points,
            circleRect.left + circleRect.width / 2,
            circleRect.top + circleRect.height / 2,
            this.elements.vsGameArea,
            false
        );
        
        this.uiManager.updateVsUI(
            this.gameState.playerScore, 
            this.gameState.machineScore, 
            this.gameState.vsTimeLeft
        );
        
        this.circleManager.removeCircle(circle);
    }

    // ========================================================================
    // MÉTODOS DE FINALIZACIÓN
    // ========================================================================

    endGame() {
        this.gameState.running = false;
        this.timerManager.clearAllTimers();
        this.circleManager.clearAll();
        
        setTimeout(() => this.showGameOverScreen(), 500);
    }

    endVsGame() {
        this.gameState.running = false;
        this.timerManager.clearAllTimers();
        this.circleManager.clearAll();
        
        setTimeout(() => this.showVsResultScreen(), 500);
    }
}

// ============================================================================
// INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
// ============================================================================

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new CircleTapGame();
        
        // Registrar service worker si está disponible
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {
                console.log('Service worker no disponible');
            });
        }
        
        // Hacer el juego accesible globalmente para debugging
        window.CircleTapGame = game;
        
    } catch (error) {
        console.error('Error inicializando el juego:', error);
    }
});

// Manejo global de errores
window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rechazada:', event.reason);
});
