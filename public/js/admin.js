let currentEditingId = null;

// Kiểm tra đăng nhập khi load trang
document.addEventListener('DOMContentLoaded', async () => {
  const isAuth = await checkAuth();
  if (isAuth) {
    showDashboard();
    loadMenu();
    loadOrders();
  }
  setupEventListeners();
});

// Kiểm tra trạng thái đăng nhập
async function checkAuth() {
  try {
    const response = await fetch('/api/admin/check');
    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    return false;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', handleLogout);

  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });

  // Add item button
  document.getElementById('add-item-btn').addEventListener('click', () => {
    currentEditingId = null;
    document.getElementById('modal-title').textContent = 'Thêm Món Mới';
    document.getElementById('item-form').reset();
    document.getElementById('item-modal').style.display = 'block';
  });

  // Item form
  document.getElementById('item-form').addEventListener('submit', handleItemSubmit);

  // Close modal
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closeBtn.closest('.modal').style.display = 'none';
    });
  });
}

// Xử lý đăng nhập
async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      showDashboard();
      loadMenu();
      loadOrders();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert('Lỗi kết nối server');
  }
}

// Xử lý đăng xuất
async function handleLogout() {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
    location.reload();
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
  }
}

// Hiển thị dashboard
function showDashboard() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'block';
}

// Chuyển tab
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`${tab}-tab`).classList.add('active');

  if (tab === 'orders') {
    loadOrders();
  } else if (tab === 'history') {
    loadHistory();
  }
}

// Load lịch sử đơn hàng
async function loadHistory(status = 'all') {
  try {
    const response = await fetch('/api/admin/orders/history');
    let orders = await response.json();
    
    // Lọc theo trạng thái
    if (status !== 'all') {
      orders = orders.filter(order => order.status === status);
    }
    
    displayHistory(orders);
  } catch (error) {
    console.error('Lỗi load history:', error);
  }
}

// Hiển thị lịch sử
function displayHistory(orders) {
  const historyList = document.getElementById('history-list');
  
  if (orders.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: #999;">Chưa có đơn hàng nào</p>';
    return;
  }

  historyList.innerHTML = '';

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card history-order-card';
    
    const date = new Date(order.createdAt).toLocaleString('vi-VN');
    
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
      itemsHTML = '<h4>Món lẻ:</h4><ul>';
      order.items.forEach(item => {
        itemsHTML += `<li>${item.name} x${item.quantity} - ${item.price.toLocaleString('vi-VN')}đ</li>`;
      });
      itemsHTML += '</ul>';
    }

    let combosHTML = '';
    if (order.combos && order.combos.length > 0) {
      combosHTML = '<h4>Mâm cúng:</h4>';
      order.combos.forEach(combo => {
        combosHTML += `<p><strong>Mâm ${combo.comboPrice.toLocaleString('vi-VN')}đ:</strong></p><ul>`;
        combo.selectedItems.forEach(item => {
          combosHTML += `<li>${item}</li>`;
        });
        combosHTML += '</ul>';
      });
    }

    const statusText = {
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy',
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận'
    };

    card.innerHTML = `
      <div class="order-header">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>Đơn hàng #${order._id.slice(-6)}</strong>
            <p style="color: #999; font-size: 0.9rem;">${date}</p>
          </div>
          <div style="text-align: right;">
            <span class="status-badge ${order.status}">${statusText[order.status] || order.status}</span>
            <p style="font-size: 1.5rem; color: #667eea; font-weight: bold; margin-top: 0.5rem;">
              ${order.totalAmount.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </div>
      <div class="order-info">
        <p><strong>Khách hàng:</strong> ${order.customerName}</p>
        <p><strong>Số điện thoại:</strong> ${order.phoneNumber}</p>
      </div>
      <div class="order-items">
        ${itemsHTML}
        ${combosHTML}
      </div>
    `;
    
    historyList.appendChild(card);
  });
}

// Lọc lịch sử theo trạng thái
function filterHistory(status) {
  loadHistory(status);
}

// Load menu
async function loadMenu() {
  try {
    const response = await fetch('/api/admin/menu');
    const items = await response.json();
    displayMenuItems(items);
  } catch (error) {
    console.error('Lỗi load menu:', error);
  }
}

// Hiển thị menu items
function displayMenuItems(items) {
  const menuList = document.getElementById('menu-list');
  menuList.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p class="price">${item.price.toLocaleString('vi-VN')}đ</p>
      <span class="status ${item.inStock ? 'in-stock' : 'out-of-stock'}">
        ${item.inStock ? 'Còn hàng' : 'Hết hàng'}
      </span>
      <div class="actions">
        <button class="btn btn-warning" onclick="editItem('${item._id}')">Sửa</button>
        <button class="btn btn-danger" onclick="deleteItem('${item._id}')">Xóa</button>
      </div>
    `;
    menuList.appendChild(card);
  });
}

// Sửa món
async function editItem(id) {
  try {
    const response = await fetch('/api/admin/menu');
    const items = await response.json();
    const item = items.find(i => i._id === id);

    if (item) {
      currentEditingId = id;
      document.getElementById('modal-title').textContent = 'Sửa Món Ăn';
      document.getElementById('item-id').value = id;
      document.getElementById('item-name').value = item.name;
      document.getElementById('item-price').value = item.price;
      document.getElementById('item-image').value = item.image;
      document.getElementById('item-description').value = item.description || '';
      document.getElementById('item-instock').checked = item.inStock;
      document.getElementById('item-modal').style.display = 'block';
    }
  } catch (error) {
    console.error('Lỗi load item:', error);
  }
}

// Xóa món
async function deleteItem(id) {
  if (!confirm('Bạn có chắc muốn xóa món này?')) return;

  try {
    const response = await fetch(`/api/admin/menu/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('Đã xóa món ăn');
      loadMenu();
    }
  } catch (error) {
    console.error('Lỗi xóa item:', error);
    alert('Có lỗi xảy ra');
  }
}

