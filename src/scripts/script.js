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

    // --- 1. INICIALIZACIÓN DE LENIS (CON PROTECCIÓN) ---
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1.1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            if (lenis) lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        window.lenis = lenis;
    }

    // --- 2. OPTIMIZACIÓN DE SCROLL UNIFICADA ---
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');

    const onScroll = () => {
        const scrollY = lenis ? lenis.animatedScroll : window.scrollY;
        if (navbar) {
            if (scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        }
        if (backToTopBtn) {
            backToTopBtn.classList.toggle('show', scrollY > 400);
        }
    };

    if (lenis) {
        lenis.on('scroll', onScroll);
    } else {
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Ejecutar una vez al cargar para setear el estado inicial
    onScroll();

    // --- 3. LIGHTBOX & INTERFACE CONSOLIDADA ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksMenu = document.getElementById('nav-links');
    
    window.lightboxState = { images: [], currentIndex: 0, isOpen: false };
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

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
    }, { rootMargin: '300px' });

    const preloadImage = (url) => {
        if (!url) return;
        const img = new Image();
        img.src = url;
    };

    window.updateLightboxImage = function () {
        if (!lightboxImg || window.lightboxState.images.length === 0) return;
        
        const currentUrl = window.lightboxState.images[window.lightboxState.currentIndex];
        lightboxImg.src = currentUrl;

        // Pre-carga predictiva: Siguiente y Anterior
        const nextIdx = (window.lightboxState.currentIndex + 1) % window.lightboxState.images.length;
        const prevIdx = (window.lightboxState.currentIndex - 1 + window.lightboxState.images.length) % window.lightboxState.images.length;
        
        preloadImage(window.lightboxState.images[nextIdx]);
        preloadImage(window.lightboxState.images[prevIdx]);
    };

    window.showNextImage = () => {
        if (window.lightboxState.images.length <= 1) return;
        window.lightboxState.currentIndex = (window.lightboxState.currentIndex + 1) % window.lightboxState.images.length;
        window.updateLightboxImage();
    };

    window.showPrevImage = () => {
        if (window.lightboxState.images.length <= 1) return;
        window.lightboxState.currentIndex = (window.lightboxState.currentIndex - 1 + window.lightboxState.images.length) % window.lightboxState.images.length;
        window.updateLightboxImage();
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
        if (!lightbox || !lightboxImg) return;
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

        if (lenis) lenis.stop(); 

        if (mobileMenuBtn) mobileMenuBtn.classList.add('active');
        window.updateLightboxImage();
    };

    const hideLightbox = () => { 
        if (lightbox) lightbox.style.display = 'none'; 
        if (lightboxImg) lightboxImg.src = ''; 
        window.lightboxState.isOpen = false;
        document.documentElement.style.overflow = ''; 
        document.body.style.overflow = '';            
        document.body.style.paddingRight = '';
        if (navbar) navbar.style.paddingRight = '';

        if (window.lenis) window.lenis.start();
        if (mobileMenuBtn) mobileMenuBtn.classList.remove('active');
    };

    const redCloseBtn = document.getElementById('lightbox-close-red');
    if (redCloseBtn) redCloseBtn.addEventListener('click', hideLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox(); });

    galleryItems.forEach(item => {
        mainImageObserver.observe(item);
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
    const miCorreo = 'javierfernandezramos9@gmail.com';
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
            if (lenis) isActive ? lenis.stop() : lenis.start();
        });

        navLinksMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinksMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                if (lenis) lenis.start();
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
            if (lenis) lenis.scrollTo(0);
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- 9. SLIDER DE TESTIMONIOS ---
    const testimonialSlider = document.getElementById('testimonials-slider');
    const tSlides = document.querySelectorAll('.testimonial-item');
    let tCurrentSlide = 0;
    let tInterval;

    if (testimonialSlider && tSlides.length > 0) {
        let slideWidth = tSlides[0].offsetWidth; 
        function updateSliderPosition() {
            testimonialSlider.style.transform = `translateX(${-tCurrentSlide * slideWidth}px)`;
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
        startAutoScroll();
        window.addEventListener('resize', () => {
            slideWidth = tSlides[0].offsetWidth; 
            updateSliderPosition();
        });
    }
});
