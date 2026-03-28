// ======================
// INIT
// ======================
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  displayProducts("productsContainer");
  loadProductPage();
});

// ======================
// MENU
// ======================
function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      if (menu.style.display === "flex") {
        menu.style.display = "none";
      } else {
        menu.style.display = "flex";
        menu.style.flexDirection = "column";
      }
    });
  }
}

// ======================
// STORAGE
// ======================
function getProducts() {
  return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

function addProduct(product) {
  let products = getProducts();

  product.id = Date.now();
  product.createdAt = new Date().toISOString();

  products.push(product);
  saveProducts(products);

  alert("Product added successfully!");
}

// ======================
// DISPLAY PRODUCTS
// ======================
function displayProducts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const products = getProducts();
  container.innerHTML = "";

  // Remove old schema
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

  products.forEach(p => {
    container.innerHTML += `
      <div class="product">
        <img src="${p.images?.[0] || p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p><strong>KES ${p.price}</strong></p>
<p style="color: ${p.stock > 0 ? 'green' : 'red'};">
  ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}
</p>
<p style="font-size: 14px;">${p.description || ""}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
        <br><br>
        <a href="product.html?id=${p.id}">View</a>
      </div>
    `;

    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": p.name,
      "sku": p.sku || "",
      "description": p.description || "",
      "image": p.images || [p.image],
      "offers": {
        "@type": "Offer",
        "priceCurrency": "KES",
        "price": p.price,
        "availability": p.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock"
      }
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

// ======================
// PRODUCT PAGE
// ======================
function loadProductPage() {
  const container = document.getElementById("product");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const product = getProducts().find(p => p.id == id);

  if (!product) {
    container.innerHTML = "<p style='color:red;'>Product not found</p>";
    return;
  }

  container.innerHTML = `
    <div style="background:white; padding:20px; border-radius:12px;">
      <h2>${product.name}</h2>

      ${product.images
        ? product.images.map(img => `<img src="${img}" width="200">`).join("")
        : `<img src="${product.image}" width="200">`
      }

      ${product.video ? `
        <div class="video">
          <iframe width="100%" height="300" src="${product.video}" frameborder="0" allowfullscreen></iframe>
        </div>
      ` : ""}

      <p><strong>Price:</strong> KES ${product.price}</p>
      <p><strong>SKU:</strong> ${product.sku || "N/A"}</p>
      <p><strong>Stock:</strong> ${product.stock > 0 ? "In Stock" : "Out of Stock"}</p>

      <p>${product.description || ""}</p>

      <button onclick="addToCart(${product.id})">Add to Cart</button>

      ${product.faq?.length ? `
        <h3>FAQs</h3>
        ${product.faq.map(f => `
          <p><strong>${f.question}</strong><br>${f.answer}</p>
        `).join("")}
      ` : ""}
    </div>
  `;

  // Clear old schema
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "sku": product.sku,
    "description": product.description,
    "image": product.images,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "KES",
      "price": product.price,
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock"
    }
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

// ======================
// CART WITH QUANTITY
// ======================
function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = getProducts().find(p => p.id == productId);

  if (!product) return alert("Product not found!");

  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1; // Increase quantity if already in cart
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart("cartContainer");
}

function displayCart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:#555;">Your cart is empty.</p>`;
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    container.innerHTML += `
      <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #ddd;">
        <span>${item.name} - KES ${item.price} × ${item.quantity} = KES ${item.price * item.quantity}</span>
        <div>
          <button style="padding:3px 8px; margin-right:5px;" onclick="updateQuantity(${index}, -1)">-</button>
          <button style="padding:3px 8px; margin-right:10px;" onclick="updateQuantity(${index}, 1)">+</button>
          <button style="background-color:#EF4444; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer;"
                  onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
  });

  container.innerHTML += `
    <h3 style="margin-top:15px;">Total: KES ${total}</h3>
    <button 
      onclick="checkoutWhatsApp()" 
      style="padding:10px 15px; margin-top:10px; background-color:#25D366; color:white; border:none; border-radius:5px; cursor:pointer;">
      Checkout via WhatsApp
    </button>
  `;
}

// Update quantity for a cart item
function updateQuantity(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1); // Remove item if quantity <= 0
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart("cartContainer");
}

// Remove item completely from cart
function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart("cartContainer");
}

// Checkout via WhatsApp
function checkoutWhatsApp() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = "Hello DK World Kenya,%0A%0AI want to order:%0A";
  let total = 0;

  cart.forEach(item => {
    message += `- ${item.name} × ${item.quantity} (KES ${item.price * item.quantity})%0A`;
    total += item.price * item.quantity;
  });

  message += `%0ATotal: KES ${total}%0A%0A`;
  message += "Please guide me on payment and delivery.";

  const phoneNumber = "254710346425"; // Your WhatsApp number
  const url = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(url, "_blank");
}

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", () => {
  displayCart("cartContainer");
});



// ======================
// WHATSAPP CHECKOUT
// ======================
function checkoutWhatsApp() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let message = "Hello DK World Kenya,%0A%0AI want to order:%0A";

  let total = 0;

  cart.forEach(item => {
    message += `- ${item.name} (KES ${item.price})%0A`;
    total += item.price;
  });

  message += `%0ATotal: KES ${total}%0A%0A`;
  message += "Please guide me on payment and delivery.";

  const phoneNumber = "254710346425"; // your number
  const url = `https://wa.me/${phoneNumber}?text=${message}`;

  window.open(url, "_blank");
}


function addProductFromForm() {
  const product = {
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value),
    image: document.getElementById("image").value,
    images: document.getElementById("images").value.split(","),
    video: document.getElementById("video").value,
    sku: document.getElementById("sku").value,
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    faq: [
      {
        question: document.getElementById("faqQ1").value,
        answer: document.getElementById("faqA1").value
      },
      {
        question: document.getElementById("faqQ2").value,
        answer: document.getElementById("faqA2").value
      }
    ]
  };

  addProduct(product);
}

