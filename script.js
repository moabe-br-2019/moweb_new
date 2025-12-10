document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (btn) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
            menu.classList.toggle('flex');
        });
    }

    // Close mobile menu when clicking on a link
    const mobileMenuLinks = menu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
        });
    });

    // Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Efeito Typewriter Refinado
    const phrases = [
        { prefix: "Transforme sua Ideia em um", suffix: "Negócio Digital." },
        { prefix: "Coloque sua Empresa no", suffix: "Piloto Automático." }
    ];
    const staticEl = document.getElementById('static-text');
    const typeEl = document.getElementById('typewriter-text');
    if (staticEl && typeEl) {
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 60;

        staticEl.textContent = phrases[0].prefix;

        function type() {
            const currentObj = phrases[phraseIndex];
            if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                const nextObj = phrases[phraseIndex];
                staticEl.classList.add('blur-mask');
                setTimeout(() => {
                    staticEl.textContent = nextObj.prefix;
                    staticEl.classList.remove('blur-mask');
                    setTimeout(type, 400);
                }, 400);
                return;
            }
            if (isDeleting) {
                if (charIndex > 0) {
                    typeEl.textContent = currentObj.suffix.substring(0, charIndex - 1);
                    charIndex--;
                    typeSpeed = 30;
                }
            } else {
                typeEl.textContent = currentObj.suffix.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 60;
            }
            if (!isDeleting && charIndex === currentObj.suffix.length) {
                isDeleting = true;
                typeSpeed = 2000;
            }
            setTimeout(type, typeSpeed);
        }
        setTimeout(type, 500);
    }

    // Update year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- FETCH PORTFOLIO FROM BASEROW ---
    async function loadPortfolio() {
        const carouselContainer = document.getElementById('carousel-container');
        if (!carouselContainer) return;

        try {
            const response = await fetch('https://api.baserow.io/api/database/rows/table/766353/?user_field_names=true', {
                method: 'GET',
                headers: {
                    'Authorization': 'Token u1K11U32UK796zxvPaVITEt8uT6ai0fK'
                }
            });

            const data = await response.json();

            // Filter only published items
            const publishedItems = data.results.filter(item => item.published === true);

            // Clear existing items
            carouselContainer.innerHTML = '';

            // Create portfolio items
            publishedItems.forEach((item) => {
                const portfolioItem = `
                    <div class="relative rounded-[3rem] overflow-hidden flex-shrink-0 w-[90vw] md:w-[70vw] lg:w-[60vw] aspect-[16/10] snap-center border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                        <!-- Background Image -->
                        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${item.image}');"></div>

                        <!-- Dark Gradient Overlay -->
                        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                        <!-- Content -->
                        <div class="absolute bottom-10 left-8 md:bottom-16 md:left-16 max-w-2xl">
                            <h3 class="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-lg">${item.name}</h3>
                            <div class="flex items-center gap-4 text-gray-300">
                                ${item.link ? `<a href="${item.link}" target="_blank" class="text-brand-yellow font-bold text-sm uppercase tracking-wider hover:underline">Ver Projeto</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
                carouselContainer.insertAdjacentHTML('beforeend', portfolioItem);
            });

            // Initialize carousel after loading items
            initCarousel();

        } catch (error) {
            console.error('Erro ao carregar portfólio:', error);
        }
    }

    // --- CAROUSEL SCRIPT ATUALIZADO ---
    function initCarousel() {
        const wrapper = document.getElementById('carousel-wrapper');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const carouselItems = document.querySelectorAll('#carousel-container > div');

        if (wrapper && prevBtn && nextBtn && carouselItems.length > 0) {
            const itemWidth = carouselItems[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(document.getElementById('carousel-container')).gap) || 32;
            const scrollAmount = itemWidth + gap;

            const updateButtons = () => {
                // Show/Hide Previous Button
                if (wrapper.scrollLeft > 20) {
                    prevBtn.disabled = false;
                    prevBtn.style.opacity = '1';
                } else {
                    prevBtn.disabled = true;
                    prevBtn.style.opacity = '0';
                }

                // Show/Hide Next Button
                const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
                if (wrapper.scrollLeft >= maxScrollLeft - 20) {
                    nextBtn.disabled = true;
                    nextBtn.style.opacity = '0';
                } else {
                    nextBtn.disabled = false;
                    nextBtn.style.opacity = '1';
                }
            };

            nextBtn.addEventListener('click', () => {
                wrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

            prevBtn.addEventListener('click', () => {
                wrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });

            wrapper.addEventListener('scroll', updateButtons);
            // Call once to set initial state
            updateButtons();
        }
    }

    // Load portfolio on page load
    loadPortfolio();

    // --- CONTACT FORM HANDLER ---
    const contactForm = document.getElementById('contact-form');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-btn');
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const notes = document.getElementById('contact-notes').value;

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                const response = await fetch('https://api.baserow.io/api/database/rows/table/766366/?user_field_names=true', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Token u1K11U32UK796zxvPaVITEt8uT6ai0fK',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        Name: name,
                        Email: email,
                        Notes: notes
                    })
                });

                if (response.ok) {
                    // Success modal
                    showModal(`
                        <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                            <i class="ph-fill ph-check-circle text-green-400 text-5xl"></i>
                        </div>
                        <h3 class="text-3xl font-bold text-white mb-4">Mensagem Enviada!</h3>
                        <p class="text-gray-400 mb-6">Obrigado pelo contato, ${name}! Retornaremos em breve para o e-mail <strong class="text-white">${email}</strong>.</p>
                        <button onclick="closeModal()" class="px-8 py-3 bg-brand-yellow text-black font-bold rounded-xl hover:bg-brand-yellowHover transition-all">
                            Fechar
                        </button>
                    `);

                    // Clear form
                    contactForm.reset();
                } else {
                    throw new Error('Erro ao enviar');
                }
            } catch (error) {
                // Error modal with WhatsApp button
                const whatsappMessage = encodeURIComponent(`Olá! Meu nome é ${name} e gostaria de falar sobre: ${notes}`);
                showModal(`
                    <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <i class="ph-fill ph-warning-circle text-red-400 text-5xl"></i>
                    </div>
                    <h3 class="text-3xl font-bold text-white mb-4">Erro ao Enviar</h3>
                    <p class="text-gray-400 mb-6">Desculpe, não conseguimos processar sua solicitação. Por favor, entre em contato pelo WhatsApp.</p>
                    <a href="https://wa.me/5521965088163?text=${whatsappMessage}" target="_blank" class="inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-all">
                        <i class="ph-fill ph-whatsapp-logo text-xl"></i>
                        Enviar via WhatsApp
                    </a>
                `);
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Solicitar Orçamento';
            }
        });
    }

    function showModal(content) {
        modalContent.innerHTML = content;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    // Make closeModal globally accessible
    window.closeModal = closeModal;

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }


    // Timeline Animation Logic (Scroll Spy)
    const timelineSteps = document.querySelectorAll('.timeline-step');
    if (timelineSteps.length > 0) {
        const timelineObserverOptions = {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        };
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, timelineObserverOptions);
        timelineSteps.forEach(step => timelineObserver.observe(step));
    }

    // --- NAVIGATION ACTIVE STATE ON SCROLL ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.hidden.md\\:flex a[href^="#"]');
    const homeLink = document.querySelector('.hidden.md\\:flex a[href="#"]');

    function updateActiveNavLink() {
        const scrollY = window.scrollY + 200; // Offset for better detection
        let activeSection = false;

        // Check if we're at the top of the page (for Home)
        if (window.scrollY < 300) {
            // Remove active classes from all links
            navLinks.forEach(link => {
                link.classList.remove('text-gray-800', 'bg-white', 'shadow-sm', 'font-bold');
                link.classList.add('text-gray-600', 'font-medium');
            });

            // Activate Home link
            if (homeLink) {
                homeLink.classList.remove('text-gray-600', 'font-medium');
                homeLink.classList.add('text-gray-800', 'bg-white', 'shadow-sm', 'font-bold');
            }
            return;
        }

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                activeSection = true;
                // Remove active classes from all links
                navLinks.forEach(link => {
                    link.classList.remove('text-gray-800', 'bg-white', 'shadow-sm', 'font-bold');
                    link.classList.add('text-gray-600', 'font-medium');
                });

                // Add active classes to current section link
                const activeLink = document.querySelector(`.hidden.md\\:flex a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.remove('text-gray-600', 'font-medium');
                    activeLink.classList.add('text-gray-800', 'bg-white', 'shadow-sm', 'font-bold');
                }
            }
        });
    }

    // Run on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    // Run on page load
    updateActiveNavLink();
});
