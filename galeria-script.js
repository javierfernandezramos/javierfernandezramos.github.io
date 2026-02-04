document.addEventListener('DOMContentLoaded', () => {

    // 1. ESTRUCTURA DE LA GALERÍA
    // Puedes gestionar tus fotos de dos formas:
    // A) NOMBRE SECUENCIAL: Si tus fotos se llaman 1.jpg, 2.jpg... solo pon el número en 'count'.
    // B) NOMBRES PERSONALIZADOS: Si quieres usar nombres originales, añádelos en la lista 'images'.
    const galleryCollections = [
        {
            name: "Modelo | Ver <i class='fa-solid fa-magnifying-glass'></i>",
            id: "carpeta1",
            folder: "Fotos/Modelo/",
            count: 8, // Usa esto si tus fotos son 1.jpg, 2.jpg...
            images: [] // O añade nombres aquí: ["foto1.jpg", "vacaciones.png"]
        },
        {
            name: "Eventos | Ver <i class='fa-solid fa-magnifying-glass'></i>",
            id: "carpeta2",
            folder: "Fotos/Eventos/",
            count: 15,
            images: []
        },
        {
            name: "Novios | Ver <i class='fa-solid fa-magnifying-glass'></i>",
            id: "carpeta3",
            folder: "Fotos/Novios/",
            count: 5,
            images: []
        },
        {
            name: "Deportes | Ver <i class='fa-solid fa-magnifying-glass'></i>",
            id: "carpeta4",
            folder: "Fotos/Deportes/",
            count: 10,
            images: []
        },
    ];

    const menuContainer = document.getElementById('categories-menu');
    const gridContainer = document.getElementById('photo-grid-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    // --- OPTIMIZACIÓN: Intersection Observer para Lazy Loading ---
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // 2. FUNCIÓN PARA GENERAR EL MENÚ DE CATEGORÍAS
    function renderCategoryMenu() {
        if (!menuContainer) return;

        const fragment = document.createDocumentFragment();
        galleryCollections.forEach(collection => {
            const link = document.createElement('a');
            link.href = `#${collection.id}`;
            link.textContent = collection.name.split('|')[0].trim();
            link.setAttribute('data-category', collection.id);

            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadCategory(collection.id);
                gridContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            fragment.appendChild(link);
        });

        menuContainer.innerHTML = '';
        menuContainer.appendChild(fragment);

        if (galleryCollections.length > 0) {
            loadCategory(galleryCollections[0].id);
        }
    }

    // 3. FUNCIÓN PARA CARGAR LAS FOTOS DE UNA CATEGORÍA
    function loadCategory(categoryId) {
        const selectedCollection = galleryCollections.find(c => c.id === categoryId);
        if (!selectedCollection || !gridContainer) return;

        // Limpiar y preparar contenedor
        gridContainer.innerHTML = '';
        gridContainer.classList.add('loading');

        // Actualizar clase 'active' en el menú
        document.querySelectorAll('#categories-menu a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-category') === categoryId);
        });

        // Generar lista de URLs de fotos
        const photoUrls = [];

        // Añadir fotos por lista de nombres
        if (selectedCollection.images && selectedCollection.images.length > 0) {
            selectedCollection.images.forEach(name => {
                photoUrls.push(selectedCollection.folder + name);
            });
        }

        // Añadir fotos por conteo secuencial (si no hay lista o en combinación)
        if (selectedCollection.count > 0) {
            for (let i = 1; i <= selectedCollection.count; i++) {
                photoUrls.push(`${selectedCollection.folder}${i}.jpg`);
            }
        }

        const fragment = document.createDocumentFragment();

        photoUrls.forEach(url => {
            const item = document.createElement('div');
            item.classList.add('gallery-item', 'fade-in');

            // Usamos un placeholder transparente o color base mientras carga
            const img = document.createElement('img');
            img.alt = "Fotografía de JaviPhoto";
            img.dataset.src = url; // Fuente real para lazy load
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Pixel transparente
            img.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.classList.add('overlay');
            overlay.innerHTML = `<span><i class='fa-solid fa-magnifying-glass'></i></span>`;

            item.appendChild(img);
            item.appendChild(overlay);

            // Añadimos data-src al contenedor para compatibilidad con script.js
            item.setAttribute('data-src', url);

            item.addEventListener('click', () => openLightbox(url));

            fragment.appendChild(item);
            imageObserver.observe(img); // Activar lazy loading para esta imagen
        });

        gridContainer.appendChild(fragment);
        gridContainer.classList.remove('loading');
    }

    // 4. LÓGICA DEL LIGHTBOX
    function openLightbox(url) {
        if (!lightbox || !lightboxImg) return;
        lightbox.style.display = 'flex';
        lightboxImg.src = url;
        document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
    }

    function closeLightbox() {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
        document.body.style.overflow = 'auto';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Iniciar
    renderCategoryMenu();
});
