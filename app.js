// --- ESTE ES EL CEREBRO DE LA APP (Versión 4.2 - Corregida) ---
// --- FUNCIÓN DE UTILIDAD (Ponla al inicio de app.js) ---
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
// --- FIN DE FUNCIÓN DE UTILIDAD ---

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. ESTADO DE LA APLICACIÓN ---
    let miColeccion = JSON.parse(localStorage.getItem('coleccion')) || [];
    let misRepetidas = JSON.parse(localStorage.getItem('repetidas')) || [];
    let ultimoSobreDiario = localStorage.getItem('ultimoSobreDiario');
    
    let pageFlip; // <-- Solo lo declaramos, no lo inicializamos
    let albumHaSidoRenderizado = false;

    // --- 2. CACHÉ DE ELEMENTOS DEL DOM ---
    const viewHome = document.getElementById('view-home');
    const viewAlbum = document.getElementById('view-album');
    
    // Home
    const homeStatsText = document.getElementById('progress-text');
    const homeProgressBar = document.getElementById('progress-bar');
    const btnGotoAlbum = document.getElementById('btn-goto-album');
    const btnOpenSobreDiario = document.getElementById('btn-open-sobre-diario');
    const btnOpenCodigo = document.getElementById('btn-open-codigo');
    const btnOpenRepetidas = document.getElementById('btn-open-repetidas');

    // Album
    const btnBackToHome = document.getElementById('btn-back-to-home');
    const albumContainer = document.getElementById('album-container'); 
    const flipbookContainer = document.getElementById('flipbook');
    const btnAlbumPrev = document.getElementById('btn-album-prev'); 
    const btnAlbumNext = document.getElementById('btn-album-next'); 

    // Modales
    const modalCodigo = document.getElementById('modal-codigo');
    const modalSobreDiario = document.getElementById('modal-sobre-diario');
    const modalResultado = document.getElementById('modal-resultado');
    const modalRepetidas = document.getElementById('modal-repetidas');

    // Modal: Código
    const inputCodigo = document.getElementById('input-codigo');
    const btnCanjearCodigo = document.getElementById('btn-canjear-codigo');

    // Modal: Sobre Diario
    const btnSobreDiario = document.getElementById('btn-sobre-diario');
    const tiempoRestanteEl = document.getElementById('tiempo-restante');
    const sobreDiarioTexto = document.getElementById('sobre-diario-texto');

    // Modal: Resultado
    const modalResultadoTitulo = document.getElementById('modal-resultado-titulo');
    const nuevasFiguritasContainer = document.getElementById('nuevas-figuritas-container');
    
    // Modal: Repetidas
    const conteoRepetidas = document.getElementById('conteo-repetidas');
    const btnCanjearRepetidas = document.getElementById('btn-canjear-repetidas');

    /**
     * NUEVO: Manejador para el cambio de tamaño de la ventana (resize)
     * * Usamos "debounce" para que no se ejecute 100 veces por segundo
     * al girar el celular, sino solo una vez que se estabiliza.
     */
    const handleResize = debounce(() => {
        if (pageFlip && albumHaSidoRenderizado) {
            console.log("Detectado cambio de tamaño (resize/rotación).");
            
            // Obtenemos el índice de la página actual
            const currentIndex = pageFlip.getCurrentPageIndex();
            
            // ¡Reutilizamos tu función!
            // Esta función ya sabe si debe poner la clase 'open' o no
            // y ya sabe que debe llamar a 'pageFlip.update()' después
            // del timeout. Es perfecta.
            actualizarAnchoAlbum(currentIndex);
        }
    }, 400); // Espera 400ms después del último cambio para ejecutarse
    
// --- 3. FUNCIONES DE LÓGICA ---