// ======================
// ADMIN PRODUCT MANAGEMENT
// ======================
function displayAdminProducts() {
  const container = document.getElementById("existingProducts");
  if (!container) return;

  const products = getProducts();
  container.innerHTML = "";

  products.forEach(product => {
    container.innerHTML += `
      <div class="product-admin" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:10px;">
        
        <div style="display:flex; gap:15px; align-items:center; flex-wrap:wrap;">
          
          <!-- IMAGE -->
          <img src="${product.images?.[0] || product.image}" 
               style="width:80px; height:80px; object-fit:cover; border-radius:8px;">

          <!-- VIDEO -->
          ${product.video ? `
            <iframe width="120" height="80"
              src="${convertToEmbedURL(product.video)}"
              frameborder="0"
              allowfullscreen>
            </iframe>
          ` : ""}

          <!-- DETAILS -->
          <div style="flex:1;">
            <h3>${product.name}</h3>
            <p><strong>KES ${product.price}</strong></p>
            <p>SKU: ${product.sku || "N/A"}</p>
            <p>Stock: ${product.stock}</p>
          </div>

          <!-- ACTION BUTTONS -->
          <div>
            <button onclick="editProduct(${product.id})">Edit</button>
            <button onclick="deleteProduct(${product.id})" style="background-color:#EF4444;">Delete</button>
          </div>

        </div>

      </div>
    `;
  });
}




// Delete a product
function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  alert("Product deleted!");
  displayAdminProducts();
}

// Edit a product
function editProduct(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return alert("Product not found!");

  // Prefill the form with existing values
  document.getElementById("name").value = product.name;
  document.getElementById("price").value = product.price;
  document.getElementById("image").value = product.image;
  document.getElementById("images").value = product.images ? product.images.join(",") : "";
  document.getElementById("video").value = product.video || "";
  document.getElementById("sku").value = product.sku;
  document.getElementById("stock").value = product.stock;
  document.getElementById("category").value = product.category;
  document.getElementById("description").value = product.description || "";
  document.getElementById("faqQ1").value = product.faq?.[0]?.question || "";
  document.getElementById("faqA1").value = product.faq?.[0]?.answer || "";
  document.getElementById("faqQ2").value = product.faq?.[1]?.question || "";
  document.getElementById("faqA2").value = product.faq?.[1]?.answer || "";

  // Temporarily override addProductFromForm to update
  const addBtn = document.querySelector("button[onclick='addProductFromForm()']");
  addBtn.textContent = "Update Product";
  addBtn.onclick = function() {
    updateProductFromForm(id);
  };
}

