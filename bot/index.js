const restify = require('restify');
const {
  BotFrameworkAdapter,
  MemoryStorage,
  ConversationState,
  UserState
} = require('botbuilder');

const RestaurantBot = require('./restaurantbot');

// adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId || '',
  appPassword: process.env.MicrosoftAppPassword || ''
});

// Catch-all error handler
adapter.onTurnError = async (context, error) => {
  console.error(` [onTurnError]: ${error}`);
  await context.sendActivity('Oops. Something went wrong!');
};

// memory storage
const memoryStorage = new MemoryStorage();

// ConversationState and UserState
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// accessors
const accessors = {
  cartAccessor : conversationState.createProperty('CartAccessor'),
  reservationAccessor: conversationState.createProperty('reservationProperty'),
  userAccessor: userState.createProperty('user'), 
  conversationState,
  userState
};

// bot instance
const bot = new RestaurantBot(adapter, accessors);

// HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(` Bot server listening on http://localhost:${server.address().port}`);
});

// Route incoming requests to the bot
server.post('/api/messages', async (req, res) => {
  await adapter.processActivity(req, res, async (context) => {
    await bot.run(context);
    await conversationState.saveChanges(context, false);
    await userState.saveChanges(context, false);
  });
});
