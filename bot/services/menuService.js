
const { CardFactory } = require('botbuilder');
const db = require('../../config/db');

class MenuService {
  async showMenu(context) {
    const name = context.activity.text.split('menu for ')[1]?.trim();
    if (!name) return await context.sendActivity(" Please specify a restaurant name.");

    const [[restaurant]] = await db.query('SELECT id FROM restaurants WHERE LOWER(name) LIKE LOWER(?)', [`%${name}%`]);
    if (!restaurant) return await context.sendActivity(` No restaurant found matching “${name}”.`);

    const [menu] = await db.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurant.id]);
    if (!menu.length) return await context.sendActivity(" No menu items found.");

    const cards = menu.map(m => CardFactory.heroCard(
      m.name,
      `💰 ₹${m.price}\n📝 ${m.description}${m.reviews ? `\n⭐ Reviews: ${m.reviews}` : ''}`,
      [m.image_url || 'https://via.placeholder.com/150'],
      [{ type: 'imBack', title: '➕ Add to Cart', value: `add 1 x ${m.name}` }]
    ));

    await context.sendActivity({ attachments: cards, attachmentLayout: 'carousel' });
  }
}

module.exports = MenuService;
