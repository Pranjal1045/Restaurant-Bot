const restify = require('restify');
const {
  BotFrameworkAdapter,
  MemoryStorage,
  ConversationState,
  UserState
} = require('botbuilder');

const RestaurantBot = require('./restaurantbot');

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId || '',
  appPassword: process.env.MicrosoftAppPassword || ''
});

// Catch-all error handler
adapter.onTurnError = async (context, error) => {
  console.error(`❌ [onTurnError]: ${error}`);
  await context.sendActivity('Oops. Something went wrong!');
};

// Create memory storage
const memoryStorage = new MemoryStorage();

// Create both ConversationState and UserState
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create accessors
const accessors = {
  cartAccessor : conversationState.createProperty('CartAccessor'),
  reservationAccessor: conversationState.createProperty('reservationProperty'),
  userAccessor: userState.createProperty('user'), // ✅ Use UserState here
  conversationState,
  userState
};

// Create the bot instance
const bot = new RestaurantBot(adapter, accessors);

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`🚀 Bot server listening on http://localhost:${server.address().port}`);
});

// Route incoming requests to the bot
server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);

    // ✅ Save state changes at the end of every turn
    await conversationState.saveChanges(context, false);
    await userState.saveChanges(context, false);
  });
});
