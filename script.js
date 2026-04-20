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

                    // Fallback: Si la miniatura no existe (ej. _thumb.jpg), intentar cargar la original
                    img.onerror = function () {
                        const originalUrl = this.dataset.src.replace('_thumb', '');
                        if (this.src !== originalUrl) {
                            this.src = originalUrl;
                        }
                    };
                }
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '300px' });

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
        rootMargin: '0px 0px 50px 0px',
        threshold: 0
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });

    // 5. MODO CLARO/OSCURO (Se asume que la lógica está aquí, se omite para brevedad)
    // ...

    // 6. LÓGICA DE CONTACTO UNIFICADA (SMART REDIRECT)
    const miCorreo = 'javierfernandezramos9@gmail.com';

    function handleContactRedirect(asunto = '', mensaje = '') {
        const subjectEncoded = encodeURIComponent(asunto || 'Consulta Portfolio');
        const bodyContent = mensaje ?
            `Hola Javier,\n\n${mensaje}` :
            `Hola Javier,\n\nMe gustaría hablar contigo sobre un proyecto...`;
        const bodyEncoded = encodeURIComponent(bodyContent);

        // URLs de destino
        const mailtoLink = `mailto:${miCorreo}?subject=${subjectEncoded}&body=${bodyEncoded}`;
        const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${miCorreo}&su=${subjectEncoded}&body=${bodyEncoded}`;

        // Detección de dispositivo
        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            // En móvil: Usamos mailto: para que el sistema abra SU app de correo (Mail en iPhone, etc.)
            // No usamos _blank para evitar pestañas vacías
            window.location.href = mailtoLink;
        } else {
            // En escritorio: Abrir Gmail en pestaña nueva es lo más fiable
            window.open(gmailUrl, '_blank');
        }
    }

    // Manejador para el botón de Biografía "Cuéntame tu visión"
    const visionBtn = document.querySelector('.luxury-cta-link');
    if (visionBtn) {
        visionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleContactRedirect('Proyecto Fotografía');
        });
    }

    // Manejador para el Formulario de contacto
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

            if (asunto.length < 5) {
                document.getElementById('asunto-error').textContent = 'El asunto es muy corto.';
                isValid = false;
            }

            if (mensaje.length < 10) {
                document.getElementById('mensaje-error').textContent = 'El mensaje es muy corto.';
                isValid = false;
            }

            if (isValid) {
                handleContactRedirect(asunto, mensaje);
                formStatus.style.color = 'var(--color-primary)';
                formStatus.textContent = 'Abriendo el gestor de correo...';

                setTimeout(() => form.reset(), 1000);
            } else {
                formStatus.style.color = 'red';
                formStatus.textContent = 'Por favor, corrige los errores en el formulario.';
            }
        });
    }

    // Manejador para el botón de Gmail en Redes Sociales (Smart Redirect)
    const gmailCard = document.getElementById('gmail-social-card');
    if (gmailCard) {
        gmailCard.addEventListener('click', (e) => {
            e.preventDefault();
            handleContactRedirect('Consulta desde Portfolio Web');
        });
    }

    // 7. LÓGICA DEL MENÚ MÓVIL (Hamburguesa)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksMenu = document.getElementById('nav-links');

    if (mobileMenuBtn && navLinksMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinksMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Cerrar menú al hacer clic en un enlace
        const links = navLinksMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinksMenu.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

}); // 👈 CIERRE FINAL
