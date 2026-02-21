// State quản lý giỏ hàng
let cart = {
  items: [],
  combos: []
};

let menuItems = [];
let currentComboPrice = 0;

// Kiểm tra và ẩn loading screen
let loadingAttempts = 0;
const maxLoadingAttempts = 30; // 30 giây

function checkDataLoaded() {
  loadingAttempts++;
  
  if (menuItems.length > 0) {
    // Dữ liệu đã load xong
    hideLoadingScreen();
  } else if (loadingAttempts < maxLoadingAttempts) {
    // Thử lại sau 1 giây
    setTimeout(checkDataLoaded, 1000);
  } else {
    // Timeout, vẫn ẩn loading screen
    hideLoadingScreen();
  }
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}

// Load menu khi trang được tải
document.addEventListener('DOMContentLoaded', async () => {
  // Bắt đầu kiểm tra loading
  checkDataLoaded();
  
  await loadMenu();
  setupEventListeners();
  updateCartCount();
  
  // Ẩn loading screen sau khi load xong
  hideLoadingScreen();
});

// Load menu từ API
async function loadMenu() {
  try {
    const response = await fetch('/api/menu');
    menuItems = await response.json();
    displayMenuItems();
  } catch (error) {
    console.error('Lỗi load menu:', error);
  }
}

// Hiển thị món ăn
function displayMenuItems() {
  const grid = document.getElementById('single-items-grid');
  grid.innerHTML = '';

  menuItems.forEach(item => {
    const card = createItemCard(item);
    grid.appendChild(card);
  });
}

// Tạo card món ăn
function createItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.innerHTML = `
    <img src="${item.image}" alt="${item.name}" class="item-image">
    <div class="item-info">
      <h3 class="item-name">${item.name}</h3>
      <p class="item-price">${item.price.toLocaleString('vi-VN')}đ</p>
      <div class="item-actions">
        <div class="quantity-control">
          <button class="btn-quantity" onclick="decreaseQuantity('${item._id}')">-</button>
          <span class="quantity-display" id="qty-${item._id}">0</span>
          <button class="btn-quantity" onclick="increaseQuantity('${item._id}')">+</button>
        </div>
      </div>
    </div>
  `;
  return card;
}

// Tăng số lượng món
function increaseQuantity(itemId) {
  const item = menuItems.find(i => i._id === itemId);
  const existingItem = cart.items.find(i => i.itemId === itemId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.items.push({
      itemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1
    });
  }

  updateQuantityDisplay(itemId);
  updateCartCount();
  showAddToCartAnimation();
}

// Giảm số lượng món
function decreaseQuantity(itemId) {
  const existingItem = cart.items.find(i => i.itemId === itemId);

  if (existingItem) {
    existingItem.quantity--;
    if (existingItem.quantity <= 0) {
      cart.items = cart.items.filter(i => i.itemId !== itemId);
    }
  }

  updateQuantityDisplay(itemId);
  updateCartCount();
}

// Cập nhật hiển thị số lượng
function updateQuantityDisplay(itemId) {
  const display = document.getElementById(`qty-${itemId}`);
  const item = cart.items.find(i => i.itemId === itemId);
  display.textContent = item ? item.quantity : 0;
}

// Cập nhật số lượng giỏ hàng
function updateCartCount() {
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0) + cart.combos.length;
  document.querySelector('.cart-count').textContent = count;
}

// Animation khi thêm vào giỏ
function showAddToCartAnimation() {
  const cartBtn = document.querySelector('.cart-btn');
  cartBtn.style.transform = 'scale(1.2)';
  setTimeout(() => {
    cartBtn.style.transform = 'scale(1)';
  }, 200);
}

// Setup event listeners
function setupEventListeners() {
  // Nút chọn combo
  document.querySelectorAll('.btn-select-combo').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.combo-card');
      const price = parseInt(card.dataset.price);
      openComboModal(price);
    });
  });

  // Đóng modal
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeBtn.closest('.modal').style.display = 'none';
    });
  });

  // Click ngoài modal để đóng
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });

  // Nút giỏ hàng
  document.querySelector('.cart-btn').addEventListener('click', openCartModal);

  // Nút thêm combo vào giỏ
  document.getElementById('add-combo-to-cart').addEventListener('click', addComboToCart);

  // Nút đặt hàng
  document.getElementById('place-order').addEventListener('click', placeOrder);
}

// Mở modal chọn combo
function openComboModal(price) {
  currentComboPrice = price;
  const modal = document.getElementById('combo-modal');
  const priceDisplay = document.getElementById('combo-price-display');
  const itemsList = document.getElementById('combo-items-list');

  priceDisplay.textContent = price.toLocaleString('vi-VN') + 'đ';
  
  // Hiển thị danh sách món để chọn
  itemsList.innerHTML = '';
  menuItems.forEach(item => {
    const checkbox = document.createElement('div');
    checkbox.className = 'combo-item-checkbox';
    checkbox.innerHTML = `
      <input type="checkbox" id="combo-item-${item._id}" value="${item.name}">
      <label for="combo-item-${item._id}">${item.name}</label>
    `;
    itemsList.appendChild(checkbox);
  });

  modal.style.display = 'block';
}

