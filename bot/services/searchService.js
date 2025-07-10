
const { CardFactory } = require('botbuilder');
const db = require('../../config/db'); 

class SearchService {
  async search(context) {
    const input = context.activity.text.toLowerCase();
    const keywords = input.replace('search', '').trim().split(' ');

    let sql = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];

    const validPriceRanges = ['low', 'medium', 'high'];

    for (let word of keywords) {
      if (validPriceRanges.includes(word)) {
        sql += ' AND LOWER(price_range) = ?';
        params.push(word);
      } else {
        sql += ' AND (LOWER(name) LIKE ? OR LOWER(location) LIKE ? OR LOWER(cuisine) LIKE ?)';
        params.push(`%${word}%`, `%${word}%`, `%${word}%`);
      }
    }

    sql += ' ORDER BY rating DESC';

    const [rows] = await db.query(sql, params);

    if (!rows.length) {
      return await context.sendActivity("❌ No matching restaurants found. Try keywords like `Indian`, `Chinese`, `Delhi`, or `medium`.");
    }

    const cards = rows.map(r => CardFactory.heroCard(
      r.name,
      `🍽️ ${r.cuisine} • 📍 ${r.location} • 💵 ${r.price_range} • ⭐ ${r.rating}/5`,
      [r.image_url || 'https://via.placeholder.com/150'],
      [
        { type: 'imBack', title: '📋 View Menu', value: `menu for ${r.name}` },
        { type: 'imBack', title: '📅 Book Table', value: `book reservation at ${r.name}` },
        { type: 'imBack', title: '🛒 Order Food', value: `place order for ${r.name}` }
      ]
    ));

    await context.sendActivity({ attachments: cards, attachmentLayout: 'carousel' });
  }
}

module.exports = SearchService;


