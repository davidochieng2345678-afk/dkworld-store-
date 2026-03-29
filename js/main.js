// ======= STORAGE HELPERS =======
function getProducts(){ return JSON.parse(localStorage.getItem("products"))||[]; }
function saveProducts(products){ localStorage.setItem("products",JSON.stringify(products)); }
function getCart(){ return JSON.parse(localStorage.getItem("cart"))||[]; }
function saveCart(cart){ localStorage.setItem("cart",JSON.stringify(cart)); }

// ======= ADD PRODUCT =======
function addProduct(product){
  product.id = Date.now();
  product.createdAt = new Date().toISOString();
  const products = getProducts();
  products.push(product);
  saveProducts(products);
  alert("✅ Product added!");
  if(document.getElementById("existingProducts")) displayAdminProducts();
  if(document.getElementById("productsContainer")) displayProducts();
}

// ======= DISPLAY PRODUCTS =======
function displayProducts(containerId="productsContainer"){
  const container=document.getElementById(containerId);
  if(!container) return;
  const products = getProducts();
  container.innerHTML="";
  products.forEach(p=>{
    const img=p.images?.[0]||p.image||"";
    container.innerHTML+=`
      <div class="product">
        <img src="${img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p><strong>KES ${p.price}</strong></p>
        <p style="color:${p.stock>0?'green':'red'};">${p.stock>0?'In Stock':'Out of Stock'}</p>
        <p>${p.description||""}</p>
        <button onclick="addToCart(${p.id})" ${p.stock===0?'disabled':''}>Add to Cart</button>
        <a href="product.html?id=${p.id}">View</a>
      </div>`;
  });
}

// ======= PRODUCT PAGE =======
function loadProductPage(){
  const container=document.getElementById("product");
  if(!container) return;
  const params=new URLSearchParams(window.location.search);
  const id=params.get("id");
  const product=getProducts().find(p=>p.id==id);
  if(!product){ container.innerHTML="<p>Product not found</p>"; return; }
  container.innerHTML=`
    <h2>${product.name}</h2>
    ${(product.images||[product.image]).map(i=>`<img src="${i}" width="200">`).join('')}
    <p><strong>Price:</strong> KES ${product.price}</p>
    <p><strong>Stock:</strong> <span style="color:${product.stock>0?'green':'red'};">${product.stock>0?'In Stock':'Out of Stock'}</span></p>
    <p>${product.description||""}</p>
    <button onclick="addToCart(${product.id})">Add to Cart</button>`;
}

// ======= CART =======
function addToCart(id){
  const product=getProducts().find(p=>p.id==id);
  if(!product) return alert("Product not found!");
  const cart=getCart();
  const existing=cart.find(i=>i.id===product.id);
  if(existing) existing.quantity+=1;
  else cart.push({id:product.id,name:product.name,price:product.price,image:product.images?.[0]||product.image,quantity:1});
  saveCart(cart);
  displayCart();
}
function displayCart(){
  const container=document.getElementById("cartContainer");
  if(!container) return;
  const cart=getCart();
  if(!cart.length){ container.innerHTML="<p>Cart is empty 🛒</p>"; return; }
  let total=0;
  container.innerHTML="";
  cart.forEach((i,idx)=>{
    const itemTotal=i.price*i.quantity; total+=itemTotal;
    container.innerHTML+=`
      <div class="cart-item">
        <img src="${i.image}" width="60">
        <div>${i.name} x ${i.quantity} = KES ${itemTotal}</div>
        <div>
          <button onclick="updateCart(${idx},-1)">-</button>
          <button onclick="updateCart(${idx},1)">+</button>
          <button onclick="removeCart(${idx})">X</button>
        </div>
      </div>`;
  });
  container.innerHTML+=`<h3>Total: KES ${total}</h3>
    <button onclick="checkoutWhatsApp()">Checkout via WhatsApp</button>`;
}
function updateCart(idx,change){
  const cart=getCart();
  cart[idx].quantity+=change;
  if(cart[idx].quantity<=0) cart.splice(idx,1);
  saveCart(cart);
  displayCart();
}
function removeCart(idx){
  const cart=getCart();
  cart.splice(idx,1);
  saveCart(cart);
  displayCart();
}
function checkoutWhatsApp(){
  const cart=getCart();
  if(!cart.length) return alert("Cart empty!");
  let msg="Hello DK World Kenya,%0AI want to order:%0A";
  let total=0;
  cart.forEach(i=>{
    const t=i.price*i.quantity; total+=t;
    msg+=`- ${i.name} x ${i.quantity} (KES ${t})%0A`;
  });
  msg+=`%0ATotal: KES ${total}`;
  window.open(`https://wa.me/254710346425?text=${msg}`,"_blank");
}

// ======= ADMIN =======
function displayAdminProducts(){
  const container=document.getElementById("existingProducts");
  if(!container) return;
  const products=getProducts();
  container.innerHTML="";
  products.forEach(p=>{
    container.innerHTML+=`
      <div>
        <img src="${p.images?.[0]||p.image}" width="80">
        <strong>${p.name}</strong> - KES ${p.price}
        <button onclick="editProduct(${p.id})">Edit</button>
        <button onclick="deleteProduct(${p.id})">Delete</button>
      </div>`;
  });
}
function deleteProduct(id){
  if(!confirm("Delete?")) return;
  const products=getProducts().filter(p=>p.id!==id);
  saveProducts(products);
  displayAdminProducts();
}
function editProduct(id){
  const product=getProducts().find(p=>p.id===id);
  if(!product) return;
  ["name","price","image","images","stock","category","description"].forEach(f=>{
    const el=document.getElementById(f); if(el) el.value=product[f]||"";
  });
  const btn=document.querySelector("button[onclick='addProductFromForm()']");
  btn.textContent="Update Product";
  btn.onclick=()=>updateProductFromForm(id);
}
function updateProductFromForm(id){
  const products=getProducts();
  const index=products.findIndex(p=>p.id==id);
  if(index===-1) return;
  products[index]={...products[index],
    name:document.getElementById("name").value,
    price:Number(document.getElementById("price").value),
    image:document.getElementById("image").value,
    images:document.getElementById("images").value.split(",").map(i=>i.trim()).filter(Boolean),
    stock:Number(document.getElementById("stock").value),
    category:document.getElementById("category").value,
    description:document.getElementById("description").value
  };
  saveProducts(products);
  alert("Updated!");
  displayAdminProducts();
}

// ======= INIT =======
document.addEventListener("DOMContentLoaded",()=>{
  displayProducts();
  displayAdminProducts();
  displayCart();
  loadProductPage();
});

