
const { TurnContext } = require('botbuilder');
const db = require('../../config/db'); 
const PaymentService = require('./paymentService');
const { verifyToken } = require('../../server/utils/jwt');

const STATUS_FLOW = ['confirmed', 'cooking', 'out_for_delivery', 'delivered'];
const STATUS_TIMINGS = [1 * 60 * 1000, 3 * 60 * 1000, 2 * 60 * 1000];

class OrderService {
  constructor(adapter, cartAccessor, userAccessor) {
    this.adapter = adapter;
    this.cartAccessor = cartAccessor;
    this.userAccessor = userAccessor;
  }

async placeOrderByName(context) {
  const name = context.activity.text.split('place order for ')[1]?.trim();
  if (!name) return await context.sendActivity("❌ Please specify a restaurant name.");

  const user = await this.userAccessor.get(context);
  if (!user || !verifyToken(user.token)) {
    return await context.sendActivity("🔒 Access denied. Please log in first.");
  }

  const [[restaurant]] = await db.query(
    'SELECT id FROM restaurants WHERE LOWER(name) LIKE LOWER(?)',
    [`%${name.toLowerCase()}%`]
  );
  if (!restaurant) return await context.sendActivity(`❌ No restaurant found matching “${name}”.`);

  let cart = await this.cartAccessor.get(context, []);
  if (!cart.length) return await context.sendActivity("🛒 Your cart is empty. Add items using 'add 1 x item name'.");

  const [menuItems] = await db.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurant.id]);
  const itemMap = Object.fromEntries(menuItems.map(item => [item.name.toLowerCase(), item]));

  let total = 0;
  const orderItems = [];

  for (let { item, quantity } of cart) {
    if (!itemMap[item]) continue;
    const price = parseFloat(itemMap[item].price);
    total += price * quantity;
    orderItems.push({ menu_item_id: itemMap[item].id, quantity });
  }

  if (!orderItems.length) {
    return await context.sendActivity("❌ None of the items in your cart are available at this restaurant.");
  }

  // Save the order in the database
  const [orderResult] = await db.query(
    'INSERT INTO orders (user_id, restaurant_id, order_type, total_amount, status) VALUES (?, ?, ?, ?, ?)',
    [user.id, restaurant.id, 'delivery', total, 'confirmed']
  );

  for (let item of orderItems) {
    await db.query(
      'INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?, ?, ?)',
      [orderResult.insertId, item.menu_item_id, item.quantity]
    );
  }

  // Clear the cart
  await this.cartAccessor.set(context, []);

  await context.sendActivity(
    `🛒 Order placed at *${name}*\n💵 Total: ₹${total}\n📦 Status: confirmed\n🚚 Use 'track order' to check status.`
  );

  // 💳 Ask for payment
  const paymentService = new PaymentService(); // Payment service should already be implemented
  const link = await paymentService.generatePaymentLink(total, `Order from ${name}`);

  await context.sendActivity(`💳 Would you like to pay now?\n[💰 Pay ₹${total}](${link})`);

  // 📬 Schedule mock delivery updates
  const reference = TurnContext.getConversationReference(context.activity);
  global.conversationReferences = global.conversationReferences || {};
  global.conversationReferences[user.id] = reference;

  this.scheduleOrderUpdates(reference, orderResult.insertId, user.id);
}

  scheduleOrderUpdates(reference, orderId, userId) {
    let index = 1;

    const updateStatus = async () => {
      if (index >= STATUS_FLOW.length) return;

      const status = STATUS_FLOW[index];
      await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

      const ref = global.conversationReferences?.[userId];
      if (ref) {
        await this.adapter.continueConversation(ref, async (ctx) => {
          await ctx.sendActivity(`📢 Order Update: Your order is now *${status.replace(/_/g, ' ')}*.`);
        });
      }

      index++;
      if (index < STATUS_FLOW.length) {
        setTimeout(updateStatus, STATUS_TIMINGS[index - 1]);
      }
    };

    setTimeout(updateStatus, STATUS_TIMINGS[0]);
  }

  async trackOrder(context) {
    const user = await this.userAccessor.get(context);
    if (!user || !verifyToken(user.token)) {
      return await context.sendActivity("🔒 You must be logged in to track order.");
  }
    const [[order]] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    );
    if (!order) return await context.sendActivity("📭 No recent orders found.");

    const statusMessages = {
      pending: "🕐 Order placed, waiting for confirmation.",
      confirmed: "✅ Order confirmed by the restaurant.",
      cooking: "👨‍🍳 Your food is being prepared.",
      out_for_delivery: "🚚 Out for delivery.",
      delivered: "📦 Delivered. Enjoy your meal!",
      cancelled: "❌ Order was cancelled."
    };

    await context.sendActivity(`📦 Order Status: *${order.status.toUpperCase()}*\n${statusMessages[order.status] || ''}`);
  }

  async cancelOrder(context) {
    const user = await this.userAccessor.get(context);
    if (!user || !verifyToken(user.token)) {
      return await context.sendActivity("🔒 You must be logged in to cancel your order.");
    }
    const [[order]] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    );
    if (!order) return await context.sendActivity("❌ No active order to cancel.");

    await db.query('UPDATE orders SET status = "cancelled" WHERE id = ?', [order.id]);
    await context.sendActivity("❌ Your order has been cancelled.");
  }
}

module.exports = OrderService;
