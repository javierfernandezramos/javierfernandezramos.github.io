document.addEventListener('DOMContentLoaded', () => {

    // 1. ESTRUCTURA DE LA GALERÍA CON CONTEO DE ARCHIVOS
    // Para añadir más fotos a una carpeta, solo incrementa el número 'count'.
    // El script asume que los archivos se llaman: 1.jpg, 2.jpg, 3.jpg, ...
    const galleryCollections = [
        {
            name: "Modelo | Retratos",
            id: "carpeta1",
            folder: "Fotos/Modelo/",
            count: 8 // 👈 El script buscará de 1.jpg hasta 15.jpg en esa carpeta
        },
        {
            name: "Eventos | Eventos",
            id: "carpeta2",
            folder: "Fotos/Eventos/",
            count: 15 // 👈 El script buscará de 1.jpg hasta 8.jpg en esa carpeta
        },
        {
            name: "Novios | Novios",
            id: "carpeta3",
            folder: "Fotos/Novios/",
            count: 5 // 👈 El script buscará de 1.jpg hasta 12.jpg
        },
        {
            name: "Creatividad | Foto",
            id: "carpeta4",
            folder: "Fotos/Novios/",
            count: 5 // 👈 El script buscará de 1.jpg hasta 12.jpg
        },
        // Añade más carpetas e incrementa 'count' cuando añadas más fotos.
    ];

    const menuContainer = document.getElementById('categories-menu');
    const gridContainer = document.getElementById('photo-grid-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    // Función de URL de alta resolución (se mantiene)
    function getHighResUrl(url) {
        return url; 
    }


    // 2. FUNCIÓN PARA GENERAR EL MENÚ DE CATEGORÍAS (Se mantiene igual)
    function renderCategoryMenu() {
        menuContainer.innerHTML = ''; 
        galleryCollections.forEach(collection => {
            const link = document.createElement('a');
            link.href = `#${collection.id}`; 
            link.textContent = collection.name.split('|')[0].trim(); 
            link.setAttribute('data-category', collection.id);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadCategory(collection.id);
                document.getElementById('photo-grid-container').scrollIntoView({ behavior: 'smooth' });
            });
            menuContainer.appendChild(link);
        });
        
        if (galleryCollections.length > 0) {
            loadCategory(galleryCollections[0].id);
        }
    }

    // 3. FUNCIÓN PARA CARGAR LAS FOTOS DE UNA CATEGORÍA
    function loadCategory(categoryId) {
        const selectedCollection = galleryCollections.find(c => c.id === categoryId);
        gridContainer.innerHTML = ''; 
        
        if (!selectedCollection) return;

        // Actualizar clase 'active' en el menú
        document.querySelectorAll('#categories-menu a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-category') === categoryId) {
                link.classList.add('active');
            }
        });

        // 🛑 BUCLE FOR PARA GENERAR LAS IMÁGENES AUTOMÁTICAMENTE 🛑
        for (let i = 1; i <= selectedCollection.count; i++) {
            
            // Construye el nombre del archivo (e.g., 1.jpg, 2.jpg)
            const fileName = `${i}.jpg`; 
            
            // Combina la carpeta base (e.g., Fotos/Retratos/) + nombre del archivo
            const photoUrl = selectedCollection.folder + fileName; 
            
            const item = document.createElement('div');
            item.classList.add('gallery-item');
            
            item.setAttribute('data-src', getHighResUrl(photoUrl));
            
            const img = document.createElement('img');
            img.src = photoUrl; // Usa la ruta completa generada
            img.alt = fileName;
            
            const overlay = document.createElement('div');
            overlay.classList.add('overlay');
            overlay.innerHTML = `<span>${selectedCollection.name.split('|')[1].trim()}</span>`; 

            item.appendChild(img);
            item.appendChild(overlay);
            
            item.addEventListener('click', openLightbox);
            
            gridContainer.appendChild(item);
        }
    }
    
    // 4. LÓGICA DEL LIGHTBOX (Se mantiene igual)
    function openLightbox() {
        lightbox.style.display = 'flex';
        lightboxImg.src = this.getAttribute('data-src');
    }

    // Eventos para cerrar el Lightbox (Se mantiene igual)
    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Iniciar el proceso
    renderCategoryMenu();
});