-- stores users detail for login signup
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores restaurant details
CREATE TABLE IF NOT EXISTS restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  location VARCHAR(100),
  cuisine VARCHAR(50),
  price_range ENUM('low', 'medium', 'high'),
  rating FLOAT DEFAULT 0,
  image_url TEXT
);


-- menu items
CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT,
  name VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- reservation table
CREATE TABLE IF NOT EXISTS reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  table_number INT DEFAULT 1,
  reservation_time DATETIME NOT NULL,
  special_request TEXT,
  people INT NOT NULL,
  status ENUM('booked', 'cancelled', 'completed') DEFAULT 'booked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- main order data
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  restaurant_id INT,
  order_type ENUM('pickup', 'delivery'),
  total_amount DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- stores which items were ordered
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  menu_item_id INT,
  quantity INT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- track payment for each order
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT,
  amount DECIMAL(10, 2),
  payment_method ENUM('card', 'upi', 'cash'),
  status ENUM('paid', 'failed', 'pending') DEFAULT 'pending',
  payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
-- Stores table numbers and status
CREATE TABLE IF NOT EXISTS tables (
  id INT PRIMARY KEY AUTO_INCREMENT,
  restaurant_id INT,
  table_number INT,
  capacity INT,
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);
-- reviews Table (for Personalized Suggestions)
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  restaurant_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);


