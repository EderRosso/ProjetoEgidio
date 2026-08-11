/**
 * BUFFON - ASSISTÊNCIA TÉCNICA INDUSTRIAL
 * JavaScript principal (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Atualiza o ano de direitos autorais no rodapé automaticamente
    const footerYearEl = document.getElementById('footer-year');
    if (footerYearEl) {
        footerYearEl.textContent = new Date().getFullYear();
    }

    /* ==========================================================================
       1. CONTROLE DO MENU RESPONSIVO (MOBILE HAMBURGER)
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            mobileToggle.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', isOpen);
            
            // Impede rolagem do fundo quando menu mobile estiver ativo
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Fecha o menu mobile quando clica em algum link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });

        // Fecha o menu mobile se clicar fora dele
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
       2. SCROLL EVENTS (STICKY NAVBAR & ACTIVE MENU HIGH LIGHT)
       ========================================================================== */
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        // Sticky Navbar
        if (header) {
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Destaque de seção ativa na barra de navegação
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Offset para compensar a barra de navegação
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    navLink.classList.add('active');
                }
            }
        });
    });

    /* ==========================================================================
       3. ACORDEÃO DE PERGUNTAS FREQUENTES (FAQ)
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const headerBtn = item.querySelector('.faq-header');
        const bodyContainer = item.querySelector('.faq-body');

        if (headerBtn && bodyContainer) {
            headerBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Fecha todos os FAQs ativos antes de abrir o atual (estilo acordeão único)
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
                    // Calcula a altura exata do conteúdo interno para transição fluida do CSS
                    bodyContainer.style.maxHeight = bodyContainer.scrollHeight + 'px';
                    headerBtn.setAttribute('aria-expanded', 'true');
                }
            });
        }
    });

    /* ==========================================================================
       4. ENVIO E VALIDAÇÃO DO FORMULÁRIO DE ORÇAMENTO
       ========================================================================== */
    const budgetForm = document.getElementById('budget-form');
    const submitBtn = document.getElementById('form-submit-btn');

    if (budgetForm) {
        budgetForm.addEventListener('submit', async (event) => {
            const formAction = budgetForm.getAttribute('action');

            // Verifica se o usuário não alterou o placeholder do Formspree
            if (formAction.includes('[ENDPOINT_DE_EMAIL_FORM_SPREE_AQUI]')) {
                event.preventDefault();
                alert('Atenção: O formulário de contato está em modo de demonstração. Configure um endpoint válido no atributo "action" do formulário para receber os e-mails (veja as instruções no arquivo README.md ou no próprio código HTML).');
                
                // Exibe no console os dados que seriam enviados
                const formData = new FormData(budgetForm);
                console.log('Dados do orçamento simulados:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}: ${value}`);
                }
                return;
            }

            // Caso possua um endpoint configurado, faz envio assíncrono (AJAX) para não recarregar a página
            event.preventDefault();
            
            // Altera botão para estado de envio
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando orçamento...';

            try {
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: new FormData(budgetForm),
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert('Solicitação de orçamento enviada com sucesso! Nossa equipe entrará em contato em breve.');
                    budgetForm.reset();
                } else {
                    const data = await response.json();
                    if (Object.hasOwn(data, 'errors')) {
                        alert('Erro no envio: ' + data.errors.map(error => error.message).join(', '));
                    } else {
                        alert('Houve um problema ao enviar o formulário. Por favor, tente novamente ou fale conosco via WhatsApp.');
                    }
                }
            } catch (error) {
                alert('Erro de conexão ao enviar o formulário. Favor tentar mais tarde ou via WhatsApp.');
            } finally {
                // Restaura o botão
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
});
