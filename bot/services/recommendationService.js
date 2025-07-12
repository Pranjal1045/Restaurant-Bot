
const db = require('../../config/db'); 
const { CardFactory } = require('botbuilder');

class RecommendationService {
  constructor(userAccessor) {
    this.userAccessor = userAccessor;
  }

  async getRecommendations(context) {
    const user = await this.userAccessor.get(context);
    if (!user) {
      return await context.sendActivity(" Please log in first to get personalized recommendations.");
    }

    // Get user's most frequently ordered menu items
    const [topItems] = await db.query(
      `SELECT mi.name, COUNT(*) as count, mi.restaurant_id, r.name as restaurant_name
       FROM order_items oi
       JOIN menu_items mi ON oi.menu_item_id = mi.id
       JOIN orders o ON oi.order_id = o.id
       JOIN restaurants r ON mi.restaurant_id = r.id
       WHERE o.user_id = ?
       GROUP BY oi.menu_item_id
       ORDER BY count DESC
       LIMIT 5`,
      [user.id]
    );

    if (!topItems.length) {
      return await context.sendActivity(" No past orders found to base recommendations on.");
    }

    const cards = topItems.map(item => CardFactory.heroCard(
      item.name,
      ` From: *${item.restaurant_name}*\n You've ordered this ${item.count} times!`,
      [],
      [
        { type: 'imBack', title: ' View Menu', value: `menu for ${item.restaurant_name}` },
        { type: 'imBack', title: ' Order Again', value: `place order for ${item.restaurant_name}` }
      ]
    ));

    await context.sendActivity({ attachments: cards, attachmentLayout: 'carousel' });
  }
}

module.exports = RecommendationService;