// Thêm combo vào giỏ
function addComboToCart() {
  const selectedItems = [];
  document.querySelectorAll('#combo-items-list input:checked').forEach(checkbox => {
    selectedItems.push(checkbox.value);
  });

  if (selectedItems.length === 0) {
    alert('Vui lòng chọn ít nhất một món cho mâm cúng');
    return;
  }

  cart.combos.push({
    comboPrice: currentComboPrice,
    selectedItems: selectedItems
  });

  document.getElementById('combo-modal').style.display = 'none';
  updateCartCount();
  showAddToCartAnimation();
  alert('Đã thêm mâm cúng vào giỏ hàng!');
}

// Mở modal giỏ hàng
function openCartModal() {
  const modal = document.getElementById('cart-modal');
  const cartItemsDiv = document.getElementById('cart-items');
  
  if (cart.items.length === 0 && cart.combos.length === 0) {
    cartItemsDiv.innerHTML = '<div class="empty-cart">Giỏ hàng trống</div>';
    document.getElementById('total-amount').textContent = '0đ';
    modal.style.display = 'block';
    return;
  }

  cartItemsDiv.innerHTML = '';
  let total = 0;

  // Hiển thị món lẻ
  cart.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>Số lượng: ${item.quantity}</p>
        <p class="cart-item-price">${itemTotal.toLocaleString('vi-VN')}đ</p>
      </div>
      <button class="btn-remove" onclick="removeItem(${index}, 'item')">Xóa</button>
    `;
    cartItemsDiv.appendChild(cartItem);
  });

  // Hiển thị combo
  cart.combos.forEach((combo, index) => {
    total += combo.comboPrice;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <h4>Mâm cúng ${combo.comboPrice.toLocaleString('vi-VN')}đ</h4>
        <div class="combo-items-section">
          <h5>Các món đã chọn:</h5>
          <ul>
            ${combo.selectedItems.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <p class="cart-item-price">${combo.comboPrice.toLocaleString('vi-VN')}đ</p>
      </div>
      <button class="btn-remove" onclick="removeItem(${index}, 'combo')">Xóa</button>
    `;
    cartItemsDiv.appendChild(cartItem);
  });

  document.getElementById('total-amount').textContent = total.toLocaleString('vi-VN') + 'đ';
  modal.style.display = 'block';
}

// Xóa món khỏi giỏ
function removeItem(index, type) {
  if (type === 'item') {
    const item = cart.items[index];
    cart.items.splice(index, 1);
    updateQuantityDisplay(item.itemId);
  } else {
    cart.combos.splice(index, 1);
  }
  
  updateCartCount();
  openCartModal();
}

// Đặt hàng
async function placeOrder() {
  const customerName = document.getElementById('customer-name').value.trim();
  const phoneNumber = document.getElementById('customer-phone').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const deliveryDate = document.getElementById('delivery-date').value;
  const deliveryTime = document.getElementById('delivery-time').value;

  if (!customerName || !phoneNumber) {
    alert('Vui lòng nhập đầy đủ họ tên và số điện thoại');
    return;
  }

  if (cart.items.length === 0 && cart.combos.length === 0) {
    alert('Giỏ hàng trống');
    return;
  }

  const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
                      cart.combos.reduce((sum, combo) => sum + combo.comboPrice, 0);

  const orderData = {
    customerName,
    phoneNumber,
    email: email || '',
    deliveryDate: deliveryDate || null,
    deliveryTime: deliveryTime || '',
    items: cart.items,
    combos: cart.combos,
    totalAmount
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (response.ok) {
      alert('🎉 Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      
      // Reset giỏ hàng
      cart = { items: [], combos: [] };
      updateCartCount();
      
      // Reset form
      document.getElementById('customer-name').value = '';
      document.getElementById('customer-phone').value = '';
      document.getElementById('customer-email').value = '';
      document.getElementById('delivery-date').value = '';
      document.getElementById('delivery-time').value = '';
      
      // Reset quantity displays
      menuItems.forEach(item => {
        const display = document.getElementById(`qty-${item._id}`);
        if (display) display.textContent = '0';
      });
      
      // Đóng modal
      document.getElementById('cart-modal').style.display = 'none';
    } else {
      alert('Có lỗi xảy ra: ' + result.message);
    }
  } catch (error) {
    console.error('Lỗi đặt hàng:', error);
    alert('Không thể kết nối đến server. Vui lòng thử lại sau.');
  }
}
