const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');

// Middleware kiểm tra đăng nhập
const isAuthenticated = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Chưa đăng nhập' });
  }
};

// Đăng nhập admin
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.json({ message: 'Đăng nhập thành công' });
  } else {
    res.status(401).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });
  }
});

// Đăng xuất
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Đã đăng xuất' });
});

// Kiểm tra trạng thái đăng nhập
router.get('/check', (req, res) => {
  res.json({ isAuthenticated: !!req.session.isAdmin });
});

// CRUD Menu Items
router.get('/menu', isAuthenticated, async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/menu', isAuthenticated, async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/menu/:id', isAuthenticated, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/menu/:id', isAuthenticated, async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa món ăn' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quản lý đơn hàng (chỉ hiển thị đơn chưa hoàn thành)
router.get('/orders', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: { $ne: 'completed' } 
    }).sort({ createdAt: -1 }).limit(100);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lịch sử đơn hàng (tất cả đơn)
router.get('/orders/history', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cập nhật trạng thái đơn hàng
router.put('/orders/:id/status', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Đánh dấu đơn hàng đã hoàn thành
router.post('/orders/:id/complete', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'completed' },
      { new: true }
    );
    res.json({ message: 'Đã đánh dấu hoàn thành', order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Hủy đơn hàng
router.post('/orders/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    res.json({ message: 'Đã hủy đơn hàng', order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
