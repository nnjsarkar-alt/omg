const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/start"
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const replyOptions = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open Mini App',
            web_app: { url: 'https://your-mini-app-url.com' } // I will replace this later
          }
        ]
      ]
    }
  };
  bot.sendMessage(chatId, 'Welcome! Click the button below to open the mini app.', replyOptions);
});

console.log('Bot started...');
