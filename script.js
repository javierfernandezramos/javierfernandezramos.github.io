document.addEventListener('DOMContentLoaded', () => {

    // 1. LOADER INICIAL
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1000);


    // 2. NAVBAR STICKY Y EFECTO AL SCROLL
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. LAZY LOADING Y LIGHTBOX PARA LA GALERÍA
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    // Intersection Observer para lazy loading en la página principal
    const mainImageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '50px' });

    galleryItems.forEach(item => {
        mainImageObserver.observe(item);

        item.addEventListener('click', () => {
            if (!lightbox || !lightboxImg) return;
            const highRes = item.getAttribute('data-src');
            if (!highRes) return; // Si no hay data-src, no hacemos nada (evita conflictos en galeria.html)

            lightbox.style.display = 'flex';
            lightboxImg.src = highRes;
            document.body.style.overflow = 'hidden';
        });
    });

    const hideLightbox = () => {
        if (!lightbox) return;
        lightbox.style.display = 'none';
        if (lightboxImg) lightboxImg.src = '';
        document.body.style.overflow = 'auto';
    };

    if (closeBtn) closeBtn.addEventListener('click', hideLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) hideLightbox();
        });
    }



    // 4. ANIMACIONES AL HACER SCROLL (REVEAL)
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // 5. MODO CLARO/OSCURO (Se asume que la lógica está aquí, se omite para brevedad)
    // ...

    // 6. FORMULARIO DE CONTACTO (IMPLEMENTACIÓN GMAIL URL CORREGIDA)
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form) {
        form.addEventListener('submit', (e) => {

            e.preventDefault();

            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            formStatus.textContent = '';

            const asunto = document.getElementById('asunto').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();
            let isValid = true;

            // --- Validación ---
            if (asunto.length < 5) {
                document.getElementById('asunto-error').textContent = 'El asunto es muy corto.';
                isValid = false;
            }

            if (mensaje.length < 10) {
                document.getElementById('mensaje-error').textContent = 'El mensaje es muy corto.';
                isValid = false;
            }

            // --- Lógica de redirección ---
            if (isValid) {
                const miCorreo = 'javierfernandezramos9@gmail.com'; // ⚠️ ¡REEMPLAZAR!
                const bodyContent = `Hola Javier,\n\nTe contacto por un proyecto.\n\nMi nombre es: [Escribe aquí tu nombre]\n--- Mensaje Original ---\n${mensaje}`;

                const subjectEncoded = encodeURIComponent(asunto);
                const bodyEncoded = encodeURIComponent(bodyContent);

                // --- Opción 1: Mailto (Mejor para abrir apps nativas en móvil) ---
                const mailtoLink = `mailto:${miCorreo}?subject=${subjectEncoded}&body=${bodyEncoded}`;

                // --- Opción 2: URL de Gmail (Mejor para escritorio/navegador) ---
                const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${miCorreo}&su=${subjectEncoded}&body=${bodyEncoded}`;


                // 🛑 LÓGICA DE DETECCIÓN Y APERTURA 🛑

                // Detección simple si es un móvil para priorizar 'mailto'
                const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                if (isMobile) {
                    // En móvil: Intentar abrir la aplicación nativa a través de mailto
                    window.location.href = mailtoLink;
                } else {
                    // En escritorio: Abrir Gmail en una nueva pestaña
                    window.open(gmailUrl, '_blank');
                }

                formStatus.style.color = 'var(--color-primary)';
                formStatus.textContent = 'Abriendo el gestor de correo... Por favor, envía el mensaje desde allí.';

                setTimeout(() => form.reset(), 1000);

            } else {
                formStatus.style.color = 'red';
                formStatus.textContent = 'Por favor, corrige los errores en el formulario.';
            }
        });
    }



}); // 👈 CIERRE FINAL
