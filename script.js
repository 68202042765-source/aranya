// ==============================
// CAT HOUSE - STORE SYSTEM
// ==============================

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "อาหารแมว Royal Canin",
    category: "อาหาร",
    price: 450,
    stock: 20,
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600",
    description: "อาหารแมวคุณภาพสำหรับแมวโต"
  },
  {
    id: 2,
    name: "ขนมแมวเลีย Tuna",
    category: "ขนม",
    price: 89,
    stock: 35,
    image: "https://images.unsplash.com/photo-1601758123927-1969a2e7c9f4?w=600",
    description: "ขนมแมวเลียรสปลาทูน่า"
  },
  {
    id: 3,
    name: "ทรายแมวเต้าหู้",
    category: "ของใช้",
    price: 159,
    stock: 12,
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600",
    description: "ทรายแมวเต้าหู้ จับตัวเป็นก้อน"
  },
  {
    id: 4,
    name: "ของเล่นลูกบอล",
    category: "ของเล่น",
    price: 59,
    stock: 4,
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600",
    description: "ของเล่นสำหรับแมวทุกวัย"
  }
];

// ==============================
// STORAGE
// ==============================

function loadData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error("Storage error:", error);
    return fallback;
  }
}

let products = loadData("catHouseProducts", DEFAULT_PRODUCTS);
let cart = loadData("catHouseCart", []);

