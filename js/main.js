// ============================================
// DATOS DE PRODUCTOS (REALES - EL POLLÓN)
// ============================================
const productsData = {
  "todo-menu": [],

  "ofertas-familiares": [
    { name: "Ofertón más chaufa", description: "Pollo entero, papas fritas, arroz chaufa, ensalada y bebidas 1.5lt.", price: 24500, image: "img/oferton mas chaufa.png", rating: 5 },
    { name: "Ofertón más fideo", description: "Pollo entero, papas fritas, fideos al pesto, ensalada y bebidas 1.5lt.", price: 24500, image: "img/oferton mas fideo.png", rating: 5 },
    { name: "Ofertón más chaufa pura papa", description: "Pollo entero, papas fritas, extra papa frita, arroz chaufa y bebidas 1.5lt.", price: 24500, image: "img/oferton mas chaufa pura papa.png", rating: 5 },
    { name: "Ofertón con fideo", description: "Pollo entero, papas fritas, fideos al pesto y bebidas 1.5lt.", price: 23500, image: "img/oferton con fideo.png", rating: 5 },
    { name: "Ofertón sin ensalada", description: "Pollo entero, papas fritas, arroz chaufa y bebidas 1.5lt.", price: 23500, image: "img/oferton sin ensalada.png", rating: 5 },
    { name: "Ofertón pura papa", description: "Pollo entero, papas fritas, 1/2 porcion de papa frita y bebidas 1.5lt.", price: 23500, image: "img/oferton pura papa.png", rating: 5 },
    { name: "Oferton familiar", description: "Pollo entero, papas fritas, ensalada y bebidas 1.5lt.", price: 22500, image: "img/oferton familiar.png", rating: 5 },
    { name: "Mega Familiar", description: "Pollo entero, papas fritas, ensalada y bebidas 1.5lt.", price: 22500, image: "img/oferton familiar.png", rating: 5 }
  ],

  "ofertas-dos": [
    { name: "1/2 combo chaufa", description: "Medio pollo, papas fritas, arroz chaufa.", price: 15600, image: "img/medio combo chaufa.png", rating: 5 },
    { name: "1/2 combo", description: "Medio pollo, papas fritas, ensalada personal.", price: 15100, image: "img/medio combo.png", rating: 5 },
    { name: "1/2 combo pura papa", description: "Medio pollo, papas fritas mas cantidad.", price: 15100, image: "img/medio combo pura papa.png", rating: 5 }
  ],

  "ofertas-personales": [
    { name: "1/4 combo", description: "1/4 pollo, papas fritas personales, ensalada personal.", price: 8100, image: "img/personal combo.png", rating: 5 },
    { name: "1/4 combo pura papa", description: "1/4 pollo, papas fritas personales mas cantidad.", price: 8100, image: "img/personal pura papa.png", rating: 5 },
    { name: "Chaufa brasa", description: "1/4 pollo, arroz chaufa.", price: 8200, image: "img/chaufa brasa.png", rating: 5 },
    { name: "Fideo al pesto con 1/4 de pollo", description: "1/4 pollo, fideos al pesto.", price: 8100, image: "img/personal pesto con pollo.png", rating: 5 },
    { name: "Chaufa brasa con papas fritas", description: "1/4 pollo, papas fritas personal, arroz chaufa.", price: 9200, image: "img/chaufa brasa con papas fritas.png", rating: 5 },
    { name: "1/4 de pollo con fideo y papa", description: "1/4 pollo, papas fritas, fideos al pesto.", price: 9300, image: "img/personal con papa y fideo 01.png", rating: 5 }
  ],

  "platos-extras": [
    { name: "Lomo saltado de carne con chaufa", description: "", price: 12200, image: "img/lomo saltado con arroz chaufa.png", rating: 5 },
    { name: "Lomo saltado de carne con arroz blanco", description: "", price: 11700, image: "img/lomo saltado de carne con arroz blanco.png", rating: 5 },
    { name: "Lomo saltado de pollo con arroz blanco", description: "", price: 11700, image: "img/lomo saltado de pollo con arroz blanco.png", rating: 5 },
    { name: "Tallarin saltado", description: "", price: 11700, image: "img/tallarin saltado de carne 01.png", rating: 5 },
    { name: "Bistec a lo pobre", description: "", price: 10700, image: "img/bistec a lo pobre.png", rating: 5 },
    { name: "Bistec con fideos al pesto", description: "", price: 10700, image: "", rating: 5 },
    { name: "Chuleta de cerdo", description: "", price: 10700, image: "img/chuleta de cerdo.png", rating: 5 },
    { name: "Pechuga a la plancha", description: "", price: 10200, image: "img/pechuga a la plancha.png", rating: 5 },
    { name: "Combo nuggets", description: "", price: 6700, image: "img/nugget.png", rating: 5 },
    { name: "Salchipapas", description: "", price: 6700, image: "img/salchipapa.png", rating: 5 }
  ],

  "agregados": [
    { name: "1 Pollo entero solo", description: "1 pollo entero.", price: 15000, image: "img/pollo solo.png", rating: 5 },
    { name: "1/2 Pollo solo", description: "1/2 pollo - parte truto y pechuga.", price: 9900, image: "img/medio pollo solo.png", rating: 5 },
    { name: "1/4 pollo solo", description: "1/4 de pollo -- truto o pechuga según stock.", price: 5800, image: "", rating: 5 },
    { name: "Porcion de papas fritas familiar", description: "Porción grande de papas crujientes.", price: 9000, image: "img/porcion de papa.png", rating: 5 },
    { name: "1/2 porcion de papas fritas", description: "Media porción de papas crujientes.", price: 6100, image: "img/media porcion papa.png", rating: 5 },
    { name: "Porcion de arroz chaufa", description: "1 porción de arroz chaufa.", price: 5300, image: "img/porcion arroz chaufa.png", rating: 5 },
    { name: "Porcion de fideos al pesto", description: "1 porción de fideos al pesto.", price: 5300, image: "img/porcion de fideo.png", rating: 5 },
    { name: "Porcion de ensalada familiar", description: "Ensalada surtida - familiar.", price: 5400, image: "img/ensalada familiar.png", rating: 5 },
    { name: "Porcion de ensalada personal", description: "Ensalada surtida - personal.", price: 3700, image: "img/ensalada personal.png", rating: 5 }
  ],

  "bebidas": [
    { name: "Coca Cola", description: "", price: 3800, image: "img/coca cola.png", rating: 5 },
    { name: "Coca Cola Cero", description: "", price: 3800, image: "img/coca cola cero.png", rating: 5 },
    { name: "Inca Kola", description: "", price: 3800, image: "img/inca kola.png", rating: 5 },
    { name: "Fanta", description: "", price: 3800, image: "img/fanta.png", rating: 5 },
    { name: "Sprite", description: "", price: 3800, image: "img/sprite.png", rating: 5 },
    { name: "Sprite Cero", description: "", price: 3800, image: "img/sprite cero.png", rating: 5 },
    { name: "Agua Sin Gas", description: "", price: 1200, image: "img/agua sin gas.png", rating: 5 },
    { name: "Agua Con Gas", description: "", price: 1200, image: "img/agua con gas.png", rating: 5 }
  ],

  "descartables": [
    { name: "Aluza CT5", description: "", price: 300, image: "img/aluza ct5.png", rating: 5 },
    { name: "Aluza CT3", description: "", price: 400, image: "img/aluza ct3.png", rating: 5 },
    { name: "Tenedor descartable", description: "", price: 200, image: "img/servicio descartable.png", rating: 5 },
    { name: "Bolsa ecológica", description: "", price: 200, image: "img/bolsa ecologica.png", rating: 5 },
    { name: "Vaso descartable", description: "", price: 50, image: "img/vaso.png", rating: 5 }
  ]
};

