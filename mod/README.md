# 🎯 Circle Tap - Juego Móvil Online

Un juego móvil interactivo desarrollado con HTML5, CSS3 y JavaScript vanilla. Toca círculos, compite contra la máquina y establece récords personales.

## 🌐 **¿CÓMO HACER TU JUEGO PÚBLICO EN INTERNET?**

### **Opciones Gratuitas para Hospedar tu Juego:**

#### 1. **GitHub Pages** ⭐ (RECOMENDADO - Gratis y Fácil)
```bash
# Pasos simples:
1. Ve a github.com y crea una cuenta
2. Crear nuevo repositorio público
3. Subir todos los archivos del juego
4. Settings → Pages → Deploy from branch "main"
5. ¡Listo! Tu URL será: https://tuusuario.github.io/nombre-repositorio
```

#### 2. **Netlify** 🚀 (Gratis con dominio personalizado)
```bash
# Súper fácil:
1. Ve a netlify.com
2. Arrastra la carpeta del juego al área de deploy
3. ¡Juego online al instante!
4. URL: https://nombre-aleatorio.netlify.app
```

#### 3. **Vercel** ⚡ (Gratis y muy rápido)
```bash
# Para desarrolladores:
1. Ve a vercel.com
2. Conecta tu GitHub
3. Deploy automático
4. URL: https://nombre-proyecto.vercel.app
```

#### 4. **Surge.sh** 💨 (Comando simple)
```bash
npm install -g surge
cd carpeta-del-juego
surge
# Te dará una URL instantánea
```

### 📋 **Archivos que DEBES incluir:**
✅ `index.html` - Página principal  
✅ `style.css` - Estilos del juego  
✅ `script.js` - Lógica del juego  
✅ `manifest.json` - Config PWA  
✅ `sw.js` - Service Worker  

### 🎯 **Recomendación Final:**
**Usa GitHub Pages** - Es gratis, confiable y tu juego estará disponible 24/7 para todo el mundo.

---

## 🎮 Modos de Juego

### 🟢 Modo Clásico
1. **Objetivo**: Toca los círculos que aparecen en la pantalla antes de que desaparezcan
2. **Consistencia**: Siempre hay exactamente 3 círculos en pantalla
3. **Respuesta inmediata**: Al tocar un círculo, inmediatamente aparece otro
4. **Puntuación**: Los círculos más pequeños dan más puntos
5. **Sin vidas**: Ya no hay límite de vidas - enfócate solo en conseguir puntos
6. **Tiempo**: Tienes 30 segundos para conseguir la máxima puntuación
7. **Dificultad**: El juego se vuelve más difícil con el tiempo (círculos más pequeños y desaparecen más rápido)

### 🤖 Modo VS Máquina
1. **Competencia**: Compite contra una IA que también toca círculos
2. **Tiempo**: 60 segundos de duración
3. **Puntuación**: Todos los círculos dan 10 puntos
4. **Objetivo**: Conseguir más puntos que la máquina
5. **Dificultades**:
   - 🟢 **Fácil**: La máquina toca 1 círculo por segundo
   - 🟡 **Medio**: La máquina toca 2 círculos por segundo  
   - 🟠 **Difícil**: La máquina toca 3 círculos por segundo
   - 🔴 **Extremo**: La máquina toca 5 círculos por segundo

## 🚀 Cómo Ejecutar

### Opción 1: Servidor Local Simple
```bash
# Navega al directorio del juego
cd "c:\Users\Johan\OneDrive\Escritorio\mod"

# Si tienes Python instalado
python -m http.server 8000

# O si tienes Node.js instalado
npx serve .
```

Luego abre tu navegador y ve a `http://localhost:8000`

### Opción 2: Abrir Directamente
Simplemente abre el archivo `index.html` en tu navegador web.

### Opción 3: VS Code Live Server
1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

## 📱 Instalación en Móvil

Este juego es una Progressive Web App (PWA), lo que significa que puedes instalarlo en tu móvil:

### En Android (Chrome):
1. Abre el juego en Chrome
2. Toca el menú (⋮) y selecciona "Agregar a pantalla de inicio"
3. Confirma la instalación

### En iOS (Safari):
1. Abre el juego en Safari
2. Toca el botón de compartir (□↗)
3. Selecciona "Agregar a pantalla de inicio"

