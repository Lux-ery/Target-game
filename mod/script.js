/**
 * Circle Tap Game - Versión con Sistema de Usuarios
 * Juego móvil con modo clásico y competencia VS máquina
 */

// ============================================================================
// SISTEMA DE AUTENTICACIÓN
// ============================================================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.isRegisterMode = false;
        this.loadCurrentUser(); // Cargar usuario actual si existe
    }

    loadUsers() {
        const users = localStorage.getItem('circleTapUsers');
        return users ? JSON.parse(users) : {};
    }

    loadCurrentUser() {
        const savedUser = localStorage.getItem('circleTapCurrentUser');
        if (savedUser && this.users[savedUser]) {
            this.currentUser = savedUser;
            return true; // Usuario cargado exitosamente
        }
        return false; // No hay usuario guardado o el usuario no existe
    }

    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('circleTapCurrentUser', this.currentUser);
        } else {
            localStorage.removeItem('circleTapCurrentUser');
        }
    }

    saveUsers() {
        localStorage.setItem('circleTapUsers', JSON.stringify(this.users));
    }

    login(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Por favor, ingresa usuario y contraseña' };
        }

        if (!this.users[username]) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        if (this.users[username].password !== password) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        this.currentUser = username;
        this.saveCurrentUser(); // Guardar usuario para próximas sesiones
        return { success: true, message: 'Bienvenido!' };
    }

    register(username, password) {
        if (!username || !password) {
            return { success: false, message: 'Por favor, ingresa usuario y contraseña' };
        }

        if (this.users[username]) {
            return { success: false, message: 'El usuario ya existe' };
        }

        if (username.length < 3) {
            return { success: false, message: 'El usuario debe tener al menos 3 caracteres' };
        }

        if (password.length < 4) {
            return { success: false, message: 'La contraseña debe tener al menos 4 caracteres' };
        }

        this.users[username] = {
            password: password,
            createdAt: new Date().toISOString()
        };

        this.saveUsers();
        this.currentUser = username;
        this.saveCurrentUser(); // Guardar usuario para próximas sesiones
        return { success: true, message: 'Usuario creado exitosamente!' };
    }

    logout() {
        this.currentUser = null;
        this.saveCurrentUser(); // Limpiar usuario guardado
    }

    getCurrentUser() {
        return this.currentUser;
    }

    toggleRegisterMode() {
        this.isRegisterMode = !this.isRegisterMode;
        return this.isRegisterMode;
    }
}

// ============================================================================
// CONFIGURACIONES Y CONSTANTES
// ============================================================================