// Combinar todos los productos para "Todo el Menú"
productsData["todo-menu"] = [
  ...productsData["ofertas-familiares"],
  ...productsData["ofertas-dos"],
  ...productsData["ofertas-personales"],
  ...productsData["platos-extras"],
  ...productsData["agregados"],
  ...productsData["bebidas"],
  ...productsData["descartables"]
];

// ============================================
// VARIABLES GLOBALES
// ============================================
let currentCategory = "todo-menu";
const ITEMS_PER_PAGE = 12;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Genera las estrellas de calificación
 * @param {number} rating - Calificación de 1 a 5
 * @returns {string} HTML de las estrellas
 */
function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<span class="star">★</span>';
        } else {
            starsHTML += '<span class="star empty">★</span>';
        }
    }
    return starsHTML;
}

/**
 * Crea el HTML de una tarjeta de producto
 * @param {Object} product - Objeto del producto
 * @returns {string} HTML de la tarjeta
 */
function createProductCard(product) {
    return `
        <div class="product-card">
            <img src="${product.image && product.image.trim() ? product.image : 'img/sin-foto.png'}" alt="${product.name}" class="product-image">

            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <div class="product-rating">
                        ${generateStars(product.rating)}
                    </div>
                    <div class="product-price">
                   ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(product.price)}
                   </div>

                </div>
            </div>
        </div>
    `;
}

