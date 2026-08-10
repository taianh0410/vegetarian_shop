# Website Bán Đồ Chay & Mâm Cúng Tâm Linh

Website bán đồ chay và mâm cúng tâm linh với giao diện thanh tịnh, trang nhã.

## Tính năng

### Khách hàng (Frontend)
- ✅ Giao diện thanh tịnh với màu sắc phù hợp chủ đề Phật giáo
- ✅ Hiệu ứng animations mượt mà khi cuộn trang và hover
- ✅ Khu vực Món lẻ: Hiển thị danh sách món chay với tăng/giảm số lượng
- ✅ Khu vực Combo (Mâm cúng): Chọn mức giá và tick chọn món cụ thể
- ✅ Giỏ hàng & Thanh toán: Chỉ yêu cầu Họ Tên và Số Điện Thoại
- ✅ Không yêu cầu đăng ký tài khoản

### Backend
- ✅ Node.js + Express + MongoDB
- ✅ Lưu đơn hàng vào database
- ✅ Tích hợp Telegram Bot để nhận thông báo đơn hàng mới

### Admin Panel
- ✅ Đăng nhập bảo mật (Username/Password)
- ✅ Quản lý Thực đơn (CRUD): Thêm, Sửa, Xóa món
- ✅ Quản lý Đơn hàng: Xem danh sách đơn hàng

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cài đặt MongoDB

Đảm bảo MongoDB đã được cài đặt và đang chạy trên máy:
- Tải MongoDB: https://www.mongodb.com/try/download/community
- Hoặc sử dụng MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 3. Cấu hình file .env

Mở file `.env` và cập nhật các thông tin:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vegetarian-shop
SESSION_SECRET=your-secret-key-here-change-this
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### 4. Cấu hình Telegram Bot (Tùy chọn)

Để nhận thông báo đơn hàng qua Telegram:

1. Tạo bot mới với @BotFather trên Telegram
2. Lấy Bot Token
3. Lấy Chat ID của bạn (có thể dùng @userinfobot)
4. Cập nhật vào file .env

## Chạy ứng dụng

### Development mode (với nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server sẽ chạy tại: http://localhost:3000

## Sử dụng

### Trang khách hàng
- Truy cập: http://localhost:3000
- Chọn món lẻ hoặc mâm cúng
- Thêm vào giỏ hàng
- Điền thông tin (Họ tên, SĐT) và đặt hàng

### Trang Admin
- Truy cập: http://localhost:3000/admin
- Đăng nhập với:
  - Username: admin
  - Password: admin123
- Quản lý thực đơn và đơn hàng

## Cấu trúc thư mục

```
├── models/              # MongoDB models
│   ├── MenuItem.js      # Model món ăn
│   └── Order.js         # Model đơn hàng
├── routes/              # API routes
│   ├── menu.js          # Routes menu
│   ├── orders.js        # Routes đơn hàng
│   └── admin.js         # Routes admin
├── utils/               # Utilities
│   └── telegram.js      # Telegram notification
├── public/              # Frontend files
│   ├── index.html       # Trang khách hàng
│   ├── admin.html       # Trang admin
│   ├── css/
│   │   ├── style.css    # CSS khách hàng
│   │   └── admin.css    # CSS admin
│   └── js/
│       ├── app.js       # JS khách hàng
│       └── admin.js     # JS admin
├── server.js            # Main server file
├── package.json
└── .env                 # Environment variables
```

## Công nghệ sử dụng

- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Session: express-session
- Notifications: Telegram Bot API
- Security: bcryptjs

 