const GAME_CONFIG = {
    CLASSIC: {
        TIME_LIMIT: 30,
        MAX_CIRCLES: 3,
        DIFFICULTY_INCREASE_INTERVAL: 10,
        DIFFICULTY_MULTIPLIER: 0.3,
        CIRCLE_LIFETIME_BASE: 5000,        // Aumentado de 4000 a 5000ms
        CIRCLE_LIFETIME_REDUCTION: 200,    // Reducido de 300 a 200ms
        CIRCLE_LIFETIME_MIN: 3000,         // Aumentado de 2000 a 3000ms
        MAINTENANCE_INTERVAL: 500          // Aumentado de 200 a 500ms
    },
    VS_MACHINE: {
        TIME_LIMIT: 60,
        CIRCLE_SIZE: 80,
        CIRCLE_POINTS: 10,
        CIRCLE_LIFETIME: 3500,         // Reducido de 4000 a 3500ms (círculos duran menos)
        SPAWN_RATE: 600,               // Reducido de 800 a 600ms (aparecen más rápido)
        MACHINE_DELAY: 2000,           // Reducido de 3000 a 2000ms (empieza más rápido)
        MACHINE_REACTION_TIME: {       // Tiempos más rápidos y desafiantes
            1: 1800,  // Fácil: 1.8 segundos (era 4s) - Más rápido
            2: 1200,  // Medio: 1.2 segundos (era 2.5s) - Mucho más rápido
            3: 800,   // Difícil: 0.8 segundos (era 1.5s) - Muy rápido
            5: 400    // Extremo: 0.4 segundos (era 0.6s) - Extremadamente rápido
        },
        MACHINE_ACCURACY: {            // Mucho más precisa
            1: 0.15,  // Fácil: 15% de fallar (era 50%) - Mucho más precisa
            2: 0.08,  // Medio: 8% de fallar (era 30%) - Muy precisa
            3: 0.04,  // Difícil: 4% de fallar (era 15%) - Extremadamente precisa
            5: 0.01   // Extremo: 1% de fallar (era 2%) - Casi perfecta
        },
        CURSOR_MOVE_TIME: {            // Movimientos más rápidos
            1: 800,   // Fácil: Moderado (era 1500ms)
            2: 600,   // Medio: Rápido (era 1000ms)
            3: 400,   // Difícil: Muy rápido (era 700ms)
            5: 250    // Extremo: Súper rápido (era 400ms)
        },
        CURSOR_TARGET_TIME: {          // Apuntado más rápido
            1: 400,   // Fácil: Decide rápido (era 1000ms)
            2: 300,   // Medio: Decide muy rápido (era 700ms)
            3: 200,   // Difícil: Decide instantáneo (era 400ms)
            5: 100    // Extremo: Casi sin apuntar (era 200ms)
        }
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
        // Validar que size sea un número válido
        if (isNaN(size) || size <= 0) {
            console.warn('Tamaño de círculo inválido:', size, 'usando tamaño por defecto');
            size = 60; // Tamaño por defecto
        }
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
            login: elements.loginScreen,
            start: elements.startScreen,
            difficulty: elements.difficultyScreen,
            game: elements.gameScreen,
            vsGame: elements.vsGameScreen,
            gameOver: elements.gameOverScreen,
            vsResult: elements.vsResultScreen,
            records: elements.recordsScreen
        };
        
        // No mostrar ninguna pantalla automáticamente, 
        // checkAutoLogin decidirá cuál mostrar
        this.hideAllScreens();
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
        this.machineCursor = null;
        this.initMachineCursor();
    }

    initMachineCursor() {
        this.machineCursor = document.createElement('div');
        this.machineCursor.classList.add('machine-cursor');
        // Posición inicial en el centro de la pantalla
        this.machineCursor.style.left = (window.innerWidth / 2 - 20) + 'px';
        this.machineCursor.style.top = (window.innerHeight / 2 - 20) + 'px';
        // Inicialmente completamente oculto
        this.machineCursor.style.opacity = '0';
        this.machineCursor.style.display = 'none';
        document.body.appendChild(this.machineCursor);
    }

    showMachineCursor(x, y, targeting = false) {
        if (!this.machineCursor) return;
        
        // Asegurar que esté visible
        this.machineCursor.style.display = 'block';
        this.machineCursor.style.opacity = '1';
        
        this.machineCursor.style.left = (x - 20) + 'px';
        this.machineCursor.style.top = (y - 20) + 'px';
        this.machineCursor.classList.remove('idle');
        this.machineCursor.classList.add('active');
        
        if (targeting) {
            this.machineCursor.classList.add('targeting');
        } else {
            this.machineCursor.classList.remove('targeting');
        }
    }

    setMachineCursorIdle() {
        if (!this.machineCursor) return;
        
        // Solo poner en idle si está en modo VS
        if (this.machineCursor.style.display === 'block') {
            this.machineCursor.classList.remove('active', 'targeting');
            this.machineCursor.classList.add('idle');
            this.machineCursor.style.opacity = '0.5';
        }
    }

    hideMachineCursor() {
        if (!this.machineCursor) return;
        
        // Ya no ocultar completamente, solo poner en modo idle
        this.setMachineCursorIdle();
    }

    hideMachineCursorCompletely() {
        if (!this.machineCursor) return;
        
        this.machineCursor.style.opacity = '0';
        this.machineCursor.style.display = 'none';
        this.machineCursor.classList.remove('active', 'targeting', 'idle');
    }

    showMachineCursorForVsMode() {
        if (!this.machineCursor) return;
        
        this.machineCursor.style.display = 'block';
        this.machineCursor.style.opacity = '0.5';
        this.setMachineCursorIdle();
    }

    moveMachineCursorTo(targetX, targetY, duration = 800) {
        return new Promise((resolve) => {
            if (!this.machineCursor) {
                resolve();
                return;
            }

            const startX = parseInt(this.machineCursor.style.left) || 0;
            const startY = parseInt(this.machineCursor.style.top) || 0;
            const startTime = Date.now();

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function para movimiento más natural
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                const currentX = startX + (targetX - startX - 20) * easeProgress;
                const currentY = startY + (targetY - startY - 20) * easeProgress;
                
                this.machineCursor.style.left = currentX + 'px';
                this.machineCursor.style.top = currentY + 'px';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    createClassicCircle() {
        try {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            
            // Calcular tamaño basado en dificultad
            const currentDifficulty = this.game.difficulty || 1; // Asegurar que no sea undefined
            const minSize = Math.max(
                GAME_CONFIG.CIRCLE.MIN_SIZE_BASE - (currentDifficulty * GAME_CONFIG.CIRCLE.SIZE_DIFFICULTY_REDUCTION),
                GAME_CONFIG.CIRCLE.MIN_SIZE_LIMIT
            );
            const maxSize = Math.max(
                GAME_CONFIG.CIRCLE.MAX_SIZE_BASE - (currentDifficulty * GAME_CONFIG.CIRCLE.MAX_SIZE_DIFFICULTY_REDUCTION),
                GAME_CONFIG.CIRCLE.MAX_SIZE_LIMIT
            );
            const size = Math.random() * (maxSize - minSize) + minSize;
            
            // Posición y estilo
            const position = GameUtils.generateRandomPosition(size, 100);
            this.setupCircleStyle(circle, size, position);
            
            // Puntos y eventos
            const points = GameUtils.calculateCirclePoints(size);
            
            // Validar que los puntos sean válidos
            if (isNaN(points) || points <= 0) {
                console.error('Puntos calculados inválidos:', points, 'para tamaño:', size);
                circle.textContent = '1'; // Valor por defecto
                circle.dataset.points = '1';
            } else {
                circle.textContent = points;
                circle.dataset.points = points;
            }
            
            circle.dataset.mode = 'classic';
            
            this.attachClassicEvents(circle);
            
            // Añadir al DOM y lista
            this.game.elements.gameArea.appendChild(circle);
            this.circles.push(circle);
            
            // Programar eliminación automática
            const lifetimeDifficulty = this.game.difficulty || 1;
            const lifetime = Math.max(
                GAME_CONFIG.CLASSIC.CIRCLE_LIFETIME_BASE - (lifetimeDifficulty * GAME_CONFIG.CLASSIC.CIRCLE_LIFETIME_REDUCTION),
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
            
            // Solo poner en idle si está en modo VS, sino ocultar completamente
            if (this.game.gameState.mode === 'vs-machine') {
                this.setMachineCursorIdle();
            } else {
                this.hideMachineCursorCompletely();
            }
            
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
// CLASE DE GESTIÓN DE RÉCORDS
// ============================================================================

class RecordsManager {
    constructor(elements, authManager) {
        this.elements = elements;
        this.authManager = authManager;
        this.currentDifficulty = 'principiante';
        this.loadRecords();
        this.setupDifficultyTabs();
    }

    setupDifficultyTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remover clase active de todas las pestañas
                tabs.forEach(t => t.classList.remove('active'));
                // Añadir clase active a la pestaña clickeada
                tab.classList.add('active');
                // Cambiar dificultad actual
                this.currentDifficulty = tab.dataset.difficulty;
                // Actualizar vista
                this.updateRecordsDisplay();
            });
        });
    }

    loadRecords() {
        try {
            this.classicRecords = JSON.parse(localStorage.getItem('circletap_classic_records')) || [];
            this.vsRecords = JSON.parse(localStorage.getItem('circletap_vs_records')) || {
                principiante: [],
                intermedio: [],
                avanzado: [],
                experto: []
            };
            this.vsStats = JSON.parse(localStorage.getItem('circletap_vs_stats')) || {
                principiante: { wins: 0, losses: 0 },
                intermedio: { wins: 0, losses: 0 },
                avanzado: { wins: 0, losses: 0 },
                experto: { wins: 0, losses: 0 }
            };
        } catch (error) {
            console.error('Error cargando récords:', error);
            this.classicRecords = [];
            this.vsRecords = {
                principiante: [],
                intermedio: [],
                avanzado: [],
                experto: []
            };
            this.vsStats = {
                principiante: { wins: 0, losses: 0 },
                intermedio: { wins: 0, losses: 0 },
                avanzado: { wins: 0, losses: 0 },
                experto: { wins: 0, losses: 0 }
            };
        }
    }

    saveRecords() {
        try {
            localStorage.setItem('circletap_classic_records', JSON.stringify(this.classicRecords));
            localStorage.setItem('circletap_vs_records', JSON.stringify(this.vsRecords));
            localStorage.setItem('circletap_vs_stats', JSON.stringify(this.vsStats));
        } catch (error) {
            console.error('Error guardando récords:', error);
        }
    }

    addClassicRecord(score) {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return -1;

        const record = {
            score: score,
            user: currentUser,
            date: new Date().toLocaleDateString('es-ES'),
            timestamp: Date.now()
        };

        this.classicRecords.push(record);
        this.classicRecords.sort((a, b) => b.score - a.score);
        this.classicRecords = this.classicRecords.slice(0, 10);
        
        this.saveRecords();
        return this.classicRecords.findIndex(r => r.timestamp === record.timestamp) + 1;
    }

    addVsRecord(playerScore, machineScore, difficulty) {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return -1;

        const isWin = playerScore > machineScore;
        const record = {
            playerScore: playerScore,
            machineScore: machineScore,
            user: currentUser,
            isWin: isWin,
            date: new Date().toLocaleDateString('es-ES'),
            timestamp: Date.now()
        };

        // Convertir difficulty number a string
        const difficultyKey = this.getDifficultyKey(difficulty);

        // Actualizar estadísticas por dificultad
        if (!this.vsStats[difficultyKey]) {
            this.vsStats[difficultyKey] = { wins: 0, losses: 0 };
        }

        if (isWin) {
            this.vsStats[difficultyKey].wins++;
        } else {
            this.vsStats[difficultyKey].losses++;
        }

        // Añadir registro por dificultad
        if (!this.vsRecords[difficultyKey]) {
            this.vsRecords[difficultyKey] = [];
        }

        this.vsRecords[difficultyKey].push(record);
        this.vsRecords[difficultyKey].sort((a, b) => b.playerScore - a.playerScore);
        this.vsRecords[difficultyKey] = this.vsRecords[difficultyKey].slice(0, 10);

        this.saveRecords();
        return this.vsRecords[difficultyKey].findIndex(r => r.timestamp === record.timestamp) + 1;
    }

    getDifficultyKey(difficulty) {
        const difficultyMap = {
            1: 'principiante',
            2: 'intermedio',
            3: 'avanzado',
            5: 'experto'
        };
        return difficultyMap[difficulty] || 'principiante';
    }

    updateRecordsDisplay() {
        this.updateClassicRecords();
        this.updateVsRecords();
    }

    updateClassicRecords() {
        if (!this.elements.bestClassicScore || !this.elements.classicRecordsList) return;

        // Mejor puntuación clásica
        const bestClassic = this.classicRecords.length > 0 ? this.classicRecords[0].score : 0;
        this.elements.bestClassicScore.textContent = bestClassic;

        // Lista de récords clásicos
        this.elements.classicRecordsList.innerHTML = '';
        this.classicRecords.forEach((record, index) => {
            const recordElement = document.createElement('div');
            recordElement.className = 'record-item classic';
            recordElement.innerHTML = `
                <span>${index + 1}</span>
                <span>${record.user}</span>
                <span>${record.score}</span>
                <span></span>
            `;
            this.elements.classicRecordsList.appendChild(recordElement);
        });
    }

    updateVsRecords() {
        if (!this.elements.bestVsScore || !this.elements.vsRecordsList) return;

        const difficulty = this.currentDifficulty;
        const records = this.vsRecords[difficulty] || [];
        const stats = this.vsStats[difficulty] || { wins: 0, losses: 0 };

        // Mejor puntuación VS
        const bestVs = records.length > 0 ? records[0].playerScore : 0;
        this.elements.bestVsScore.textContent = bestVs;

        // Estadísticas
        if (this.elements.vsWins) this.elements.vsWins.textContent = stats.wins;
        if (this.elements.vsLosses) this.elements.vsLosses.textContent = stats.losses;
        
        const total = stats.wins + stats.losses;
        const winRate = total > 0 ? Math.round((stats.wins / total) * 100) : 0;
        if (this.elements.vsWinrate) this.elements.vsWinrate.textContent = `${winRate}%`;

        // Lista de récords VS
        this.elements.vsRecordsList.innerHTML = '';
        records.forEach((record, index) => {
            const recordElement = document.createElement('div');
            recordElement.className = 'record-item';
            recordElement.innerHTML = `
                <span>${index + 1}</span>
                <span>${record.user}</span>
                <span>${record.playerScore}</span>
                <span>${record.isWin ? '✅' : '❌'}</span>
            `;
            this.elements.vsRecordsList.appendChild(recordElement);
        });
    }

    clearAllRecords() {
        this.classicRecords = [];
        this.vsRecords = {
            principiante: [],
            intermedio: [],
            avanzado: [],
            experto: []
        };
        this.vsStats = {
            principiante: { wins: 0, losses: 0 },
            intermedio: { wins: 0, losses: 0 },
            avanzado: { wins: 0, losses: 0 },
            experto: { wins: 0, losses: 0 }
        };
        this.saveRecords();
        this.updateRecordsDisplay();
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
        // Inicializar sistema de autenticación
        this.authManager = new AuthManager();
        
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
        this.checkAutoLogin(); // Verificar si hay un usuario logueado automáticamente
    }

    initializeElements() {
        this.elements = {
            // Pantallas
            loginScreen: document.getElementById('login-screen'),
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
            vsResultMessageElement: document.getElementById('vs-result-message'),
            
            // Pantalla de récords
            recordsScreen: document.getElementById('records-screen'),
            recordsBtn: document.getElementById('records-btn'),
            recordsScreen: document.getElementById('records-screen'),
            recordsBackBtn: document.getElementById('records-back-btn'),
            
            // Elementos de récords
            bestClassicScore: document.getElementById('best-classic-score'),
            bestVsScore: document.getElementById('best-vs-score'),
            classicRecordsList: document.getElementById('classic-records-list'),
            vsRecordsList: document.getElementById('vs-records-list'),
            vsWins: document.getElementById('vs-wins'),
            vsLosses: document.getElementById('vs-losses'),
            vsWinrate: document.getElementById('vs-winrate')
        };
    }

    initializeManagers() {
        this.screenManager = new ScreenManager(this.elements);
        this.circleManager = new CircleManager(this);
        this.timerManager = new TimerManager(this);
        this.uiManager = new UIManager(this.elements);
        this.recordsManager = new RecordsManager(this.elements, this.authManager);
    }

    bindEvents() {
        try {
            // Eventos de login
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            const logoutBtn = document.getElementById('logout-btn');
            
            if (usernameInput && passwordInput) {
                // Permitir login con Enter
                [usernameInput, passwordInput].forEach(input => {
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            this.login();
                        }
                    });
                });
            }

            // Event listeners para botones de autenticación (respaldo)
            if (loginBtn) {
                loginBtn.addEventListener('click', () => this.login());
            }
            
            if (registerBtn) {
                registerBtn.addEventListener('click', () => this.toggleRegisterMode());
            }
            
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }

            // Eventos principales
            this.elements.classicBtn?.addEventListener('click', () => this.startClassicGame());
            this.elements.vsMachineBtn?.addEventListener('click', () => this.showDifficultyScreen());
            this.elements.recordsBtn?.addEventListener('click', () => this.showRecordsScreen());
            this.elements.backBtn?.addEventListener('click', () => this.showStartScreen());
            this.elements.restartBtn?.addEventListener('click', () => this.startClassicGame());
            this.elements.menuBtn?.addEventListener('click', () => this.showStartScreen());
            this.elements.vsRestartBtn?.addEventListener('click', () => this.restartVsGame());
            this.elements.vsMenuBtn?.addEventListener('click', () => this.showStartScreen());
            this.elements.recordsBackBtn?.addEventListener('click', () => this.showStartScreen());
            
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
        // Ocultar cursor de la máquina cuando se sale del modo VS
        this.circleManager.hideMachineCursorCompletely();
    }

    showDifficultyScreen() {
        this.screenManager.showScreen('difficulty');
        // Ocultar cursor cuando se va a selección de dificultad
        this.circleManager.hideMachineCursorCompletely();
    }

    showGameScreen() {
        this.screenManager.showScreen('game');
        // Ocultar cursor en modo clásico
        this.circleManager.hideMachineCursorCompletely();
    }

    showVsGameScreen() {
        this.screenManager.showScreen('vsGame');
        // Mostrar cursor para modo VS
        this.circleManager.showMachineCursorForVsMode();
    }

    showGameOverScreen() {
        this.uiManager.showFinalScore(this.gameState.score);
        this.screenManager.showScreen('gameOver');
    }

    showVsResultScreen() {
        this.uiManager.showVsResult(this.gameState.playerScore, this.gameState.machineScore);
        this.screenManager.showScreen('vsResult');
    }

    showRecordsScreen() {
        this.recordsManager.updateRecordsDisplay();
        this.screenManager.showScreen('records');
        // Ocultar cursor cuando se va a récords
        this.circleManager.hideMachineCursorCompletely();
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
            this.gameState.machineSpeedMultiplier = 1; // Inicializar multiplicador
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
            
            // Máquina se vuelve más agresiva con el tiempo
            if (this.gameState.vsTimeLeft % 15 === 0 && this.gameState.vsTimeLeft > 0) {
                this.increaseMachineDifficulty();
            }
            
            if (this.gameState.vsTimeLeft <= 0) {
                this.endVsGame();
            }
        }, 1000);
    }

    increaseMachineDifficulty() {
        // La máquina mejora gradualmente cada 15 segundos
        if (this.gameState.machineSpeedMultiplier === undefined) {
            this.gameState.machineSpeedMultiplier = 1;
        }
        
        this.gameState.machineSpeedMultiplier += 0.15; // 15% más rápida cada vez
        console.log(`¡La máquina se vuelve más rápida! Multiplicador: ${this.gameState.machineSpeedMultiplier.toFixed(2)}x`);
    }

    startCircleMaintenance() {
        this.timerManager.startTimer('maintenance', () => {
            if (!this.gameState.running || this.gameState.mode !== 'classic') return;
            
            const activeCircles = this.circleManager.getActiveCircles('classic');
            const needed = GAME_CONFIG.CLASSIC.MAX_CIRCLES - activeCircles.length;
            
            // Solo crear círculos si realmente faltan
            if (needed > 0) {
                for (let i = 0; i < needed; i++) {
                    this.circleManager.createClassicCircle();
                }
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
        const difficulty = this.gameState.machineDifficulty;
        let baseReactionTime = GAME_CONFIG.VS_MACHINE.MACHINE_REACTION_TIME[difficulty];
        
        const machineAction = async () => {
            if (!this.gameState.running) return;
            
            const availableCircles = this.circleManager.getAvailableVsCircles();
            
            if (availableCircles.length > 0) {
                // Seleccionar círculo aleatorio
                const targetCircle = availableCircles[Math.floor(Math.random() * availableCircles.length)];
                
                // Verificar si la máquina falla (según dificultad) - Se vuelve más precisa con el tiempo
                const speedMultiplier = this.gameState.machineSpeedMultiplier || 1;
                const adjustedAccuracy = GAME_CONFIG.VS_MACHINE.MACHINE_ACCURACY[difficulty] * (1 / speedMultiplier);
                const willMiss = Math.random() < adjustedAccuracy;
                
                if (!willMiss && targetCircle.parentNode) {
                    await this.executeMachineAction(targetCircle);
                }
            }
            
            // Tiempo de reacción ajustado por velocidad creciente
            const speedMultiplier = this.gameState.machineSpeedMultiplier || 1;
            const adjustedReactionTime = Math.max(baseReactionTime / speedMultiplier, 200); // Mínimo 200ms
            
            // Programar siguiente acción
            this.timerManager.startTimeout('machineAI', machineAction, adjustedReactionTime);
        };
        
        // Iniciar IA con delay inicial
        this.timerManager.startTimeout('machineStart', () => {
            if (this.gameState.running) {
                machineAction();
            }
        }, GAME_CONFIG.VS_MACHINE.MACHINE_DELAY);
    }

    async executeMachineAction(targetCircle) {
        try {
            if (!targetCircle || !targetCircle.parentNode) return;
            
            const difficulty = this.gameState.machineDifficulty;
            const speedMultiplier = this.gameState.machineSpeedMultiplier || 1;
            const rect = targetCircle.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Tiempos ajustados por velocidad creciente
            const adjustedMoveTime = Math.max(
                GAME_CONFIG.VS_MACHINE.CURSOR_MOVE_TIME[difficulty] / speedMultiplier, 
                100 // Mínimo 100ms
            );
            const adjustedTargetTime = Math.max(
                GAME_CONFIG.VS_MACHINE.CURSOR_TARGET_TIME[difficulty] / speedMultiplier, 
                50 // Mínimo 50ms
            );
            
            // Mostrar cursor y moverlo al objetivo (más rápido con el tiempo)
            this.circleManager.showMachineCursor(centerX, centerY);
            await this.circleManager.moveMachineCursorTo(centerX, centerY, adjustedMoveTime);
            
            // Apuntar por un momento (menos tiempo conforme mejora)
            this.circleManager.showMachineCursor(centerX, centerY, true);
            await new Promise(resolve => setTimeout(resolve, adjustedTargetTime));
            
            // Verificar que el círculo aún existe antes de hacer clic
            if (targetCircle.parentNode && !targetCircle.classList.contains('hit')) {
                this.handleMachineHit(targetCircle);
            }
            
            // Volver a modo idle después de un breve momento
            setTimeout(() => {
                this.circleManager.setMachineCursorIdle();
            }, 300);
            
        } catch (error) {
            console.error('Error en acción de máquina:', error);
            this.circleManager.setMachineCursorIdle();
        }
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
        
        // Guardar récord del modo clásico
        const position = this.recordsManager.addClassicRecord(this.gameState.score);
        
        setTimeout(() => this.showGameOverScreen(), 500);
    }

    endVsGame() {
        this.gameState.running = false;
        this.timerManager.clearAllTimers();
        this.circleManager.clearAll();
        
        // Guardar récord del modo VS
        const result = this.recordsManager.addVsRecord(
            this.gameState.playerScore,
            this.gameState.machineScore,
            this.gameState.machineDifficulty
        );
        
        setTimeout(() => this.showVsResultScreen(), 500);
    }

    // ========================================================================
    // MÉTODOS DE AUTENTICACIÓN
    // ========================================================================

    login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');

        // Validaciones básicas
        if (!username || !password) {
            errorElement.textContent = 'Por favor, ingresa usuario y contraseña';
            return;
        }

        const result = this.authManager.login(username, password);
        
        if (result.success) {
            errorElement.textContent = '';
            this.updateUserDisplay();
            // Limpiar campos
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            this.screenManager.showScreen('start');
        } else {
            errorElement.textContent = result.message;
        }
    }

    register() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');

        // Validaciones básicas
        if (!username || !password) {
            errorElement.textContent = 'Por favor, ingresa usuario y contraseña';
            return;
        }

        if (username.length < 3) {
            errorElement.textContent = 'El usuario debe tener al menos 3 caracteres';
            return;
        }

        if (password.length < 4) {
            errorElement.textContent = 'La contraseña debe tener al menos 4 caracteres';
            return;
        }

        const result = this.authManager.register(username, password);
        
        if (result.success) {
            errorElement.textContent = '';
            this.updateUserDisplay();
            
            // Resetear a modo login
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            const title = document.querySelector('.login-form h2');
            
            if (loginBtn) loginBtn.textContent = 'Entrar';
            if (registerBtn) registerBtn.textContent = 'Registrarse';
            if (title) title.textContent = 'Iniciar Sesión';
            
            // Limpiar campos
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            
            this.screenManager.showScreen('start');
        } else {
            errorElement.textContent = result.message;
        }
    }

    toggleRegisterMode() {
        const isRegisterMode = this.authManager.toggleRegisterMode();
        
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const title = document.querySelector('.login-form h2');

        if (isRegisterMode) {
            if (loginBtn) loginBtn.textContent = 'Crear Cuenta';
            if (registerBtn) registerBtn.textContent = 'Ya tengo cuenta';
            if (title) title.textContent = 'Registrarse';
        } else {
            if (loginBtn) loginBtn.textContent = 'Entrar';
            if (registerBtn) registerBtn.textContent = 'Registrarse';
            if (title) title.textContent = 'Iniciar Sesión';
        }

        // Limpiar campos y errores
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        const errorField = document.getElementById('login-error');
        
        if (usernameField) usernameField.value = '';
        if (passwordField) passwordField.value = '';
        if (errorField) errorField.textContent = '';
    }

    logout() {
        this.authManager.logout();
        this.screenManager.showScreen('login');
    }

    updateUserDisplay() {
        const currentUser = this.authManager.getCurrentUser();
        const userDisplay = document.getElementById('current-user');
        if (userDisplay && currentUser) {
            userDisplay.textContent = `Usuario: ${currentUser}`;
        }
    }

    checkAutoLogin() {
        // Verificar si hay un usuario logueado automáticamente
        const currentUser = this.authManager.getCurrentUser();
        if (currentUser) {
            // Usuario ya logueado, ir directamente al menú principal
            this.updateUserDisplay();
            this.screenManager.showScreen('start');
        } else {
            // No hay usuario logueado, mostrar pantalla de login
            this.screenManager.showScreen('login');
        }
    }
}

