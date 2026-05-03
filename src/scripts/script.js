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

                    // Fallback: Si la miniatura no existe (ej. _thumb.webp), intentar cargar la original
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

    // --- NUEVA LÓGICA DE NAVEGACIÓN DEL LIGHTBOX (SLIDER) ---
    window.lightboxState = {
        images: [],
        currentIndex: 0
    };

    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    window.updateLightboxImage = function () {
        if (!lightboxImg || window.lightboxState.images.length === 0) return;
        lightboxImg.src = window.lightboxState.images[window.lightboxState.currentIndex];
    };

    window.showNextImage = function () {
        if (window.lightboxState.images.length <= 1) return;
        window.lightboxState.currentIndex = (window.lightboxState.currentIndex + 1) % window.lightboxState.images.length;
        window.updateLightboxImage();
    };

    window.showPrevImage = function () {
        if (window.lightboxState.images.length <= 1) return;
        window.lightboxState.currentIndex = (window.lightboxState.currentIndex - 1 + window.lightboxState.images.length) % window.lightboxState.images.length;
        window.updateLightboxImage();
    };

    if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); window.showNextImage(); });
    if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); window.showPrevImage(); });

    // Eventos de deslizamiento (Swipe) táctil
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) {
                window.showNextImage();
            }
            if (touchEndX > touchStartX + threshold) {
                window.showPrevImage();
            }
        }, { passive: true });
    }

    // Función universal para abrir el slider
    window.openSmartLightbox = function (clickedUrl, allUrls) {
        if (!lightbox || !lightboxImg) return;
        window.lightboxState.images = allUrls;
        window.lightboxState.currentIndex = allUrls.indexOf(clickedUrl);
        if (window.lightboxState.currentIndex === -1) window.lightboxState.currentIndex = 0;

        const multiple = allUrls.length > 1;
        if (btnPrev) btnPrev.style.display = multiple ? 'flex' : 'none';
        if (btnNext) btnNext.style.display = multiple ? 'flex' : 'none';

        lightbox.style.display = 'flex';
        window.updateLightboxImage();
    };

    galleryItems.forEach(item => {
        mainImageObserver.observe(item);

        item.addEventListener('click', (e) => {
            const highRes = item.getAttribute('data-src');
            if (!highRes) return;

            // Get only images from the same container (important for categories in galeria)
            const parentGrid = item.closest('.gallery-grid');
            const allItems = Array.from(parentGrid ? parentGrid.querySelectorAll('.gallery-item') : document.querySelectorAll('.gallery-grid .gallery-item'));
            const allUrls = allItems.map(i => i.getAttribute('data-src')).filter(src => src);

            window.openSmartLightbox(highRes, allUrls);
        });
    });

    const hideLightbox = () => {
        if (!lightbox) return;
        lightbox.style.display = 'none';
        if (lightboxImg) lightboxImg.src = '';
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

    // 6. LÓGICA DE CONTACTO UNIFICADA (SMART REDIRECT)
    const miCorreo = 'javierfernandezramos9@gmail.com';

    function handleContactRedirect(asunto = '', mensaje = '') {
        const subjectEncoded = encodeURIComponent(asunto || 'Consulta Portfolio');
        const bodyContent = mensaje ?
            `Hola Javier,\n\n${mensaje}` :
            `Hola Javier,\n\nMe gustaría hablar contigo sobre un proyecto...`;
        const bodyEncoded = encodeURIComponent(bodyContent);

        const mailtoLink = `mailto:${miCorreo}?subject=${subjectEncoded}&body=${bodyEncoded}`;
        const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${miCorreo}&su=${subjectEncoded}&body=${bodyEncoded}`;

        const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile) {
            window.location.href = mailtoLink;
        } else {
            window.open(gmailUrl, '_blank');
        }
    }

    const visionBtn = document.querySelector('.luxury-cta-link');
    if (visionBtn) {
        visionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleContactRedirect('Proyecto Fotografía');
        });
    }

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

    const gmailCard = document.getElementById('gmail-social-card');
    if (gmailCard) {
        gmailCard.addEventListener('click', (e) => {
            e.preventDefault();
            handleContactRedirect('Consulta desde Portfolio Web');
        });
    }

    const footerGmail = document.getElementById('footer-gmail-link');
    if (footerGmail) {
        footerGmail.addEventListener('click', (e) => {
            e.preventDefault();
            handleContactRedirect('Consulta desde Footer');
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
                document.body.style.overflow = 'hidden';
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = 'auto';
            }
        });

        const links = navLinksMenu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinksMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // 8. BOTÓN VOLVER ARRIBA
    const backToTopBtn = document.getElementById('back-to-top');

    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 9. SLIDER DE TESTIMONIOS (Auto-scroll e Interactivo)
    const testimonialSlider = document.getElementById('testimonials-slider');
    const tSlides = document.querySelectorAll('.testimonial-item');
    const tWrapper = document.querySelector('.testimonials-slider-wrapper');
    let tCurrentSlide = 0;
    let tInterval;
    let startX = 0;
    let isDragging = false;
    let currentTranslate = 0;
    let prevTranslate = 0;

    function updateSliderPosition() {
        if (!tSlides.length) return;
        const slideWidth = tSlides[0].offsetWidth;
        currentTranslate = -tCurrentSlide * slideWidth;
        testimonialSlider.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        testimonialSlider.style.transform = `translateX(${currentTranslate}px)`;
    }

    function startAutoScroll() {
        stopAutoScroll();
        tInterval = setInterval(() => {
            tCurrentSlide = (tCurrentSlide + 1) % tSlides.length;
            updateSliderPosition();
        }, 5000);
    }

    function stopAutoScroll() {
        if (tInterval) clearInterval(tInterval);
    }

    if (testimonialSlider && tSlides.length > 0) {
        startAutoScroll();

        // Botones de Navegación (Solo Desktop)
        const prevBtn = document.getElementById('testimonial-prev');
        const nextBtn = document.getElementById('testimonial-next');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                stopAutoScroll();
                tCurrentSlide = (tCurrentSlide - 1 + tSlides.length) % tSlides.length;
                updateSliderPosition();
                startAutoScroll();
            });

            nextBtn.addEventListener('click', () => {
                stopAutoScroll();
                tCurrentSlide = (tCurrentSlide + 1) % tSlides.length;
                updateSliderPosition();
                startAutoScroll();
            });
        }

        // Reajuste en cambio de tamaño de ventana
        window.addEventListener('resize', updateSliderPosition);
    }

}); // 👈 CIERRE FINAL
