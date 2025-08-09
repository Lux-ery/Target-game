/**
 * Circle Tap Game - Versión con Sistema de Usuarios
 * Juego de destreza con modo clásico y competencia VS máquina
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
        console.log('📂 Loading users from localStorage...');
        console.log('💾 Raw data:', users);
        const parsedUsers = users ? JSON.parse(users) : {};
        console.log('👥 Parsed users:', parsedUsers);
        console.log('📊 Users loaded:', Object.keys(parsedUsers).length);
        return parsedUsers;
    }

    loadCurrentUser() {
        console.log('🔄 Ejecutando loadCurrentUser...');
        const savedUser = localStorage.getItem('circleTapCurrentUser');
        console.log('💾 Usuario guardado en localStorage:', savedUser);
        
        if (savedUser) {
            // Verificar si el usuario existe en la base de datos
            const users = this.users;
            console.log('👥 Usuarios disponibles:', Object.keys(users));
            
            if (users[savedUser]) {
                this.currentUser = savedUser;
                console.log('✅ Usuario cargado automáticamente:', savedUser);
                return true; // Usuario cargado exitosamente
            } else {
                // El usuario guardado ya no existe, limpiar
                localStorage.removeItem('circleTapCurrentUser');
                console.log('⚠️ Usuario guardado no existe, limpiando auto-login');
            }
        }
        console.log('ℹ️ No hay usuario para auto-login');
        return false; // No hay usuario guardado o el usuario no existe
    }

    saveCurrentUser() {
        console.log('💾 Guardando usuario actual:', this.currentUser);
        if (this.currentUser) {
            localStorage.setItem('circleTapCurrentUser', this.currentUser);
            console.log('✅ Usuario guardado en localStorage para auto-login');
            console.log('🗑️ Usuario removido del localStorage');
        }
    }

    saveUsers() {
        console.log('💾 Saving users to localStorage...');
        console.log('👥 Users to save:', this.users);
        localStorage.setItem('circleTapUsers', JSON.stringify(this.users));
        console.log('✅ Users saved successfully');
        
        // Verificar que se guardó correctamente
        const saved = localStorage.getItem('circleTapUsers');
        console.log('🔍 Verification - saved data:', saved);
    }

    login(username, password) {
        console.log('🔐 AuthManager.login called with:', username);
        console.log('👥 Current users database:', this.users);
        console.log('📊 Users count:', Object.keys(this.users).length);
        
        if (!username || !password) {
            return { success: false, message: 'Por favor, ingresa usuario y contraseña' };
        }

        if (!this.users[username]) {
            console.log('❌ Usuario no encontrado en base de datos');
            console.log('🔍 Usuarios disponibles:', Object.keys(this.users));
            return { success: false, message: 'Usuario no encontrado' };
        }

        if (this.users[username].password !== password) {
            console.log('❌ Contraseña incorrecta para usuario:', username);
            return { success: false, message: 'Contraseña incorrecta' };
        }

        this.currentUser = username;
        console.log('✅ Login exitoso, usuario actual:', this.currentUser);
        this.saveCurrentUser(); // Guardar usuario para próximas sesiones
        return { success: true, message: 'Bienvenido!' };
    }

    register(username, password) {
        console.log('📝 AuthManager.register called with:', username);
        console.log('👥 Current users before register:', this.users);
        
        if (!username || !password) {
            return { success: false, message: 'Por favor, ingresa usuario y contraseña' };
        }

        if (this.users[username]) {
            console.log('❌ Usuario ya existe:', username);
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

        console.log('👥 Users after adding new user:', this.users);
        this.saveUsers();
        this.currentUser = username;
        console.log('✅ Usuario registrado exitosamente:', username);
        this.saveCurrentUser(); // Guardar usuario para próximas sesiones
        return { success: true, message: 'Usuario creado exitosamente!', isNewUser: true };
    }

    logout() {
        this.currentUser = null;
        this.saveCurrentUser(); // Limpiar usuario guardado
    }

    getCurrentUser() {
        // Si no hay usuario actual, intentar cargar desde localStorage
        if (!this.currentUser) {
            this.loadCurrentUser();
        }
        return this.currentUser;
    }

    toggleRegisterMode() {
        this.isRegisterMode = !this.isRegisterMode;
        return this.isRegisterMode;
    }
}

// ============================================================================
// ESTADÍSTICAS DE LA PÁGINA
// ============================================================================

class PageStats {
    constructor() {
        this.ACTIVE_USER_TIMEOUT = 5 * 60 * 1000; // 5 minutos en millisegundos
        this.UPDATE_INTERVAL = 10 * 1000; // Actualizar cada 10 segundos, no cada minuto
        this.updateInterval = null;
        this.sessionId = this.generateSessionId();
        this.init();
    }

    generateSessionId() {
        // Generar ID único para esta sesión
        return Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        this.incrementVisits();
        this.updateActiveUsers();
        this.updateDisplay();
        
        // Actualizar usuarios activos cada 10 segundos para mejor tiempo real
        this.updateInterval = setInterval(() => {
            this.updateActiveUsers();
            this.updateDisplay();
        }, this.UPDATE_INTERVAL);
        
        // Configurar eventos para manejo de sesión
        this.setupSessionManagement();
    }

    setupSessionManagement() {
        // Limpiar al cerrar página
        window.addEventListener('beforeunload', () => {
            this.removeCurrentSession();
        });
        
        window.addEventListener('unload', () => {
            this.removeCurrentSession();
        });
        
        // Manejar pérdida de foco para detectar inactividad
        let visibilityTimer = null;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Después de 10 minutos de inactividad, marcar como inactivo
                visibilityTimer = setTimeout(() => {
                    this.removeCurrentSession();
                }, 600000); // 10 minutos
            } else {
                // Cancelar timer si la página vuelve a estar visible
                if (visibilityTimer) {
                    clearTimeout(visibilityTimer);
                    visibilityTimer = null;
                }
                // Reactivar sesión
                this.updateActiveUsers();
                this.updateDisplay();
            }
        });
    }

    incrementVisits() {
        const visits = parseInt(localStorage.getItem('circleTapTotalVisits') || '0');
        localStorage.setItem('circleTapTotalVisits', (visits + 1).toString());
    }

    updateActiveUsers() {
        const now = Date.now();
        const currentUser = window.userManager?.getCurrentUser() || 'usuario-anonimo';
        
        // Obtener sesiones activas actuales
        const activeSessions = JSON.parse(localStorage.getItem('circleTapActiveSessions') || '{}');
        
        // Siempre actualizar sesión actual (incluso para usuarios anónimos)
        activeSessions[this.sessionId] = {
            user: currentUser,
            lastActivity: now,
            startTime: activeSessions[this.sessionId]?.startTime || now
        };
        
        // Remover sesiones inactivas (más de 5 minutos)
        Object.keys(activeSessions).forEach(sessionId => {
            if (now - activeSessions[sessionId].lastActivity > this.ACTIVE_USER_TIMEOUT) {
                delete activeSessions[sessionId];
            }
        });
        
        // Guardar sesiones activas actualizadas
        localStorage.setItem('circleTapActiveSessions', JSON.stringify(activeSessions));
    }

    removeCurrentSession() {
        const activeSessions = JSON.parse(localStorage.getItem('circleTapActiveSessions') || '{}');
        delete activeSessions[this.sessionId];
        localStorage.setItem('circleTapActiveSessions', JSON.stringify(activeSessions));
    }

    getStats() {
        const totalVisits = parseInt(localStorage.getItem('circleTapTotalVisits') || '0');
        const activeUsers = this.getActiveUserCount();

        return {
            totalVisits,
            activeUsers
        };
    }

    getActiveUserCount() {
        const now = Date.now();
        const activeSessions = JSON.parse(localStorage.getItem('circleTapActiveSessions') || '{}');
        
        // Contar solo sesiones activas reales (últimos 5 minutos)
        let realActiveCount = 0;
        Object.values(activeSessions).forEach(session => {
            if (now - session.lastActivity <= this.ACTIVE_USER_TIMEOUT) {
                realActiveCount++;
            }
        });
        
        // Retornar solo usuarios reales, sin simulación
        return realActiveCount;
    }

    updateDisplay() {
        const stats = this.getStats();
        
        const totalVisitsElement = document.getElementById('total-visits');
        const activeUsersElement = document.getElementById('active-users');
        
        if (totalVisitsElement) {
            const newValue = stats.totalVisits.toLocaleString();
            if (totalVisitsElement.textContent !== newValue) {
                totalVisitsElement.textContent = newValue;
                this.animateValue(totalVisitsElement);
            }
        }
        
        if (activeUsersElement) {
            const newValue = stats.activeUsers.toString();
            if (activeUsersElement.textContent !== newValue) {
                activeUsersElement.textContent = newValue;
                this.animateValue(activeUsersElement);
            }
        }
    }

    animateValue(element) {
        element.classList.add('updated');
        setTimeout(() => {
            element.classList.remove('updated');
        }, 300);
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        this.removeCurrentSession();
    }
}

// ============================================================================
// AUDIO MANAGER (música y efectos con sliders y persistencia)
// ============================================================================

class AudioManager {
    constructor() {
        this.enabled = true;
    // Volúmenes 0-1
    this.musicVolume = parseFloat(localStorage.getItem('circletap_audio_musicVol') || '0.6');
    this.sfxVolume = parseFloat(localStorage.getItem('circletap_audio_sfxVol') || '0.8');
    // WebAudio solo para SFX
    this.ctx = null;
    this.sounds = {};
    // Música basada en archivo (si existe)
    this.music = new Audio();
    this.music.loop = true;
    this.music.volume = this.musicVolume;
    // Intentar usar un archivo por defecto si lo agregas (SUBIR/music.mp3)
    // Si no existe, no sonará hasta que elijas un archivo.
    this.music.src = 'music.mp3';
    this.musicAvailable = false; // se marcará true al poder reproducir
    // Fuente de música: builtin | file
    this.musicSource = localStorage.getItem('circletap_audio_musicSource') || 'caminos';
    // Si la fuente guardada es caminos, establecer inmediatamente la pista externa correcta
    if (this.musicSource === 'caminos') {
        try {
            this.music.src = 'Caminos de Luz [music].mp3';
            this.music.loop = true;
            this.music.load();
        } catch {}
    }
    // Motor builtin
    this.builtin = { playing: false, nodes: [] };
    this.userInteracted = false; // cumplir autoplay: iniciar tras gesto
    this.attachSliderHandlers();
    this.initAudio();
    // Observador simple para intensificar cuando haya x2
    this.intensity = 1; // 1 normal, >1 más energía
    // Intentar autoplay (puede ser bloqueado por políticas del navegador)
    setTimeout(() => this.attemptAutoplay(), 150);
    }

    attachSliderHandlers() {
        // Refrescar UI si existen sliders
        const musicSlider = document.getElementById('music-volume');
        const sfxSlider = document.getElementById('sfx-volume');
        const musicVal = document.getElementById('music-volume-value');
        const sfxVal = document.getElementById('sfx-volume-value');

        if (musicSlider) {
            musicSlider.value = Math.round(this.musicVolume * 100);
            if (musicVal) musicVal.textContent = `${musicSlider.value}%`;
            musicSlider.addEventListener('input', () => {
                this.setMusicVolume(musicSlider.value / 100);
                if (musicVal) musicVal.textContent = `${musicSlider.value}%`;
            });
        }

        if (sfxSlider) {
            sfxSlider.value = Math.round(this.sfxVolume * 100);
            if (sfxVal) sfxVal.textContent = `${sfxSlider.value}%`;
            sfxSlider.addEventListener('input', () => {
                this.setSfxVolume(sfxSlider.value / 100);
                if (sfxVal) sfxVal.textContent = `${sfxSlider.value}%`;
                this.play('ui'); // feedback
            });
        }

        // Selector de fuente
        const sourceSel = document.getElementById('music-source');
        const fileRow = document.getElementById('music-file-row');
        if (sourceSel) {
            sourceSel.value = this.musicSource;
            const syncFileRow = () => { if (fileRow) fileRow.style.display = (sourceSel.value === 'file') ? 'flex' : 'none'; };
            syncFileRow();
            sourceSel.addEventListener('change', () => {
                this.musicSource = sourceSel.value;
                localStorage.setItem('circletap_audio_musicSource', this.musicSource);
                this.stopMusic();
        if (this.musicSource === 'caminos') {
                    // Cargar pista integrada externa
                    try {
            this.music.src = 'Caminos de Luz [music].mp3';
                        this.music.loop = true;
                        this.music.load();
                        this.ensureCanPlay();
                        this.playMusic();
                    } catch {}
                } else if (this.musicSource === 'builtin') {
                    // Asegurar que no quede reproduciendo el archivo anterior
                    try { this.music.pause(); } catch {}
                    // Iniciar inmediatamente el motor builtin si ya hubo interacción
                    if (this.userInteracted) {
                        this.playBuiltinLoop();
                    }
                }
                syncFileRow();
            });
        }

        // File picker para música personalizada
        const musicBtn = document.getElementById('music-file-btn');
        const musicInput = document.getElementById('music-file');
        const musicName = document.getElementById('music-file-name');
        if (musicBtn && musicInput) {
            musicBtn.addEventListener('click', () => musicInput.click());
            musicInput.addEventListener('change', () => {
                const file = musicInput.files && musicInput.files[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                this.music.src = url;
                this.musicAvailable = true;
                if (musicName) musicName.textContent = file.name;
                this.ensureCanPlay();
                this.playMusic();
            });
        }

        // Detectar primer gesto del usuario para habilitar reproducción
        const markInteracted = () => { this.userInteracted = true; };
        window.addEventListener('pointerdown', markInteracted, { once: true });
        window.addEventListener('keydown', markInteracted, { once: true });
        // También iniciar música automáticamente tras la primera interacción sin necesidad de cambiar selector
        const autoStart = async () => {
            this.userInteracted = true;
            // Reintentar resumir contexto
            await this.ensureCanPlay();
            if (this.musicSource === 'caminos' || this.musicSource === 'file') {
                this.playMusic();
            } else if (this.musicSource === 'builtin') {
                this.playBuiltinLoop();
            }
        };
        window.addEventListener('pointerdown', autoStart, { once: true });
        window.addEventListener('keydown', autoStart, { once: true });
    }

    initAudio() {
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
                this.ctx = new AC();
            } else {
                // Sin WebAudio disponible: se limitarán los SFX simples con <audio>
            }
        } catch (e) {
            // Continuar sin WebAudio (solo efectos mínimos)
        }
    }

    async ensureCanPlay() {
        // Intento de reproducir tras interacción si hay src
        if (!this.userInteracted) return;
        try {
            if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
            if (this.music && this.music.src && this.music.paused) {
                await this.music.play().then(() => { this.musicAvailable = true; }).catch(() => { this.musicAvailable = false; });
            }
        } catch {}
    }

    playMusic() {
    if (!this.enabled) return;
    if (this.musicSource === 'file' || this.musicSource === 'caminos') {
            if (this.music && this.music.src) {
                this.music.volume = this.musicVolume;
                // Asegurar contexto listo y reintentar si necesario
                this.ensureCanPlay();
                this.music.play().then(() => { this.musicAvailable = true; }).catch(() => {
                    this.musicAvailable = false;
                });
            }
        } else {
            this.playBuiltinLoop();
        }
    }

    // Intento discreto de reproducir al cargar la página (puede fallar sin interacción)
    attemptAutoplay() {
        try {
            if (!this.enabled) return;
            if (this.musicSource === 'caminos' || this.musicSource === 'file') {
                if (!this.music || !this.music.src) return;
                // Comenzar en volumen 0 y hacer fade si se permite
                const target = this.musicVolume;
                this.music.volume = 0;
                this.music.play().then(() => {
                    this.musicAvailable = true;
                    this.fadeInHtmlAudio(target, 1200);
                    // Marcar interacción lógica para permitir controles posteriores
                    this.userInteracted = true;
                }).catch(() => {
                    // Autoplay bloqueado: se usará el flujo normal tras gesto
                });
            } else if (this.musicSource === 'builtin') {
                // WebAudio normalmente necesita gesto; intentar crear contexto ya (initAudio ya lo hizo)
                // Solo prepararemos; reproducción real tras gesto
            }
        } catch {}
    }

    fadeInHtmlAudio(targetVol, durationMs) {
        if (!this.music) return;
        const steps = 30;
        const stepDur = durationMs / steps;
        let i = 0;
        const startVol = 0;
        const diff = targetVol - startVol;
        const timer = setInterval(() => {
            i++;
            const frac = i / steps;
            this.music.volume = startVol + diff * frac;
            if (i >= steps) clearInterval(timer);
        }, stepDur);
    }

    stopMusic() {
        if (this.music) this.music.pause();
        this.stopBuiltinLoop();
    }

    setMusicVolume(v) {
        this.musicVolume = Math.max(0, Math.min(1, v));
        localStorage.setItem('circletap_audio_musicVol', this.musicVolume.toString());
        if (this.music) this.music.volume = this.musicVolume;
        if (this.builtin && this.builtin.masterGain) this.builtin.masterGain.gain.value = this.musicVolume * 0.4;
    }

    setSfxVolume(v) {
        this.sfxVolume = Math.max(0, Math.min(1, v));
        localStorage.setItem('circletap_audio_sfxVol', this.sfxVolume.toString());
    }

    play(name) {
        if (!this.enabled) return;
        const freqMap = { ui: 880, hit: 1200, machine: 500, over: 300 };
        const durMap = { ui: 0.06, hit: 0.08, machine: 0.08, over: 0.25 };
        const freq = freqMap[name] || 800;
        const dur = durMap[name] || 0.06;
        if (this.ctx) {
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = name === 'machine' ? 'square' : 'sine';
                osc.frequency.value = freq;
                // Envolvente rápida
                const now = this.ctx.currentTime;
                const vol = Math.max(0.0001, this.sfxVolume) * 0.25;
                gain.gain.setValueAtTime(0.0001, now);
                gain.gain.exponentialRampToValueAtTime(vol, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
                osc.connect(gain).connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + dur + 0.02);
                osc.onended = () => { try { osc.disconnect(); gain.disconnect(); } catch {} };
            } catch {}
        }
    }

    // ===== Builtin music (agradable, sin pitido) =====
    playBuiltinLoop() {
        if (!this.ctx) return; // requiere WebAudio
        this.stopBuiltinLoop();
        const ctx = this.ctx;
        // ============================================================
        // NUEVA VERSION: patrón rítmico + arpegio + pequeña percusión
        // Más brillante y activo; cambia tempo/intensidad con X2
        // ============================================================
        const master = ctx.createGain();
        master.gain.value = Math.max(0.0001, this.musicVolume) * 0.55;
        master.connect(ctx.destination);
        this.builtin.masterGain = master;

        // Filtro global muy abierto para suavizar extremos
        const globalFilter = ctx.createBiquadFilter();
        globalFilter.type = 'lowpass';
        globalFilter.frequency.value = 6500;
        globalFilter.Q.value = 0.3;
        globalFilter.connect(master);

        // Parámetros dinámicos según intensidad
        const tempo = this.intensity > 1 ? 150 : 112; // BPM
        const beat = 60 / tempo; // 1 negra
        const step = beat / 2;   // corchea

        // Progresión (brillante) usando pentatónica mayor / mixolydia
        // Cada elemento: notas (Hz) para el arpegio de ese compás
        const toHz = (n) => 440 * Math.pow(2, (n - 69) / 12); // MIDI->Hz
        const chords = [
            // C mixo (C D E G A) -> MIDI: 60,62,64,67,69
            [60, 64, 67, 72, 74], // C arpegio extendido
            // A menor pentatónica subida (A C D E G)
            [57, 60, 62, 64, 67],
            // F mayor (F A C D E) color Lydian
            [53, 57, 60, 62, 64],
            // G mixo (G B C D F)
            [55, 59, 60, 62, 65]
        ].map(arr => arr.map(toHz));

        // Generador de un pluck corto
        const makePluck = (freq, when, vol = 0.25) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            const f = ctx.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.value = freq * 2;
            f.Q.value = 6;
            o.type = 'sawtooth';
            o.frequency.value = freq;
            const start = when;
            const peak = Math.max(0.0001, this.musicVolume) * vol * this.intensity;
            g.gain.setValueAtTime(0.0001, start);
            g.gain.exponentialRampToValueAtTime(peak, start + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, start + 0.25 * beat);
            o.connect(f).connect(g).connect(globalFilter);
            o.start(start);
            o.stop(start + 0.3 * beat);
            o.onended = () => { try { o.disconnect(); f.disconnect(); g.disconnect(); } catch {} };
        };

        // Percusión: hi-hat (ruido filtrado) + kick sintético suave
        const noiseBuffer = (() => {
            const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
            return buffer;
        })();

        const hat = (when, vol = 0.15) => {
            const src = ctx.createBufferSource();
            src.buffer = noiseBuffer;
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass';
            hp.frequency.value = 6000;
            const g = ctx.createGain();
            const peak = Math.max(0.0001, this.musicVolume) * vol * this.intensity;
            g.gain.setValueAtTime(0.0001, when);
            g.gain.exponentialRampToValueAtTime(peak, when + 0.005);
            g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
            src.connect(hp).connect(g).connect(globalFilter);
            src.start(when);
            src.stop(when + 0.06);
            src.onended = () => { try { src.disconnect(); hp.disconnect(); g.disconnect(); } catch {} };
        };

        const kick = (when, vol = 0.4) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            const peak = Math.max(0.0001, this.musicVolume) * vol * this.intensity;
            o.frequency.setValueAtTime(140, when);
            o.frequency.exponentialRampToValueAtTime(50, when + 0.25 * beat);
            g.gain.setValueAtTime(0.0001, when);
            g.gain.exponentialRampToValueAtTime(peak, when + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, when + 0.28 * beat);
            o.connect(g).connect(globalFilter);
            o.start(when);
            o.stop(when + 0.3 * beat);
            o.onended = () => { try { o.disconnect(); g.disconnect(); } catch {} };
        };

        // Arpegio y percusión programados en bloques de 4 compases
        let stopped = false;
        const measures = 4; // compases en la progresión
        const beatsPerMeasure = 4;
        const totalBeats = measures * beatsPerMeasure;
        const loopDur = totalBeats * beat;

        const scheduleLoop = (baseTime) => {
            for (let m = 0; m < measures; m++) {
                const chord = chords[m];
                const chordStartBeat = m * beatsPerMeasure;
                // Kick en beat 0 de cada compás
                kick(baseTime + chordStartBeat * beat, 0.55);
                // Hats en todas las corcheas
                for (let b = 0; b < beatsPerMeasure; b += 0.5) {
                    hat(baseTime + (chordStartBeat + b) * beat, (b % 1 === 0 ? 0.18 : 0.11));
                }
                // Arpegio: lanzar 8 corcheas rotando notas
                const patternSteps = 8; // 4 beats * 2 corcheas
                for (let s = 0; s < patternSteps; s++) {
                    const when = baseTime + (chordStartBeat + s * 0.5) * beat;
                    const noteIdx = (s + m) % chord.length; // desplazar para variar
                    const freq = chord[noteIdx] * (this.intensity > 1 && s % 4 === 0 ? 2 : 1); // ocasional octava arriba en X2
                    makePluck(freq, when, 0.22 + (this.intensity > 1 ? 0.05 : 0));
                }
            }
        };

        const startTime = ctx.currentTime + 0.05;
        scheduleLoop(startTime);
        // Programar repeticiones seguras con setInterval + re-schedule para no drift (reseteamos cada iteración)
        const timer = setInterval(() => {
            if (stopped) return;
            const t = ctx.currentTime + 0.05;
            scheduleLoop(t);
        }, loopDur * 1000);

        this.builtin.playing = true;
        this.builtin.nodes = [master, globalFilter];
        this.builtin.cleanup = () => {
            stopped = true;
            clearInterval(timer);
            try { master.disconnect(); globalFilter.disconnect(); } catch {}
        };
    }

    stopBuiltinLoop() {
        if (!this.builtin || !this.builtin.playing) return;
        this.builtin.playing = false;
        if (this.builtin.cleanup) this.builtin.cleanup();
        this.builtin.nodes = [];
        this.builtin.cleanup = null;
    }

    // Llamar cuando se active/desactive x2 para subir energía
    setIntensity(mult) {
        this.intensity = mult;
        // Reiniciar loop para aplicar nueva intensidad
        if (this.builtin.playing && this.musicSource === 'builtin') {
            this.playBuiltinLoop();
        } else if (this.musicSource === 'file' && this.music) {
            // Para archivos solo ajustamos volumen (leve realce)
            this.music.volume = this.musicVolume * (mult > 1 ? 1 : 1);
        }
    }
}

// ============================================================================
// CONFIGURACIONES Y CONSTANTES
// ============================================================================

const GAME_CONFIG = {
    CLASSIC: {
        TIME_LIMIT: 60,
        MAX_CIRCLES: 3,
        DIFFICULTY_INCREASE_INTERVAL: 10,
        DIFFICULTY_MULTIPLIER: 0.3,
        CIRCLE_LIFETIME_BASE: 5000,        // Aumentado de 4000 a 5000ms
        CIRCLE_LIFETIME_REDUCTION: 200,    // Reducido de 300 a 200ms
        CIRCLE_LIFETIME_MIN: 3000,         // Aumentado de 2000 a 3000ms
        MAINTENANCE_INTERVAL: 500          // Aumentado de 200 a 500ms
    },
    RAPID: {
        TIME_LIMIT: 20,                    // Modo más corto y rápido
        MAX_CIRCLES: 5,                    // Exactamente 5 círculos simultáneos
        DIFFICULTY_INCREASE_INTERVAL: 5,   // Aumenta dificultad más rápido
        DIFFICULTY_MULTIPLIER: 0.4,        // Incremento mayor
        CIRCLE_LIFETIME_BASE: 3000,        // Círculos duran menos
        CIRCLE_LIFETIME_REDUCTION: 150,    // Reducción más agresiva
        CIRCLE_LIFETIME_MIN: 1500,         // Mínimo muy bajo
        MAINTENANCE_INTERVAL: 300,         // Mantenimiento más frecuente
        SPAWN_RATE: 400                    // Aparecen muy rápido
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
        // Obtener las dimensiones reales del área de juego actual
        const gamePlayArea = document.querySelector('.game-play-area') || document.querySelector('.vs-game-play-area');
        
        let gameAreaWidth = 800;
        let gameAreaHeight = 500;
        
        if (gamePlayArea) {
            const rect = gamePlayArea.getBoundingClientRect();
            gameAreaWidth = rect.width;
            gameAreaHeight = rect.height;
        } else {
            // Fallback: calcular basado en viewport
            gameAreaWidth = Math.min(800, window.innerWidth * 0.9);
            gameAreaHeight = Math.min(500, window.innerHeight - 200);
        }
        
        const margin = size * GAME_CONFIG.CIRCLE.MARGIN_MULTIPLIER + GAME_CONFIG.CIRCLE.BASE_MARGIN;
        const maxX = gameAreaWidth - margin * 2;
        const maxY = gameAreaHeight - margin * 2;
        
        return {
            x: Math.random() * maxX + margin,
            y: Math.random() * maxY + margin
        };
    }

    static generateSafePosition(size, existingCircles = [], excludeUI = 100, maxAttempts = 50) {
        // Obtener las dimensiones reales del área de juego actual
        const gamePlayArea = document.querySelector('.game-play-area') || document.querySelector('.vs-game-play-area');
        
        let gameAreaWidth = 800;
        let gameAreaHeight = 500;
        
        if (gamePlayArea) {
            const rect = gamePlayArea.getBoundingClientRect();
            // Si el área no tiene dimensiones (está oculta/pausada), usar valores por defecto
            if (rect.width > 0 && rect.height > 0) {
                gameAreaWidth = rect.width;
                gameAreaHeight = rect.height;
            } else {
                // Fallback cuando el área está oculta (pausada)
                gameAreaWidth = 384; // Ancho típico del área VS
                gameAreaHeight = 421; // Alto típico del área VS
            }
        } else {
            // Fallback: calcular basado en viewport
            gameAreaWidth = Math.min(800, window.innerWidth * 0.9);
            gameAreaHeight = Math.min(500, window.innerHeight - 200);
        }
        
        const margin = size * GAME_CONFIG.CIRCLE.MARGIN_MULTIPLIER + GAME_CONFIG.CIRCLE.BASE_MARGIN;
        const maxX = gameAreaWidth - margin * 2;
        const maxY = gameAreaHeight - margin * 2;
        
        // Buffer adicional para evitar superposición
        const collisionBuffer = size * 0.1; // 10% extra de espacio
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const position = {
                x: Math.random() * maxX + margin,
                y: Math.random() * maxY + margin
            };
            
            // Verificar colisión con círculos existentes
            let hasCollision = false;
            
            for (const existingCircle of existingCircles) {
                if (!existingCircle.parentNode || existingCircle.classList.contains('hit')) {
                    continue; // Ignorar círculos que ya no están activos
                }
                
                const existingRect = existingCircle.getBoundingClientRect();
                const gameAreaRect = gamePlayArea ? gamePlayArea.getBoundingClientRect() : { left: 0, top: 0 };
                
                // Convertir a coordenadas relativas al área de juego
                const existingX = existingRect.left - gameAreaRect.left + existingRect.width / 2;
                const existingY = existingRect.top - gameAreaRect.top + existingRect.height / 2;
                const existingRadius = existingRect.width / 2;
                
                const newRadius = size / 2;
                const centerX = position.x + newRadius;
                const centerY = position.y + newRadius;
                
                // Calcular distancia entre centros
                const distance = Math.sqrt(
                    Math.pow(centerX - existingX, 2) + 
                    Math.pow(centerY - existingY, 2)
                );
                
                // Verificar si hay superposición (con buffer adicional)
                const minDistance = existingRadius + newRadius + collisionBuffer;
                
                if (distance < minDistance) {
                    hasCollision = true;
                    break;
                }
            }
            
            if (!hasCollision) {
                return position;
            }
        }
        
        // Si no se encontró posición segura después de maxAttempts, usar posición aleatoria normal
        console.warn('⚠️ No se pudo encontrar posición segura, usando posición aleatoria');
        return {
            x: Math.random() * maxX + margin,
            y: Math.random() * maxY + margin
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
            records: elements.recordsScreen,
            pause: document.getElementById('pause-screen'),
            tutorial: document.getElementById('tutorial-screen')
        };
        
        // No mostrar ninguna pantalla automáticamente, 
        // checkAutoLogin decidirá cuál mostrar
        this.hideAllScreens();
    }

    showScreen(screenName) {
        console.log('� Mostrando pantalla:', screenName);
        
        try {
            // Ocultar todas las pantallas
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.add('hidden');
            });
            
            // Mostrar la pantalla solicitada
            const targetScreen = document.getElementById(screenName + '-screen');
            if (targetScreen) {
                targetScreen.classList.remove('hidden');
            } else {
                console.error('Pantalla no encontrada:', screenName);
            }
        } catch (error) {
            console.error('Error mostrando pantalla:', error);
        }
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }
}

// ============================================================================
// CLASE DE GESTIÓN DE TUTORIAL
// ============================================================================

// Tutorial paso a paso eliminado

// ============================================================================
// CLASE DE OVERLAY INFORMATIVO
// ============================================================================

class InfoOverlay {
    constructor() {
        this.overlay = document.getElementById('info-overlay');
        this.title = document.getElementById('info-overlay-title');
        this.text = document.getElementById('info-overlay-text');
        this.closeBtn = document.getElementById('info-overlay-close');
        this.currentCallback = null;
        this.currentMode = null;
        this.startBtn = document.getElementById('info-overlay-start');
        this.skipBtn = document.getElementById('info-overlay-skip');
        
        this.currentCallback = null;
        this.setupEvents();
        
        this.messages = {
            classic: {
                title: "🎮 Modo Clásico",
                content: `
                    <h3>¡Bienvenido al Modo Clásico!</h3>
                    <p>🎯 <span class="highlight">Objetivo:</span> Haz click en todos los círculos que puedas</p>
                    <p>⏰ <span class="highlight">Tiempo:</span> Tienes 60 segundos</p>
                    <p>📊 <span class="highlight">Puntuación:</span> Círculos más pequeños = más puntos</p>
                    <div class="tip">
                        💡 <strong>Tip:</strong> Los círculos no desaparecen solos, ¡tómate tu tiempo para apuntar bien!
                    </div>
                `,
                startText: "🎮 ¡Comenzar Modo Clásico!"
            },
            casual: {
                title: "🙂 Modo Casual (Clásico)",
                content: `
                    <h3>🎯 Relájate y juega</h3>
                    <p>Este es el modo clásico, pensado para practicar sin presión.</p>
                    <p>⏰ 60 segundos para conseguir la mejor puntuación.</p>
                    <p>🔍 Los círculos pequeños valen más puntos.</p>
                    <div class="tip">💡 Consejo: Apunta con calma, no desaparecen solos.</div>
                `,
                startText: "🙂 ¡Jugar Modo Casual!"
            },
            rapid: {
                title: "⚡ Modo Rápido",
                content: `
                    <h3>¡Modo Rápido Activado!</h3>
                    <p>🚀 <span class="highlight">Control:</span> Pasa el mouse sobre los círculos</p>
                    <p>🎯 <span class="highlight">Siempre hay 5 círculos:</span> Constante desafío</p>
                    <p>⚠️ <span class="warning">¡Cuidado!</span> Los círculos desaparecen automáticamente</p>
                    <div class="tip">
                        💡 <strong>Tip:</strong> ¡No hagas click! Solo pasa el mouse por encima de los círculos
                    </div>
                `,
                startText: "⚡ ¡Comenzar Modo Rápido!"
            },
            vs: {
                title: "🤖 Modo VS Máquina",
                content: `
                    <h3>¡Batalla contra la IA!</h3>
                    <p>🆚 <span class="highlight">Competencia:</span> Tú vs la Máquina en tiempo real</p>
                    <p>🏃‍♂️ <span class="highlight">Velocidad:</span> El más rápido se lleva los puntos</p>
                    <p>🧠 <span class="highlight">Dificultad:</span> La máquina se vuelve más inteligente</p>
                    <div class="tip">
                        💡 <strong>Tip:</strong> ¡Sé más rápido que la IA para ganar puntos!
                    </div>
                `,
                startText: "🤖 ¡Batalla vs IA!"
            }
        };
    }

    setupEvents() {
        this.closeBtn.addEventListener('click', () => this.hide());
        this.startBtn.addEventListener('click', () => this.startGame());
        this.skipBtn.addEventListener('click', () => this.returnToMenu());
        
        // No permitir cerrar haciendo click fuera cuando es informativo
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target.classList.contains('info-overlay-backdrop')) {
                // Solo mostrar una pequeña animación para indicar que deben usar los botones
                this.overlay.style.animation = 'shake 0.5s ease-in-out';
                setTimeout(() => {
                    this.overlay.style.animation = '';
                }, 500);
            }
        });
    }

    show(mode, callback) {
        // Verificar si es la primera vez jugando este modo
        const playedModes = JSON.parse(localStorage.getItem('circleTapPlayedModes') || '{}');
        
        if (playedModes[mode]) {
            // Ya jugó este modo antes, iniciar directamente
            callback();
            return;
        }
        
        const message = this.messages[mode];
        if (!message) return;

        // Guardar callback y modo para cuando se inicie el juego
        this.currentCallback = callback;
        this.currentMode = mode;
        
        // Configurar contenido
        this.title.textContent = message.title;
        this.text.innerHTML = message.content;
        this.startBtn.textContent = message.startText;
        
        // Mostrar overlay
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('visible');
    }

    hide() {
        this.overlay.classList.add('fade-out');
        
        setTimeout(() => {
            this.overlay.classList.remove('visible', 'fade-out');
            this.overlay.classList.add('hidden');
        }, 300);
    }

    startGame() {
        // Marcar modo como jugado
        this.markModeAsPlayed();
        
        this.hide();
        
        // Ejecutar callback para iniciar el juego después de cerrar el overlay
        if (this.currentCallback) {
            setTimeout(() => {
                this.currentCallback();
                this.currentCallback = null;
                this.currentMode = null;
            }, 300);
        }
    }

    markModeAsPlayed() {
        if (this.currentMode) {
            const playedModes = JSON.parse(localStorage.getItem('circleTapPlayedModes') || '{}');
            playedModes[this.currentMode] = true;
            localStorage.setItem('circleTapPlayedModes', JSON.stringify(playedModes));
        }
    }

    returnToMenu() {
        this.hide();
        // Regresar al menú principal correctamente usando Game instance
        if (window.game) {
            window.game.showStartScreen();
        } else {
            const start = document.getElementById('start-screen');
            if (start) start.classList.remove('hidden');
            document.querySelectorAll('.screen').forEach(s=>{ if(s!==start) s.classList.add('hidden'); });
        }
        this.currentCallback = null;
        this.currentMode = null;
    }

    // Método estático para uso fácil
    static show(mode, callback) {
        if (!window.infoOverlay) {
            window.infoOverlay = new InfoOverlay();
        }
        window.infoOverlay.show(mode, callback);
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
            const position = GameUtils.generateSafePosition(size, this.circles, 100);
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
        console.log('🔵 CREANDO CÍRCULO VS');
        try {
            const circle = document.createElement('div');
            circle.classList.add('circle');
            
            const size = GAME_CONFIG.VS_MACHINE.CIRCLE_SIZE;
            console.log('📏 Tamaño del círculo:', size);
            
            const position = GameUtils.generateSafePosition(size, this.circles, 120);
            console.log('📍 Posición generada:', position);
            
            this.setupCircleStyle(circle, size, position);
            
            circle.textContent = GAME_CONFIG.VS_MACHINE.CIRCLE_POINTS;
            circle.dataset.points = GAME_CONFIG.VS_MACHINE.CIRCLE_POINTS;
            circle.dataset.mode = 'vs';
            
            this.attachVsEvents(circle);
            
            console.log('🎯 Área del juego VS:', this.game.elements.vsGameArea);
            this.game.elements.vsGameArea.appendChild(circle);
            this.circles.push(circle);
            
            console.log('✅ Círculo VS creado y agregado');
            console.log('📊 Total de círculos activos:', this.circles.length);
            
            setTimeout(() => this.autoRemoveVsCircle(circle), GAME_CONFIG.VS_MACHINE.CIRCLE_LIFETIME);
            
            return circle;
        } catch (error) {
            console.error('Error creando círculo VS:', error);
            return null;
        }
    }

    createRapidCircle() {
        try {
            const circle = document.createElement('div');
            circle.classList.add('circle', 'rapid-circle');
            
            // Configuración para modo rápido
            const minSize = 60; // Círculos más grandes para mejor hover
            const maxSize = 100;
            const size = Math.random() * (maxSize - minSize) + minSize;
            
            const position = GameUtils.generateSafePosition(size, this.circles, 100);
            this.setupCircleStyle(circle, size, position);
            
            // Asignar puntos variables (ponderado):
            // 1 (40%), 2 (25%), 3 (18%), 4 (12%), 5 (5%)
            const r = Math.random();
            let points;
            if (r < 0.40) points = 1; else if (r < 0.65) points = 2; else if (r < 0.83) points = 3; else if (r < 0.95) points = 4; else points = 5;
            circle.textContent = points;
            circle.dataset.points = points;
            // Ajuste visual: más brillo si más puntos
            const hue = 200 - points * 20; // menor hue = más hacia rojo
            const sat = 55 + points * 6;
            const light = 55 + points * 3;
            circle.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue},${sat}%,${light}%) 0%, hsl(${hue},${sat-10}%,${light-10}%) 70%)`;
            circle.style.boxShadow = `0 0 ${6+points*2}px rgba(255,255,255,0.5), 0 0 ${12+points*3}px rgba(255,215,0,${0.08*points})`;
            circle.dataset.mode = 'rapid';
            
            // Eventos especiales para modo rápido
            this.attachRapidEvents(circle);
            
            this.game.elements.gameArea.appendChild(circle);
            this.circles.push(circle);
            
            // Tiempo de vida dinámico basado en dificultad
            const lifetime = Math.max(
                GAME_CONFIG.RAPID.CIRCLE_LIFETIME_BASE - (this.game.gameState.difficulty * GAME_CONFIG.RAPID.CIRCLE_LIFETIME_REDUCTION),
                GAME_CONFIG.RAPID.CIRCLE_LIFETIME_MIN
            );
            
            setTimeout(() => this.autoRemoveCircle(circle), lifetime);
            
            return circle;
        } catch (error) {
            console.error('Error creando círculo rápido:', error);
            return null;
        }
    }

    setupCircleStyle(circle, size, position) {
        circle.style.width = size + 'px';
        circle.style.height = size + 'px';
        circle.style.position = 'absolute';
        circle.style.left = position.x + 'px';
        circle.style.top = position.y + 'px';
        circle.style.background = GameUtils.getRandomColor();
        
        // Asegurar que el círculo sea visible
        circle.style.display = 'flex';
        circle.style.alignItems = 'center';
        circle.style.justifyContent = 'center';
        circle.style.borderRadius = '50%';
        circle.style.color = 'white';
        circle.style.fontWeight = 'bold';
        circle.style.fontSize = (size * 0.3) + 'px';
        circle.style.cursor = 'pointer';
        circle.style.userSelect = 'none';
        circle.style.zIndex = '10';
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

    attachRapidEvents(circle) {
        let triggered = false;
        
        const triggerHandler = (e) => {
            if (triggered) return;
            triggered = true;
            
            e.preventDefault();
            e.stopPropagation();
            this.game.handleCircleHit(e, circle);
        };
        
        // Para escritorio: hover (pasar el mouse)
        circle.addEventListener('mouseenter', triggerHandler);
        
        // Para interacción: hacer clic
        circle.addEventListener('click', triggerHandler);
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
            
            // Si es modo rápido, crear inmediatamente un reemplazo
            const isRapidMode = circle.dataset.mode === 'rapid';
            if (isRapidMode && this.game.gameState.mode === 'rapid' && this.game.gameState.running) {
                // Crear nuevo círculo inmediatamente para mantener 5 constantes
                setTimeout(() => {
                    if (this.circles.length < GAME_CONFIG.RAPID.MAX_CIRCLES) {
                        this.createRapidCircle();
                    }
                }, 100); // Delay mínimo para evitar problemas de timing
            }
            
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
        
        // Desactivar inmediatamente la hitbox
        circle.style.pointerEvents = 'none';
        circle.style.userSelect = 'none';
        
        return true;
    }

    machineHitCircle(circle) {
        if (!circle || circle.classList.contains('hit') || circle.classList.contains('machine-circle')) {
            return false;
        }
        
        circle.classList.add('machine-circle', 'hit');
        
        // Desactivar inmediatamente la hitbox
        circle.style.pointerEvents = 'none';
        circle.style.userSelect = 'none';
        
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

    pauseGeneration() {
        console.log('⏸️ Pausando generación de círculos');
        // Los timers ya se pausan en TimerManager, solo necesitamos marcar el estado
    }

    resumeGeneration() {
        console.log('▶️ Reanudando generación de círculos');
        // La generación se reanudará cuando se reinicien los timers
    }

    startGeneration() {
        // Reiniciar la generación de círculos según el modo actual
        if (this.game.gameState.mode === 'vs') {
            this.game.startCircleGeneration(); // Modo VS
        } else {
            this.game.startCircleGeneration(); // Modo clásico/rápido
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
        this.pausedTimers = new Map();
        this.isPaused = false;
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

    pauseAllTimers() {
        if (this.isPaused) return;
        
        this.isPaused = true;
        console.log('⏸️ Pausando todos los timers');
        
        // Guardar información de timers activos y detenerlos
        this.timers.forEach((timer, name) => {
            clearInterval(timer);
            clearTimeout(timer);
        });
        
        // Marcar como pausado sin limpiar la referencia
        this.timers.forEach((timer, name) => {
            this.pausedTimers.set(name, true);
        });
    }

    resumeAllTimers() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        console.log('▶️ Reanudando timers');
        
        // Limpiar estado de pausa
        this.pausedTimers.clear();
        
        // El juego debe reiniciar sus propios timers según sea necesario
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
            this.rapidRecords = JSON.parse(localStorage.getItem('circletap_rapid_records')) || [];
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
            localStorage.setItem('circletap_rapid_records', JSON.stringify(this.rapidRecords));
        } catch (error) {
            console.error('Error guardando récords:', error);
        }
    }

    addClassicRecord(score) {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return -1;

        // Buscar si el usuario ya tiene un récord
        const existingRecordIndex = this.classicRecords.findIndex(r => r.user === currentUser);
        
        if (existingRecordIndex !== -1) {
            // Usuario ya existe, verificar si el nuevo score es mejor
            const existingRecord = this.classicRecords[existingRecordIndex];
            if (score > existingRecord.score) {
                // Nuevo récord es mejor, actualizar
                existingRecord.score = score;
                existingRecord.date = new Date().toLocaleDateString('es-ES');
                existingRecord.timestamp = Date.now();
            } else {
                // Nuevo score no es mejor, devolver posición actual
                this.classicRecords.sort((a, b) => b.score - a.score);
                this.saveRecords();
                return this.classicRecords.findIndex(r => r.user === currentUser) + 1;
            }
        } else {
            // Usuario no existe, añadir nuevo récord
            const record = {
                score: score,
                user: currentUser,
                date: new Date().toLocaleDateString('es-ES'),
                timestamp: Date.now()
            };
            this.classicRecords.push(record);
        }

        // Ordenar y mantener solo los top 10
        this.classicRecords.sort((a, b) => b.score - a.score);
        this.classicRecords = this.classicRecords.slice(0, 10);
        
        this.saveRecords();
        return this.classicRecords.findIndex(r => r.user === currentUser) + 1;
    }

    addRapidRecord(score) {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return -1;

        // Buscar si el usuario ya tiene un récord
        const existingRecordIndex = this.rapidRecords.findIndex(r => r.user === currentUser);
        
        if (existingRecordIndex !== -1) {
            // Usuario ya existe, verificar si el nuevo score es mejor
            const existingRecord = this.rapidRecords[existingRecordIndex];
            if (score > existingRecord.score) {
                // Nuevo récord es mejor, actualizar
                existingRecord.score = score;
                existingRecord.date = new Date().toLocaleDateString('es-ES');
                existingRecord.time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                existingRecord.timestamp = Date.now();
            } else {
                // Nuevo score no es mejor, devolver posición actual
                this.rapidRecords.sort((a, b) => b.score - a.score);
                this.saveRecords();
                return this.rapidRecords.findIndex(r => r.user === currentUser) + 1;
            }
        } else {
            // Usuario no existe, añadir nuevo récord
            const record = {
                score: score,
                user: currentUser,
                date: new Date().toLocaleDateString('es-ES'),
                time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            };
            this.rapidRecords.push(record);
        }

        // Ordenar y mantener solo los top 10
        this.rapidRecords.sort((a, b) => b.score - a.score);
        this.rapidRecords = this.rapidRecords.slice(0, 10);
        
        this.saveRecords();
        return this.rapidRecords.findIndex(r => r.user === currentUser) + 1;
    }

    addVsRecord(playerScore, machineScore, difficulty) {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return -1;

        const isWin = playerScore > machineScore;
        
        // Convertir difficulty number a string
        const difficultyKey = this.getDifficultyKey(difficulty);

        // Actualizar estadísticas por dificultad
        if (!this.vsStats[difficultyKey]) {
            this.vsStats[difficultyKey] = { wins: 0, losses: 0 };
        }

        // Inicializar registros por dificultad si no existen
        if (!this.vsRecords[difficultyKey]) {
            this.vsRecords[difficultyKey] = [];
        }

        // Buscar si el usuario ya tiene un récord en esta dificultad
        const existingRecordIndex = this.vsRecords[difficultyKey].findIndex(r => r.user === currentUser);
        
        if (existingRecordIndex !== -1) {
            // Usuario ya existe, verificar si el nuevo score es mejor
            const existingRecord = this.vsRecords[difficultyKey][existingRecordIndex];
            if (playerScore > existingRecord.playerScore) {
                // Nuevo récord es mejor, actualizar
                existingRecord.playerScore = playerScore;
                existingRecord.machineScore = machineScore;
                existingRecord.isWin = isWin;
                existingRecord.date = new Date().toLocaleDateString('es-ES');
                existingRecord.timestamp = Date.now();
                
                // Actualizar estadísticas solo si es mejor récord
                if (isWin) {
                    this.vsStats[difficultyKey].wins++;
                } else {
                    this.vsStats[difficultyKey].losses++;
                }
            } else {
                // Nuevo score no es mejor, solo actualizar estadísticas
                if (isWin) {
                    this.vsStats[difficultyKey].wins++;
                } else {
                    this.vsStats[difficultyKey].losses++;
                }
                // Devolver posición actual
                this.vsRecords[difficultyKey].sort((a, b) => b.playerScore - a.playerScore);
                this.saveRecords();
                return this.vsRecords[difficultyKey].findIndex(r => r.user === currentUser) + 1;
            }
        } else {
            // Usuario no existe, añadir nuevo récord
            const record = {
                playerScore: playerScore,
                machineScore: machineScore,
                user: currentUser,
                isWin: isWin,
                date: new Date().toLocaleDateString('es-ES'),
                timestamp: Date.now()
            };
            this.vsRecords[difficultyKey].push(record);
            
            // Actualizar estadísticas
            if (isWin) {
                this.vsStats[difficultyKey].wins++;
            } else {
                this.vsStats[difficultyKey].losses++;
            }
        }

        // Ordenar y mantener solo los top 10
        this.vsRecords[difficultyKey].sort((a, b) => b.playerScore - a.playerScore);
        this.vsRecords[difficultyKey] = this.vsRecords[difficultyKey].slice(0, 10);

        this.saveRecords();
        return this.vsRecords[difficultyKey].findIndex(r => r.user === currentUser) + 1;
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
        this.updateRapidRecords();
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

    updateRapidRecords() {
        if (!this.elements.bestRapidScore || !this.elements.rapidRecordsList) return;

        // Mejor puntuación rápida
        const bestRapid = this.rapidRecords.length > 0 ? this.rapidRecords[0].score : 0;
        this.elements.bestRapidScore.textContent = bestRapid;

        // Lista de récords rápidos
        this.elements.rapidRecordsList.innerHTML = '';
        this.rapidRecords.forEach((record, index) => {
            const recordElement = document.createElement('div');
            recordElement.className = 'record-item rapid';
            recordElement.innerHTML = `
                <span>${index + 1}</span>
                <span>${record.user}</span>
                <span>${record.score}</span>
            `;
            this.elements.rapidRecordsList.appendChild(recordElement);
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
        this.rapidRecords = [];
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
        console.log('🗑️ Todos los récords han sido reiniciados');
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
                
                // Agregar indicador visual cuando x2 está activo
                if (this.game && this.game.gameState.x2Multiplier) {
                    this.elements.scoreElement.style.color = '#ffd93d';
                    this.elements.scoreElement.style.textShadow = '0 0 20px rgba(255, 217, 61, 0.8)';
                    this.elements.scoreElement.style.transform = 'scale(1.1)';
                } else {
                    this.elements.scoreElement.style.color = '';
                    this.elements.scoreElement.style.textShadow = '';
                    this.elements.scoreElement.style.transform = '';
                }
            }
            if (this.elements.timeElement) {
                this.elements.timeElement.textContent = timeLeft;
            }
            
            // Mostrar/ocultar indicador X2
            this.updateX2Indicator();
        } catch (error) {
            console.error('Error actualizando UI clásica:', error);
        }
    }

    updateVsUI(playerScore, machineScore, timeLeft) {
        try {
            if (this.elements.playerScoreElement) {
                this.elements.playerScoreElement.textContent = playerScore;
                
                // Agregar indicador visual cuando x2 está activo
                if (this.game && this.game.gameState.x2Multiplier) {
                    this.elements.playerScoreElement.style.color = '#ffd93d';
                    this.elements.playerScoreElement.style.textShadow = '0 0 20px rgba(255, 217, 61, 0.8)';
                    this.elements.playerScoreElement.style.transform = 'scale(1.1)';
                } else {
                    this.elements.playerScoreElement.style.color = '';
                    this.elements.playerScoreElement.style.textShadow = '';
                    this.elements.playerScoreElement.style.transform = '';
                }
            }
            if (this.elements.machineScoreElement) {
                this.elements.machineScoreElement.textContent = machineScore;
            }
            if (this.elements.vsTimeElement) {
                this.elements.vsTimeElement.textContent = timeLeft;
            }
            
            // Mostrar/ocultar indicador X2
            this.updateX2Indicator();
        } catch (error) {
            console.error('Error actualizando UI VS:', error);
        }
    }

    showScorePopup(points, x, y, container, isPlayer = true) {
        try {
            const popup = document.createElement('div');
            popup.classList.add('score-popup');
            
            // Ajustar coordenadas relativas al contenedor
            const containerRect = container.getBoundingClientRect();
            const relativeX = x - containerRect.left;
            const relativeY = y - containerRect.top;
            
            popup.style.left = relativeX + 'px';
            popup.style.top = relativeY + 'px';
            
            if (isPlayer) {
                popup.textContent = '+' + points;
                
                // Cambiar color si el multiplicador x2 está activo
                if (this.game && this.game.gameState.x2Multiplier) {
                    popup.style.color = '#ffd93d';
                    popup.style.textShadow = '0 0 15px rgba(255, 217, 61, 0.9), 2px 2px 4px rgba(0,0,0,0.5)';
                    popup.style.fontSize = '2.5rem';
                    popup.innerHTML = '🚀+' + points;
                }
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

    showX2Button(container) {
        try {
            console.log('✨ Mostrando botón X2');
            
            const x2Button = document.createElement('div');
            x2Button.classList.add('x2-button');
            x2Button.textContent = 'X2';
            x2Button.id = 'x2-special-button';
            
            // Variable para evitar activación múltiple
            let activated = false;
            
            // Evento de activación del multiplicador
            const activateX2 = (e) => {
                if (activated) return;
                activated = true;
                
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 Botón X2 activado!');
                
                // Activar multiplicador x2
                this.game.gameState.x2Multiplier = true;
                // Intensificar música + capa extra
                if (this.game.audio) {
                    this.game.audio.setIntensity(1.8);
                    this.game.audio.play('ui'); // pequeño ping
                    // Añadir capa extra rítmica temporal si builtin activo
                    if (this.game.audio.musicSource === 'builtin' && this.game.audio.ctx) {
                        this.addX2ExtraLayer(this.game.audio.ctx);
                    }
                    // Si sonido archivo/caminos: un efecto de impulso
                    if (this.game.audio.ctx) this.playRocketWhoosh(this.game.audio.ctx);
                }
                
                // Remover el botón inmediatamente
                GameUtils.safeRemoveElement(x2Button);
                
                // Desactivar el multiplicador después de 5 segundos
                setTimeout(() => {
                    console.log('⏰ Multiplicador X2 desactivado');
                    this.game.gameState.x2Multiplier = false;
                    if (this.game.audio) this.game.audio.setIntensity(1);
                }, 5000);
                
                // Mostrar efecto visual de activación
                this.showX2ActivationEffect(container);
            };
            
            // Verificar si estamos en modo rápido
            const isRapidMode = this.game && this.game.gameState.mode === 'rapid';
            
            if (isRapidMode) {
                console.log('⚡ Configurando botón X2 para modo rápido (hover)');
                // En modo rápido: activar con hover (mouseenter)
                x2Button.addEventListener('mouseenter', activateX2);
                // Click como respaldo
                x2Button.addEventListener('click', activateX2);
            } else {
                console.log('🎯 Configurando botón X2 para modo normal (click)');
                // En otros modos: activar con click
                x2Button.addEventListener('click', activateX2);
            }
            
            container.appendChild(x2Button);
            
            // Remover automáticamente después de 1 segundo si no se activa
            setTimeout(() => {
                if (x2Button.parentNode && !activated) {
                    console.log('⏰ Botón X2 expirado');
                    GameUtils.safeRemoveElement(x2Button);
                }
            }, 1000);
            
        } catch (error) {
            console.error('Error mostrando botón X2:', error);
        }
    }

    // Capa extra: un barrido agudo + arpegio rápido encima (solo durante activación)
    addX2ExtraLayer(ctx) {
        try {
            const now = ctx.currentTime;
            // Barrido agudo
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(400, now);
            o.frequency.exponentialRampToValueAtTime(1600, now + 0.6);
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
            o.connect(g).connect(ctx.destination);
            o.start(now);
            o.stop(now + 0.72);
            o.onended = () => { try { o.disconnect(); g.disconnect(); } catch {} };
            // Arpegio rápido (pentatónica) 0.5s
            const notes = [0,3,5,7,10].map(semi => 440*Math.pow(2,(semi)/12));
            for (let i=0;i<12;i++) {
                const t = now + i*0.04;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type='square';
                osc.frequency.value = notes[i % notes.length]* (i%4===0?2:1);
                gain.gain.setValueAtTime(0.0001,t);
                gain.gain.exponentialRampToValueAtTime(0.18,t+0.01);
                gain.gain.exponentialRampToValueAtTime(0.0001,t+0.15);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t);
                osc.stop(t+0.16);
                osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch{}};
            }
        } catch {}
    }

    // Sonido tipo propulsión cohete (ruido filtrado + caída de pitch)
    playRocketWhoosh(ctx) {
        try {
            const now = ctx.currentTime;
            // Ruido
            const buffer = ctx.createBuffer(1, ctx.sampleRate*0.6, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1)*Math.pow(1 - i/data.length, 2.2);
            const src = ctx.createBufferSource();
            src.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type='bandpass';
            filter.frequency.value = 600;
            filter.Q.value = 1.2;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.9, now+0.05);
            g.gain.exponentialRampToValueAtTime(0.0001, now+0.6);
            src.connect(filter).connect(g).connect(ctx.destination);
            src.start(now);
            src.stop(now+0.62);
            src.onended=()=>{try{src.disconnect();filter.disconnect();g.disconnect();}catch{}};
            // Tono descendente (refuerzo)
            const o = ctx.createOscillator();
            const og = ctx.createGain();
            o.type='sine';
            o.frequency.setValueAtTime(900, now);
            o.frequency.exponentialRampToValueAtTime(180, now+0.5);
            og.gain.setValueAtTime(0.0001, now);
            og.gain.exponentialRampToValueAtTime(0.5, now+0.05);
            og.gain.exponentialRampToValueAtTime(0.0001, now+0.55);
            o.connect(og).connect(ctx.destination);
            o.start(now);
            o.stop(now+0.56);
            o.onended=()=>{try{o.disconnect();og.disconnect();}catch{}};
        } catch {}
    }

    showX2ActivationEffect(container) {
        try {
            const effect = document.createElement('div');
            effect.style.position = 'absolute';
            effect.style.top = '50%';
            effect.style.left = '50%';
            effect.style.transform = 'translate(-50%, -50%)';
            effect.style.fontSize = '4rem';
            effect.style.fontWeight = 'bold';
            effect.style.color = '#ffd93d';
            effect.style.textShadow = '0 0 20px rgba(255, 217, 61, 0.8)';
            effect.style.zIndex = '999';
            effect.style.pointerEvents = 'none';
            effect.style.animation = 'x2Activation 2s ease-out forwards';
            effect.textContent = '🚀 X2 ACTIVADO!';
            
            container.appendChild(effect);
            
            setTimeout(() => GameUtils.safeRemoveElement(effect), 2000);
        } catch (error) {
            console.error('Error mostrando efecto X2:', error);
        }
    }

    updateX2Indicator() {
        try {
            const existingIndicator = document.getElementById('x2-active-indicator');
            
            if (this.game && this.game.gameState.x2Multiplier) {
                // Crear indicador si no existe
                if (!existingIndicator) {
                    const indicator = document.createElement('div');
                    indicator.id = 'x2-active-indicator';
                    indicator.innerHTML = '🚀 X2 ACTIVO 🚀';
                    indicator.style.position = 'fixed';
                    indicator.style.top = '20px';
                    indicator.style.left = '50%';
                    indicator.style.transform = 'translateX(-50%)';
                    indicator.style.fontSize = '1.5rem';
                    indicator.style.fontWeight = 'bold';
                    indicator.style.color = '#ffd93d';
                    indicator.style.background = 'rgba(0,0,0,0.8)';
                    indicator.style.padding = '10px 20px';
                    indicator.style.borderRadius = '25px';
                    indicator.style.border = '2px solid #ffd93d';
                    indicator.style.textShadow = '0 0 10px rgba(255, 217, 61, 0.8)';
                    indicator.style.boxShadow = '0 0 20px rgba(255, 217, 61, 0.6)';
                    indicator.style.zIndex = '9999';
                    indicator.style.animation = 'x2IndicatorPulse 1s ease-in-out infinite';
                    indicator.style.pointerEvents = 'none';
                    
                    document.body.appendChild(indicator);
                }
            } else {
                // Remover indicador si existe y x2 no está activo
                if (existingIndicator) {
                    GameUtils.safeRemoveElement(existingIndicator);
                }
            }
        } catch (error) {
            console.error('Error actualizando indicador X2:', error);
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
// Función global para probar el final del juego
window.testGameOver = function() {
    console.log('🧪 PROBANDO GAME OVER MANUALMENTE');
    if (window.game) {
        window.game.endGame();
    } else {
        console.error('❌ Juego no disponible');
    }
};

// Función para verificar estado del juego
window.checkGameState = function() {
    console.log('🎮 ESTADO DEL JUEGO:');
    if (window.game) {
        console.log('- Game existe:', !!window.game);
        console.log('- Game state:', window.game.gameState);
        console.log('- Running:', window.game.gameState?.running);
        console.log('- Mode:', window.game.gameState?.mode);
        console.log('- VS Time Left:', window.game.gameState?.vsTimeLeft);
        console.log('- Elements VS Area:', window.game.elements?.vsGameArea);
    } else {
        console.log('❌ Game no existe');
    }
};

// Función para forzar crear un círculo VS
window.forceCreateVsCircle = function() {
    console.log('🔵 FORZANDO CREACIÓN DE CÍRCULO VS');
    if (window.game && window.game.circleManager) {
        window.game.circleManager.createVsCircle();
    } else {
        console.log('❌ No se puede crear círculo - game o circleManager no disponible');
    }
};

// Función de test paso a paso
window.stepByStepVsTest = function() {
    console.log('🧪 TEST PASO A PASO VS MÁQUINA');
    
    if (!window.game) {
        console.log('❌ Game no disponible');
        return;
    }
    
    console.log('1️⃣ Reseteando estado...');
    window.game.resetGameState('vs-machine', 1);
    
    console.log('2️⃣ Verificando estado...');
    checkGameState();
    
    console.log('3️⃣ Mostrando pantalla VS...');
    window.game.showVsGameScreen();
    
    console.log('4️⃣ Limpiando círculos...');
    window.game.circleManager.clearAll();
    
    console.log('5️⃣ Creando círculo manualmente...');
    forceCreateVsCircle();
    
    console.log('✅ Test completado');
};

// Función para probar el modo VS
window.testVsMode = function() {
    console.log('🧪 PROBANDO MODO VS MANUALMENTE');
    if (window.game) {
        window.game.startVsMachineGame(1); // Dificultad fácil
    } else {
        console.error('❌ Juego no disponible');
    }
};

// Función para verificar elementos del DOM
window.checkVsElements = function() {
    console.log('🔍 VERIFICANDO ELEMENTOS VS:');
    const vsGameArea = document.getElementById('vs-game-area');
    console.log('- vs-game-area:', vsGameArea);
    console.log('- vs-game-area children:', vsGameArea ? vsGameArea.children.length : 'No encontrado');
};

// CLASE PRINCIPAL DEL JUEGO
// ============================================================================

class CircleTapGame {
    constructor() {
        // Inicializar sistema de autenticación
        this.authManager = new AuthManager();
    // Audio
    this.audio = new AudioManager();
        
        // Estado del juego
        this.gameState = {
            mode: 'classic',
            running: false,
            paused: false,
            score: 0,
            timeLeft: GAME_CONFIG.CLASSIC.TIME_LIMIT,
            difficulty: 1,
            playerScore: 0,
            machineScore: 0,
            machineDifficulty: 1,
            vsTimeLeft: GAME_CONFIG.VS_MACHINE.TIME_LIMIT,
            x2Multiplier: false,
            x2ButtonShown: false,
            x2TriggerTime: 0
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
            rapidBtn: document.getElementById('rapid-btn'),
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
            gameArea: document.querySelector('.game-play-area'),
            playerScoreElement: document.getElementById('player-score'),
            machineScoreElement: document.getElementById('machine-score'),
            vsTimeElement: document.getElementById('vs-time'),
            difficultyNameElement: document.getElementById('difficulty-name'),
            difficultyRateElement: document.getElementById('difficulty-rate'),
            vsGameArea: document.querySelector('.vs-game-play-area'),
            playerFinalScoreElement: document.getElementById('player-final-score'),
            machineFinalScoreElement: document.getElementById('machine-final-score'),
            vsResultTitleElement: document.getElementById('vs-result-title'),
            vsResultMessageElement: document.getElementById('vs-result-message'),
            
            // Pantalla de récords
            recordsScreen: document.getElementById('records-screen'),
            recordsBtn: document.getElementById('records-btn'),
            resetOverlaysBtn: document.getElementById('reset-overlays-btn'),
            startSettingsBtn: document.getElementById('start-settings-btn'),
            recordsScreen: document.getElementById('records-screen'),
            recordsBackBtn: document.getElementById('records-back-btn'),
            
            // Elementos de récords
            bestClassicScore: document.getElementById('best-classic-score'),
            bestRapidScore: document.getElementById('best-rapid-score'),
            bestVsScore: document.getElementById('best-vs-score'),
            classicRecordsList: document.getElementById('classic-records-list'),
            rapidRecordsList: document.getElementById('rapid-records-list'),
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
        this.uiManager.game = this; // Agregar referencia al juego
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

            // Event listeners para botones de autenticación
            console.log('🔍 Configurando eventos de autenticación...');
            console.log('🔍 loginBtn:', loginBtn);
            console.log('🔍 registerBtn:', registerBtn);
            console.log('🔍 logoutBtn:', logoutBtn);
            
            if (!loginBtn) console.error('❌ login-btn not found!');
            if (!registerBtn) console.error('❌ register-btn not found!');
            if (!logoutBtn) console.error('❌ logout-btn not found!');
            
            this.addButtonEvents(loginBtn, () => this.login());
            this.addButtonEvents(registerBtn, () => {
                console.log('🔘 Register button clicked!');
                this.toggleRegisterMode();
            });
            this.addButtonEvents(logoutBtn, () => this.logout());

            // Configurar eventos principales
        this.addButtonEvents(this.elements.classicBtn, () => { this.audio?.play('ui'); this.startClassicGame(); });
        this.addButtonEvents(this.elements.rapidBtn, () => { this.audio?.play('ui'); this.startRapidGame(); });
        this.addButtonEvents(this.elements.vsMachineBtn, () => { this.audio?.play('ui'); this.showDifficultyScreen(); });
        this.addButtonEvents(this.elements.recordsBtn, () => { this.audio?.play('ui'); this.showRecordsScreen(); });
        this.addButtonEvents(this.elements.startSettingsBtn, () => {
            this.audio?.play('ui');
            const panel = document.getElementById('settings-panel');
            if (panel && panel.classList.contains('hidden')) panel.classList.remove('hidden');
            // Sincronizar valores actuales
            try { window.game && window.game.syncExternalSettings?.(); } catch {}
        });
            // Botón ahora se gestiona al final (resetea solo tutorial) — se elimina lógica antigua de overlays
        this.addButtonEvents(this.elements.backBtn, () => { this.audio?.play('ui'); this.showStartScreen(); });
            this.addButtonEvents(this.elements.restartBtn, () => {
                if (this.gameState.mode === 'rapid') {
            this.audio?.play('ui');
            this.startRapidGame();
                } else {
            this.audio?.play('ui');
            this.startClassicGame();
                }
            });
        this.addButtonEvents(this.elements.menuBtn, () => { this.audio?.play('ui'); this.showStartScreen(); });
        this.addButtonEvents(this.elements.vsRestartBtn, () => { this.audio?.play('ui'); this.restartVsGame(); });
        this.addButtonEvents(this.elements.vsMenuBtn, () => { this.audio?.play('ui'); this.showStartScreen(); });
        this.addButtonEvents(this.elements.recordsBackBtn, () => { this.audio?.play('ui'); this.showStartScreen(); });
            
            // Botones de dificultad
            this.elements.difficultyBtns.forEach(btn => {
                this.addButtonEvents(btn, () => {
                    const difficulty = parseInt(btn.dataset.difficulty);
                    console.log('🎯 BOTÓN DE DIFICULTAD PRESIONADO:', difficulty);
                    this.audio?.play('ui');
                    this.startVsMachineGame(difficulty);
                });
            });

            // Botones de pausa
            const pauseBtn = document.getElementById('pause-btn');
            const vsPauseBtn = document.getElementById('vs-pause-btn');
            const resumeBtn = document.getElementById('resume-btn');
            const pauseMenuBtn = document.getElementById('pause-menu-btn');

            this.addButtonEvents(pauseBtn, () => { this.audio?.play('ui'); this.togglePause(); });
            this.addButtonEvents(vsPauseBtn, () => { this.audio?.play('ui'); this.togglePause(); });
            this.addButtonEvents(resumeBtn, () => { this.audio?.play('ui'); this.resumeGame(); });
            this.addButtonEvents(pauseMenuBtn, () => {
                this.gameState.running = false;
                this.gameState.paused = false;
                this.timerManager.clearAllTimers();
                this.circleManager.clearAll();
                this.audio?.play('ui');
                this.showStartScreen();
            });
        } catch (error) {
            console.error('Error configurando eventos:', error);
        }
    }

    setupTouchHandling() {
        // Solo prevenir comportamientos por defecto en elementos específicos, no en todo el documento
        
        // Prevenir zoom en iOS solo en elementos no interactivos
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        
        // Mantener orientación
        window.addEventListener('orientationchange', () => {
            setTimeout(() => window.scrollTo(0, 0), 100);
        });
        
        // Prevenir scroll solo en las áreas de juego delimitadas
        const gamePlayArea = document.querySelector('.game-play-area');
        const vsGamePlayArea = document.querySelector('.vs-game-play-area');
        
        [gamePlayArea, vsGamePlayArea].forEach(area => {
            if (area) {
                ['touchstart', 'touchmove'].forEach(event => {
                    area.addEventListener(event, (e) => {
                        e.preventDefault();
                    }, { passive: false });
                });
            }
        });
        
        // Prevenir scroll del body solo si no es un elemento interactivo
        ['touchstart', 'touchmove'].forEach(event => {
            document.body.addEventListener(event, (e) => {
                // Solo prevenir si no es un botón, input u otro elemento interactivo
                if (!e.target.closest('button, input, .btn, .circle')) {
                    e.preventDefault();
                }
            }, { passive: false });
        });
    }

    addButtonEvents(button, handler) {
        console.log('🔧 Adding events to button:', button, 'Handler:', handler ? 'exists' : 'missing');
        if (!button || !handler) {
            console.log('❌ Button or handler missing, skipping event setup');
            return;
        }
        
        let touchHandled = false;
        
        // Evento touch para móviles (más responsivo)
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchHandled = true;
            handler();
        }, { passive: false });
        
        // Evento click como respaldo (para desktop y casos donde touch falle)
        button.addEventListener('click', (e) => {
            if (touchHandled) {
                touchHandled = false;
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            handler();
        });
        
        // Resetear el flag después de un tiempo
        button.addEventListener('touchend', () => {
            setTimeout(() => {
                touchHandled = false;
            }, 100);
        });
    }

    // ========================================================================
    // MÉTODOS DE NAVEGACIÓN
    // ========================================================================

    showStartScreen() {
        this.screenManager.showScreen('start');
        // Ocultar cursor de la máquina cuando se sale del modo VS
        this.circleManager.hideMachineCursorCompletely();
    // Mantener música sonando en menú (antes se detenía)
    if (this.audio) {
        // Si venimos de juego builtin reanudar (ya seguirá). Si se pausó archivo, intentar play.
        this.audio.ensureCanPlay();
        this.audio.playMusic();
    }
        
        // Actualizar estadísticas cuando se muestra la pantalla principal
        if (window.pageStats) {
            window.pageStats.updateActiveUsers();
            window.pageStats.updateDisplay();
        }
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
        console.log('🤖 MOSTRANDO PANTALLA VS GAME');
        this.screenManager.showScreen('vs-game');
        // Mostrar cursor para modo VS
        this.circleManager.showMachineCursorForVsMode();
        console.log('✅ Pantalla VS game mostrada');
    }

    showGameOverScreen() {
        console.log('🎮 ENTRANDO A showGameOverScreen');
        console.log('📊 Puntuación final:', this.gameState.score);
        
        this.uiManager.showFinalScore(this.gameState.score);
        console.log('✅ Final score actualizado en UI');
        
        console.log('🚀 Llamando a screenManager.showScreen("gameOver")');
        this.screenManager.showScreen('gameOver');
        
        // Verificación adicional - forzar mostrar la pantalla si no se muestra
        setTimeout(() => {
            const gameOverScreen = document.getElementById('game-over-screen');
            if (gameOverScreen && gameOverScreen.classList.contains('hidden')) {
                console.log('⚠️ Pantalla game-over aún oculta, forzando visualización...');
                gameOverScreen.classList.remove('hidden');
                console.log('🔧 Pantalla game-over forzada a mostrarse');
            } else {
                console.log('✅ Pantalla game-over se muestra correctamente');
            }
        }, 100);
        
        console.log('✅ showGameOverScreen completado');
    }

    showVsResultScreen() {
        console.log('🏆 MOSTRANDO RESULTADO VS');
        this.uiManager.showVsResult(this.gameState.playerScore, this.gameState.machineScore);
        this.screenManager.showScreen('vs-result');
        console.log('✅ Resultado VS mostrado');
    }

    showRecordsScreen() {
        this.recordsManager.updateRecordsDisplay();
        this.screenManager.showScreen('records');
        // Ocultar cursor cuando se va a récords
        this.circleManager.hideMachineCursorCompletely();
        // Inicializar pestañas de récords
        this.initRecordsTabs();
    }
    
    // (Eliminado resetOverlays antiguo — ahora solo tutorial reset manejado en DOMContentLoaded)
    
    initRecordsTabs() {
        // Limpiar event listeners previos para evitar duplicados
        const tabButtons = document.querySelectorAll('.records-tabs .tab-btn');
        
        // Clonar y reemplazar para limpiar event listeners
        tabButtons.forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Obtener los nuevos botones y agregar event listeners
        const newTabButtons = document.querySelectorAll('.records-tabs .tab-btn');
        
        newTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedMode = e.target.dataset.mode;
                this.switchRecordsTab(selectedMode);
            });
        });
        
        // Mostrar pestaña clásica por defecto
        this.switchRecordsTab('classic');
    }
    
    switchRecordsTab(mode) {
        // Remover clase active de todos los botones
        const tabButtons = document.querySelectorAll('.records-tabs .tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Agregar clase active al botón seleccionado
        const activeButton = document.querySelector(`.records-tabs .tab-btn[data-mode="${mode}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Ocultar todas las secciones
        const recordsSections = document.querySelectorAll('.records-section');
        recordsSections.forEach(section => {
            section.classList.add('hidden');
        });
        
        // Mostrar sección seleccionada
        const activeSection = document.querySelector(`.records-section[data-mode="${mode}"]`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }
    }

    // ========================================================================
    // MÉTODOS DE INICIO DE JUEGO
    // ========================================================================

    startClassicGame() {
        this.resetGameState('classic');
        this.showGameScreen();
        this.circleManager.clearAll();
    this.audio?.ensureCanPlay();
    this.audio?.playMusic();
        
        // Mostrar overlay informativo y pausar hasta que el usuario confirme
    // Usar 'casual' si existe para mostrar texto alternativo, pero mantener modo 'classic'
    InfoOverlay.show(window.infoOverlay?.messages.casual ? 'casual' : 'classic', () => {
            // Esta función se ejecuta cuando el usuario hace click en "Comenzar"
            this.startClassicTimers();
            this.startCircleMaintenance();
        });
    }

    startRapidGame() {
        console.log('⚡ INICIANDO MODO RÁPIDO');
        this.resetGameState('rapid');
        this.showGameScreen();
        this.circleManager.clearAll();
    this.audio?.ensureCanPlay();
    this.audio?.playMusic();
        
        // Mostrar overlay informativo y pausar hasta que el usuario confirme
        InfoOverlay.show('rapid', () => {
            // Esta función se ejecuta cuando el usuario hace click en "Comenzar"
            this.startRapidTimers();
            this.startRapidSpawning();
        });
        console.log('✅ Modo rápido iniciado');
    }

    startVsMachineGame(difficulty) {
        console.log('🤖 INICIANDO MODO VS MÁQUINA, dificultad:', difficulty);
        this.resetGameState('vs-machine', difficulty);
        this.uiManager.setupVsDifficulty(difficulty);
        this.showVsGameScreen();
        this.circleManager.clearAll();
    this.audio?.ensureCanPlay();
    this.audio?.playMusic();
        
        // Mostrar overlay informativo y pausar hasta que el usuario confirme
        InfoOverlay.show('vs', () => {
            // Esta función se ejecuta cuando el usuario hace click en "Comenzar"
            console.log('🕐 Iniciando timers VS...');
            this.startVsTimers();
            console.log('🎯 Iniciando spawn de círculos...');
            this.startVsSpawning();
            console.log('🤖 Iniciando IA de la máquina...');
            this.startMachineAI();
            console.log('✅ Modo VS máquina iniciado completamente');
        });
    }

    restartVsGame() {
        this.startVsMachineGame(this.gameState.machineDifficulty);
    }

    resetGameState(mode, difficulty = 1) {
        console.log('🔄 RESETEANDO ESTADO DEL JUEGO:', mode, 'dificultad:', difficulty);
        this.gameState.mode = mode;
        this.gameState.running = true;
        this.gameState.difficulty = 1;
        
        // Resetear variables del multiplicador X2
        this.gameState.x2Multiplier = false;
        this.gameState.x2ButtonShown = false;
        
        if (mode === 'classic') {
            this.gameState.score = 0;
            this.gameState.timeLeft = GAME_CONFIG.CLASSIC.TIME_LIMIT;
            
            // Generar tiempo aleatorio para X2 (entre 30 y 6 segundos, pero no mayor que el tiempo total - 1)
            const maxTriggerTime = Math.min(30, this.gameState.timeLeft - 1);
            const minTriggerTime = Math.min(6, maxTriggerTime);
            this.gameState.x2TriggerTime = Math.floor(Math.random() * (maxTriggerTime - minTriggerTime + 1)) + minTriggerTime;
            
            console.log('✅ Estado clásico inicializado - Score:', this.gameState.score, 'Time:', this.gameState.timeLeft);
        } else if (mode === 'rapid') {
            this.gameState.score = 0;
            this.gameState.timeLeft = GAME_CONFIG.RAPID.TIME_LIMIT;
            
            // Para modo rápido, ajustar el rango según el tiempo disponible
            const maxTriggerTime = Math.min(30, this.gameState.timeLeft - 1);
            const minTriggerTime = Math.min(6, maxTriggerTime);
            this.gameState.x2TriggerTime = Math.floor(Math.random() * (maxTriggerTime - minTriggerTime + 1)) + minTriggerTime;
            
            console.log('✅ Estado rápido inicializado - Score:', this.gameState.score, 'Time:', this.gameState.timeLeft);
        } else {
            this.gameState.playerScore = 0;
            this.gameState.machineScore = 0;
            this.gameState.machineDifficulty = difficulty;
            this.gameState.vsTimeLeft = GAME_CONFIG.VS_MACHINE.TIME_LIMIT;
            this.gameState.machineSpeedMultiplier = 1; // Inicializar multiplicador
            
            // Para modo VS máquina
            const maxTriggerTime = Math.min(30, this.gameState.vsTimeLeft - 1);
            const minTriggerTime = Math.min(6, maxTriggerTime);
            this.gameState.x2TriggerTime = Math.floor(Math.random() * (maxTriggerTime - minTriggerTime + 1)) + minTriggerTime;
            
            console.log('✅ Estado VS inicializado - Player:', this.gameState.playerScore, 'Machine:', this.gameState.machineScore, 'Time:', this.gameState.vsTimeLeft);
        }
        
        console.log('🎲 Botón X2 aparecerá en:', this.gameState.x2TriggerTime, 'segundos restantes');
        console.log('🎮 Estado final running:', this.gameState.running);
    }

    // ========================================================================
    // MÉTODOS DE TIMERS
    // ========================================================================

    startClassicTimers() {
        this.timerManager.startTimer('gameTimer', () => {
            if (!this.gameState.running) return;
            
            this.gameState.timeLeft--;
            this.uiManager.updateClassicUI(this.gameState.score, this.gameState.timeLeft);
            
            console.log('⏱️ Tiempo restante:', this.gameState.timeLeft);
            
            // Mostrar botón X2 en el momento aleatorio calculado
            if (this.gameState.timeLeft === this.gameState.x2TriggerTime && !this.gameState.x2ButtonShown) {
                this.gameState.x2ButtonShown = true;
                console.log('🎲 ¡Aparece el botón X2! Tiempo restante:', this.gameState.timeLeft);
                this.uiManager.showX2Button(this.elements.gameArea);
            }
            
            if (this.gameState.timeLeft <= 0) {
                console.log('⏰ TIEMPO AGOTADO - Llamando endGame()');
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

    startRapidTimers() {
        console.log('⚡ INICIANDO TIMER RÁPIDO');
        console.log('🕐 Tiempo inicial rápido:', this.gameState.timeLeft);
        
        this.timerManager.startTimer('rapidTimer', () => {
            if (!this.gameState.running) return;
            
            this.gameState.timeLeft--;
            this.uiManager.updateClassicUI(this.gameState.score, this.gameState.timeLeft);
            
            console.log('⏱️ Tiempo rápido restante:', this.gameState.timeLeft);
            
            // Mostrar botón X2 en el momento aleatorio calculado
            if (this.gameState.timeLeft === this.gameState.x2TriggerTime && !this.gameState.x2ButtonShown) {
                this.gameState.x2ButtonShown = true;
                console.log('🎲 ¡Aparece el botón X2 rápido! Tiempo restante:', this.gameState.timeLeft);
                this.uiManager.showX2Button(this.elements.gameArea);
            }
            
            if (this.gameState.timeLeft <= 0) {
                console.log('⏰ TIEMPO RÁPIDO AGOTADO - Llamando endGame()');
                this.endGame();
                return;
            }
            
            // Aumentar dificultad más rápido
            if (this.gameState.timeLeft % GAME_CONFIG.RAPID.DIFFICULTY_INCREASE_INTERVAL === 0 && 
                this.gameState.timeLeft < GAME_CONFIG.RAPID.TIME_LIMIT) {
                this.gameState.difficulty += GAME_CONFIG.RAPID.DIFFICULTY_MULTIPLIER;
                console.log('⚡ Dificultad rápida aumentada a:', this.gameState.difficulty);
            }
        }, 1000);
    }

    startVsTimers() {
        console.log('⏰ INICIANDO TIMER VS');
        console.log('🕐 Tiempo inicial VS:', this.gameState.vsTimeLeft);
        
        this.timerManager.startTimer('vsTimer', () => {
            if (!this.gameState.running) return;
            
            this.gameState.vsTimeLeft--;
            console.log('⏱️ Tiempo VS restante:', this.gameState.vsTimeLeft);
            
            this.uiManager.updateVsUI(
                this.gameState.playerScore, 
                this.gameState.machineScore, 
                this.gameState.vsTimeLeft
            );
            
            // Mostrar botón X2 en el momento aleatorio calculado
            if (this.gameState.vsTimeLeft === this.gameState.x2TriggerTime && !this.gameState.x2ButtonShown) {
                this.gameState.x2ButtonShown = true;
                console.log('🎲 ¡Aparece el botón X2 VS! Tiempo restante:', this.gameState.vsTimeLeft);
                this.uiManager.showX2Button(this.elements.vsGameArea);
            }
            
            // Máquina se vuelve más agresiva con el tiempo
            if (this.gameState.vsTimeLeft % 15 === 0 && this.gameState.vsTimeLeft > 0) {
                this.increaseMachineDifficulty();
            }
            
            if (this.gameState.vsTimeLeft <= 0) {
                console.log('⏰ TIEMPO VS AGOTADO - Terminando juego VS');
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

    startRapidSpawning() {
        console.log('⚡ INICIANDO SPAWN RÁPIDO');
        
        // Crear 5 círculos iniciales inmediatamente
        for (let i = 0; i < GAME_CONFIG.RAPID.MAX_CIRCLES; i++) {
            this.circleManager.createRapidCircle();
        }
        
        console.log(`🚀 Iniciados ${GAME_CONFIG.RAPID.MAX_CIRCLES} círculos rápidos. Los reemplazos se crean automáticamente.`);
        
        // Verificación periódica para asegurar que siempre haya 5 círculos
        const maintainCircles = () => {
            if (!this.gameState.running) {
                return;
            }
            
            // Crear círculos faltantes si hay menos de 5
            const currentCircles = this.circleManager.circles.filter(c => c.dataset.mode === 'rapid').length;
            const needed = GAME_CONFIG.RAPID.MAX_CIRCLES - currentCircles;
            
            for (let i = 0; i < needed; i++) {
                this.circleManager.createRapidCircle();
            }
            
            // Verificar cada 200ms
            this.timerManager.startTimeout('rapidMaintain', maintainCircles, 200);
        };
        
        // Iniciar verificación de mantenimiento
        this.timerManager.startTimeout('rapidMaintain', maintainCircles, 200);
    }

    startVsSpawning() {
        console.log('🎯 INICIANDO SPAWN DE CÍRCULOS VS');
        const spawnCircle = () => {
            if (!this.gameState.running) {
                console.log('⛔ Juego no está corriendo, no se pueden crear círculos');
                return;
            }
            
            console.log('🔵 Creando círculo VS...');
            this.circleManager.createVsCircle();
            console.log(`⏰ Próximo círculo en ${GAME_CONFIG.VS_MACHINE.SPAWN_RATE}ms`);
            this.timerManager.startTimeout('vsSpawn', spawnCircle, GAME_CONFIG.VS_MACHINE.SPAWN_RATE);
        };
        
        console.log('🚀 Iniciando primer círculo VS...');
        spawnCircle();
    }

    startMachineAI() {
        console.log('🤖 INICIANDO IA DE LA MÁQUINA');
        const difficulty = this.gameState.machineDifficulty;
        let baseReactionTime = GAME_CONFIG.VS_MACHINE.MACHINE_REACTION_TIME[difficulty];
        console.log(`⚡ Tiempo de reacción base: ${baseReactionTime}ms para dificultad ${difficulty}`);
        
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
        
    this.audio?.play('hit');
        let points = parseInt(circle.dataset.points);
        // Variación de puntos específica para modo rápido
        if (this.gameState.mode === 'rapid') {
            // Base según tamaño (si estuviera) + random: 1-3 (pequeños) / 1-5 (otros)
            const rand = Math.random();
            if (points <= 2) {
                points = 1 + Math.floor(rand * 3); // 1-3
            } else {
                points = 1 + Math.floor(rand * 5); // 1-5
            }
        }
        
        // Aplicar multiplicador x2 si está activo
        if (this.gameState.x2Multiplier) {
            points *= 2;
            console.log('🚀 Multiplicador X2 aplicado! Puntos:', points);
        }
        
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
        
    if (player === 'player') this.audio?.play('hit');
        let points = parseInt(circle.dataset.points);
        
        if (player === 'player') {
            // Aplicar multiplicador x2 si está activo (solo para el jugador)
            if (this.gameState.x2Multiplier) {
                points *= 2;
                console.log('🚀 Multiplicador X2 aplicado en VS! Puntos:', points);
            }
            
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
        
    this.audio?.play('machine');
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
        console.log('🏁 FINALIZANDO JUEGO - Modo:', this.gameState.mode);
        this.gameState.running = false;
        this.timerManager.clearAllTimers();
        this.circleManager.clearAll();
    this.audio?.play('over');
        
        // Guardar récord según el modo de juego
        let position;
        if (this.gameState.mode === 'rapid') {
            position = this.recordsManager.addRapidRecord(this.gameState.score);
            console.log('💾 Récord rápido guardado, posición:', position);
        } else {
            position = this.recordsManager.addClassicRecord(this.gameState.score);
            console.log('💾 Récord clásico guardado, posición:', position);
        }
        
        console.log('⏰ Esperando 500ms antes de mostrar Game Over...');
        setTimeout(() => {
            console.log('🎮 Llamando a showGameOverScreen...');
            this.showGameOverScreen();
        }, 500);
    }

    endVsGame() {
        console.log('🏁 FINALIZANDO JUEGO VS MÁQUINA');
        console.log('📊 Puntuación final - Jugador:', this.gameState.playerScore, 'Máquina:', this.gameState.machineScore);
        
        this.gameState.running = false;
        this.timerManager.clearAllTimers();
        this.circleManager.clearAll();
    this.audio?.play('over');
        
        // Guardar récord del modo VS
        const result = this.recordsManager.addVsRecord(
            this.gameState.playerScore,
            this.gameState.machineScore,
            this.gameState.machineDifficulty
        );
        
        console.log('⏰ Esperando 500ms antes de mostrar resultado VS...');
        setTimeout(() => {
            console.log('🏆 Llamando a showVsResultScreen...');
            this.showVsResultScreen();
        }, 500);
    }

    // ========================================================================
    // MÉTODOS DE AUTENTICACIÓN
    // ========================================================================

    login() {
        console.log('🔑 Login function called');
        console.log('📝 Current register mode:', this.authManager.isRegisterMode);
        
        // Si está en modo registro, llamar a la función register
        if (this.authManager.isRegisterMode) {
            console.log('➡️ Redirecting to register function');
            return this.register();
        }

        console.log('➡️ Processing as login');
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
        console.log('📝 Register function called');
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');

        console.log('👤 Username:', username);
        console.log('🔒 Password length:', password.length);

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
            
            // Ir directamente al menú principal
            this.screenManager.showScreen('start');
        } else {
            errorElement.textContent = result.message;
        }
    }

    toggleRegisterMode() {
        console.log('🔄 Toggle register mode called');
        const isRegisterMode = this.authManager.toggleRegisterMode();
        console.log('📝 Register mode is now:', isRegisterMode);
        
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const title = document.querySelector('.login-form h2');

        if (isRegisterMode) {
            if (loginBtn) loginBtn.textContent = 'Crear Cuenta';
            if (registerBtn) registerBtn.textContent = 'Ya tengo cuenta';
            if (title) title.textContent = 'Registrarse';
            console.log('✅ UI updated to register mode');
        } else {
            if (loginBtn) loginBtn.textContent = 'Entrar';
            if (registerBtn) registerBtn.textContent = 'Registrarse';
            if (title) title.textContent = 'Iniciar Sesión';
            console.log('✅ UI updated to login mode');
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
        
        if (userDisplay) {
            if (currentUser) {
                userDisplay.textContent = `Usuario: ${currentUser}`;
                console.log('✅ Display actualizado para usuario:', currentUser);
                
                // Actualizar estadísticas cuando hay un usuario activo
                if (window.pageStats) {
                    window.pageStats.updateActiveUsers();
                    window.pageStats.updateDisplay();
                }
            } else {
                userDisplay.textContent = 'Usuario: ';
                console.log('ℹ️ Display limpiado - no hay usuario');
            }
        } else {
            console.log('⚠️ Elemento current-user no encontrado en el DOM');
        }
    }

    checkAutoLogin() {
        console.log('🔍 Verificando auto-login...');
        
        // Verificar si hay un usuario logueado automáticamente
        const currentUser = this.authManager.getCurrentUser();
        
        if (currentUser) {
            console.log('✅ Usuario encontrado para auto-login:', currentUser);
            // Usuario ya logueado, ir directamente al menú principal
            this.updateUserDisplay();
            this.screenManager.showScreen('start');
        } else {
            console.log('ℹ️ No hay usuario para auto-login, mostrando pantalla de login');
            // No hay usuario logueado, mostrar pantalla de login
            this.screenManager.showScreen('login');
        }
    }

    // ========================================================================
    // MÉTODOS DE PAUSA
    // ========================================================================

    togglePause() {
        if (this.gameState.paused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        if (!this.gameState.running || this.gameState.paused) return;
        
        console.log('⏸️ Pausando juego...');
        this.gameState.paused = true;
        
        // Pausar todos los timers
        this.timerManager.pauseAllTimers();
        
        // Pausar generación de círculos
        this.circleManager.pauseGeneration();
        
        // Mostrar pantalla de pausa
        this.screenManager.showScreen('pause');
        
        // Actualizar botón de pausa
        this.updatePauseButton();
    }

    resumeGame() {
        if (!this.gameState.paused) return;
        
        console.log('▶️ Reanudando juego...');
        this.gameState.paused = false;
        
        // Reanudar timers
        this.timerManager.resumeAllTimers();
        
        // Reanudar generación de círculos
        this.circleManager.resumeGeneration();
        
        // Volver a la pantalla de juego apropiada
        if (this.gameState.mode === 'vs') {
            this.screenManager.showScreen('vs-game');
            // Reiniciar específicamente el spawn de círculos VS y timer
            this.startVsTimers();
            this.startVsSpawning();
            this.startVsMachine();
        } else {
            this.screenManager.showScreen('game');
        }
        
        // Reiniciar timers del juego
        this.restartGameTimers();
        
        // Actualizar botón de pausa
        this.updatePauseButton();
    }

    updatePauseButton() {
        const pauseBtn = document.getElementById('pause-btn');
        const vsPauseBtn = document.getElementById('vs-pause-btn');
        
        if (pauseBtn) {
            pauseBtn.textContent = this.gameState.paused ? '▶️ Continuar' : '⏸️ Pausar';
        }
        
        if (vsPauseBtn) {
            vsPauseBtn.textContent = this.gameState.paused ? '▶️ Continuar' : '⏸️ Pausar';
        }
    }

    restartGameTimers() {
        // Reiniciar timer principal del juego
        if (this.gameState.mode === 'vs') {
            this.startVsGameTimer();
        } else {
            this.startGameTimer();
        }
        
        // Reiniciar generación de círculos
        this.circleManager.startGeneration();
    }
}

// ============================================================================
// INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
// ============================================================================

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.game = new CircleTapGame();
    // Tutorial manager
        
        // Inicializar InfoOverlay globalmente
        window.infoOverlay = new InfoOverlay();
        
        // Inicializar estadísticas de la página
        window.pageStats = new PageStats();
        
        // Hacer métodos accesibles globalmente para el HTML
        window.gameLogin = () => {
            console.log('gameLogin called');
            window.game.login();
            // Mostrar tutorial si corresponde
            // Tutorial desactivado
        };
        
        window.gameRegister = () => {
            console.log('gameRegister called');
            window.game.register();
            // Tutorial desactivado
        };
        
        window.gameToggleRegister = () => {
            console.log('gameToggleRegister called');
            window.game.toggleRegisterMode();
        };
        
        window.gameLogout = () => {
            console.log('gameLogout called');
            window.game.logout();
        };

        // Botón para volver a ver explicaciones de modos
        const resetBtn = document.getElementById('reset-overlays-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                try {
                    // Eliminar flag de modos ya vistos
                    localStorage.removeItem('circleTapPlayedModes');
                    // (legacy) eliminar antiguo flag de tutorial si existiera
                    localStorage.removeItem('tutorialCompleted');
                    // Feedback visual rápido
                    const original = resetBtn.textContent;
                    resetBtn.disabled = true;
                    resetBtn.textContent = '✅ Explicaciones reiniciadas';
                    setTimeout(() => {
                        resetBtn.textContent = original;
                        resetBtn.disabled = false;
                    }, 1800);
                } catch (e) {
                    console.warn('No se pudo resetear explicaciones:', e);
                }
            });
        }

        // ================== PANEL DE CONFIGURACIÓN ==================
    const settingsToggle = null; // eliminado botón flotante
        const settingsPanel = document.getElementById('settings-panel');
        const settingsClose = document.getElementById('settings-close');
        const sMusicSource = document.getElementById('settings-music-source');
        const sMusicVol = document.getElementById('settings-music-volume');
        const sMusicVolVal = document.getElementById('settings-music-vol-val');
        const sSfxVol = document.getElementById('settings-sfx-volume');
        const sSfxVolVal = document.getElementById('settings-sfx-vol-val');
        const sFileBtn = document.getElementById('settings-music-file-btn');
        const sFileInput = document.getElementById('settings-music-file');
        const sFileName = document.getElementById('settings-music-file-name');
        const sFileRow = document.getElementById('settings-music-file-row');
        const sResetExpl = document.getElementById('settings-reset-explanations');
        const sAutoplay = document.getElementById('settings-autoplay');

        const syncSettingsValues = () => {
            if (!this.audio) return;
            if (sMusicSource) sMusicSource.value = this.audio.musicSource;
            if (sMusicVol) { sMusicVol.value = Math.round(this.audio.musicVolume * 100); if (sMusicVolVal) sMusicVolVal.textContent = sMusicVol.value + '%'; }
            if (sSfxVol) { sSfxVol.value = Math.round(this.audio.sfxVolume * 100); if (sSfxVolVal) sSfxVolVal.textContent = sSfxVol.value + '%'; }
            if (sFileRow) sFileRow.style.display = (this.audio.musicSource === 'file') ? 'flex' : 'none';
            if (sAutoplay) {
                const autoPref = localStorage.getItem('circletap_autoAutoplayMusic') === '1';
                sAutoplay.checked = autoPref;
            }
        };
    // Exponer para uso desde botón de inicio
    this.syncExternalSettings = syncSettingsValues;

        // Abrir configuración desde el botón en pausa
        const pauseSettingsBtn = document.getElementById('pause-settings-btn');
        pauseSettingsBtn?.addEventListener('click', () => {
            syncSettingsValues();
            settingsPanel.classList.remove('hidden');
        });
        settingsClose?.addEventListener('click', () => settingsPanel.classList.add('hidden'));

        sMusicSource?.addEventListener('change', () => {
            if (!this.audio) return;
            this.audio.musicSource = sMusicSource.value;
            localStorage.setItem('circletap_audio_musicSource', this.audio.musicSource);
            this.audio.stopMusic();
            if (this.audio.musicSource === 'caminos') {
                try { this.audio.music.src = 'Caminos de Luz [music].mp3'; this.audio.music.load(); } catch {}
                this.audio.playMusic();
            } else if (this.audio.musicSource === 'builtin') {
                this.audio.playBuiltinLoop();
            } else if (this.audio.musicSource === 'file') {
                if (sFileRow) sFileRow.style.display = 'flex';
            }
            if (sFileRow) sFileRow.style.display = (this.audio.musicSource === 'file') ? 'flex' : 'none';
        });

        sMusicVol?.addEventListener('input', () => {
            if (!this.audio) return;
            this.audio.setMusicVolume(sMusicVol.value / 100);
            if (sMusicVolVal) sMusicVolVal.textContent = sMusicVol.value + '%';
        });
        sSfxVol?.addEventListener('input', () => {
            if (!this.audio) return;
            this.audio.setSfxVolume(sSfxVol.value / 100);
            if (sSfxVolVal) sSfxVolVal.textContent = sSfxVol.value + '%';
            this.audio.play('ui');
        });

        sFileBtn?.addEventListener('click', () => sFileInput?.click());
        sFileInput?.addEventListener('change', () => {
            if (!this.audio) return;
            const file = sFileInput.files && sFileInput.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            this.audio.music.src = url;
            this.audio.musicAvailable = true;
            if (sFileName) sFileName.textContent = file.name;
            this.audio.playMusic();
        });

        sResetExpl?.addEventListener('click', () => {
            localStorage.removeItem('circleTapPlayedModes');
            localStorage.removeItem('tutorialCompleted');
            const original = sResetExpl.textContent;
            sResetExpl.disabled = true;
            sResetExpl.textContent = '✅ Reiniciado';
            setTimeout(() => { sResetExpl.textContent = original; sResetExpl.disabled = false; }, 1600);
        });

        sAutoplay?.addEventListener('change', () => {
            localStorage.setItem('circletap_autoAutoplayMusic', sAutoplay.checked ? '1' : '0');
        });

    // Ocultar panel al reanudar o ir a menú
    document.getElementById('resume-btn')?.addEventListener('click', () => settingsPanel.classList.add('hidden'));
    document.getElementById('pause-menu-btn')?.addEventListener('click', () => settingsPanel.classList.add('hidden'));

    // Ocultar panel al iniciar un modo
    const hideSettingsOnGameStart = () => settingsPanel.classList.add('hidden');
    const originalStartClassic = this.startClassicGame.bind(this);
    this.startClassicGame = (...a) => { hideSettingsOnGameStart(); return originalStartClassic(...a); };
    const originalStartRapid = this.startRapidGame.bind(this);
    this.startRapidGame = (...a) => { hideSettingsOnGameStart(); return originalStartRapid(...a); };
    const originalStartVs = this.startVsMachineGame.bind(this);
    this.startVsMachineGame = (...a) => { hideSettingsOnGameStart(); return originalStartVs(...a); };

        // Si el usuario tenía autoplay preferido y la música no sonó todavía
        if (localStorage.getItem('circletap_autoAutoplayMusic') === '1' && this.audio) {
            this.audio.attemptAutoplay?.();
        }

        // Funciones para gestión de récords
        window.clearAllRecords = () => {
            console.log('🗑️ REINICIANDO TODOS LOS RÉCORDS...');
            if (window.game && window.game.recordsManager) {
                window.game.recordsManager.clearAllRecords();
                console.log('✅ Récords reiniciados exitosamente');
            } else {
                console.error('❌ Juego no disponible');
            }
        };

        window.checkRecords = () => {
            console.log('📊 RÉCORDS ACTUALES:');
            if (window.game && window.game.recordsManager) {
                console.log('- Clásicos:', window.game.recordsManager.classicRecords.length);
                console.log('- Rápidos:', window.game.recordsManager.rapidRecords.length);
                console.log('- VS Máquina:', window.game.recordsManager.vsRecords);
            } else {
                console.log('❌ Game no existe');
            }
        };

        console.log('🎮 Juego inicializado');
        console.log('💡 Usa clearAllRecords() para reiniciar todos los récords');
        console.log('💡 Usa checkRecords() para ver los récords actuales');

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