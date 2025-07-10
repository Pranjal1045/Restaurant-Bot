module.exports = {
    isValidDate(date) {
      return /^\d{4}-\d{2}-\d{2}$/.test(date);
    },
  
    isValidTime(time) {
      return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time); // 24hr format
    },
  
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
  
    isValidQuantity(qty) {
      return !isNaN(qty) && Number(qty) > 0;
    }
  };
  