function saveProducts() {
  localStorage.setItem("catHouseProducts", JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem("catHouseCart", JSON.stringify(cart));
}

// ==============================
// HELPERS
// ==============================

function money(number) {
  return Number(number).toLocaleString("th-TH") + " บาท";
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeImage(url) {
  if (/^(https?:\/\/|data:image\/)/i.test(url || "")) {
    return url;
  }
  return "";
}

function placeholderImage() {
  return "https://placehold.co/600x500/f0ebe3/776650?text=CAT+HOUSE";
}

// ==============================
// STORE DISPLAY
// ==============================

let selectedCategory = "ทั้งหมด";

function displayProducts() {
  const grid = document.getElementById("productGrid");
  const keyword = document.getElementById("searchInput")
    .value.trim().toLowerCase();

  const filtered = products.filter(product => {
    const matchCategory =
      selectedCategory === "ทั้งหมด" ||
      product.category === selectedCategory;

    const matchSearch =
      product.name.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword);

    return matchCategory && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = "<p>ไม่พบสินค้าที่ค้นหา</p>";
    return;
  }

  grid.innerHTML = filtered.map(product => {
    const soldOut = Number(product.stock) <= 0;
    const image = safeImage(product.image) || placeholderImage();

    return `
      <article class="product-card">
        <div class="product-image">
          <img src="${escapeHTML(image)}"
               alt="${escapeHTML(product.name)}"
               onerror="this.src='${placeholderImage()}'">

          ${Number(product.stock) <= 5 && !soldOut
            ? '<span class="stock-label">เหลือน้อย</span>'
            : ''}

          ${soldOut
            ? '<span class="stock-label">สินค้าหมด</span>'
            : ''}
        </div>

        <div class="product-info">
          <small>${escapeHTML(product.category)}</small>
          <h3>${escapeHTML(product.name)}</h3>

          <p class="product-description">
            ${escapeHTML(product.description)}
          </p>

          <div class="product-bottom">
            <span class="price">${money(product.price)}</span>

            <button class="add-btn"
              ${soldOut ? "disabled" : ""}
              onclick="addToCart(${Number(product.id)})">
              +
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// ==============================
// CATEGORY AND SEARCH
// ==============================

document.querySelectorAll(".category").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".category").forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");
    selectedCategory = button.dataset.category;

    displayProducts();
  });
});

document.getElementById("searchInput")
  .addEventListener("input", displayProducts);

// ==============================
// SHOPPING CART
// ==============================

function addToCart(id) {
  const product = products.find(item => item.id === id);

  if (!product || product.stock <= 0) return;

  const item = cart.find(item => item.id === id);

  const quantityInCart = item ? item.quantity : 0;

  if (quantityInCart >= product.stock) {
    alert("สินค้าในสต็อกมีไม่เพียงพอ");
    return;
  }

  if (item) {
    item.quantity++;
  } else {
    cart.push({
      id: product.id,
      quantity: 1
    });
  }

  updateCart();
}

function updateCart() {
  cart = cart.filter(item => {
    const product = products.find(p => p.id === item.id);
    return product && item.quantity > 0;
  });

  const count = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);

  const container = document.getElementById("cartItems");

  if (cart.length === 0) {
    container.innerHTML = "<p>ยังไม่มีสินค้าในตะกร้า</p>";
  } else {
    container.innerHTML = cart.map(item => {
      const product = products.find(p => p.id === item.id);

      if (!product) return "";

      return `
        <div class="cart-row">
          <div>
            <strong>${escapeHTML(product.name)}</strong>
            <small>${money(product.price)}</small>
          </div>

          <div>
            <button onclick="changeCart(${product.id}, -1)">−</button>
            ${item.quantity}
            <button onclick="changeCart(${product.id}, 1)">+</button>
          </div>
        </div>
      `;
    }).join("");
  }

  saveCart();
}

function changeCart(id, amount) {
  const item = cart.find(p => p.id === id);
  const product = products.find(p => p.id === id);

  if (!item || !product) return;

  if (amount > 0 && item.quantity >= product.stock) {
    alert("สินค้าในสต็อกมีไม่เพียงพอ");
    return;
  }

  item.quantity += amount;

  cart = cart.filter(item => item.quantity > 0);

  updateCart();
}

function toggleCart() {
  document.getElementById("cartPanel").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}

function closePanels() {
  document.getElementById("cartPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

// ==============================
// CHECKOUT DEMO
// ==============================

function checkout() {
  if (cart.length === 0) {
    alert("กรุณาเลือกสินค้าก่อน");
    return;
  }

  const insufficient = cart.some(item => {
    const product = products.find(p => p.id === item.id);
    return !product || item.quantity > product.stock;
  });

  if (insufficient) {
    alert("สินค้าในสต็อกไม่เพียงพอ กรุณาตรวจสอบตะกร้า");
    return;
  }

  const confirmOrder = confirm(
    "ยืนยันการสั่งซื้อสินค้าใช่หรือไม่?"
  );

  if (!confirmOrder) return;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);
    product.stock -= item.quantity;
  });

  products = [...products];
  cart = [];

  saveProducts();
  saveCart();

  displayProducts();
  updateCart();
  updateDashboard();
  renderAdminProducts();

  closePanels();

  alert("บันทึกคำสั่งซื้อเรียบร้อยแล้ว (ตัวอย่าง)");
}

// ==============================
// ADMIN LOGIN
// ==============================

// บัญชีตัวอย่างสำหรับทดสอบเท่านั้น
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

function openAdminLogin() {
  document.getElementById("loginModal").classList.add("show");
}

function closeLogin() {
  document.getElementById("loginModal").classList.remove("show");
}

document.getElementById("loginForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      closeLogin();

      document.getElementById("adminLayout").classList.add("show");

      updateDashboard();
      renderAdminProducts();

      document.getElementById("adminLayout")
        .scrollIntoView({ behavior: "smooth" });

    } else {
      document.getElementById("loginError").textContent =
        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
    }
  });

function logoutAdmin() {
  document.getElementById("adminLayout").classList.remove("show");

  document.getElementById("shop")
    .scrollIntoView({ behavior: "smooth" });
}

// ==============================
// ADMIN DASHBOARD
// ==============================

function updateDashboard() {
  const totalStock = products.reduce(
    (sum, item) => sum + Number(item.stock), 0
  );

  const lowStock = products.filter(
    item => Number(item.stock) <= 5
  ).length;

  document.getElementById("totalProducts").textContent =
    products.length;

  document.getElementById("totalStock").textContent =
    totalStock;

  document.getElementById("lowStock").textContent =
    lowStock;
}

function renderAdminProducts() {
  const tbody = document.getElementById("adminProducts");

  tbody.innerHTML = products.map(product => `
    <tr>
      <td>
        <div class="admin-product">
          <img src="${escapeHTML(safeImage(product.image) || placeholderImage())}"
               alt=""
               onerror="this.src='${placeholderImage()}'">
          <span>${escapeHTML(product.name)}</span>
        </div>
      </td>

      <td>${escapeHTML(product.category)}</td>

      <td>${money(product.price)}</td>

      <td>
        <strong style="color:${product.stock <= 5 ? '#c64d4d' : 'inherit'}">
          ${product.stock}
        </strong>
      </td>

      <td>
        <button class="action-btn"
          onclick="editProduct(${product.id})">
          แก้ไข
        </button>

        <button class="action-btn delete-btn"
          onclick="deleteProduct(${product.id})">
          ลบ
        </button>
      </td>
    </tr>
  `).join("");
}

// ==============================
// ADD / EDIT PRODUCT
// ==============================

function openProductForm() {
  document.getElementById("productForm").reset();
  document.getElementById("productId").value = "";
  document.getElementById("formTitle").textContent = "เพิ่มสินค้า";

  document.getElementById("imagePreview").innerHTML =
    "<span>ตัวอย่างรูปสินค้า</span>";

  document.getElementById("productModal").classList.add("show");
}

function closeProductForm() {
  document.getElementById("productModal").classList.remove("show");
}

function editProduct(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productImage").value =
    product.image.startsWith("data:image") ? "" : product.image;

  document.getElementById("productDescription").value =
    product.description;

  document.getElementById("imageFile").value = "";

  const preview = document.getElementById("imagePreview");

  preview.innerHTML = product.image
    ? `<img src="${escapeHTML(product.image)}" alt="Preview">`
    : "<span>ตัวอย่างรูปสินค้า</span>";

  document.getElementById("formTitle").textContent = "แก้ไขสินค้า";

  document.getElementById("productModal").classList.add("show");
}

function deleteProduct(id) {
  if (!confirm("คุณต้องการลบสินค้านี้หรือไม่?")) return;

  products = products.filter(p => p.id !== id);
  cart = cart.filter(p => p.id !== id);

  saveProducts();
  saveCart();

  displayProducts();
  updateCart();
  updateDashboard();
  renderAdminProducts();
}

// ==============================
// IMAGE UPLOAD
// ==============================

let uploadedImage = "";

document.getElementById("imageFile")
  .addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) {
      uploadedImage = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพ");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("กรุณาเลือกรูปภาพขนาดไม่เกิน 5 MB");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 900;

        let width = image.width;
        let height = image.height;

        if (width > height && width > maxSize) {
          height = height * maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = width * maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);

        uploadedImage = canvas.toDataURL("image/jpeg", 0.8);

        document.getElementById("imagePreview").innerHTML =
          `<img src="${uploadedImage}" alt="Preview">`;
      };

      image.onerror = () => alert("ไม่สามารถอ่านรูปภาพได้");
      image.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });

// ==============================
// SAVE PRODUCT
// ==============================

document.getElementById("productForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const id = document.getElementById("productId").value;

    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = Number(document.getElementById("productPrice").value);
    const stock = Number(document.getElementById("productStock").value);

    const description =
      document.getElementById("productDescription").value.trim();

    const imageUrl =
      document.getElementById("productImage").value.trim();

    const existing = id
      ? products.find(p => p.id === Number(id))
      : null;

    if (!name || !Number.isFinite(price) || price < 0 ||
        !Number.isInteger(stock) || stock < 0) {
      alert("กรุณาตรวจสอบข้อมูลสินค้า");
      return;
    }

    const image = uploadedImage ||
      safeImage(imageUrl) ||
      (existing ? existing.image : "");

    if (!image) {
      alert("กรุณาใส่ URL รูปภาพหรืออัปโหลดรูปสินค้า");
      return;
    }

    const product = {
      id: existing ? existing.id : Date.now(),
      name,
      category,
      price,
      stock,
      image,
      description
    };

    if (existing) {
      products = products.map(p =>
        p.id === existing.id ? product : p
      );
    } else {
      products.push(product);
    }

    try {
      saveProducts();
    } catch (error) {
      alert("พื้นที่จัดเก็บไม่เพียงพอ กรุณาใช้รูปที่มีขนาดเล็กลง");
      return;
    }

    uploadedImage = "";

    closeProductForm();

    displayProducts();
    updateCart();
    updateDashboard();
    renderAdminProducts();

    alert("บันทึกข้อมูลสินค้าเรียบร้อยแล้ว");
  });

// ==============================
// INITIALIZE
// ==============================

displayProducts();
updateCart();