/**
 * Renderiza los productos en el grid
 * @param {string} category - Categoría a mostrar
 * @param {HTMLElement} container - Contenedor donde renderizar
 * @param {number} limit - Límite de productos a mostrar (null = todos)
 */
function renderProducts(category, container, limit = null) {
    const products = productsData[category] || [];
    const productsToShow = limit ? products.slice(0, limit) : products;
    
    container.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

/**
 * Actualiza el título de la sección
 * @param {string} category - Categoría actual
 */
function updateSectionTitle(category) {
    const titles = {
        "todo-menu": "Todo el Menú",
        "ofertas-familiares": "Ofertas Familiares",
        "ofertas-dos": "Ofertas para Dos",
        "ofertas-personales": "Ofertas Personales",
        "platos-extras": "Platos Extras",
        "agregados": "Agregados",
        "bebidas": "Bebidas",
        "descartables": "Descartables"

    };
    
    const sectionTitle = document.getElementById('sectionTitle');
    if (sectionTitle) {
        sectionTitle.textContent = titles[category] || "Nuestro Menú";
    }
}

/**
 * Marca la categoría activa
 * @param {string} category - Categoría activa
 */
function setActiveCategory(category) {
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const activeCard = document.querySelector(`[data-category="${category}"]`);
    if (activeCard) {
        activeCard.classList.add('active');
    }
}

/**
 * Abre el modal con todos los productos de una categoría
 * @param {string} category - Categoría a mostrar
 */
function openCategoryModal(category) {
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalGrid = document.getElementById('modalProductsGrid');
    
    const titles = {
        "todo-menu": "Todo el Menú",
        "ofertas-familiares": "Ofertas Familiares",
        "ofertas-dos": "Ofertas para Dos",
        "ofertas-personales": "Ofertas Personales",
        "platos-extras": "Platos Extras",
        "agregados": "Agregados",
        "bebidas": "Bebidas",
        "descartables": "Descartables"

    };
    
    modalTitle.textContent = titles[category] || "Platos";
    renderProducts(category, modalGrid, null);
    modal.classList.add('active');
}

/**
 * Cierra el modal
 */
function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('active');
}

// ============================================
// EVENT LISTENERS
// ============================================

// ============================================
// CARRUSEL HERO (panel publicitario)
// ============================================
const HERO_INTERVAL_MS = 2000;
const HERO_SLIDE_COUNT = 10;

function initHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('heroDots');
    if (!slides.length || !dotsContainer) return;

    let currentIndex = 0;
    let carouselTimer = null;

    function goToSlide(index) {
        currentIndex = (index + HERO_SLIDE_COUNT) % HERO_SLIDE_COUNT;
        slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        dotsContainer.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === currentIndex));
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function startTimer() {
        stopTimer();
        carouselTimer = setInterval(nextSlide, HERO_INTERVAL_MS);
    }

    function stopTimer() {
        if (carouselTimer) {
            clearInterval(carouselTimer);
            carouselTimer = null;
        }
    }

    // Crear puntos de navegación
    dotsContainer.innerHTML = '';
    for (let i = 0; i < HERO_SLIDE_COUNT; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
        dot.addEventListener('click', () => {
            goToSlide(i);
            startTimer();
        });
        dotsContainer.appendChild(dot);
    }

    // Pausar al pasar el mouse (solo en pantallas que usan hover)
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);
    }

    startTimer();
}

