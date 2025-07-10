module.exports = function errorHandler(fn) {
    return async (context, next) => {
      try {
        await fn(context, next);
      } catch (err) {
        console.error(" [Global Error]:", err);
        await context.sendActivity(`❌ Error: ${error.message}`);
        //await context.sendActivity("⚠️ An unexpected error occurred. Please try again.");
      }
    };
  };
  