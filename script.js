document.addEventListener('DOMContentLoaded', () => {

    // 1. LOADER INICIAL
    const loader = document.getElementById('loader');
    setTimeout(() => {
        // Inicia el fade-out del loader
        loader.style.opacity = '0';
        setTimeout(() => {
            // Oculta completamente después de la transición
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

    // 3. LIGHTBOX PARA LA GALERÍA
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            // Usa data-src para la imagen de alta resolución
            lightboxImg.src = item.getAttribute('data-src');
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Cierra el lightbox al hacer clic fuera de la imagen
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });


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



    // 6. FORMULARIO DE CONTACTO (Validación)
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Limpiar errores previos
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        formStatus.textContent = '';
        
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const asunto = document.getElementById('asunto').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();
        let isValid = true;

        if (nombre.length < 3) {
            document.getElementById('nombre-error').textContent = 'El nombre es muy corto.';
            isValid = false;
        }

        if (!validateEmail(email)) {
            document.getElementById('email-error').textContent = 'Introduce un correo válido.';
            isValid = false;
        }
        
        if (asunto.length < 5) {
            document.getElementById('asunto-error').textContent = 'El asunto es muy corto.';
            isValid = false;
        }

        if (mensaje.length < 10) {
            document.getElementById('mensaje-error').textContent = 'El mensaje es muy corto.';
            isValid = false;
        }

        if (isValid) {
            // SIMULACIÓN de éxito: reemplaza esto por tu servicio de envío de formularios (e.g., Formspree, Netlify Forms, backend propio)
            formStatus.style.color = 'green';
            formStatus.textContent = '¡Mensaje enviado con éxito! Te contactaré pronto.';
            form.reset();
        } else {
            formStatus.style.color = 'red';
            formStatus.textContent = 'Por favor, corrige los errores en el formulario.';
        }

    });

});