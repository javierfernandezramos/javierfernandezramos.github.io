import { contactInfo } from '../data/config';

document.addEventListener('DOMContentLoaded', () => {

    // --- 0. LOADER INICIAL (PRIORIDAD MÁXIMA) ---
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 100);
    }

    // --- 2. OPTIMIZACIÓN DE SCROLL UNIFICADA ---
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');

    const onScroll = () => {
        const scrollY = window.scrollY;
        if (navbar) {
            if (scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
        if (backToTopBtn) {
            backToTopBtn.classList.toggle('show', scrollY > 400);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Ejecutar una vez al cargar para setear el estado inicial
    onScroll();

    // --- 3. LIGHTBOX & INTERFACE CONSOLIDADA ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg1 = document.getElementById('lightbox-img-1');
    const lightboxImg2 = document.getElementById('lightbox-img-2');
    let currentActiveImg = lightboxImg1;
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksMenu = document.getElementById('nav-links');
    
    window.lightboxState = { images: [], currentIndex: 0, isOpen: false };
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');



    const preloadImage = (url) => {
        if (!url) return;
        const img = new Image();
        img.src = url;
    };

    window.updateLightboxImage = function (isNavigating = false, direction = 'next') {
        if (!lightboxImg1 || !lightboxImg2 || window.lightboxState.images.length === 0) return;
        
        const currentUrl = window.lightboxState.images[window.lightboxState.currentIndex];

        if (isNavigating) {
            const activeImg = currentActiveImg;
            const incomingImg = activeImg === lightboxImg1 ? lightboxImg2 : lightboxImg1;

            // 1. Ocultar la nueva imagen temporalmente y asignarle el nuevo src
            incomingImg.className = 'lightbox-content';
            incomingImg.style.transition = 'none';
            incomingImg.style.opacity = '0';
            incomingImg.src = currentUrl;

            let hasStarted = false;
            const startAnimation = () => {
                if (hasStarted) return;
                hasStarted = true;
                
                // Preparar posición inicial de entrada lateral (slide-in)
                const startClass = direction === 'next' ? 'slide-in-right-start' : 'slide-in-left-start';
                incomingImg.className = 'lightbox-content ' + startClass;
                
                // Quitar estilos inline de carga
                incomingImg.style.transition = '';
                incomingImg.style.opacity = '';

                // Forzar reflow para registrar el punto de partida
                incomingImg.offsetHeight;

                // Iniciar la transición
                setTimeout(() => {
                    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
                    activeImg.className = 'lightbox-content ' + outClass;
                    incomingImg.className = 'lightbox-content active';
                }, 20);

                // Limpieza tras finalizar la transición (270ms)
                setTimeout(() => {
                    if (currentActiveImg !== activeImg) {
                        activeImg.src = '';
                        activeImg.className = 'lightbox-content';
                    }
                }, 270);

                currentActiveImg = incomingImg;
            };

            // Si ya está en caché o se carga al instante
            if (incomingImg.complete) {
                startAnimation();
            } else {
                incomingImg.onload = () => {
                    startAnimation();
                    incomingImg.onload = null;
                    incomingImg.onerror = null;
                };
                incomingImg.onerror = () => {
                    startAnimation();
                    incomingImg.onload = null;
                    incomingImg.onerror = null;
                };
            }
        } else {
            // Carga inicial sin transición de deslizamiento
            lightboxImg1.className = 'lightbox-content active';
            lightboxImg1.style.transition = '';
            lightboxImg1.style.opacity = '';
            lightboxImg1.src = currentUrl;

            lightboxImg2.className = 'lightbox-content';
            lightboxImg2.style.transition = '';
            lightboxImg2.style.opacity = '';
            lightboxImg2.src = '';

            currentActiveImg = lightboxImg1;
        }

        // Pre-carga predictiva: 2 Siguientes y 2 Anteriores
        const len = window.lightboxState.images.length;
        if (len > 0) {
            preloadImage(window.lightboxState.images[(window.lightboxState.currentIndex + 1) % len]);
            preloadImage(window.lightboxState.images[(window.lightboxState.currentIndex + 2) % len]);
            preloadImage(window.lightboxState.images[(window.lightboxState.currentIndex - 1 + len) % len]);
            preloadImage(window.lightboxState.images[(window.lightboxState.currentIndex - 2 + len * 2) % len]);
        }
    };

    window.showNextImage = () => {
        if (window.lightboxState.images.length <= 1) return;
        window.lightboxState.currentIndex = (window.lightboxState.currentIndex + 1) % window.lightboxState.images.length;
        window.updateLightboxImage(true, 'next');
    };

    window.showPrevImage = () => {
        if (window.lightboxState.images.length <= 1) return;
        window.lightboxState.currentIndex = (window.lightboxState.currentIndex - 1 + window.lightboxState.images.length) % window.lightboxState.images.length;
        window.updateLightboxImage(true, 'prev');
    };

    if (btnNext) btnNext.addEventListener('click', (e) => { e.stopPropagation(); window.showNextImage(); });
    if (btnPrev) btnPrev.addEventListener('click', (e) => { e.stopPropagation(); window.showPrevImage(); });

    if (lightbox) {
        let touchStartX = 0;
        lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        lightbox.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) window.showNextImage();
            if (touchEndX > touchStartX + 50) window.showPrevImage();
        }, { passive: true });
    }

    window.openSmartLightbox = function (clickedUrl, allUrls) {
        if (!lightbox || !lightboxImg1 || !lightboxImg2) return;
        window.lightboxState.images = allUrls;
        window.lightboxState.currentIndex = allUrls.indexOf(clickedUrl);
        window.lightboxState.isOpen = true;
        
        const multiple = allUrls.length > 1;
        if (btnPrev) btnPrev.style.display = multiple ? 'flex' : 'none';
        if (btnNext) btnNext.style.display = multiple ? 'flex' : 'none';
        
        lightbox.style.display = 'flex';

        // Bloqueamos scroll y compensamos el salto de la barra en desktop
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.overflow = 'hidden'; 
        document.body.style.overflow = 'hidden';            
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        if (navbar) navbar.style.paddingRight = `${scrollbarWidth}px`;

        if (mobileMenuBtn) mobileMenuBtn.classList.add('active');
        lightbox.classList.add('opening');
        setTimeout(() => {
            lightbox.classList.remove('opening');
        }, 300);
        window.updateLightboxImage(false);
    };

    const hideLightbox = () => { 
        if (!lightbox) return;
        
        // Iniciar animación de cierre
        lightbox.classList.add('closing');
        if (lightboxImg1) lightboxImg1.classList.add('closing-img');
        if (lightboxImg2) lightboxImg2.classList.add('closing-img');
        
        // Desactivar estado 'active' del botón móvil inmediatamente para sincronizar animación
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
        
        // Restaurar estado de scroll y barra inmediatamente para mejor UX
        document.documentElement.style.overflow = ''; 
        document.body.style.overflow = '';            
        document.body.style.paddingRight = '';
        if (navbar) navbar.style.paddingRight = '';
        
        setTimeout(() => {
            lightbox.style.display = 'none'; 
            lightbox.classList.remove('closing');
            
            if (lightboxImg1) {
                lightboxImg1.src = ''; 
                lightboxImg1.className = 'lightbox-content active';
                lightboxImg1.onload = null;
                lightboxImg1.onerror = null;
            }
            if (lightboxImg2) {
                lightboxImg2.src = ''; 
                lightboxImg2.className = 'lightbox-content';
                lightboxImg2.onload = null;
                lightboxImg2.onerror = null;
            }
            currentActiveImg = lightboxImg1;
            window.lightboxState.isOpen = false;
        }, 200); // Duración de la animación de cierre (200ms)
    };

    const redCloseBtn = document.getElementById('lightbox-close-red');
    if (redCloseBtn) redCloseBtn.addEventListener('click', hideLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox(); });

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const highRes = item.getAttribute('data-src');
            const parentGrid = item.closest('.gallery-grid');
            const allItems = Array.from(parentGrid ? parentGrid.querySelectorAll('.gallery-item') : document.querySelectorAll('.gallery-grid .gallery-item'));
            const allUrls = allItems.map(i => i.getAttribute('data-src')).filter(src => src);
            window.openSmartLightbox(highRes, allUrls);
        });
    });

    // --- 5. ANIMACIONES REVEAL ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px 50px 0px' });
    revealElements.forEach(el => revealObserver.observe(el));

    // --- 6. CONTACTO ---
    const miCorreo = contactInfo.email;
    function handleContactRedirect(asunto = '', mensaje = '') {
        const sub = encodeURIComponent(asunto || 'Consulta Portfolio');
        const body = encodeURIComponent(mensaje ? `Hola Javier,\n\n${mensaje}` : `Hola Javier,\n\nMe gustaría hablar contigo sobre un proyecto...`);
        if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
            window.location.href = `mailto:${miCorreo}?subject=${sub}&body=${body}`;
        } else {
            window.open(`https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${miCorreo}&su=${sub}&body=${body}`, '_blank');
        }
    }

    ['luxury-cta-link', 'gmail-social-card', 'footer-gmail-link'].forEach(id => {
        const el = document.getElementById(id) || document.querySelector('.' + id);
        if (el) el.addEventListener('click', (e) => { e.preventDefault(); handleContactRedirect(); });
    });

    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const asunto = document.getElementById('asunto').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();
            if (asunto.length > 4 && mensaje.length > 9) {
                handleContactRedirect(asunto, mensaje);
                form.reset();
            }
        });
    }

    // --- 7. MENÚ MÓVIL & LÓGICA DUAL ---
    if (mobileMenuBtn && navLinksMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (window.lightboxState.isOpen) {
                hideLightbox();
                return;
            }
            navLinksMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            const isActive = navLinksMenu.classList.contains('active');
            document.body.style.overflow = isActive ? 'hidden' : '';
            document.documentElement.style.overflow = isActive ? 'hidden' : '';
        });

        navLinksMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            });
        });

        // Bloqueo total de scroll táctil cuando el menú está abierto
        navLinksMenu.addEventListener('touchmove', (e) => {
            if (navLinksMenu.classList.contains('active')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // --- 8. VOLVER ARRIBA ---
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 9. SLIDER DE TESTIMONIOS ---
    const testimonialSlider = document.getElementById('testimonials-slider');
    const tSlides = document.querySelectorAll('.testimonial-item');
    let tCurrentSlide = 0;
    let tInterval;

    if (testimonialSlider && tSlides.length > 0) {
        function updateSliderPosition() {
            testimonialSlider.style.transform = `translateX(${-tCurrentSlide * 100}%)`;
        }
        function startAutoScroll() {
            if (tInterval) clearInterval(tInterval);
            tInterval = setInterval(() => {
                tCurrentSlide = (tCurrentSlide + 1) % tSlides.length;
                updateSliderPosition();
            }, 5000);
        }
        const prevBtn = document.getElementById('testimonial-prev');
        const nextBtn = document.getElementById('testimonial-next');
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => { tCurrentSlide = (tCurrentSlide - 1 + tSlides.length) % tSlides.length; updateSliderPosition(); startAutoScroll(); });
            nextBtn.addEventListener('click', () => { tCurrentSlide = (tCurrentSlide + 1) % tSlides.length; updateSliderPosition(); startAutoScroll(); });
        }
        
        // Deslizamiento táctil para móviles
        let touchStartX = 0;
        let touchEndX = 0;

        testimonialSlider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        testimonialSlider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleGesture();
        }, { passive: true });

        function handleGesture() {
            const swipeThreshold = 50; // distancia mínima en px
            if (touchEndX < touchStartX - swipeThreshold) {
                tCurrentSlide = (tCurrentSlide + 1) % tSlides.length;
                updateSliderPosition();
                startAutoScroll();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                tCurrentSlide = (tCurrentSlide - 1 + tSlides.length) % tSlides.length;
                updateSliderPosition();
                startAutoScroll();
            }
        }

        startAutoScroll();
    }
});
