const DEFAULT_NOSOTROS_CONFIG = {
    imagen: 'images/fondo_carissma.jpg',
    etiqueta: 'ESENCIA & ALMA',
    titulo: 'Sobre Nosotros',
    parrafo: '<p>En Carissma creemos que tu espacio debe contar una historia de calidez, belleza e intención. Somos un rincón dedicado al encuentro entre la artesanía honesta, hecha a mano con paciencia infinita, y la curaduría selecta de objetos que inspiran calma y distinción.</p><p>Colaboramos estrechamente con talleres familiares y artesanos locales que transmiten saberes generación tras generación, fusionándolos con un diseño minimalista y atemporal. Cada pieza en nuestra tienda ha sido elegida una a una por su alma, textura y calidad insuperable. Queremos llevar a tu hogar elementos con propósito, que transformen los momentos más simples del día a día en instantes de profunda conexión y belleza.</p>'
};

function getNosotrosConfig() {
    const stored = localStorage.getItem('carissma_nosotros_config');
    if (stored) {
        try {
            return { ...DEFAULT_NOSOTROS_CONFIG, ...JSON.parse(stored) };
        } catch (e) {
            return DEFAULT_NOSOTROS_CONFIG;
        }
    }
    return DEFAULT_NOSOTROS_CONFIG;
}

function saveNosotrosConfig(config) {
    localStorage.setItem('carissma_nosotros_config', JSON.stringify(config));
}
