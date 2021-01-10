import 'https://deno.land/x/dotenv/load.ts'
import { TelegramBot, UpdateType } from 'https://deno.land/x/telegram_bot_api/mod.ts'
import { cron } from 'https://deno.land/x/deno_cron/cron.ts'

// Initialize and sync db
import db from './db.js'
await db.sync()

// Telegram stuff
const TOKEN = Deno.env.get('TOKEN')
if (!TOKEN) throw new Error('Bot token is not provided')
const bot = new TelegramBot(TOKEN)

import { startCommand, removeCommand, addCommand, listCommand, statsCommand, debugListCommand, unknownCommand, callbackQuery, checkAllOrders } from './actions.js'

bot.on(UpdateType.Message, async ({ message }) => {
  var command = message.text.split(' ')
  try {
    if (command[0] === '/start') {
      startCommand(bot, message.chat.id)
    } else if (command[0] === '/remove') {
      console.log(message)
      removeCommand(bot, message.chat.id)
    } else if (command[0] === '/add') {
      addCommand(bot, message.chat.id, command[1])
    } else if (command[0] === '/list') {
      listCommand(bot, message.chat.id)
    } else if (command[0] === '/stats') {
      statsCommand(bot, message.chat.id)
    } else if (command[0] === '/debuglist') {
      debugListCommand(bot, message.chat.id)
    } else {
      // unknownCommand(bot, message.chat.id)
    }
  } catch (e) {
    console.log('Error have occurred! ' + e)
  }
  
})

bot.on(UpdateType.CallbackQuery, async ({ callback_query }) => {
  console.log(callback_query)
  callbackQuery(bot, callback_query.message.chat.id, callback_query.message.message_id, callback_query.id, callback_query.data)
})

bot.run({
  polling: true,
})

// Cron jobs
cron('* * * * *', async () => {
  checkAllOrders(bot)
})