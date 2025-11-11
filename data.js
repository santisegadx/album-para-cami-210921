// --- ESTA ES TU BASE DE DATOS (VERSIÓN 3) ---
// Aquí defines TODAS las figuritas que se pueden coleccionar.
// Rareza: "Comun", "Rara", "Legendaria"

const TODAS_LAS_FIGURITAS = [
    { id: 1, nombre: "Nuestra Primera Foto", rareza: "Rara", imagen: "https://placehold.co/300x400/c94b4b/white?text=Foto+1" },
    { id: 2, nombre: "Selfie en el parque", rareza: "Comun", imagen: "https://placehold.co/300x400/4b134f/white?text=Foto+2" },
    { id: 3, nombre: "Cena de Aniversario", rareza: "Legendaria", imagen: "https://placehold.co/300x400/ffd700/black?text=Foto+3" },
    { id: 4, nombre: "Haciendo caras raras", rareza: "Comun", imagen: "https://placehold.co/300x400/4b134f/white?text=Foto+4" },
    { id: 5, nombre: "Vale por Noche de Pelis", rareza: "Rara", imagen: "https://placehold.co/300x400/007bff/white?text=Vale" },
    { id: 6, nombre: "Viaje a la playa", rareza: "Rara", imagen: "https://placehold.co/300x400/007bff/white?text=Foto+6" },
    { id: 7, nombre: "Tu comida favorita", rareza: "Comun", imagen: "https://placehold.co/300x400/4b134f/white?text=Foto+7" },
    { id: 8, nombre: "Concierto", rareza: "Rara", imagen: "https://placehold.co/300x400/007bff/white?text=Foto+8" },
    { id: 9, nombre: "Día de flojera", rareza: "Comun", imagen: "https://placehold.co/300x400/4b134f/white?text=Foto+9" },
    { id: 10, nombre: "¡El Primer Beso!", rareza: "Legendaria", imagen: "https://placehold.co/300x400/ffd700/black?text=Foto+10" },
    { id: 11, nombre: "Figurita Secreta 1", rareza: "Legendaria", imagen: "https://placehold.co/300x400/ffd700/black?text=Secreto+11" },
    { id: 12, nombre: "Figurita Secreta 2", rareza: "Legendaria", imagen: "https://placehold.co/300x400/ffd700/black?text=Secreto+12" }
];


// --- CÓDIGOS SECRETOS ---
const CODIGOS_SECRETOS = {
    "NUESTRAFECHA": 10,
    "APODOSECURE": 11,
    "LUGARFAVORITO": 12,
    "SOBREEXTRA": "SOBRE_5"
};


// --- NUEVO: DISEÑO DE PÁGINAS ---
// Aquí defines CADA PÁGINA del álbum.
// 'fondoClass' es una clase CSS que debes crear en style.css para el fondo.
// 'figuritas' es un array que define CADA figurita en esa página.
// 'id' debe coincidir con uno de TODAS_LAS_FIGURITAS.
// 'top', 'left', 'width' definen la posición y tamaño (en porcentajes).

const PAGINAS_ALBUM = [
    // --- Página 1 ---
    {
        paginaId: 1,
        fondoClass: 'fondo-pagina-1', // Debes crear esta clase en style.css
        figuritas: [
            // { id: ID, top: 'Y%', left: 'X%', width: 'W%' }
            { id: 1, top: '10%', left: '10%', width: '35%' },
            { id: 2, top: '10%', left: '55%', width: '35%' },
            { id: 3, top: '50%', left: '30%', width: '40%' }
        ]
    },
    // --- Página 2 ---
    {
        paginaId: 2,
        fondoClass: 'fondo-pagina-2',
        figuritas: [
            { id: 4, top: '5%', left: '30%', width: '40%' },
            { id: 5, top: '50%', left: '10%', width: '35%' },
            { id: 6, top: '50%', left: '55%', width: '35%' }
        ]
    },
    // --- Página 3 ---
    {
        paginaId: 3,
        fondoClass: 'fondo-pagina-3',
        figuritas: [
            { id: 7, top: '10%', left: '55%', width: '35%' },
            { id: 8, top: '30%', left: '10%', width: '40%' },
            { id: 9, top: '60%', left: '30%', width: '40%' }
        ]
    },
    // --- Página 4 (Página Legendaria) ---
    {
        paginaId: 4,
        fondoClass: 'fondo-pagina-1',
        figuritas: [
            { id: 10, top: '15%', left: '25%', width: '50%' },
            { id: 11, top: '60%', left: '10%', width: '35%' },
            { id: 12, top: '60%', left: '55%', width: '35%' }
        ]
    }
    // ... puedes añadir más páginas
];