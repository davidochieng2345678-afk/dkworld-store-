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
// CART
// ======================
function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = getProducts().find(p => p.id == productId);

  if (!product) return alert("Product not found!");

  cart.push({
    id: product.id,
    name: product.name,
    price: product.price
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function displayCart(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  container.innerHTML = "";

  let total = 0;

  cart.forEach(item => {
    total += item.price;
    container.innerHTML += `<p>${item.name} - KES ${item.price}</p>`;
  });

  container.innerHTML += `<h3>Total: KES ${total}</h3>`;
}

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
        
