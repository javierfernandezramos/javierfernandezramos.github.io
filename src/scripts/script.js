document.addEventListener('DOMContentLoaded', () => {

    // 1. LOADER INICIAL
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 100);
    }

    // 2. NAVBAR STICKY
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. LAZY LOADING Y LIGHTBOX
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

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

    window.lightboxState = { images: [], currentIndex: 0 };
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');

    window.updateLightboxImage = function () {
        if (!lightboxImg || window.lightboxState.images.length === 0) return;
        lightboxImg.src = window.lightboxState.images[window.lightboxState.currentIndex];
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
        const multiple = allUrls.length > 1;
        if (btnPrev) btnPrev.style.display = multiple ? 'flex' : 'none';
        if (btnNext) btnNext.style.display = multiple ? 'flex' : 'none';
        lightbox.style.display = 'flex';
        window.updateLightboxImage();
    };

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

    const hideLightbox = () => { if (lightbox) lightbox.style.display = 'none'; if (lightboxImg) lightboxImg.src = ''; };
    if (closeBtn) closeBtn.addEventListener('click', hideLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox(); });

    // 4. ANIMACIONES REVEAL
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

    // 6. CONTACTO
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
        const el = id.startsWith('.') ? document.querySelector(id) : document.getElementById(id) || document.querySelector('.'+id);
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

    // 7. MENÚ MÓVIL
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinksMenu = document.getElementById('nav-links');
    if (mobileMenuBtn && navLinksMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksMenu.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
            document.body.style.overflow = navLinksMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // 8. VOLVER ARRIBA
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.classList.toggle('show', window.scrollY > 400);
        });
        backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // 9. SLIDER DE TESTIMONIOS (Optimizado para evitar forced reflows)
    const testimonialSlider = document.getElementById('testimonials-slider');
    const tSlides = document.querySelectorAll('.testimonial-item');
    let tCurrentSlide = 0;
    let tInterval;

    if (testimonialSlider && tSlides.length > 0) {
        let slideWidth = tSlides[0].offsetWidth; // Cacheamos el valor inicial
        
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
            slideWidth = tSlides[0].offsetWidth; // Solo recalculamos al redimensionar
            updateSliderPosition();
        });
    }

});