// Cargar productos iniciales
document.addEventListener('DOMContentLoaded', () => {
    initHeroCarousel();

    const productsGrid = document.getElementById('productsGrid');
    const goHome = document.getElementById('goHome');

    const goToOrdersBtn = document.getElementById('goToOrders');
    
    // Renderizar productos iniciales
    renderProducts(currentCategory, productsGrid, ITEMS_PER_PAGE);
    updateSectionTitle(currentCategory);
    setActiveCategory(currentCategory);
    // ============================================
  // En celular: centrar "Todo el Menú" al cargar
   // ============================================
   const categoriesScroll = document.getElementById('categoriesScroll');
   const todoMenuCard = document.querySelector('.category-card[data-category="todo-menu"]');

   function centerTodoMenuOnMobile() {
      if (!categoriesScroll || !todoMenuCard) return;
      if (window.matchMedia('(max-width: 768px)').matches) {
          // centra la tarjeta en el carrusel
          todoMenuCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
   }

      // Ejecutar al cargar (con pequeño delay para asegurar render)
    setTimeout(centerTodoMenuOnMobile, 150);

    
    // Botón "Ir a la página de pedidos"
    if (goToOrdersBtn) {
        goToOrdersBtn.addEventListener('click', () => {
            document.querySelector('.products-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
    
    // Click en tarjetas de categoría
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Si se hace click en el botón "Ver más", abrir modal
            if (e.target.classList.contains('btn-view-more')) {
                e.stopPropagation();
                const category = card.dataset.category;
                openCategoryModal(category);
                return;
            }
            
            // Si se hace click en la tarjeta, cambiar categoría
            const category = card.dataset.category;
            currentCategory = category;
            renderProducts(category, productsGrid, ITEMS_PER_PAGE);
            updateSectionTitle(category);
            setActiveCategory(category);
            
            // Scroll suave a la sección de productos
            document.querySelector('.products-section').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
    
    // Botones "Ver más" en las tarjetas de categoría
    document.querySelectorAll('.btn-view-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.category-card');
            const category = card.dataset.category;
            openCategoryModal(category);
        });
    });
    
    // Cerrar modal
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeCategoryModal);
    }
    
    // Cerrar modal al hacer click fuera
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeCategoryModal();
            }
        });
    }
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCategoryModal();
        }
    });
    
    // Menú toggle (para futuras funcionalidades)
    // ============================================
// MENÚ HAMBURGUESA FUNCIONAL
// ============================================
const menuToggle = document.getElementById('menuToggle');
const hamburgerMenu = document.getElementById('hamburgerMenu');

function openHamburger() {
    hamburgerMenu.classList.add('open');
}

function closeHamburger() {
    hamburgerMenu.classList.remove('open');
}

function toggleHamburger() {
    hamburgerMenu.classList.toggle('open');
}

if (menuToggle && hamburgerMenu) {
    // Abrir/cerrar al hacer click en el icono
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHamburger();
    });

    // Click en una categoría del menú
    hamburgerMenu.querySelectorAll('.hamburger-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;

            currentCategory = category;
            renderProducts(category, productsGrid, ITEMS_PER_PAGE);
            updateSectionTitle(category);
            setActiveCategory(category);

            closeHamburger();

            document.querySelector('.products-section').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });

    // Cerrar si hago click fuera
    document.addEventListener('click', (e) => {
        const clickedOutside = !hamburgerMenu.contains(e.target) && !menuToggle.contains(e.target);
        if (clickedOutside) closeHamburger();
    });

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeHamburger();
    });
}


    // ============================================
// VOLVER AL INICIO AL HACER CLICK EN LOGO
// ============================================
// ============================================
// VOLVER AL INICIO (LOGO / TÍTULO) - PC + CELULAR
// ============================================
if (goHome) {
    const goHomeAction = (e) => {
        e.preventDefault();

        // Volver a categoría principal
        currentCategory = "todo-menu";
        renderProducts(currentCategory, productsGrid, ITEMS_PER_PAGE);
        updateSectionTitle(currentCategory);
        setActiveCategory(currentCategory);

        // Cerrar modal si está abierto
        closeCategoryModal();

        // Cerrar menú hamburguesa si está abierto
        const hm = document.getElementById('hamburgerMenu');
        if (hm) hm.classList.remove('open');

        // Scroll suave arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ✅ Click normal (PC)
    goHome.addEventListener('click', goHomeAction);

    // ✅ Touch en celular (algunos móviles lo requieren)
    goHome.addEventListener('touchstart', goHomeAction, { passive: false });
}



});