## 🛠️ Características Técnicas

- **🏗️ Arquitectura Modular**: Código dividido en clases especializadas para fácil mantenimiento
- **🔧 Gestión Robusta de Errores**: Try-catch en todas las operaciones críticas
- **⚡ Gestión Inteligente de Timers**: Sistema centralizado de timers para evitar memory leaks
- **🎯 Separación de Responsabilidades**: Cada clase tiene una función específica
- **📱 Responsive Design**: Se adapta a cualquier tamaño de pantalla
- **🎮 Touch Optimizado**: Diseñado específicamente para dispositivos táctiles
- **📦 PWA**: Funciona offline y se puede instalar como una app nativa
- **🚫 Sin Dependencias**: Solo HTML, CSS y JavaScript vanilla
- **🔍 Debugging Mejorado**: Sistema de logs y manejo de errores globalizado

## 🎨 Características del Juego

### **Modo Clásico:**
- **Círculos Coloridos**: 6 diferentes gradientes de colores
- **Sistema de Puntuación Variable**: Puntos basados en el tamaño del círculo
- **Dificultad Progresiva**: Aumenta cada 10 segundos
- **Sistema de Vidas**: 3 oportunidades para fallar

### **Modo VS Máquina:**
- **IA Competitiva**: La máquina toca círculos automáticamente
- **4 Niveles de Dificultad**: Desde 1 hasta 5 círculos por segundo
- **Puntuación Equilibrada**: Todos los círculos valen 10 puntos
- **Identificación Visual**: Los círculos tocados por la máquina se marcan con 🤖
- **Resultados Detallados**: Pantalla de victoria/derrota con estadísticas

### **Características Generales:**
- **Efectos Visuales**: Animaciones suaves y efectos de partículas
- **UI Moderna**: Interfaz limpia con efectos de glass morphism
- **Retroalimentación Táctil**: Animaciones de respuesta al toque

## 📊 Sistema de Puntuación

### **Modo Clásico:**
- Círculos pequeños (40-50px): 6-5 puntos
- Círculos medianos (50-70px): 4-3 puntos  
- Círculos grandes (70-100px): 2-1 puntos

### **Modo VS Máquina:**
- Todos los círculos: 10 puntos
- Sin penalización por círculos perdidos
- La máquina y el jugador compiten por los mismos círculos

## 🔧 Personalización

Puedes modificar fácilmente:

### **Modo Clásico:**
- **Dificultad**: Cambia las variables en `script.js`
- **Tiempo de juego**: Ajusta `timeLeft` en el constructor
- **Número de vidas**: Modifica `lives` en el constructor

### **Modo VS Máquina:**
- **Velocidad de la máquina**: Modifica los valores en `machineDifficulty`
- **Tiempo de partida**: Ajusta `vsTimeLeft` en el constructor  
- **Puntos por círculo**: Cambia `points` en `createVsCircle()`

### **General:**
- **Colores**: Modifica los gradientes en `style.css`
- **Tamaños de círculos**: Ajusta `size` en los métodos `createCircle()`

## 📁 Estructura del Proyecto

```
mod/
├── index.html              # Estructura principal del juego
├── style.css               # Estilos y animaciones
├── script.js               # Lógica del juego (versión estructurada)
├── script_structured.js    # Código fuente estructurado
├── script_old.js          # Backup de la versión anterior
├── manifest.json          # Configuración PWA
├── sw.js                  # Service Worker para cache
└── README.md              # Este archivo
```

### 🏗️ Arquitectura del Código

- **`GAME_CONFIG`**: Todas las configuraciones centralizadas
- **`GameUtils`**: Utilidades y funciones helper
- **`ScreenManager`**: Gestión de navegación entre pantallas
- **`CircleManager`**: Creación y gestión de círculos
- **`TimerManager`**: Gestión centralizada de timers
- **`UIManager`**: Actualización de interfaz de usuario
- **`CircleTapGame`**: Clase principal que coordina todo

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Puedes:

- Agregar nuevos tipos de círculos
- Implementar power-ups
- Añadir sonidos
- Mejorar las animaciones
- Agregar nuevos niveles de dificultad

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

¡Disfruta jugando Circle Tap! 🎯✨