// Update product after editing
function updateProductFromForm(id) {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return alert("Product not found!");

  products[index] = {
    ...products[index],
    name: document.getElementById("name").value,
    price: Number(document.getElementById("price").value),
    image: document.getElementById("image").value,
    images: document.getElementById("images").value.split(",").map(i => i.trim()).filter(Boolean),
    video: document.getElementById("video").value,
    sku: document.getElementById("sku").value,
    stock: Number(document.getElementById("stock").value),
    category: document.getElementById("category").value,
    description: document.getElementById("description").value,
    faq: [
      { question: document.getElementById("faqQ1").value, answer: document.getElementById("faqA1").value },
      { question: document.getElementById("faqQ2").value, answer: document.getElementById("faqA2").value }
    ],
  };

  saveProducts(products);
  alert("Product updated!");
  resetForm();
  displayAdminProducts();
}

// Reset form to default
function resetForm() {
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";
  document.getElementById("images").value = "";
  document.getElementById("video").value = "";
  document.getElementById("sku").value = "";
  document.getElementById("stock").value = "";
  document.getElementById("category").value = "Websites";
  document.getElementById("description").value = "";
  document.getElementById("faqQ1").value = "";
  document.getElementById("faqA1").value = "";
  document.getElementById("faqQ2").value = "";
  document.getElementById("faqA2").value = "";

  const addBtn = document.querySelector("button[onclick]");
  addBtn.textContent = "Add Product";
  addBtn.setAttribute("onclick", "addProductFromForm()");
}

// Call displayAdminProducts whenever the admin page loads
document.addEventListener("DOMContentLoaded", displayAdminProducts);


// ======================
// PRODUCT FILTERS
// ======================
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function filterAndDisplayProducts() {
  const allProducts = getProducts();
  const searchText = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchText) || (p.description || "").toLowerCase().includes(searchText);
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  displayProductsFiltered("productsContainer", filtered);
}

// New display function that accepts filtered products
function displayProductsFiltered(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="product">
        <img src="${p.images?.[0] || p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p><strong>KES ${p.price}</strong></p>
        <p style="color: ${p.stock > 0 ? 'green' : 'red'};">
          ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </p>
        <p style="font-size: 14px;">${p.description || ""}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
        <br><br>
        <a href="product.html?id=${p.id}">View</a>
      </div>
    `;
  });
}

// Event listeners
searchInput.addEventListener("input", filterAndDisplayProducts);
categoryFilter.addEventListener("change", filterAndDisplayProducts);

// Optional: show all products on page load using filter function
document.addEventListener("DOMContentLoaded", filterAndDisplayProducts);


// ======================
// FILTER & SEARCH
// ======================
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const clearFiltersBtn = document.getElementById("clearFilters");

function filterAndDisplayProducts() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;
  const container = document.getElementById("productsContainer");

  if (!container) return;

  const products = getProducts().filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm) || (p.description || "").toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  container.innerHTML = "";

  products.forEach(p => {
    container.innerHTML += `
      <div class="product" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; border-radius:10px; position:relative;">
        <img src="${p.images?.[0] || p.image}" alt="${p.name}" style="width:100%; max-width:300px; display:block; margin-bottom:10px; border-radius:8px;">
        
        ${p.video ? `
          <iframe width="100%" height="200" src="${convertToEmbedURL(p.video)}" frameborder="0" allowfullscreen style="margin-bottom:10px; border-radius:8px;"></iframe>
        ` : ""}

        <h3>${p.name}</h3>
        <p><strong>KES ${p.price}</strong></p>
        <p style="color:${p.stock > 0 ? 'green' : 'red'};">
          ${p.stock > 0 ? 'In Stock' : 'Out of Stock'}
        </p>
        <p>${p.description || ""}</p>
        <button onclick="addToCart(${p.id})" ${p.stock === 0 ? "disabled" : ""}>Add to Cart</button>
        <br><br>
        <a href="product.html?id=${p.id}">View</a>
      </div>
    `;
  });
}

// Update products on search or category change
searchInput.addEventListener("input", filterAndDisplayProducts);
categoryFilter.addEventListener("change", filterAndDisplayProducts);

// Clear filters
clearFiltersBtn.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  filterAndDisplayProducts();
});

// Call once on page load
filterAndDisplayProducts();
