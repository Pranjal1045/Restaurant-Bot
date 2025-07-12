
const db = require('../../config/db'); 
const { isValidDate, isValidTime } = require('../../server/utils/validators');
const PaymentService = require('./paymentService'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../server/utils/jwt');

class ReservationService {
  constructor(reservationAccessor, userAccessor) {
    this.reservationAccessor = reservationAccessor;
    this.userAccessor = userAccessor;
    this.paymentService = new PaymentService();

  }

  async handleStep(context) {
    const reservationDetails = await this.reservationAccessor.get(context);
    const userMessage = context.activity.text.trim().toLowerCase();

  
    if (!reservationDetails) return false;
  
    if (reservationDetails.step === 'awaiting_date') {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
      if (!isValidDate(userMessage)) {
        return await context.sendActivity(" Invalid date. Use YYYY-MM-DD format.");
      }
      reservationDetails.date = userMessage;

      reservationDetails.step = 'awaiting_time';
      await this.reservationAccessor.set(context, reservationDetails);
      await context.sendActivity(" What time would you like to reserve? (e.g., 19:30)");
      return true;
    }
  
    if (reservationDetails.step === 'awaiting_time') {
      const timePattern = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/; // HH:MM in 24-hour
    if (!isValidTime(userMessage)) {
  return await context.sendActivity(" Invalid time. Use HH:mm (24-hour) format.");
}

  
      reservationDetails.time = userMessage;
      reservationDetails.step = 'awaiting_people';
      await this.reservationAccessor.set(context, reservationDetails);
      await context.sendActivity(" For how many people?");
      return true;
    }
  
    if (reservationDetails.step === 'awaiting_people') {
      if (isNaN(userMessage) || parseInt(userMessage) <= 0) {
        return await context.sendActivity(" Please enter a valid number of people.");
      }
  
      reservationDetails.people = userMessage;
      reservationDetails.step = 'awaiting_notes';
      await this.reservationAccessor.set(context, reservationDetails);
      await context.sendActivity(" Any special requests?");
      return true;
    }
  
    if (reservationDetails.step === 'awaiting_notes') {
      reservationDetails.notes = userMessage;
      const user = await this.userAccessor.get(context);
      if (!user || !verifyToken(user.token)) {
        await context.sendActivity(" Access denied. Please log in using `login email password`");
        return true;
      }
      
    
      const [[restaurant]] = await db.query(
        'SELECT id FROM restaurants WHERE LOWER(name) LIKE LOWER(?)',
        [`%${reservationDetails.restaurant}%`]
      );
    
      if (!restaurant) {
        await context.sendActivity(" Restaurant not found.");
        await this.reservationAccessor.delete(context);
        return true;
      }
    
      await db.query(
        'INSERT INTO reservations (user_id, restaurant_id, table_number, reservation_time, special_request, people) VALUES (?, ?, ?, ?, ?, ?)',
        [
          user.id,
          restaurant.id,
          1,
          `${reservationDetails.date} ${reservationDetails.time}`,
          reservationDetails.notes,
          parseInt(reservationDetails.people)
        ]
      );
    
      await context.sendActivity(
        ` Reservation confirmed at *${reservationDetails.restaurant}* 🪑\n ${reservationDetails.date} at ${reservationDetails.time}\n👥 ${reservationDetails.people} people\n Notes: ${reservationDetails.notes}`
      );
    
   
      reservationDetails.step = 'awaiting_payment';
      await this.reservationAccessor.set(context, reservationDetails);
      await context.sendActivity(" Would you like to pay *online* or *offline*?");
      return true;
    }
      
        
    if (reservationDetails.step === 'awaiting_payment') {
      if (userMessage.includes('online')) {
        const amount = 500; 
        const paymentUrl = await this.paymentService.generatePaymentLink(amount, `Reservation at ${reservationDetails.restaurant}`);
        await context.sendActivity(` Click here to pay: [Pay Now](${paymentUrl})`);
      } else {
        await context.sendActivity(" You chose to pay offline at the restaurant.");
      }
    
      await this.reservationAccessor.delete(context);
      return true;
    }
  }
    
  
  async initReservation(context) {
    const name = context.activity.text.split('book reservation at ')[1]?.trim();
    if (!name) {
      return await context.sendActivity(" Please specify a restaurant name.");
    }
    await this.reservationAccessor.set(context, { step: 'awaiting_date', restaurant: name });
    await context.sendActivity(` What date would you like to book a table at *${name}*? (e.g., 2025-06-30)`);
  }

  async cancelReservation(context) {
    const user = await this.userAccessor.get(context);
   if (!user || !verifyToken(user.token)) {
      return await context.sendActivity(" Access denied. Please log in first using `login email password`");
}


    const [[res]] = await db.query('SELECT * FROM reservations WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id]);
    if (!res) return await context.sendActivity(" No reservation found.");

    await db.query('DELETE FROM reservations WHERE id = ?', [res.id]);
    await context.sendActivity(" Reservation cancelled successfully.");
  }
}

module.exports = ReservationService;