/**
 * Dibuja el álbum usando la estructura de PAGINAS_ALBUM.
 * Solo se llama una vez al inicio (cuando el usuario entra a "Ver Álbum").
 * ESTA VERSIÓN ASUME QUE `renderizarAlbumConRetraso` YA HA HECHO EL CONTENEDOR ANGOSTO.
 */
    function renderizarAlbum() {
        console.log("Renderizando esqueleto del álbum por primera vez...");
        console.log("albumContainer:", albumContainer);
        console.log("flipbookContainer:", flipbookContainer);

        flipbookContainer.innerHTML = ""; // Limpiamos bien

        // --- 1. Crear Tapa (Front Cover) ---
        const frontCover = document.createElement('div');
        frontCover.classList.add('page', 'cover');
        frontCover.innerHTML = `
            <div class="cover-content">
                <h1>Nuestro Álbum</h1>
                <p>(Tapa genérica)</p>
            </div>
        `;

        // --- 2. NUEVO: Crear Interior de la Tapa ---
        // Esta página irá a la izquierda cuando abras el libro
        const frontCoverInside = document.createElement('div');
        frontCoverInside.classList.add('page', 'hard'); // 'hard' para que tenga la textura de la tapa
        // Puedes añadir un estilo o dejarla en blanco (turn.js le da el fondo de .hard)
        frontCoverInside.innerHTML = `<div class="page-content" style="background-color: #3a2a24;"></div>`;

        // --- 3. Crear Páginas del álbum ---
        // (Asegúrate de haber borrado las páginas 0 y 7 de data.js)
        const paginasDelAlbum = PAGINAS_ALBUM.map((pagina) => {
            const page = document.createElement('div');
            page.classList.add('page');
            const slotsHTML = pagina.figuritas.map(figura => {
                return `<div class="sticker-slot" data-id="${figura.id}" style="top: ${figura.top}; left: ${figura.left}; width: ${figura.width};">${figura.id}</div>`;
            }).join('');
            page.innerHTML = `<div class="page-content ${pagina.fondoClass}"><div class="sticker-container">${slotsHTML}</div></div>`;
            return page; 
        });

        // --- 4. NUEVO: Crear Interior de la Contratapa ---
        // Esta página irá a la derecha antes de cerrar el libro
        const backCoverInside = document.createElement('div');
        backCoverInside.classList.add('page', 'hard');
        backCoverInside.innerHTML = `<div class="page-content" style="background-color: #3a2a24;"></div>`;

        // --- 5. Contratapa ---
        const backCover = document.createElement('div');
        backCover.classList.add('page', 'cover', 'hard'); // 'hard' es para turn.js
        backCover.innerHTML = `<div class="cover-content"><h1>Fin del Álbum</h1><p>¡Gracias por coleccionar!</p></div>`;
    
        // --- 6. MODIFICADO: Crear el array final de TODAS las páginas ---
        // (1 Tapa + 1 Interior + 6 Contenido + 1 Interior + 1 Contratapa = 10 páginas)
        const todasLasPaginas = [
            frontCover,
            frontCoverInside,  // <-- AÑADIDA
            ...paginasDelAlbum,
            backCoverInside,   // <-- AÑADIDA
            backCover
        ];

        // Añadimos todas las páginas al DOM
        todasLasPaginas.forEach(page => flipbookContainer.appendChild(page));

        // --- . Inicializar PageFlip y Cargar ---
        // El contenedor YA MIDE el tamaño de TAPA (angosto) gracias a la función anterior
        const bookRect = albumContainer.getBoundingClientRect();
        console.log("Inicializando PageFlip en contenedor angosto:", bookRect.width, ", Alto:", bookRect.height);

        try {
            // Inicializamos la librería en el contenedor (que ahora está vacío)
            pageFlip = new St.PageFlip(flipbookContainer, {
                // --- CAMBIO HECHO: El ancho de página es el 100% del contenedor angosto ---
                width: bookRect.width || 300, 
                height: bookRect.height || 200,
                maxShadowOpacity: 0.2,
                showCover: true,
                mobileScrollSupport: false,
                disableFlipByClick: true,
                showPageCorners: false
            });

            // Cargamos las páginas desde nuestro ARRAY, no desde los children
            pageFlip.loadFromHTML(todasLasPaginas);

            albumHaSidoRenderizado = true;
            console.log("Álbum renderizado correctamente.");

            // --- CAMBIO HECHO: Lógica de eventos con setTimeout ---
            
            // Escuchar cada vez que se PASA la página (para flechas)
            pageFlip.on('flip', (e) => {
                actualizarBotonesNav(e.data);
            });

            // Escuchar cuando el libro TERMINA de moverse (para re-dimensionar)
            pageFlip.on('changeState', (e) => {
                // e.data es el nuevo estado, ej: "flipping" o "read"
                if (e.data === 'read') {
                    // LLAMAMOS a la función INMEDIATAMENTE
                    actualizarAnchoAlbum(pageFlip.getCurrentPageIndex());
                }
            });
            // --- FIN DEL CAMBIO ---

            actualizarFiguritasEnAlbum();
            actualizarBotonesNav(0);
            
            // No llamamos a actualizarAnchoAlbum(0) aquí,
            // porque ya inicializamos en el estado angosto (de tapa).

        } catch (err) {
            console.error("Error inicializando PageFlip:", err);
        }
    }

    /**
     * Espera a que la vista del álbum sea visible antes de renderizarlo.
     * NUEVO: Ahora solo se asegura de que la clase 'open' no esté.
     */
    function renderizarAlbumConRetraso() {
        if (albumHaSidoRenderizado) return;

        const esperarVisibilidad = () => {
            const estilos = window.getComputedStyle(albumContainer);
            const visible = estilos.display !== 'none' && albumContainer.offsetWidth > 0;

            if (visible) {
                console.log("Vista del álbum visible. Forzando estado de tapa...");
                
                // --- NUEVO ---
                // Forzamos el estado de TAPA (angosto) ANTES de inicializar
                albumContainer.classList.remove('open'); // Nos aseguramos de que esté en estado "cover"
                // --- FIN NUEVO ---
                
                // Damos 10ms al DOM para que aplique el CSS antes de renderizar
                setTimeout(renderizarAlbum, 350); 

            } else {
                console.log("Esperando a que la vista sea visible...");
                setTimeout(esperarVisibilidad, 100);
            }
        };

        setTimeout(esperarVisibilidad, 100);
    }

    /**
     * Ya no es "ConChequeo" ni "ConRetraso".
     * Esta función APLICA las figuritas al álbum ya existente.
     */
    function actualizarFiguritasEnAlbum() {
        if (!pageFlip) return; // Seguridad

        miColeccion.forEach(id => {
            const figuData = TODAS_LAS_FIGURITAS.find(f => f.id === id);
            if (!figuData) return;

            // Buscamos TODOS los slots de esta figurita (podría estar repetida en el álbum)
            const slots = document.querySelectorAll(`.sticker-slot[data-id="${id}"]`);
            slots.forEach(slot => {
                if (!slot.classList.contains('obtenida')) {
                    slot.classList.add('obtenida');
                    slot.classList.add(figuData.rareza);
                    slot.style.backgroundImage = `url(${figuData.imagen})`;
                    slot.textContent = '';
                }
            });
        });
    }


    /**
     * Guarda el progreso en localStorage y actualiza las estadísticas.
     */
    function guardarProgreso() {
        localStorage.setItem('coleccion', JSON.stringify(miColeccion));
        localStorage.setItem('repetidas', JSON.stringify(misRepetidas));
        actualizarEstadisticas();
    }
    
    /**
     * Actualiza todos los contadores en la UI (Home y Modales)
     */
    function actualizarEstadisticas() {
        const total = TODAS_LAS_FIGURITAS.length;
        const actuales = miColeccion.length;
        const porcentaje = total > 0 ? Math.round((actuales / total) * 100) : 0;
        
        homeProgressBar.style.width = `${porcentaje}%`;
        homeStatsText.textContent = `Completado: ${porcentaje}% (${actuales} / ${total})`;
        
        conteoRepetidas.textContent = misRepetidas.length;
        btnCanjearRepetidas.disabled = misRepetidas.length < 5;
    }

    /**
     * Añade una figurita.
     */
    function agregarFigurita(id) {
        const figuData = TODAS_LAS_FIGURITAS.find(f => f.id === id);
        if (!figuData) return { data: null, esNueva: false };

        if (miColeccion.includes(id)) {
            misRepetidas.push(id);
            guardarProgreso();
            return { data: figuData, esNueva: false };
        } else {
            miColeccion.push(id);
            guardarProgreso();
            
            // ¡Importante! Actualiza el slot en el álbum
            // Buscamos TODOS los slots de esta figurita
            const slots = document.querySelectorAll(`.sticker-slot[data-id="${id}"]`);
            slots.forEach(slot => {
                slot.classList.add('obtenida');
                slot.classList.add(figuData.rareza);
                slot.style.backgroundImage = `url(${figuData.imagen})`;
                slot.textContent = '';
            });
            
            return { data: figuData, esNueva: true };
        }
    }

    /**
     * Lógica para abrir un sobre.
     */
    function abrirSobre(cantidad) {
        let nuevasFiguritas = [];
        let notificaciones = { nuevas: 0, repetidas: 0 };

        for (let i = 0; i < cantidad; i++) {
            const figuData = obtenerFiguritaAleatoria();
            const resultado = agregarFigurita(figuData.id);
            
            if (resultado.esNueva) {
                notificaciones.nuevas++;
            } else {
                notificaciones.repetidas++;
            }
            nuevasFiguritas.push(figuData);
        }

        modalResultadoTitulo.textContent = `¡Te salieron ${notificaciones.nuevas} nuevas y ${notificaciones.repetidas} repetidas!`;
        mostrarModalResultado(nuevasFiguritas);
    }

    /**
     * Algoritmo de rareza.
     */
    function obtenerFiguritaAleatoria() {
        const r = Math.random();
        const legendarias = TODAS_LAS_FIGURITAS.filter(f => f.rareza === 'Legendaria');
        const raras = TODAS_LAS_FIGURITAS.filter(f => f.rareza === 'Rara');
        const comunes = TODAS_LAS_FIGURITAS.filter(f => f.rareza === 'Comun');

        if (r < 0.10 && legendarias.length > 0) { // 10% Legendaria
            return legendarias[Math.floor(Math.random() * legendarias.length)];
        } else if (r < 0.35 && raras.length > 0) { // 25% Rara
            return raras[Math.floor(Math.random() * raras.length)];
        } else { // 65% Comun
            return comunes[Math.floor(Math.random() * comunes.length)];
        }
    }

    /**
     * Muestra el modal con las figuritas obtenidas.
     */
    function mostrarModalResultado(figuritas) {
        nuevasFiguritasContainer.innerHTML = '';
        figuritas.forEach(figu => {
            const imgDiv = document.createElement('div');
            imgDiv.classList.add('nueva-figu-modal');
            imgDiv.classList.add(figu.rareza);
            imgDiv.style.backgroundImage = `url(${figu.imagen})`;
            nuevasFiguritasContainer.appendChild(imgDiv);
        });
        modalResultado.classList.add('visible');
    }

    /**
     * Revisa el estado del sobre diario.
     */
    function actualizarEstadoSobreDiario() {
        const AHORA = new Date().getTime();
        const MS_POR_DIA = 24 * 60 * 60 * 1000;
        
        if (!ultimoSobreDiario || (AHORA - ultimoSobreDiario) > MS_POR_DIA) {
            btnSobreDiario.disabled = false;
            sobreDiarioTexto.textContent = "¡Tu sobre diario de 3 figuritas está listo!";
            tiempoRestanteEl.textContent = "";
        } else {
            btnSobreDiario.disabled = true;
            const tiempoPasado = AHORA - ultimoSobreDiario;
            const tiempoRestante = MS_POR_DIA - tiempoPasado;
            
            const horas = Math.floor(tiempoRestante / (1000 * 60 * 60));
            const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
            sobreDiarioTexto.textContent = "Ya reclamaste tu sobre de hoy.";
            tiempoRestanteEl.textContent = `Vuelve en ${horas}h ${minutos}m`;
        }
    }
    
    /**
     * Funciones para manejar vistas y modales
     */
    function cambiarVista(vistaID) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('activa'));
        document.getElementById(vistaID).classList.add('activa');
    }
    
    function abrirModal(modalID) {
        const modal = document.getElementById(modalID);
        if (modal) {
            if (modalID === 'modal-sobre-diario') {
                actualizarEstadoSobreDiario();
            }
            modal.classList.add('visible');
        }
    }
    
    function cerrarModal(modalID) {
        document.getElementById(modalID).classList.remove('visible');
    }
    
    /**
     * NUEVO: Controla los botones de flecha del álbum
     */
    function actualizarBotonesNav(paginaActual) {
        if (!pageFlip) return;
        
        const totalPaginas = pageFlip.getPageCount();
        
        // Página 0 es la tapa
        btnAlbumPrev.style.display = (paginaActual <= 0) ? 'none' : 'block';
        // Última página es la contratapa
        btnAlbumNext.style.display = (paginaActual >= totalPaginas - 1) ? 'none' : 'block';
    }

    // --- CAMBIO HECHO: Esta es la nueva función de lógica de tamaño ---
    /**
     * NUEVO (v6 - Sincronizado): Ajusta el tamaño del contenedor
     * Y ESPERA a que la transición de CSS termine antes de actualizar la biblioteca.
     */
    function actualizarAnchoAlbum(indexPagina) {
        if (!pageFlip) return;
        
        const totalPages = pageFlip.getPageCount();
        
        // 1. Cambiamos la CLASE CSS (esto es inmediato)
        if (indexPagina === 0 || indexPagina === totalPages - 1) {
            // MODO TAPA (ANGOSTO)
            albumContainer.classList.remove('open');
        } else {
            // MODO SPREAD (ANCHO)
            albumContainer.classList.add('open');
        }
        
        // 2. (LA CLAVE) ESPERAMOS a que la transición de CSS (300ms) termine
        //    y LUEGO, Y SÓLO ENTONCES, actualizamos la biblioteca.
        setTimeout(() => {
            if (pageFlip) {
                // Ahora, 350ms después, pageFlip.update() leerá
                // las dimensiones FINALES y correctas.
                pageFlip.update();
            }
        }, 350); // 350ms es > 300ms (el tiempo de la transición en style.css)
    }


    // --- 4. EVENT LISTENERS ---

    // Navegación de Vistas
    btnGotoAlbum.addEventListener('click', () => {
        // 1. Cambia la vista
        cambiarVista('view-album');

        // --- LÓGICA DE INICIALIZACIÓN (SOLO LA PRIMERA VEZ) ---
        if (!albumHaSidoRenderizado) {
            // Esta función (modificada) preparará el contenedor ANTES de renderizar
            setTimeout(renderizarAlbumConRetraso, 100); 
            return; // Importante: Salimos aquí la primera vez
        }
        
        // --- LÓGICA PARA VECES POSTERIORES (EL ÁLBUM YA EXISTE) ---
        const currentHeight = albumContainer.offsetHeight;
        const bookRect = albumContainer.getBoundingClientRect();
        
        if (bookRect.width > 0 && pageFlip) {
            console.log("Restaurando vista de álbum...");
            actualizarFiguritasEnAlbum();
            
            // Usamos un timeout para asegurar que el DOM está listo
            setTimeout(() => {
                const currentIndex = pageFlip.getCurrentPageIndex();
                actualizarBotonesNav(currentIndex);
                // Esta función re-aplicará el tamaño correcto (ancho o angosto)
                actualizarAnchoAlbum(currentIndex); 
            }, 100); 
        } else {
            console.warn("No se pudo actualizar el tamaño de PageFlip. Ancho: " + bookRect.width);
        }
    });

    btnBackToHome.addEventListener('click', () => cambiarVista('view-home'));

    btnAlbumPrev.addEventListener('click', () => {
        if (pageFlip) {
            pageFlip.flipPrev();
        }
    });

    btnAlbumNext.addEventListener('click', () => {
        if (pageFlip) {
            pageFlip.flipNext();
        }
    });


    // Navegación de Modales (Home)
    btnOpenSobreDiario.addEventListener('click', () => abrirModal('modal-sobre-diario'));
    btnOpenCodigo.addEventListener('click', () => abrirModal('modal-codigo'));
    btnOpenRepetidas.addEventListener('click', () => abrirModal('modal-repetidas'));

    // Cerrar Modales
    document.querySelectorAll('.btn-cerrar-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            cerrarModal(btn.dataset.modal);
        });
    });
    
    // Lógica Modal: Sobre Diario
    btnSobreDiario.addEventListener('click', () => {
        abrirSobre(3);
        ultimoSobreDiario = new Date().getTime();
        localStorage.setItem('ultimoSobreDiario', ultimoSobreDiario);
        actualizarEstadoSobreDiario();
        cerrarModal('modal-sobre-diario');
    });

    // Lógica Modal: Código
    btnCanjearCodigo.addEventListener('click', () => {
        const codigo = inputCodigo.value.toUpperCase().trim();
        if (CODIGOS_SECRETOS[codigo]) {
            const recompensa = CODIGOS_SECRETOS[codigo];
            
            if (recompensa === "SOBRE_5") {
                abrirSobre(5);
                modalResultadoTitulo.textContent = "¡Código correcto! ¡Recibiste 5 figuritas!";
            } else {
                const resultado = agregarFigurita(recompensa);
                if (resultado.data) {
                    modalResultadoTitulo.textContent = resultado.esNueva 
                        ? `¡Código correcto! Recibiste: "${resultado.data.nombre}"`
                        : `¡Código correcto! Pero ya tenías: "${resultado.data.nombre}"`;
                    mostrarModalResultado([resultado.data]);
                }
            }
            inputCodigo.value = '';
            cerrarModal('modal-codigo');
        } else {
            alert("Ese código no existe... ¡Intenta de nuevo!");
        }
    });
    
    // Lógica Modal: Repetidas
    btnCanjearRepetidas.addEventListener('click', () => {
        if (misRepetidas.length >= 5) { 
            misRepetidas.splice(0, 5);
            const faltantes = TODAS_LAS_FIGURITAS.filter(f => !miColeccion.includes(f.id));
            
            if (faltantes.length > 0) {
                const nuevaFigu = faltantes[Math.floor(Math.random() * faltantes.length)];
                
                agregarFigurita(nuevaFigu.id); 
                
                modalResultadoTitulo.textContent = `¡Canjeaste 5 repetidas por una nueva!`;
                mostrarModalResultado([nuevaFigu]);
            } else {
                alert("¡Ya tienes todas las figuritas!");
            }
            guardarProgreso();
            cerrarModal('modal-repetidas');
        } 
    });


    // --- 5. INICIALIZACIÓN ---
    function inicializarApp() {
        console.log("Iniciando Álbum (v4.2 Corregida)...");
        
        // 1. Dibuja el esqueleto del álbum (está oculto, pero existe)
        // renderizarAlbum(); // No lo llamamos aquí, lo hacemos "on-demand"
        
        // 2. Carga las estadísticas
        actualizarEstadisticas();
        
        // 3. Configura el timer del sobre diario
        setInterval(actualizarEstadoSobreDiario, 60000);
        
        // 4. Llama una vez a la función del sobre para estado inicial
        actualizarEstadoSobreDiario();

        window.addEventListener('resize', handleResize);
    }

    inicializarApp();
});