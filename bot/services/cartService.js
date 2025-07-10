
const { isValidQuantity } = require('../../server/utils/validators');
const { verifyToken } = require('../../server/utils/jwt');


class CartService {
  constructor(cartAccessor, conversationState,userAccessor) {
  this.cartAccessor = cartAccessor;
  this.conversationState = conversationState;
  this.userAccessor = userAccessor;
}


async addToCart(context) {
  const user = await this.userAccessor.get(context);
  if (!user || !verifyToken(user.token)) {
    return await context.sendActivity("🔒 You must be logged in to add items to your cart.");
  }

  const message = context.activity.text;
  const match = message.match(/add (\d+) x (.+)/i);
  if (!match) {
    return await context.sendActivity("❌ Invalid format. Use something like `add 1 x Paneer Butter Masala`");
  }

  const [, qty, itemName] = match;
  const quantity = parseInt(qty);
  if (!isValidQuantity(quantity)) {
    return await context.sendActivity("❌ Quantity must be a positive number.");
  }

  let cart = await this.cartAccessor.get(context, []);
  const existing = cart.find(i => i.item === itemName.toLowerCase());
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ item: itemName.toLowerCase(), quantity });
  }

  await this.cartAccessor.set(context, cart);
  await this.conversationState.saveChanges(context);
  await context.sendActivity(`✅ Added *${quantity} x ${itemName}* to your cart.`);
}

  async viewCart(context) {
    const user = await this.userAccessor.get(context);
    if (!user || !verifyToken(user.token)) {
      return await context.sendActivity("🔒 You must be logged in to view items in your cart.");
    }
    const cart = await this.cartAccessor.get(context, []);
    if (!cart.length) {
      return await context.sendActivity("🛒 Your cart is empty.");
    }

    const items = cart.map(i => `• ${i.quantity} x ${i.item}`).join('\n');
    await context.sendActivity(`🧾 Your Cart:\n${items}`);
  }

  async removeFromCart(context) {
    const user = await this.userAccessor.get(context);
    if (!user || !verifyToken(user.token)) {
      return await context.sendActivity("🔒 You must be logged in to remove items from your cart.");
    }
    const message = context.activity.text;
    const match = message.match(/remove (\d+) x (.+)/i);
    if (!match) {
      return await context.sendActivity("❌ Invalid format. Use `remove 1 x item name`");
    }

    const [, qty, itemName] = match;
    const quantity = parseInt(qty);
    if (!isValidQuantity(quantity)) {
      return await context.sendActivity("❌ Quantity must be a positive number.");
    }
    

    let cart = await this.cartAccessor.get(context, []);
    const index = cart.findIndex(i => i.item === itemName.toLowerCase());

    if (index === -1) {
      return await context.sendActivity("❌ Item not found in cart.");
    }

    if (cart[index].quantity <= quantity) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity -= quantity;
    }

    await this.cartAccessor.set(context, cart);
    await this.conversationState.saveChanges(context);

    await context.sendActivity(`🗑️ Removed *${quantity} x ${itemName}* from your cart.`);
  }
}

module.exports = CartService;
