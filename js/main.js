/**
 * BUFFON - ASSISTÊNCIA TÉCNICA INDUSTRIAL
 * JavaScript principal (ES6+)
 * 
 * Este arquivo controla o carregamento de dados dinâmicos e a interatividade do site.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CARREGAMENTO E RENDERIZAÇÃO DOS DADOS DINÂMICOS
    renderSiteData();

    // Atualiza o ano de direitos autorais no rodapé automaticamente
    const footerYearEl = document.getElementById('footer-year');
    if (footerYearEl) {
        footerYearEl.textContent = new Date().getFullYear();
    }

    /* ==========================================================================
       2. CONTROLE DO MENU RESPONSIVO (MOBILE HAMBURGER)
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('open') && 
                !navMenu.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    /* ==========================================================================
       3. SCROLL EVENTS (STICKY NAVBAR & ACTIVE MENU HIGHLIGHT)
       ========================================================================== */
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            if (sectionId) {
                const navLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);
                if (navLink) {
                    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                        navLinks.forEach(link => link.classList.remove('active'));
                        navLink.classList.add('active');
                    }
                }
            }
        });
    });

    /* ==========================================================================
       4. ACORDEÃO DE PERGUNTAS FREQUENTES (FAQ) - USANDO DELEGAÇÃO DE EVENTOS
       ========================================================================== */
    const faqWrapper = document.querySelector('.faq-wrapper');
    if (faqWrapper) {
        faqWrapper.addEventListener('click', (e) => {
            const headerBtn = e.target.closest('.faq-header');
            if (!headerBtn) return;

            const item = headerBtn.closest('.faq-item');
            const bodyContainer = item.querySelector('.faq-body');
            const isActive = item.classList.contains('active');

            // Fecha outros FAQs ativos
            const faqItems = faqWrapper.querySelectorAll('.faq-item');
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-body').style.maxHeight = '0px';
                    otherItem.querySelector('.faq-header').setAttribute('aria-expanded', 'false');
                }
            });

            // Alterna o estado do item atual
            if (isActive) {
                item.classList.remove('active');
                bodyContainer.style.maxHeight = '0px';
                headerBtn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                bodyContainer.style.maxHeight = bodyContainer.scrollHeight + 'px';
                headerBtn.setAttribute('aria-expanded', 'true');
            }
        });
    }

    /* ==========================================================================
       5. ENVIO E VALIDAÇÃO DO FORMULÁRIO DE ORÇAMENTO
       ========================================================================== */
    const budgetForm = document.getElementById('budget-form');
    const submitBtn = document.getElementById('form-submit-btn');

    if (budgetForm) {
        budgetForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            const formData = new FormData(budgetForm);
            const name = formData.get('name') || '';
            const phone = formData.get('phone') || '';
            const email = formData.get('email') || '';
            const device_type = formData.get('device_type') || '';
            const message = formData.get('message') || '';
            
            const deviceMap = {
                'pneumatica': 'Ferramenta Pneumática',
                'pintura': 'Equipamento de Pintura',
                'motor': 'Motor Elétrico',
                'eletrica': 'Ferramenta Elétrica',
                'outro': 'Outro Equipamento'
            };
            const deviceName = deviceMap[device_type] || device_type;
            
            const wppText = `*NOVA SOLICITAÇÃO DE ORÇAMENTO*
            
*Nome/Empresa:* ${name}
*Telefone/WhatsApp:* ${phone}
*E-mail:* ${email}
*Equipamento:* ${deviceName}
*Defeito/Descrição:* ${message}`;

            const rawPhone = window.siteData?.config?.whatsapp || '555134740000';
            const cleanPhone = rawPhone.replace(/\D/g, '');
            
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(wppText)}`;
            window.open(whatsappUrl, '_blank');
        });
    }
});

/**
 * Injeta todos os dados dinâmicos do arquivo js/data.js no HTML
 */
function renderSiteData() {
    const data = window.siteData;
    if (!data) {
        console.warn("Aviso: Configurações do site (window.siteData) não encontradas. O site utilizará as informações estáticas.");
        return;
    }

    // 0. Visibilidade das Seções e Links de Navegação
    const visibility = data.visibility || {};
    const sectionsMap = {
        '#home': visibility.hero !== false,
        '.stats': visibility.stats !== false,
        '#sobre': visibility.about !== false,
        '#processo': visibility.process !== false,
        '#servicos': visibility.services !== false,
        '#faq': visibility.faq !== false,
        '#depoimentos': visibility.testimonials !== false,
        '#contato': visibility.contact !== false
    };

    for (const [selector, isVisible] of Object.entries(sectionsMap)) {
        const secEl = document.querySelector(selector);
        if (secEl) {
            secEl.style.display = isVisible ? '' : 'none';
        }
        
        if (selector.startsWith('#')) {
            const navLink = document.querySelector(`.nav-menu a[href="${selector}"]`);
            if (navLink) {
                navLink.style.display = isVisible ? '' : 'none';
            }
        }
    }

    // 1. Injetar textos e atributos simples (campos marcados com data-field)
    const textFields = document.querySelectorAll('[data-field]');
    textFields.forEach(el => {
        const fieldPath = el.getAttribute('data-field');
        const value = getNestedValue(data, fieldPath);
        
        if (value !== undefined && value !== null) {
            // Se o campo tiver tags HTML (ex: no título do Hero), usamos innerHTML, caso contrário textContent
            if (el.tagName === 'SPAN' || el.tagName === 'H1' || el.tagName === 'H2' || fieldPath.includes('title')) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        }
    });

    // 2. Atualizar links globais (WhatsApp, Email, Redes Sociais, Favicon, Logos)
    const config = data.config || {};
    
    // Favicon
    if (config.faviconUrl) {
        const faviconLink = document.querySelector('link[rel="shortcut icon"]');
        if (faviconLink) faviconLink.setAttribute('href', config.faviconUrl);
    }

    // Logo Icon
    if (config.logoIconUrl) {
        const logoIcon = document.querySelector('#header-logo img');
        if (logoIcon) logoIcon.setAttribute('src', config.logoIconUrl);
    }

    // WhatsApp Links
    if (config.whatsapp) {
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
        whatsappLinks.forEach(link => {
            link.setAttribute('href', `https://wa.me/${config.whatsapp.replace(/\D/g, '')}`);
        });
    }

    // Email link
    if (config.email) {
        const emailLink = document.querySelector('a[href^="mailto:"]');
        if (emailLink) emailLink.setAttribute('href', `mailto:${config.email}`);
    }

    // Facebook & Instagram
    if (config.facebookUrl) {
        const fbLink = document.querySelector('a[href*="facebook.com"]');
        if (fbLink) fbLink.setAttribute('href', config.facebookUrl);
    }
    if (config.instagramUrl) {
        const igLink = document.querySelector('a[href*="instagram.com"]');
        if (igLink) igLink.setAttribute('href', config.instagramUrl);
    }

    // Google Maps Iframe
    if (config.mapsIframeSrc) {
        const mapIframe = document.querySelector('.map-container iframe');
        if (mapIframe) mapIframe.setAttribute('src', config.mapsIframeSrc);
    }

    // Formspree Action
    if (config.formspreeAction) {
        const budgetForm = document.getElementById('budget-form');
        if (budgetForm) budgetForm.setAttribute('action', config.formspreeAction);
    }

    // 3. Renderizar listas dinâmicas

    // Hero Background Carousel
    if (data.hero && data.hero.backgrounds) {
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            const bgList = data.hero.backgrounds.filter(bg => bg !== '');
            if (bgList.length === 0) {
                bgList.push('assets/images/industrial_maintenance.png');
            }

            heroBg.innerHTML = bgList.map((bg, idx) => `
                <div class="hero-slide ${idx === 0 ? 'active' : ''}" style="background-image: url('${bg}');"></div>
            `).join('');

            if (bgList.length > 1) {
                let currentSlide = 0;
                const slides = heroBg.querySelectorAll('.hero-slide');
                
                if (window.heroCarouselInterval) {
                    clearInterval(window.heroCarouselInterval);
                }
                
                window.heroCarouselInterval = setInterval(() => {
                    if (slides.length > 0) {
                        slides[currentSlide].classList.remove('active');
                        currentSlide = (currentSlide + 1) % slides.length;
                        slides[currentSlide].classList.add('active');
                    }
                }, 5000);
            }
        }
    }

    // Hero Features
    if (data.hero && data.hero.features) {
        const heroFeaturesBadge = document.querySelector('.hero-features-badge');
        if (heroFeaturesBadge) {
            heroFeaturesBadge.innerHTML = data.hero.features.map(feat => `
                <div class="hero-feature-item">
                    <div class="hero-feature-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="hero-feature-text">
                        <h4>${feat.title}</h4>
                        <p>${feat.description}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // Stats Grid
    if (data.stats) {
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.innerHTML = data.stats.map(stat => `
                <div class="stat-item">
                    <div class="stat-number">${stat.number}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            `).join('');
        }
    }

    // About Image (ou fallback do gráfico SVG original)
    if (data.about) {
        const aboutImgSide = document.querySelector('.about-image-side');
        if (aboutImgSide) {
            const imgContainer = aboutImgSide.querySelector('.about-image-container');
            if (data.about.imageUrl && imgContainer) {
                imgContainer.innerHTML = `<img src="${data.about.imageUrl}" alt="${data.about.title || 'Buffon'}" style="width:100%; border-radius:12px; height:100%; object-fit:cover; display:block; aspect-ratio:1.43;">`;
            }
            
            // Experiência flutuante
            const expBadge = aboutImgSide.querySelector('.about-experience-badge');
            if (expBadge) {
                expBadge.innerHTML = `
                    <h3>${data.about.experienceYears || '10'}</h3>
                    <p>${data.about.experienceLabel || 'Anos no Mercado'}</p>
                `;
            }
        }

        // About Cards
        if (data.about.cards) {
            const aboutGrid = document.querySelector('.about-grid');
            if (aboutGrid) {
                aboutGrid.innerHTML = data.about.cards.map((card, idx) => `
                    <div class="about-card">
                        <div class="about-card-icon">
                            ${idx === 0 ? `
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                            ` : `
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                </svg>
                            `}
                        </div>
                        <h4 class="about-card-title">${card.title}</h4>
                        <p class="about-card-desc">${card.description}</p>
                    </div>
                `).join('');
            }
        }
    }

    // Process Steps Timeline
    if (data.process && data.process.steps) {
        const timelineWrapper = document.querySelector('.timeline-wrapper');
        if (timelineWrapper) {
            const timelineHeader = `<div class="timeline-line"></div>`;
            const stepsHtml = data.process.steps.map((step, idx) => {
                const isEven = idx % 2 === 0;
                return `
                    <div class="timeline-step">
                        ${isEven ? `
                            <div class="timeline-content-side">
                                <div class="timeline-card">
                                    <span class="timeline-step-num">${step.num}</span>
                                    <h3>${step.title}</h3>
                                    <p>${step.description}</p>
                                </div>
                            </div>
                            <div class="timeline-node">${idx + 1}</div>
                            <div class="timeline-empty-side"></div>
                        ` : `
                            <div class="timeline-empty-side"></div>
                            <div class="timeline-node">${idx + 1}</div>
                            <div class="timeline-content-side">
                                <div class="timeline-card">
                                    <span class="timeline-step-num">${step.num}</span>
                                    <h3>${step.title}</h3>
                                    <p>${step.description}</p>
                                </div>
                            </div>
                        `}
                    </div>
                `;
            }).join('');
            timelineWrapper.innerHTML = timelineHeader + stepsHtml;
        }
    }

    // Services Grid
    if (data.services && data.services.items) {
        const servicesGrid = document.querySelector('.services-grid');
        if (servicesGrid) {
            const svgs = {
                pneumatic: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 0-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 0 7.94-7.94l-3.76 3.76z"></path></svg>`,
                painting: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"></path><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"></path><path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"></path></svg>`,
                motor: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
                electric: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>`
            };

            servicesGrid.innerHTML = data.services.items.map(srv => `
                <div class="service-card">
                    ${srv.imageUrl ? `
                    <div class="service-card-img-wrapper">
                        <img src="${srv.imageUrl}" alt="${srv.title}" class="service-card-img" loading="lazy">
                    </div>
                    ` : ''}
                    <div class="service-card-body">
                        <div class="service-icon-box">
                            ${svgs[srv.icon] || svgs.pneumatic}
                        </div>
                        <h3>${srv.title}</h3>
                        <p>${srv.description}</p>
                        <a href="https://wa.me/${(config.whatsapp || '').replace(/\D/g, '')}" class="service-link" target="_blank" rel="noopener noreferrer">
                            Solicitar Manutenção
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>
                </div>
            `).join('');
        }
    }

    // Brands Carousel (duplicado para efeito infinito)
    if (data.services && data.services.brands) {
        const carouselTrack = document.querySelector('.brands-carousel-track');
        if (carouselTrack) {
            const brandsHtml = data.services.brands.map(brand => `
                <div class="brand-logo-item">${brand}</div>
            `).join('');
            // Duplicar marcas para manter o scroll contínuo
            carouselTrack.innerHTML = brandsHtml + brandsHtml;
        }
    }

    // FAQ Wrapper
    if (data.faq && data.faq.items) {
        const faqWrapper = document.querySelector('.faq-wrapper');
        if (faqWrapper) {
            faqWrapper.innerHTML = data.faq.items.map((faq, idx) => `
                <div class="faq-item">
                    <button class="faq-header" aria-expanded="false" id="faq-btn-${idx + 1}">
                        <span class="faq-question">${faq.question}</span>
                        <span class="faq-icon-box">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </span>
                    </button>
                    <div class="faq-body">
                        <div class="faq-content">
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Testimonials Grid (Suporta widget do Google ou depoimentos manuais)
    if (data.testimonials) {
        const testGrid = document.querySelector('.testimonials-grid');
        const summaryBadge = document.querySelector('.google-badge-summary');
        
        if (data.testimonials.widgetHtml) {
            // Se houver código de widget, exibe-o e esconde as estatísticas manuais
            if (testGrid) {
                testGrid.style.display = 'block';
                testGrid.innerHTML = `<div class="google-widget-wrapper" style="width:100%; overflow:hidden;">${data.testimonials.widgetHtml}</div>`;
            }
            if (summaryBadge) summaryBadge.style.display = 'none';
        } else {
            // Caso contrário, renderiza os depoimentos manuais estruturados
            if (summaryBadge) summaryBadge.style.display = '';
            
            if (data.testimonials.items && testGrid) {
                testGrid.style.display = 'grid';
                testGrid.innerHTML = data.testimonials.items.map(test => {
                    let starsHtml = '';
                    for (let i = 0; i < (test.rating || 5); i++) {
                        starsHtml += `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="star-icon"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
                    }

                    return `
                        <div class="testimonial-card">
                            <div class="testimonial-header">
                                <div class="client-avatar">
                                    <span>${test.initials}</span>
                                </div>
                                <div class="client-info">
                                    <h4 class="client-name">${test.name}</h4>
                                    <span class="client-company">${test.company}</span>
                                </div>
                                <div class="google-logo-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-6.886 4.113-4.907 0-8.905-4.013-8.905-8.9s3.998-8.9 8.905-8.9c2.285 0 4.36.815 5.998 2.37l3.124-3.128C18.665 1.545 15.673 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.07 0 11.758-4.975 11.758-11.966 0-.81-.073-1.603-.22-2.229H12.24z"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="testimonial-rating">
                                ${starsHtml}
                            </div>
                            <p class="testimonial-text">${test.text}</p>
                            <span class="testimonial-date">${test.date}</span>
                        </div>
                    `;
                }).join('');
            }
        }

        // Links de reviews do footer
        if (data.testimonials.googlePlaceReviewsUrl) {
            const googleLinkBtn = document.querySelector('.testimonials-footer a');
            if (googleLinkBtn) googleLinkBtn.setAttribute('href', data.testimonials.googlePlaceReviewsUrl);
        }
    }
}

/**
 * Função utilitária para obter valores de objetos aninhados a partir de uma string de caminho (ex: "hero.title")
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
