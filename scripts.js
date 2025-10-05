document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURAÇÕES GLOBAIS ---
    const WHATSAPP_NUMBER = '5541992717798';
    const IMAGE_TRANSITION_DELAY = 200;

    // --- ESTADO DA APLICAÇÃO ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // --- SELETORES DO DOM ---
    const DOM = {
        body: document.body,
        siteHeader: document.querySelector('.site-header'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        currentYearSpan: document.getElementById('current-year'),
        product: {
            techniqueSelect: document.getElementById('mandala-technique'),
            apliqueCheckbox: document.getElementById('mandala-aplique'),
            apliqueWrapper: document.getElementById('aplique-option-wrapper'),
            sizeSelect: document.getElementById('mandala-size'),
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
            sizeCaption: document.getElementById('legenda-tamanho'),
            sizeVisualizer: document.querySelector('.configurador-visualizador-tamanho'),
        },
        cart: {
            openBtn: document.getElementById('open-cart-btn'),
            closeBtn: document.querySelector('.cart-drawer__close'),
            drawer: document.querySelector('.cart-drawer'),
            overlay: document.querySelector('.cart-drawer__overlay'),
            count: document.getElementById('cart-count'),
            itemsContainer: document.getElementById('cart-items'),
            totalDisplay: document.getElementById('cart-total'),
            checkoutBtn: document.getElementById('checkout-btn'),
        },
        customOrder: {
            form: document.getElementById('custom-order-form'),
            nameInput: document.getElementById('order-name'),
            messageInput: document.getElementById('order-message'),
        }
    };

    // --- MÓDULO DE INICIALIZAÇÃO ---
    function init() {
        setupThemeToggle();
        setupHeaderScroll();
        setupProductConfigurator();
        setupCart();
        setupCustomOrderForm();
        if (DOM.currentYearSpan) {
            DOM.currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- LÓGICA DO PRODUTO ---
    function setupProductConfigurator() {
        if (!DOM.product.techniqueSelect) return;

        const updateProductView = () => {
            const techOption = DOM.product.techniqueSelect.options[DOM.product.techniqueSelect.selectedIndex];
            const sizeOption = DOM.product.sizeSelect.options[DOM.product.sizeSelect.selectedIndex];
            
            if (techOption.value === 'Pontilhismo') {
                DOM.product.apliqueWrapper.removeAttribute('hidden');
                if(DOM.product.labelTechnique) DOM.product.labelTechnique.textContent = '1. Escolha a Técnica:';
                if(DOM.product.labelAdicional) DOM.product.labelAdicional.textContent = '2. Adicional:';
                if(DOM.product.labelDiametro) DOM.product.labelDiametro.textContent = '3. Escolha o Diâmetro:';
            } else {
                DOM.product.apliqueWrapper.setAttribute('hidden', 'true');
                DOM.product.apliqueCheckbox.checked = false; 
                if(DOM.product.labelTechnique) DOM.product.labelTechnique.textContent = '1. Escolha a Técnica:';
                if(DOM.product.labelDiametro) DOM.product.labelDiametro.textContent = '2. Escolha o Diâmetro:';
            }

            const hasAplique = DOM.product.apliqueCheckbox.checked;
            
            const techImageSrc = hasAplique ? techOption.dataset.imageAplique : techOption.dataset.image;
            if (techImageSrc) {
                DOM.product.techniqueImageContainer.removeAttribute('hidden');
                if (DOM.product.techniqueImage && DOM.product.techniqueImage.src !== techImageSrc) {
                    DOM.product.techniqueImage.src = techImageSrc;
                }
            } else {
                DOM.product.techniqueImageContainer.setAttribute('hidden', 'true');
            }
            
            const sizeImageSrc = sizeOption.dataset.image;
            if (sizeImageSrc && sizeOption.value !== 'outro') {
                if(DOM.product.sizeVisualizer) DOM.product.sizeVisualizer.removeAttribute('hidden');
                if (DOM.product.sizeImage && DOM.product.sizeImage.src !== sizeImageSrc) {
                    DOM.product.sizeImage.src = sizeImageSrc;
                }
            } else {
                if(DOM.product.sizeVisualizer) DOM.product.sizeVisualizer.setAttribute('hidden', 'true');
            }
            
            const basePrice = parseFloat(sizeOption.dataset.price || '0');
            const apliquePrice = parseFloat(DOM.product.apliqueCheckbox.dataset.addonPrice || '0');
            let currentPrice = basePrice + (hasAplique ? apliquePrice : 0);
            
            const isPlaceholderSize = sizeOption.value === '';
            const isCustomSize = sizeOption.value === 'outro';

            if (isPlaceholderSize) {
                if(DOM.product.priceDisplay) DOM.product.priceDisplay.textContent = '---';
                if(DOM.product.addToCartBtn) DOM.product.addToCartBtn.setAttribute('disabled', 'true');
                if(DOM.product.customSizeInfo) DOM.product.customSizeInfo.setAttribute('hidden', '');
            } else if (isCustomSize) {
                if(DOM.product.customSizeInfo) DOM.product.customSizeInfo.removeAttribute('hidden');
                if(DOM.product.priceDisplay) DOM.product.priceDisplay.textContent = 'Sob Consulta';
                if(DOM.product.addToCartBtn) DOM.product.addToCartBtn.setAttribute('disabled', 'true');
            } else {
                if(DOM.product.customSizeInfo) DOM.product.customSizeInfo.setAttribute('hidden', '');
                if(DOM.product.priceDisplay) DOM.product.priceDisplay.textContent = formatCurrency(currentPrice);
                if(DOM.product.addToCartBtn) DOM.product.addToCartBtn.removeAttribute('disabled');
            }
        };

        DOM.product.techniqueSelect.addEventListener('change', updateProductView);
        DOM.product.apliqueCheckbox.addEventListener('change', updateProductView);
        DOM.product.sizeSelect.addEventListener('change', updateProductView);

        if (DOM.product.addToCartBtn) {
            DOM.product.addToCartBtn.addEventListener('click', () => {
                 const sizeOption = DOM.product.sizeSelect.options[DOM.product.sizeSelect.selectedIndex];
                 if (sizeOption.value === 'outro' || sizeOption.value === '') return;
                 const price = parseFloat(DOM.product.priceDisplay.textContent.replace(/[^0-9,-]+/g,"").replace(",", "."));
                 cart.push({ id: Date.now(), name: `Mandala Personalizada`, size: sizeOption.text.split('-')[0].trim(), technique: DOM.product.techniqueSelect.value, aplique: DOM.product.apliqueCheckbox.checked, price: price });
                 updateCartDisplay();
                 openCart();
            });
        }
        updateProductView();
    }
    
    // --- FUNÇÕES GERAIS E DO CARRINHO ---
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    function updateCartDisplay() {
        const totalItems = cart.length;
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        if (DOM.cart.count) DOM.cart.count.textContent = totalItems;
        if (DOM.cart.totalDisplay) DOM.cart.totalDisplay.textContent = formatCurrency(totalPrice);
        if (DOM.cart.openBtn) DOM.cart.openBtn.classList.toggle('cart-toggle--has-items', totalItems > 0);
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
                message += `\n*Total do Pedido: ${DOM.cart.totalDisplay.textContent}*`;
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

    // Inicia a aplicação
    init();
});