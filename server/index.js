// server/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const restaurantRoutes = require('./routes/restaurants');
const getAllRestaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const reservationRoutes = require('./routes/reservations');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/uploads');
const stripeRoutes = require('./routes/stripe');


app.use('/api/restaurants', restaurantRoutes);
app.use('/api/getAllrestaurants', getAllRestaurantRoutes);
app.use('/api/menu_items', menuRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', uploadRoutes);
app.use('/api/payments', stripeRoutes);
app.use('/api/restaurants', restaurantRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});












