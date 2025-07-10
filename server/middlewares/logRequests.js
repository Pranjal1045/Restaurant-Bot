
module.exports = async function logRequests(context, next) {
    const userId = context.activity.from.id;
    const message = context.activity.text;
  
    console.log(`[LOG] User: ${userId} | Message: "${message}"`);
    await next(); 
  };
  