// MENU TOGGLE
document.addEventListener("DOMContentLoaded", ()=>{
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");
  if(toggle){
    toggle.addEventListener("click", ()=>{
      menu.style.display = menu.style.display === "block" ? "none" : "block";
    });
  }
});

// PRODUCTS STORAGE
function getProducts(){
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProduct(name, price, image){
  let products = getProducts();
  products.push({name, price, image});
  localStorage.setItem("products", JSON.stringify(products));
  alert("Product added!");
}

// DISPLAY PRODUCTS
function displayProducts(containerId){
  const container = document.getElementById(containerId);
  if(!container) return;

  const products = getProducts();
  container.innerHTML = "";

  products.forEach(p=>{
    container.innerHTML += `
      <div class="product">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>KES ${p.price}</p>
        <button onclick="addToCart('${p.name}', ${p.price})">Add to Cart</button>
        <br><br>
        <a href="product.html?name=${encodeURIComponent(p.name)}">View</a>
      </div>
    `;

    // SEO Schema
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "image": p.image,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "KES",
        "price": p.price
      }
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.body.appendChild(script);
  });
}

// CART
function addToCart(name, price){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({name, price});
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function displayCart(containerId){
  const container = document.getElementById(containerId);
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";

  let total = 0;

  cart.forEach(item=>{
    total += item.price;
    container.innerHTML += `<p>${item.name} - KES ${item.price}</p>`;
  });

  container.innerHTML += `<h3>Total: KES ${total}</h3>`;
}
