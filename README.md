
#  Restaurant Bot

This is a smart restaurant chatbot built using **Microsoft Bot Framework**, **Node.js**, and **MySQL**.  
It allows users to interact with restaurants through chat to:

-  Search restaurants
-  View menus
-  Book or cancel reservations
-  Add items to cart and place orders
-  Make payments
-  Track or cancel orders
-  Login/signup using JWT authentication

---

##  How to Run the Project Locally

1. **Clone the repository**

   git clone https://github.com/Pranjal1045/restaurant-bot.git
   cd restaurant_services

2. **Install Dependencies**

   npm install

3. **Set up environment variables**

Create a .env file and add your DB, JWT, Stripe, and Cloudinary credentials.

4. **Start the server**

node bot/index.js
node server/index.js

5. **Test with Bot Framework Emulator**
Use http://localhost:3978/api/messages as the bot endpoint.

 **Commands used:**
signup john john@gmail.com john123 
login john@gmail.com john123
search Italian menu for Bella Italia
book reservation at Spice Hub cancel reservation
add 2 x hakka noodles view cart remove 1 x hakka noodles place order for Spice Hub track order cancel order
recommend me a place




