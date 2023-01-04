getProducts();

async function getProducts(){
    const response = await fetch('../products.json');

    const productsArr = await response.json();

    renderProducts(productsArr);
}


function renderProducts(productsArr){
    const containerProd = document.querySelector('#container__products');

    productsArr.forEach(arr => {
        const cardBlock = `
            <div class="col-md-6">
            <div class="card mb-4" data-id="${arr.id}">
                <img class="product-img" src=${arr.imgSrc} alt="">
                <div class="card-body text-center">
                    <h4 class="item-title">${arr.title}</h4>
                    <p><small data-items-in-box class="text-muted">${arr.itemsInBox}шт.</small></p>

                    <div class="details-wrapper">
                        <div class="items counter-wrapper">
                            <div class="items__control" data-action="minus">-</div>
                            <div class="items__current" data-counter>1</div>
                            <div class="items__control" data-action="plus">+</div>
                        </div>

                        <div class="price">
                            <div class="price__weight">${arr.weight}г.</div>
                            <div class="price__currency">${arr.price} ₽</div>
                        </div>
                    </div>

                    <button data-cart type="button" class="btn btn-block btn-outline-warning">+ в корзину</button>

                </div>
            </div>
        </div>
        `;

        containerProd.insertAdjacentHTML('beforeend', cardBlock);
    });
}

toggleCartEmpty();
calcCartPriceAndDelivery();


window.addEventListener('click', (e) => {
    if (e.target.dataset.action === 'plus' || e.target.dataset.action === 'minus'){
        doCounter(e);
    }

    if (e.target.hasAttribute('data-cart')){
        addToCart(e);
    }
});


function doCounter(event){
    let counter;

    const counterWrapper = event.target.closest('.counter-wrapper');
    counter = counterWrapper.querySelector('[data-counter]');

    if (event.target.dataset.action === 'plus'){
        counter.innerText = ++counter.innerText;
    } 

    if (event.target.dataset.action === 'minus'){
        if (parseInt(counter.innerText) > 1) {
            counter.innerText = --counter.innerText;
        } else if (event.target.closest('.cart-wrapper') && parseInt(counter.innerText) === 1) {
            // Удаляем товар из корзины
            event.target.closest('.cart-item').remove();

            toggleCartEmpty();
            calcCartPriceAndDelivery();
        }
    }

    if (event.target.hasAttribute('data-action') && event.target.closest('.cart-wrapper')) {
		// Пересчет общей стоимости товаров в корзине
		calcCartPriceAndDelivery();
	}
}


function addToCart(event){
    const cartWrapper = document.querySelector('.cart-wrapper');

    const card = event.target.closest('.card');

    const productInfo = {
        id: card.dataset.id,
        imgSrc: card.querySelector('.product-img').getAttribute('src'),
        title: card.querySelector('.item-title').innerText,
        itemsInBox: card.querySelector('[data-items-in-box]').innerText,
        weight: card.querySelector('.price__weight').innerText,
        price: card.querySelector('.price__currency').innerText,
        counter: card.querySelector('[data-counter]').innerText
    };

    const itemInCart = cartWrapper.querySelector(`[data-id="${productInfo.id}"]`); 

    if (itemInCart){
        const cartCounter = itemInCart.querySelector('[data-counter]').innerText;
        cartCounter.innerText = parseInt(cartCounter.innerText) + parseInt(productInfo.counter);
    } else {
        const cartItem = `
            <div class="cart-item" data-id="${productInfo.id}">
                <div class="cart-item__top">
                    <div class="cart-item__img">
                        <img src="${productInfo.imgSrc}" alt="">
                    </div>
                    <div class="cart-item__desc">
                        <div class="cart-item__title">${productInfo.title}</div>
                        <div class="cart-item__weight">${productInfo.itemsInBox} / ${productInfo.weight}</div>
                        <div class="cart-item__details">
                            <div class="items items--small counter-wrapper">
                                <div class="items__control" data-action="minus">-</div>
                                <div class="items__current" data-counter="">${productInfo.counter}</div>
                                <div class="items__control" data-action="plus">+</div>
                            </div>
                            <div class="price">
                                <div class="price__currency">${productInfo.price}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        cartWrapper.insertAdjacentHTML('beforeend', cartItem);
    }

    card.querySelector('[data-counter]').innerText = '1';

    toggleCartEmpty();
    calcCartPriceAndDelivery();
}

function toggleCartEmpty(){
    const cartWrapper = document.querySelector('.cart-wrapper'),
          cartEmpty = document.querySelector('[data-cart-empty]'),
          orderForm = document.querySelector('#order-form');

    if (cartWrapper.children.length > 0){
        cartEmpty.classList.add('none');
        orderForm.classList.remove('none');
    } else {
        cartEmpty.classList.remove('none');
        orderForm.classList.add('none');
    }
}

function calcCartPriceAndDelivery(){
    const cartWrapper = document.querySelector('.cart-wrapper'),
          currentPrice = cartWrapper.querySelectorAll('.price__currency'),
          totalPrice = document.querySelector('.total-price'),
          deliveryCost = document.querySelector('.delivery-cost'),
          deliveryBlock = document.querySelector('[data-cart-delivery]');

    let priceTotal = 0;

    currentPrice.forEach(current => {
        const amountElem = current.closest('.cart-item').querySelector('[data-counter]');
        priceTotal += parseInt(current.innerText) * parseInt(amountElem.innerText);
    });

    totalPrice.innerText = priceTotal;

    if (priceTotal > 0){
        deliveryBlock.classList.remove('none');
    } else {
        deliveryBlock.classList.add('none');
    }

    if (priceTotal >= 600){
        deliveryCost.classList.add('free');
        deliveryCost.innerText = "бесплатно!";
    } else {
        deliveryCost.classList.remove('free');
		deliveryCost.innerText = '250 ₽';
    }
}