INSERT INTO restaurants (name, location, cuisine, price_range, rating, image_url) VALUES
('Spice Hub', 'Delhi', 'Indian', 'medium', 4.5, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752061034/photo1_convert_jpg_ufagqd.png'),
('Bella Italia', 'Mumbai', 'Italian', 'high', 4.2, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752061430/photo2_convert_jpg_ycho00.png'),
('Sakura Sushi', 'Bangalore', 'Japanese', 'high', 4.7, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752061763/photo3_convert_jpg_boregy.png'),
('Grill Master', 'Chennai', 'Barbecue', 'medium', 4.1, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752062078/photo4_convert_jpg_hvmsnn.png'),
('Green Bowl', 'Hyderabad', 'Vegan', 'low', 4.3, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752062103/photo5_convert_jpg_b5jdbe.png'),
('Tandoori Nights', 'Pune', 'Indian', 'medium', 4.0, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752062153/photo6_convert_jpg_hcqpdq.png'),
('Dragon Wok', 'Kolkata', 'Chinese', 'medium', 4.4, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752062178/photo7_convert_jpg_njhqjz.png'),
('Le Paris', 'Delhi', 'French', 'high', 4.6, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752061430/photo2_convert_jpg_ycho00.png'),
('The Burger Spot', 'Bangalore', 'Fast Food', 'low', 4.1, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752062206/photo9_convert_jpg_dkoody.png'),
('Coastal Catch', 'Goa', 'Seafood', 'medium', 4.5, 'https://res.cloudinary.com/dt2y8ev1x/image/upload/v1752062226/photo10_convert_jpg_vsysji.png');


INSERT INTO menu_items (restaurant_id, name, description, price, image_url) VALUES
-- Spice Hub
(1, 'Butter Chicken', 'Creamy tomato chicken curry', 250.00, 'https://res.cloudinary.com/demo/image/upload/butter_chicken.jpg'),
(1, 'Garlic Naan', 'Indian flatbread with garlic', 50.00, 'https://res.cloudinary.com/demo/image/upload/garlic_naan.jpg'),
(1, 'Mango Lassi', 'Sweet mango yogurt drink', 80.00, 'https://res.cloudinary.com/demo/image/upload/mango_lassi.jpg'),

-- Bella Italia
(2, 'Margherita Pizza', 'Classic pizza with tomato, basil, mozzarella', 400.00, 'https://res.cloudinary.com/demo/image/upload/margherita.jpg'),
(2, 'Pasta Alfredo', 'Creamy white sauce pasta', 350.00, 'https://res.cloudinary.com/demo/image/upload/alfredo.jpg'),
(2, 'Tiramisu', 'Coffee-flavored Italian dessert', 200.00, 'https://res.cloudinary.com/demo/image/upload/tiramisu.jpg'),

-- Sakura Sushi
(3, 'Sushi Platter', 'Assorted sushi rolls', 550.00, 'https://res.cloudinary.com/demo/image/upload/sushi.jpg'),
(3, 'Miso Soup', 'Traditional Japanese soup', 100.00, 'https://res.cloudinary.com/demo/image/upload/miso_soup.jpg'),
(3, 'Tempura', 'Crispy fried veggies and shrimp', 300.00, 'https://res.cloudinary.com/demo/image/upload/tempura.jpg'),

-- Grill Master
(4, 'Grilled Chicken', 'Charcoal grilled chicken with herbs', 300.00, 'https://res.cloudinary.com/demo/image/upload/grilled_chicken.jpg'),
(4, 'BBQ Ribs', 'Smoky pork ribs', 450.00, 'https://res.cloudinary.com/demo/image/upload/bbq_ribs.jpg'),
(4, 'Coleslaw', 'Fresh cabbage salad', 90.00, 'https://res.cloudinary.com/demo/image/upload/coleslaw.jpg'),

-- Green Bowl
(5, 'Quinoa Salad', 'Healthy salad with avocado and quinoa', 220.00, 'https://res.cloudinary.com/demo/image/upload/quinoa.jpg'),
(5, 'Vegan Burger', 'Plant-based burger', 280.00, 'https://res.cloudinary.com/demo/image/upload/vegan_burger.jpg'),
(5, 'Fruit Smoothie', 'Mixed fruit smoothie', 150.00, 'https://res.cloudinary.com/demo/image/upload/smoothie.jpg'),

-- Tandoori Nights
(6, 'Tandoori Chicken', 'Chicken grilled in tandoor', 280.00, 'https://res.cloudinary.com/demo/image/upload/tandoori.jpg'),
(6, 'Paneer Tikka', 'Grilled cottage cheese cubes', 250.00, 'https://res.cloudinary.com/demo/image/upload/paneer_tikka.jpg'),
(6, 'Roti', 'Whole wheat flatbread', 30.00, 'https://res.cloudinary.com/demo/image/upload/roti.jpg'),

-- Dragon Wok
(7, 'Hakka Noodles', 'Stir-fried noodles with veggies', 180.00, 'https://res.cloudinary.com/demo/image/upload/noodles.jpg'),
(7, 'Chilli Chicken', 'Spicy Indo-Chinese chicken', 250.00, 'https://res.cloudinary.com/demo/image/upload/chilli_chicken.jpg'),
(7, 'Spring Rolls', 'Crispy rolls with veggies', 120.00, 'https://res.cloudinary.com/demo/image/upload/spring_rolls.jpg'),

-- Le Paris
(8, 'Croissant', 'Flaky buttery pastry', 120.00, 'https://res.cloudinary.com/demo/image/upload/croissant.jpg'),
(8, 'Coq au Vin', 'Chicken in red wine sauce', 500.00, 'https://res.cloudinary.com/demo/image/upload/coq_au_vin.jpg'),
(8, 'Crème Brûlée', 'Vanilla custard with caramel top', 220.00, 'https://res.cloudinary.com/demo/image/upload/creme_brulee.jpg'),

-- The Burger Spot
(9, 'Cheeseburger', 'Beef patty with cheese', 150.00, 'https://res.cloudinary.com/demo/image/upload/cheeseburger.jpg'),
(9, 'Fries', 'Crispy french fries', 80.00, 'https://res.cloudinary.com/demo/image/upload/fries.jpg'),
(9, 'Soda', 'Cold drink of choice', 50.00, 'https://res.cloudinary.com/demo/image/upload/soda.jpg'),

-- Coastal Catch
(10, 'Fish Curry', 'Spicy Goan fish curry', 300.00, 'https://res.cloudinary.com/demo/image/upload/fish_curry.jpg'),
(10, 'Prawn Fry', 'Fried prawns with masala', 350.00, 'https://res.cloudinary.com/demo/image/upload/prawn_fry.jpg'),
(10, 'Steamed Rice', 'Plain steamed rice', 70.00, 'https://res.cloudinary.com/demo/image/upload/rice.jpg');
