document.addEventListener('DOMContentLoaded', () => {

    // 1. ESTRUCTURA DE LA GALERÍA (¡FÁCIL DE ESCALAR!)
    // Para añadir otra carpeta (e.g., Carpeta4), solo añade otro objeto a este array.
    const galleryCollections = [
        {
            name: "Carpeta 1 | Retratos",
            id: "carpeta1",
            folder: "img/carpeta1",
            photos: [
                "https://picsum.photos/seed/p1_1/400/300",
                "https://picsum.photos/seed/p1_2/400/300",
                "https://picsum.photos/seed/p1_3/400/300",
                "https://picsum.photos/seed/p1_4/400/300",
                "https://picsum.photos/seed/p1_5/400/300"
            ]
        },
        {
            name: "Carpeta 2 | Eventos",
            id: "carpeta2",
            folder: "img/carpeta2",
            photos: [
                "https://picsum.photos/seed/p2_1/400/300",
                "https://picsum.photos/seed/p2_2/400/300",
                "https://picsum.photos/seed/p2_3/400/300",
                "https://picsum.photos/seed/p2_4/400/300",
                "https://picsum.photos/seed/p2_5/400/300"
            ]
        },
        {
            name: "Carpeta 3 | Producto",
            id: "carpeta3",
            folder: "img/carpeta3",
            photos: [
                "https://picsum.photos/seed/p3_1/400/300",
                "https://picsum.photos/seed/p3_2/400/300",
                "https://picsum.photos/seed/p3_3/400/300",
                "https://picsum.photos/seed/p3_4/400/300",
                "https://picsum.photos/seed/p3_5/400/300"
            ]
        },
        // Cuando añadas una nueva carpeta de fotos, solo copia y pega aquí:
        // { name: "Carpeta 4 | Urbana", id: "carpeta4", folder: "img/carpeta4", photos: ["url1", "url2", "url3"] }
    ];

    const menuContainer = document.getElementById('categories-menu');
    const gridContainer = document.getElementById('photo-grid-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    // 2. FUNCIÓN PARA GENERAR EL MENÚ DE CATEGORÍAS
    function renderCategoryMenu() {
        menuContainer.innerHTML = ''; // Limpiar menú
        galleryCollections.forEach(collection => {
            const link = document.createElement('a');
            link.href = "#"; // Evitamos el recargar la página
            link.textContent = collection.name;
            link.setAttribute('data-category', collection.id);
            
            // Asignar evento click
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadCategory(collection.id);
            });
            menuContainer.appendChild(link);
        });
        
        // Cargar la primera categoría por defecto
        if (galleryCollections.length > 0) {
            loadCategory(galleryCollections[0].id);
        }
    }

    // 3. FUNCIÓN PARA CARGAR LAS FOTOS DE UNA CATEGORÍA
    function loadCategory(categoryId) {
        const selectedCollection = galleryCollections.find(c => c.id === categoryId);
        gridContainer.innerHTML = ''; // Limpiar fotos anteriores
        
        if (!selectedCollection) return;

        // Actualizar clase 'active' en el menú
        document.querySelectorAll('#categories-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-category') === categoryId) {
                link.classList.add('active');
            }
        });

        // Insertar las nuevas fotos
        selectedCollection.photos.forEach(photoUrl => {
            const item = document.createElement('div');
            item.classList.add('gallery-item');
            item.setAttribute('data-src', photoUrl);
            
            // Creamos la etiqueta de la imagen
            const img = document.createElement('img');
            img.src = photoUrl;
            img.alt = selectedCollection.name;
            
            // Agregamos el overlay (opcional)
            const overlay = document.createElement('div');
            overlay.classList.add('overlay');
            overlay.innerHTML = `<span>${selectedCollection.name.split('|')[1].trim()}</span>`; // Usamos solo la segunda parte del nombre

            item.appendChild(img);
            item.appendChild(overlay);
            
            // Evento para abrir el Lightbox
            item.addEventListener('click', openLightbox);
            
            gridContainer.appendChild(item);
        });
    }
    
    // 4. LÓGICA DEL LIGHTBOX (COMPARTIDA)
    function openLightbox() {
        lightbox.style.display = 'flex';
        lightboxImg.src = this.getAttribute('data-src');
    }

    // Eventos para cerrar el Lightbox
    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Iniciar el proceso: renderizar el menú y cargar la primera colección
    renderCategoryMenu();
});