// ============================================================================
// INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
// ============================================================================

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new CircleTapGame();
        
        // Hacer métodos accesibles globalmente para el HTML
        window.gameLogin = () => {
            console.log('gameLogin called');
            window.game.login();
        };
        
        window.gameRegister = () => {
            console.log('gameRegister called');
            window.game.register();
        };
        
        window.gameToggleRegister = () => {
            console.log('gameToggleRegister called');
            window.game.toggleRegisterMode();
        };
        
        window.gameLogout = () => {
            console.log('gameLogout called');
            window.game.logout();
        };

        // Funciones globales simplificadas
        window.handleAuth = () => {
            const loginBtn = document.getElementById('login-btn');
            
            if (loginBtn && loginBtn.textContent === 'Crear Cuenta') {
                window.game.register();
            } else {
                window.game.login();
            }
        };

        window.toggleMode = () => {
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            const title = document.querySelector('.login-form h2');
            
            if (registerBtn && registerBtn.textContent === 'Registrarse') {
                // Cambiar a modo registro
                if (loginBtn) loginBtn.textContent = 'Crear Cuenta';
                registerBtn.textContent = 'Ya tengo cuenta';
                if (title) title.textContent = 'Registrarse';
            } else {
                // Cambiar a modo login
                if (loginBtn) loginBtn.textContent = 'Entrar';
                if (registerBtn) registerBtn.textContent = 'Registrarse';
                if (title) title.textContent = 'Iniciar Sesión';
            }
            
            // Limpiar campos
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            const error = document.getElementById('login-error');
            
            if (username) username.value = '';
            if (password) password.value = '';
            if (error) error.textContent = '';
        };

        window.togglePasswordVisibility = () => {
            const passwordInput = document.getElementById('password');
            const toggleBtn = document.querySelector('.toggle-password');
            
            if (passwordInput && toggleBtn) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    toggleBtn.textContent = '🙈';
                } else {
                    passwordInput.type = 'password';
                    toggleBtn.textContent = '👁️';
                }
            }
        };
        
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
