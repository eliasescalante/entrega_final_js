// Espero a que el DOM del HTML se cargue
document.addEventListener('DOMContentLoaded', () => {
    const productsElement = document.getElementById('products');
    const cartItemsElement = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    const newQuoteButton = document.getElementById('new-quote-button');

    // Uso un array para almacenar los productos seleccionados en el carrito
    let cart = [];

    // cargo el carrito desde localStorage al inicio
    const loadCartFromLocalStorage = () => {
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                cart = JSON.parse(cartData);
                updateCart();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar el carrito desde localStorage.'
            });
        }
    };

    // guardo el carrito en localStorage y uso la estructura try
    const saveCartToLocalStorage = () => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al guardar el carrito en localStorage.'
            });
        }
    };

    // Uso Fetch para obtener los productos desde mi archivo JSON e insertarlos en el index
    const loadProducts = () => {
        fetch('base.json')
            .then(async response => {
                const products = await response.json();
                try {
                    products.forEach(product => {
                        const productItem = document.createElement('div');
                        productItem.className = 'product-item';
                        productItem.innerHTML = `
                            <img src="${product.image}" alt="${product.name}">
                            <span>${product.name} - $${product.price}</span>
                            <button data-id="${product.id}" class="btn">Agregar al Carrito</button>
                        `;
                        productsElement.appendChild(productItem);
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al procesar productos.'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar productos.'
                });
            })
            .finally(() => {
                console.log('Carga de productos finalizada.');
            });
    };

    loadProducts();

    // Evento clic en los productos para agregar al carrito
    productsElement.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON') {
            const productId = event.target.getAttribute('data-id');
            addProductToCart(productId);
        }
    });

    // agrego un producto al carrito
    const addProductToCart = (productId) => {
        fetch('base.json')
            .then(async response => {
                const products = await response.json();
                try {
                    const product = products.find(p => p.id == productId);
                    cart.push(product);
                    updateCart();
                    saveCartToLocalStorage();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al agregar producto.'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al obtener productos.'
                });
            });
    };

    // actualizo la visualización del carrito
    const updateCart = () => {
        cartItemsElement.innerHTML = '';
        let total = 0;
        cart.forEach((product, index) => {
            const cartItem = document.createElement('li');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <span>${product.name} - $${product.price}</span>
                <button class="btn btn-remove" data-index="${index}">Eliminar</button>
            `;
            cartItemsElement.appendChild(cartItem);
            total += product.price;
        });
        totalPriceElement.textContent = total.toFixed(2);
        checkoutButton.style.display = cart.length > 0 ? 'block' : 'none';
    };

    // Evento clic en el carrito para eliminar productos
    cartItemsElement.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remove')) {
            const index = event.target.getAttribute('data-index');
            cart.splice(index, 1);
            updateCart();
            saveCartToLocalStorage();
        }
    });

    // Evento clic en el botón de comprar
    checkoutButton.addEventListener('click', () => {
        Swal.fire({
            title: 'Formulario de Compra',
            html: `
                <form id="checkout-form">
                    <div class="form-group">
                        <label for="name">Nombre y Apellido:</label>
                        <input type="text" id="name" name="name" required class="swal2-input" style="width: 80%;">
                    </div>
                    <div class="form-group">
                        <label for="email">Correo Electrónico:</label>
                        <input type="email" id="email" name="email" required class="swal2-input" style="width: 80%;">
                    </div>
                </form>
            `,
            width: '600px',
            confirmButtonText: 'Continuar',
            showCancelButton: true,
            preConfirm: () => {
                const name = Swal.getPopup().querySelector('#name').value;
                const email = Swal.getPopup().querySelector('#email').value;
                if (!isValidEmail(email)) {
                    Swal.showValidationMessage('Por favor, ingrese un correo electrónico válido.');
                    return false;
                }
                return { name, email };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { name, email } = result.value;
                const total = parseFloat(totalPriceElement.textContent).toFixed(2);
                Swal.fire({
                    title: `Gracias ${name} por tu compra`,
                    text: `¡El total de tu compra es $${total} pesos! Se han enviado las instrucciones para confirmar la compra con el link de pago a (${email})!`,
                    icon: 'success'
                });
                cart = [];
                updateCart();
                localStorage.removeItem('cart'); // limpio el carrito en el localStorage después de la compra
            }
        });
    });

    // Evento clic en el botón de continuar para limpiar el carrito y actualizar la vista
    newQuoteButton.addEventListener('click', () => {
        cart = [];
        updateCart();
        localStorage.removeItem('cart');
    });

    // Oculto el botón de comprar al inicio.
    checkoutButton.style.display = 'none';

    // valido el formato de email usando regex
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // cargo el carrito desde localStorage al iniciar la página
    loadCartFromLocalStorage();
});
