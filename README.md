
A production-ready Node.js chatbot built using the **Microsoft Bot Framework**, connected to a MySQL backend with features like restaurant discovery, menu viewing, reservations, ordering, payments (Stripe), recommendations, and JWT-based authentication.

---

## 🛠️ Features

- 🔍 Search restaurants by cuisine/location
- 📋 View menu of any restaurant
- 📅 Book & cancel reservations
- 🛒 Add/remove/view cart items
- 📦 Place, track, and cancel orders
- 💳 Online payments via Stripe
- ✅ Login/Signup with hashed passwords (bcrypt) & JWT auth
- 📊 Personalized restaurant recommendations

---



### 1. Clone the Repository


git clone https://github.com/Pranjal1045/restaurant-bot.git
cd restaurant-bot

2. Install Dependencies
npm install

3. Set Up MySQL Database

✅ Create .env file:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=restaurant_bot

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

✅ Import Tables:
-- MySQL Tables
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  location VARCHAR(100),
  cuisine VARCHAR(50),
  price_range ENUM('low', 'medium', 'high'),
  rating FLOAT DEFAULT 0,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT,
  name VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  restaurant_id INT,
  table_number INT,
  reservation_time DATETIME,
  special_request TEXT,
  people INT
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  restaurant_id INT,
  order_type ENUM('delivery', 'pickup'),
  total_amount DECIMAL(10,2),
  status ENUM('pending', 'confirmed', 'cooking', 'out_for_delivery', 'delivered', 'cancelled')
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  menu_item_id INT,
  quantity INT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
4. Start the Bot Server

node index.js
🔊 Server will run on: http://localhost:3978

💬 Test Using Bot Framework Emulator
Step 1: Download Emulator
🔗 https://github.com/microsoft/BotFramework-Emulator/releases

Step 2: Connect to Bot
Open Bot Framework Emulator

Click "Open Bot"

Enter this URL:

http://localhost:3978/api/messages


🧪 Example Commands to Test

signup john john@gmail.com john123
login john@gmail.com john123

search Italian
menu for Bella Italia

book reservation at Spice Hub
cancel reservation

add 2 x hakka noodles
view cart
remove 1 x hakka noodles
place order for Spice Hub
track order
cancel order

recommend me a place
