// server/routes/reservations.js
const express = require('express');
const router = express.Router();
const db = require('../db');

//  Book a reservation
router.post('/book', async (req, res) => {
  const { user_id, restaurant_id, table_number, reservation_time, special_request } = req.body;

  try {
    await db.query(
      `INSERT INTO reservations (user_id, restaurant_id, table_number, reservation_time, special_request)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, restaurant_id, table_number, reservation_time, special_request]
    );

    // Mark the table unavailable
    await db.query(
      'UPDATE tables SET is_available = FALSE WHERE restaurant_id = ? AND table_number = ?',
      [restaurant_id, table_number]
    );

    res.status(200).json({ message: 'Reservation successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Reservation failed' });
  }
});

// View user reservations
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const [reservations] = await db.query(
      `SELECT r.*, res.name AS restaurant_name
       FROM reservations r
       JOIN restaurants res ON r.restaurant_id = res.id
       WHERE r.user_id = ?`,
      [userId]
    );
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch reservations' });
  }
});

//  Cancel a reservation
router.delete('/:reservationId', async (req, res) => {
  const { reservationId } = req.params;

  try {
    const [[reservation]] = await db.query(
      `SELECT restaurant_id, table_number FROM reservations WHERE id = ?`,
      [reservationId]
    );

    await db.query(`DELETE FROM reservations WHERE id = ?`, [reservationId]);

    await db.query(
      `UPDATE tables SET is_available = TRUE WHERE restaurant_id = ? AND table_number = ?`,
      [reservation.restaurant_id, reservation.table_number]
    );

    res.json({ message: 'Reservation cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

module.exports = router;
