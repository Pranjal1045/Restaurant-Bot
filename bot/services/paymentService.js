const axios = require('axios');

class PaymentService {
  async generatePaymentLink(amount, itemName) {
    const response = await axios.post('http://localhost:5000/api/payments/create-checkout-session', {
      amount,
      itemName
    });
    return response.data.url;
  }
}

module.exports = PaymentService;

  