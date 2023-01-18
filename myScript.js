// getting each btn to be clicked
const cartBtn = document.querySelector(".cartBtn");
const cartItems = document.querySelector(".cart-items");
const productsDom = document.querySelector(".products-center");

const cartOverlay = document.querySelector(".cart-overlay"); 
const cartDom = document.querySelector(".cart")
const closeCartBtn = document.querySelector(".closeCart"); 
const cartContent = document.querySelector(".cart-content");
const cartTotal = document.querySelector(".cart-total");  
const clearCartBtn = document.querySelector(".clear-cart");



// cartDom
let cart = [];

// buttonsDom
let buttonsDom = [];



// class to get the products 
class Products {
    async getProducts(){
        let serveresponse = await fetch(`products.json`);
        let resp = await serveresponse.json();
        let data = resp.items;
        return data;
    }
}

// class to display the products
class UI{

    displayProducts(data){
        productsDom.innerHTML = ``;
        data.forEach( (item) => {
            const div = document.createElement("article");
            div.classList.add("product");
            div.innerHTML = `
                <div class="img-cont">
                    <img src="${item.img}" alt="">
                    <button class="buy-btn" data-id="${item.id}">
                        <i class="fa fa-cart-plus" aria-hidden="true"></i>
                        add to cart
                    </button>
                </div>
                <h3>${item.name}</h3>
                <h4>$${item.price}</h4>
            `
            productsDom.appendChild(div);
        })
    }

    getBuyButtons(){
        const buttons = [...document.querySelectorAll(".buy-btn")];
        buttonsDom = buttons;

        buttons.forEach( btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => item.id == id);

            if(inCart){
                btn.disabled = true;
                btn.innerText = `In Cart`;
            }

            btn.addEventListener("click", (e) => {
                e.target.disabled = true;
                e.target.innerText = `In Cart`;

                let data = {...Storage.getProduct(id), amount: 1};
                cart = [...cart, data];
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addProductToCart(data);
                this.showCart();
            })
        })
    }

    setCartValues(cart){
        let tempTotal = 0;
        let cartItem = 0;

        cart.map( item => {
            tempTotal += item.price * item.amount;
            cartItem += item.amount
        })

        cartItems.innerText = cartItem;
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    }

    addProductToCart(data){
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <div class="eachImgCont">
                <img src="${data.img}" alt="">
            </div>

            <div class="details">
                <h4>${data.name}</h4>
                <h5>$${data.price}</h5>
                <span class="remove-item" data-id="${data.id}">Remove</span>
            </div>

            <div class="cart-function">
                <i class="fa fa-chevron-up" aria-hidden="true" data-id="${data.id}"></i>
                <p class="item-amount">${data.amount}</p>
                <i class="fa fa-chevron-down" aria-hidden="true" data-id="${data.id}"></i>
            </div>
        `
        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.style.visibility = "visible";
        cartDom.classList.add("showCart");
    }

    hideCart(){
        cartOverlay.style.visibility = "hidden";
        cartDom.classList.remove("showCart");
    }

    appLogic(){
        cart = Storage.getCart();
        this.getBuyButtons();
        this.setCartValues(cart);
        this.populateCart(cart);

        cartBtn.addEventListener("click", () => {
            this.showCart();
        })

        closeCartBtn.addEventListener("click", () => {
            this.hideCart();
        })
    }

    populateCart(cart){
        cart.forEach ( item => {
            this.addProductToCart(item);
        })
    }




    cartLogic(){

        clearCartBtn.addEventListener("click", () => {
            let ids = cart.map(item => item.id);
            ids.forEach( id => {
                this.removeId(id);
            })

            while(cartContent.children.length > 0){
                cartContent.removeChild(cartContent.children[0]);
            }
        })

        cartContent.addEventListener("click", (e) => {
            if(e.target.classList.contains("fa-chevron-up")){
                let addMore = e.target;
                let id = addMore.dataset.id;
                let tempItem = cart.find( item => item.id == id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);

                addMore.nextElementSibling.innerText = tempItem.amount;
            }else if(e.target.classList.contains("fa-chevron-down")){
                let subLess = e.target;
                let id = subLess.dataset.id;
                let tempItem = cart.find(item => item.id == id);
                tempItem.amount -= 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);

                if(tempItem.amount == 0){
                    this.removeId(id);
                    cartContent.removeChild(subLess.parentElement.parentElement);
                }

                subLess.previousElementSibling.innerText = tempItem.amount;
            }else if(e.target.classList.contains("remove-item")){
                let removedItem = e.target;
                let id = removedItem.dataset.id;
                this.removeId(id);
                cartContent.removeChild(removedItem.parentElement.parentElement)
            }
        })
    }

    removeId(id){
        cart = cart.filter(item => item.id != id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let btn = this.getSingleButton(id);
        btn.disabled = false;
        btn.innerHTML = `
            <i class="fa fa-cart-plus" aria-hidden="true"></i>
            add to cart
        `
    }

    getSingleButton(id){
        return buttonsDom.find(item => item.dataset.id == id);
    }
}

// class to store and get the products using LS api
class Storage{
    static saveProducts(data){
        localStorage.setItem("products", JSON.stringify(data));
    }

    static getProduct(id){
        let datas = JSON.parse(localStorage.getItem("products")) || [];
        let product = datas.find( item => item.id == id);
        return product;
    }

    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart(){
        return JSON.parse(localStorage.getItem("cart")) || [];
    }
}

// loading instances to get and use the classes
window.addEventListener("DOMContentLoaded", () => {
    const product = new Products();
    const ui = new UI();

    ui.appLogic();

    product.getProducts().then( (data) => {
        ui.displayProducts(data);
        Storage.saveProducts(data)
    }).then( () => {
        ui.getBuyButtons();
        ui.cartLogic();
    })
})