// Xử lý submit form món ăn
async function handleItemSubmit(e) {
  e.preventDefault();

  const itemData = {
    name: document.getElementById('item-name').value,
    price: parseInt(document.getElementById('item-price').value),
    image: document.getElementById('item-image').value || 'https://via.placeholder.com/300x200?text=Món+Chay',
    description: document.getElementById('item-description').value,
    inStock: document.getElementById('item-instock').checked,
    category: 'single'
  };

  try {
    let response;
    if (currentEditingId) {
      response = await fetch(`/api/admin/menu/${currentEditingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
    } else {
      response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
    }

    if (response.ok) {
      alert(currentEditingId ? 'Đã cập nhật món ăn' : 'Đã thêm món mới');
      document.getElementById('item-modal').style.display = 'none';
      loadMenu();
    }
  } catch (error) {
    console.error('Lỗi lưu item:', error);
    alert('Có lỗi xảy ra');
  }
}

// Load đơn hàng
async function loadOrders() {
  try {
    const response = await fetch('/api/admin/orders');
    const orders = await response.json();
    displayOrders(orders);
  } catch (error) {
    console.error('Lỗi load orders:', error);
  }
}

// Hiển thị đơn hàng
function displayOrders(orders) {
  const ordersList = document.getElementById('orders-list');
  
  if (orders.length === 0) {
    ordersList.innerHTML = '<p style="text-align: center; color: #999;">Chưa có đơn hàng nào</p>';
    return;
  }

  ordersList.innerHTML = '';

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.id = `order-${order._id}`;
    
    const date = new Date(order.createdAt).toLocaleString('vi-VN');
    
    let itemsHTML = '';
    if (order.items && order.items.length > 0) {
      itemsHTML = '<h4>Món lẻ:</h4><ul>';
      order.items.forEach(item => {
        itemsHTML += `<li>${item.name} x${item.quantity} - ${item.price.toLocaleString('vi-VN')}đ</li>`;
      });
      itemsHTML += '</ul>';
    }

    let combosHTML = '';
    if (order.combos && order.combos.length > 0) {
      combosHTML = '<h4>Mâm cúng:</h4>';
      order.combos.forEach(combo => {
        combosHTML += `<p><strong>Mâm ${combo.comboPrice.toLocaleString('vi-VN')}đ:</strong></p><ul>`;
        combo.selectedItems.forEach(item => {
          combosHTML += `<li>${item}</li>`;
        });
        combosHTML += '</ul>';
      });
    }

    card.innerHTML = `
      <div class="order-header">
        <div>
          <strong>Đơn hàng #${order._id.slice(-6)}</strong>
          <p style="color: #999; font-size: 0.9rem;">${date}</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 1.5rem; color: #667eea; font-weight: bold;">
            ${order.totalAmount.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>
      <div class="order-info">
        <p><strong>Khách hàng:</strong> ${order.customerName}</p>
        <p><strong>Số điện thoại:</strong> ${order.phoneNumber}</p>
      </div>
      <div class="order-items">
        ${itemsHTML}
        ${combosHTML}
      </div>
      <div class="order-actions">
        <button class="btn btn-success" onclick="completeOrder('${order._id}')">
          ✓ Đã Hoàn Thành
        </button>
        <button class="btn btn-danger" onclick="cancelOrder('${order._id}')">
          ✕ Hủy Đơn
        </button>
      </div>
    `;
    
    ordersList.appendChild(card);
  });
}

// Đánh dấu đơn hàng đã hoàn thành
async function completeOrder(orderId) {
  if (!confirm('Xác nhận đơn hàng này đã hoàn thành?')) return;

  try {
    const response = await fetch(`/api/admin/orders/${orderId}/complete`, {
      method: 'POST'
    });

    if (response.ok) {
      removeOrderWithAnimation(orderId, '✅ Đã đánh dấu hoàn thành');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra');
  }
}

// Hủy đơn hàng
async function cancelOrder(orderId) {
  if (!confirm('Xác nhận HỦY đơn hàng này?')) return;

  try {
    const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
      method: 'POST'
    });

    if (response.ok) {
      removeOrderWithAnimation(orderId, '🚫 Đã hủy đơn hàng');
    }
  } catch (error) {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra');
  }
}

// Xóa đơn hàng với animation
function removeOrderWithAnimation(orderId, message) {
  // Thêm hiệu ứng fade out
  const orderCard = document.getElementById(`order-${orderId}`);
  orderCard.style.transition = 'opacity 0.5s, transform 0.5s';
  orderCard.style.opacity = '0';
  orderCard.style.transform = 'translateX(100px)';
  
  // Xóa khỏi DOM sau khi animation xong
  setTimeout(() => {
    orderCard.remove();
    
    // Kiểm tra nếu không còn đơn hàng nào
    const ordersList = document.getElementById('orders-list');
    if (ordersList.children.length === 0) {
      ordersList.innerHTML = '<p style="text-align: center; color: #999;">Chưa có đơn hàng nào</p>';
    }
  }, 500);
  
  // Hiển thị thông báo
  showNotification(message);
}

// Hiển thị thông báo tạm thời
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #2ecc71;
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}
