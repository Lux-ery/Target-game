// Protección anti-manipulación para Circle Tap
// Agregar al final de script.js

(function() {
    'use strict';
    
    // 1. Protección contra modificación de localStorage
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    // Lista de usuarios autorizados para modificar datos
    const adminUsers = ['admin', 'johan']; // Agrega tu usuario aquí
    
    localStorage.setItem = function(key, value) {
        // Permitir siempre guardar usuarios y sesiones (necesario para funcionamiento básico)
        if (key === 'circleTapUsers' || key === 'circleTapCurrentUser') {
            return originalSetItem.call(this, key, value);
        }
        
        // Solo proteger récords de modificaciones no autorizadas
        if (key.includes('circletap_') && key.includes('records') && 
            !adminUsers.includes(getCurrentUser())) {
            console.warn('🚫 Modificación no autorizada detectada en récords');
            return false;
        }
        
        return originalSetItem.call(this, key, value);
    };
    
    localStorage.removeItem = function(key) {
        // Permitir eliminar sesiones (logout normal)
        if (key === 'circleTapCurrentUser') {
            return originalRemoveItem.call(this, key);
        }
        
        // Solo proteger eliminación de usuarios y récords de modificaciones no autorizadas
        if ((key === 'circleTapUsers' || key.includes('circletap_') && key.includes('records')) && 
            !adminUsers.includes(getCurrentUser())) {
            console.warn('🚫 Eliminación no autorizada detectada');
            return false;
        }
        return originalRemoveItem.call(this, key);
    };
    
    // 2. Validación de récords (anti-cheating básico)
    function validateScore(score, mode) {
        const maxReasonableScores = {
            classic: 1000,   // 1000 círculos máximo razonable
            rapid: 500,      // 500 en modo rápido
            vs: 200          // 200 en vs máquina
        };
        
        if (score > maxReasonableScores[mode]) {
            console.warn(`🚫 Puntuación sospechosa detectada: ${score} en modo ${mode}`);
            return false;
        }
        return true;
    }
    
    // 3. Protección contra modificación del DOM del juego
    const gameArea = document.getElementById('gameArea');
    if (gameArea) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'style') {
                    console.warn('🚫 Modificación del área de juego detectada');
                }
            });
        });
        
        observer.observe(gameArea, {
            attributes: true,
            subtree: true
        });
    }
    
    // 4. Detección de herramientas de desarrollador
    let devtools = {open: false};
    let threshold = 160;
    
    function detectDevTools() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.warn('🔍 Herramientas de desarrollador detectadas');
                // Opcional: mostrar advertencia al usuario
                // showSecurityWarning();
            }
        } else {
            devtools.open = false;
        }
    }
    
    setInterval(detectDevTools, 1000);
    
    // 5. Función para mostrar advertencia de seguridad
    function showSecurityWarning() {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 10px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        warning.innerHTML = `
            <strong>⚠️ ADVERTENCIA DE SEGURIDAD</strong><br>
            Se detectó actividad sospechosa.<br>
            Las modificaciones no autorizadas pueden<br>
            resultar en la pérdida de récords.
        `;
        
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) {
                warning.parentNode.removeChild(warning);
            }
        }, 5000);
    }
    
    // 6. Función auxiliar para obtener usuario actual
    function getCurrentUser() {
        return localStorage.getItem('currentUser') || 'guest';
    }
    
    // 7. Validación de integridad de datos al cargar
    function validateGameData() {
        try {
            const records = JSON.parse(localStorage.getItem('circleTapRecords') || '{}');
            const users = JSON.parse(localStorage.getItem('circleTapUsers') || '{}');
            
            // Verificar estructura de datos
            if (!records.classic || !records.rapid || !records.vs) {
                console.warn('🚫 Estructura de datos de récords corrupta');
                return false;
            }
            
            // Verificar récords sospechosos
            const allRecords = [
                ...(records.classic || []),
                ...(records.rapid || []),
                ...Object.values(records.vs || {}).flat()
            ];
            
            for (let record of allRecords) {
                if (!record.user || !record.score || !record.date) {
                    console.warn('🚫 Récord con datos faltantes detectado');
                    continue;
                }
                
                if (typeof record.score !== 'number' || record.score < 0) {
                    console.warn('🚫 Puntuación inválida detectada');
                    continue;
                }
            }
            
            return true;
        } catch (error) {
            console.error('🚫 Error validando datos del juego:', error);
            return false;
        }
    }
    
    // Ejecutar validación al cargar la página
    document.addEventListener('DOMContentLoaded', validateGameData);
    
    console.log('🛡️ Protecciones anti-manipulación activadas');
})();
