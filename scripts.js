document.addEventListener('DOMContentLoaded', () => {

    const WHATSAPP_NUMBER = '5541991449078';
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const DOM = {
        body: document.body,
        siteHeader: document.querySelector('.site-header'),
        nav: document.querySelector('.site-header__nav'),
        mobileNavToggle: document.querySelector('.mobile-nav-toggle'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        currentYearSpan: document.getElementById('current-year'),
        product: {
            techniqueRadios: document.querySelectorAll('input[name="mandala-technique"]'),
            sizeRadios: document.querySelectorAll('input[name="mandala-size"]'),
            apliqueCheckbox: document.getElementById('mandala-aplique'),
            apliqueWrapper: document.getElementById('aplique-option-wrapper'),
            priceDisplay: document.getElementById('product-price'),
            addToCartBtn: document.getElementById('add-to-cart-btn'),
            customSizeInfo: document.getElementById('custom-size-info'),
            labelTechnique: document.getElementById('label-tecnica'),
            labelAdicional: document.getElementById('label-adicional'),
            labelDiametro: document.getElementById('label-diametro'),
            techniqueImageContainer: document.getElementById('visualizador-tecnica'),
            techniqueImage: document.getElementById('mandala-image-tecnica'),
            techniqueCaption: document.getElementById('legenda-tecnica'),
            sizeImage: document.getElementById('mandala-image-tamanho'),
            sizeVisualizer: document.querySelector('.configurador-visualizador-tamanho'),
            // ADICIONADOS PARA VALIDAÇÃO:
            errorMsg: document.getElementById('selection-error'),
            containerTechniqueOptions: document.getElementById('technique-options'),
            // IMPORTANTE: Certifique-se de que adicionou id="container-tamanhos" no HTML
            containerSizeOptions: document.getElementById('container-tamanhos') || document.querySelector('.visual-options-group--sizes'),
        },
        cart: {
            openBtn: document.getElementById('open-cart-btn'),
            closeBtn: document.querySelector('.cart-drawer__close'),
            drawer: document.querySelector('.cart-drawer'),
            overlay: document.querySelector('.cart-drawer__overlay'),
            count: document.getElementById('cart-count'),
            itemsContainer: document.getElementById('cart-items'),
            subtotalDisplay: document.getElementById('cart-subtotal'),
            checkoutBtn: document.getElementById('checkout-btn'),
        },
        customOrder: {
            form: document.getElementById('custom-order-form'),
            nameInput: document.getElementById('order-name'),
            messageInput: document.getElementById('order-message'),
        }
    };

    function init() {
        setupMobileMenu();
        setupThemeToggle();
        setupHeaderScroll();
        setupProductConfigurator(); // A lógica unificada está aqui dentro
        setupCart();
        setupCustomOrderForm();
        if (DOM.currentYearSpan) {
            DOM.currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    function setupMobileMenu() {
        if (!DOM.mobileNavToggle || !DOM.nav) return;
        DOM.mobileNavToggle.addEventListener('click', () => {
            DOM.body.classList.toggle('nav-open');
            DOM.nav.classList.toggle('is-active');
            const isExpanded = DOM.nav.classList.contains('is-active');
            DOM.mobileNavToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    function setupProductConfigurator() {
        if (DOM.product.techniqueRadios.length === 0) return;

        // 1. Lógica Visual (Troca imagens e preços)
        const updateProductView = () => {
            const selectedTechniqueRadio = document.querySelector('input[name="mandala-technique"]:checked');
            const selectedSizeRadio = document.querySelector('input[name="mandala-size"]:checked');

            // Lógica de Técnica e Aplique
            if (selectedTechniqueRadio && selectedTechniqueRadio.value === 'Pontilhismo') {
                DOM.product.apliqueWrapper.removeAttribute('hidden');
            } else {
                DOM.product.apliqueWrapper.setAttribute('hidden', 'true');
                if (DOM.product.apliqueCheckbox) DOM.product.apliqueCheckbox.checked = false;
            }

            const hasAplique = DOM.product.apliqueCheckbox && DOM.product.apliqueCheckbox.checked;
            
            // Textos e Imagens da Técnica
            if (selectedTechniqueRadio && selectedTechniqueRadio.value === 'Pontilhismo' && hasAplique) {
                DOM.product.techniqueCaption.textContent = 'Exemplo de aplique na mandala pontilhismo';
            } else {
                DOM.product.techniqueCaption.textContent = 'Exemplo de mandala na técnica selecionada';
            }

            const techImageSrc = selectedTechniqueRadio ? (hasAplique ? selectedTechniqueRadio.dataset.imageAplique : selectedTechniqueRadio.dataset.image) : null;
            if (techImageSrc) {
                if (DOM.product.techniqueImageContainer) DOM.product.techniqueImageContainer.removeAttribute('hidden');
                if (DOM.product.techniqueImage && DOM.product.techniqueImage.src !== techImageSrc) {
                    DOM.product.techniqueImage.src = techImageSrc;
                }
            } else {
                if (DOM.product.techniqueImageContainer) DOM.product.techniqueImageContainer.setAttribute('hidden', 'true');
            }

            // Imagens do Tamanho
            const sizeImageSrc = selectedSizeRadio ? selectedSizeRadio.dataset.image : null;
            if (sizeImageSrc && selectedSizeRadio && selectedSizeRadio.value !== 'outro') {
                if (DOM.product.sizeVisualizer) DOM.product.sizeVisualizer.removeAttribute('hidden');
                if (DOM.product.sizeImage && DOM.product.sizeImage.src !== sizeImageSrc) {
                    DOM.product.sizeImage.src = sizeImageSrc;
                }
            } else {
                if (DOM.product.sizeVisualizer) DOM.product.sizeVisualizer.setAttribute('hidden', 'true');
            }

            // Preços
            const basePrice = selectedSizeRadio ? parseFloat(selectedSizeRadio.dataset.price || '0') : 0;
            const apliquePrice = (DOM.product.apliqueCheckbox && parseFloat(DOM.product.apliqueCheckbox.dataset.addonPrice)) || 0;
            let currentPrice = basePrice + (hasAplique ? apliquePrice : 0);
            
            const isCustomSize = selectedSizeRadio && selectedSizeRadio.value === 'outro';
            
            // O botão SEMPRE fica habilitado agora para permitir o clique e a validação
            if (DOM.product.addToCartBtn) DOM.product.addToCartBtn.removeAttribute('disabled');

            if (isCustomSize) {
                if (DOM.product.customSizeInfo) DOM.product.customSizeInfo.removeAttribute('hidden');
                if (DOM.product.priceDisplay) DOM.product.priceDisplay.textContent = 'Sob Consulta';
                // Apenas no caso de tamanho personalizado ("outro") podemos desabilitar ou mudar a lógica
                if (DOM.product.addToCartBtn) DOM.product.addToCartBtn.setAttribute('disabled', 'true');
            } else if (!selectedSizeRadio) {
                 if (DOM.product.priceDisplay) DOM.product.priceDisplay.textContent = '---';
                 if (DOM.product.customSizeInfo) DOM.product.customSizeInfo.setAttribute('hidden', '');
            } else {
                if (DOM.product.customSizeInfo) DOM.product.customSizeInfo.setAttribute('hidden', '');
                if (DOM.product.priceDisplay) DOM.product.priceDisplay.textContent = formatCurrency(currentPrice);
            }
        };

        DOM.product.techniqueRadios.forEach(radio => radio.addEventListener('change', updateProductView));
        DOM.product.sizeRadios.forEach(radio => radio.addEventListener('change', updateProductView));
        if (DOM.product.apliqueCheckbox) DOM.product.apliqueCheckbox.addEventListener('change', updateProductView);

        // 2. Lógica de Clique no Botão (Validação + Adicionar)
        if (DOM.product.addToCartBtn) {
            DOM.product.addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Impede comportamento padrão

                const selectedTechniqueRadio = document.querySelector('input[name="mandala-technique"]:checked');
                const selectedSizeRadio = document.querySelector('input[name="mandala-size"]:checked');
                
                // --- INÍCIO DA VALIDAÇÃO ---
                const msgErro = DOM.product.errorMsg;
                const containerTecnica = DOM.product.containerTechniqueOptions;
                const containerTamanho = DOM.product.containerSizeOptions;

                // Limpa erros anteriores
                if(msgErro) msgErro.style.display = 'none';
                if(containerTecnica) containerTecnica.parentElement.classList.remove('input-error');
                if(containerTamanho) containerTamanho.parentElement.classList.remove('input-error');

                let temErro = false;

                // Valida Técnica
                if (!selectedTechniqueRadio) {
                    if(containerTecnica) containerTecnica.parentElement.classList.add('input-error');
                    temErro = true;
                }

                // Valida Tamanho
                if (!selectedSizeRadio) {
                    if(containerTamanho) containerTamanho.parentElement.classList.add('input-error');
                    temErro = true;
                }

                // Se tiver erro, PARE AQUI.
                if (temErro) {
                    if(msgErro) {
                        msgErro.style.display = 'block';
                        if (!selectedTechniqueRadio && !selectedSizeRadio) {
                            msgErro.textContent = "Por favor, selecione a técnica e o tamanho.";
                        } else if (!selectedTechniqueRadio) {
                            msgErro.textContent = "Você esqueceu de escolher a técnica!";
                        } else if (!selectedSizeRadio) {
                            msgErro.textContent = "Você esqueceu de escolher o tamanho!";
                        }
                    }
                    return; // Sai da função e não adiciona ao carrinho
                }
                // --- FIM DA VALIDAÇÃO ---

                // Se chegou aqui, está tudo certo. Adiciona ao carrinho.
                if (selectedSizeRadio.value === 'outro') return; 

                const price = parseFloat(DOM.product.priceDisplay.textContent.replace(/[^0-9,-]+/g, "").replace(",", "."));
                
                cart.push({
                    id: Date.now(),
                    name: `Mandala Personalizada`,
                    size: `${selectedSizeRadio.value} cm`,
                    technique: selectedTechniqueRadio.value,
                    aplique: DOM.product.apliqueCheckbox.checked,
                    price: price
                });

                updateCartDisplay();
                openCart();
            });
        }
        updateProductView();
    }

    const formatCurrency = (value) => value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    function updateCartDisplay() {
        const subtotalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        if (DOM.cart.count) DOM.cart.count.textContent = cart.length;
        if (DOM.cart.subtotalDisplay) DOM.cart.subtotalDisplay.textContent = formatCurrency(subtotalPrice);
        if (DOM.cart.openBtn) DOM.cart.openBtn.classList.toggle('cart-toggle--has-items', cart.length > 0);
        if (!DOM.cart.itemsContainer) return;
        DOM.cart.itemsContainer.innerHTML = '';
        if (cart.length === 0) {
            DOM.cart.itemsContainer.innerHTML = '<p class="cart-empty-message">Seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <div class="cart-item__info">
                        <p class="cart-item__name">${item.name}</p>
                        <p class="cart-item__details">${item.size} - ${item.technique}</p>
                        ${item.aplique ? '<p class="cart-item__details">+ Aplique Central</p>' : ''}
                    </div>
                    <div class="cart-item__actions">
                        <span class="cart-item__price">${formatCurrency(item.price)}</span>
                        <button class="remove-item-btn" data-id="${item.id}" aria-label="Remover item">&times;</button>
                    </div>`;
                DOM.cart.itemsContainer.appendChild(itemElement);
            });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function openCart() {
        if (DOM.cart.drawer) DOM.cart.drawer.removeAttribute('hidden');
        if (DOM.body) DOM.body.classList.add('no-scroll');
        window.addEventListener('keydown', handleEscapeKey);
    }

    function closeCart() {
        if (DOM.cart.drawer) DOM.cart.drawer.setAttribute('hidden', 'true');
        if (DOM.body) DOM.body.classList.remove('no-scroll');
        window.removeEventListener('keydown', handleEscapeKey);
    }

    function handleEscapeKey(event) {
        if (event.key === 'Escape') closeCart();
    }

    function setupThemeToggle() {
        if (!DOM.themeToggleBtn) return;
        const savedTheme = localStorage.getItem('theme') || 'light-theme';
        if (savedTheme === 'dark-theme') DOM.body.classList.add('dark-theme');
        DOM.themeToggleBtn.addEventListener('click', () => {
            DOM.body.classList.toggle('dark-theme');
            const newTheme = DOM.body.classList.contains('dark-theme') ? 'dark-theme' : 'light-theme';
            localStorage.setItem('theme', newTheme);
        });
    }

    function setupHeaderScroll() {
        if (!DOM.siteHeader) return;
        window.addEventListener('scroll', () => {
            DOM.siteHeader.classList.toggle('site-header--scrolled', window.scrollY > 50);
        });
    }

    function setupCart() {
        if (DOM.cart.openBtn) DOM.cart.openBtn.addEventListener('click', openCart);
        if (DOM.cart.closeBtn) DOM.cart.closeBtn.addEventListener('click', closeCart);
        if (DOM.cart.overlay) DOM.cart.overlay.addEventListener('click', closeCart);
        if (DOM.cart.itemsContainer) {
            DOM.cart.itemsContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('remove-item-btn')) {
                    const itemId = parseInt(event.target.dataset.id, 10);
                    cart = cart.filter(item => item.id !== itemId);
                    updateCartDisplay();
                }
            });
        }
        if (DOM.cart.checkoutBtn) {
            DOM.cart.checkoutBtn.addEventListener('click', (event) => {
                event.preventDefault();
                if (cart.length === 0) {
                    alert('Seu carrinho está vazio!');
                    return;
                }
                let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
                cart.forEach(item => {
                    message += `- ${item.name} (${item.size}, ${item.technique}${item.aplique ? ' + Aplique' : ''}): ${formatCurrency(item.price)}\n`;
                });
                const subtotalText = DOM.cart.subtotalDisplay.textContent;
                message += `\n*Subtotal dos Itens: ${subtotalText}*`;
                message += `\n*Frete: Sob consulta*`;
                const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            });
        }
        updateCartDisplay();
    }

    function setupCustomOrderForm() {
        if (!DOM.customOrder.form) return;
        DOM.customOrder.form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = DOM.customOrder.nameInput.value.trim();
            const messageText = DOM.customOrder.messageInput.value.trim();
            if (!name || !messageText) {
                alert('Por favor, preencha seu nome e descreva sua ideia.');
                return;
            }
            const whatsappMessage = `Olá! Meu nome é ${name} e tenho uma ideia para uma mandala:\n\n${messageText}`;
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    init();
});