
const { ActivityHandler } = require('botbuilder');

const logRequests = require('../server/middlewares/logRequests');
const errorHandler = require('../server/middlewares/errorHandler');

const SearchService = require('./services/searchService');
const MenuService = require('./services/menuService');
const AuthService = require('./services/authService');
const OrderService = require('./services/orderService');
const CartService = require('./services/cartService');
const ReservationService = require('./services/reservationService');
const RecommendationService = require('./services/recommendationService');

class RestaurantBot extends ActivityHandler {
  constructor(adapter, accessors) {
    super();
     
    const {
      cartAccessor,
      reservationAccessor,
      userAccessor,
      conversationState,
      userState      // ✅ Grab userState from accessors
    } = accessors;

    this.conversationState = conversationState;  // ✅ Store for reuse
    this.userState = userState;

    // Initialize services
    this.authService = new AuthService(userAccessor, conversationState);
    this.orderService = new OrderService(adapter, cartAccessor, userAccessor);
    this.cartService = new CartService(cartAccessor, conversationState,userAccessor);
    this.reservationService = new ReservationService(reservationAccessor, userAccessor);
    this.searchService = new SearchService();
    this.menuService = new MenuService();
    this.recommendationService = new RecommendationService(userAccessor);

    this.onMessage(errorHandler(async (context, next) => {
      await logRequests(context , async () => {

        const text = context.activity.text.toLowerCase();

        if (await this.reservationService.handleStep(context)) return;
  
        if (text.includes('search')) return await this.searchService.search(context);
        if (text.includes('menu for')) return await this.menuService.showMenu(context);
        if (text.includes('book reservation at')) return await this.reservationService.initReservation(context);
        if (text.includes('cancel reservation')) return await this.reservationService.cancelReservation(context);
        if (text.includes('place order for')) return await this.orderService.placeOrderByName(context);
        if (text.includes('track order')) return await this.orderService.trackOrder(context);
        if (text.includes('cancel order')) return await this.orderService.cancelOrder(context);
        if (text.includes('recommend')) return await this.recommendationService.getRecommendations(context);
        if (text.startsWith('add')) return await this.cartService.addToCart(context);
        if (text.startsWith('remove')) return await this.cartService.removeFromCart(context);
        if (text.includes('view cart')) return await this.cartService.viewCart(context);
        if (text.startsWith('login')) return await this.authService.loginUser(context);
        if (text.startsWith('logout')) return await this.authService.logoutUser(context);
        if (text.startsWith('signup')) return await this.authService.signupUser(context);
  
        await context.sendActivity("🤖 Try:\n- `search Chinese`\n- `menu for Dominos`\n- `book reservation at Pizza Hut`");
  
        await next();
      })
      }));
  

  
    this.onDialog(async (context, next) => {
      await this.conversationState.saveChanges(context, false);
      await this.userState.saveChanges(context, false);
      await next();
    });
  }
}

module.exports = RestaurantBot;
