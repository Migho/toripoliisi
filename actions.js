import Order from './models/Order.js'
import getNewToriItems from './tori.js'

export async function startCommand(bot, chatId) {
  await bot.sendMessage({
    chat_id: chatId,
    text: `Hello! I am Toripoliisi. I will keep an eye on your Tori searches and notify you for new items. Tori also provides ` +
          `such feature (called 'Hakuvahti'), but the notification is sent only daily which often is not enough. I check Tori ` +
          `for new items every minute.\n\n` +
          
          `Commands:\n` +
          `/add - order me to keep track of a new search. Paste a tori search url in the same message after the command.\n` +
          `/list - list all your personal searches\n` +
          `/remove - remove an order\n` +
          `/stats - get common user statistics\n`,
  })
}

export async function removeCommand(bot, chatId) {
  const orders = await Order.where('chatId', chatId).get()
  const listOfRemovableOrders = orders.map(o => [{text: o.name, callback_data: o.id}])
  await bot.sendMessage({
    chat_id: chatId,
    text: 'Which one would you like to remove?',
    reply_markup: { inline_keyboard: listOfRemovableOrders },
  })
}

export async function addCommand(bot, chatId, url) {
  if (url === undefined) {
    await bot.sendMessage({
      chat_id: chatId,
      text: 'Please provide the URL after the command',
    })
  } else {
    try {
      const args = new URLSearchParams(new URL(url).search)
      const newestItem = await getNewToriItems(url)
      if (newestItem.length > 0) {
        await Order.create({
          chatId: chatId,
          name: args.get('q'),
          url: url,
          newestToriItemId: newestItem[0].id,
          newestToriItemDate: newestItem[0].date,
        })
      } else {
        await Order.create({
          chatId: chatId,
          name: args.get('q'),
          url: url,
        })
      }
      await bot.sendMessage({
        chat_id: chatId,
        text: 'Url added!',
      })
    } catch(e) {
      console.log(e)
      await bot.sendMessage({
        chat_id: chatId,
        text: 'Unknown error occured. Please check the url.',
      })
    }
  }
}

export async function listCommand(bot, chatId) {
  const orders = await Order.where('chatId', chatId).get()
  const listOfItems = orders.map(o => o.name).join('\n')
  await bot.sendMessage({
    chat_id: chatId,
    text: 'You have ' + orders.length + ' active search(es):\n\n' + listOfItems
  })
}

export async function statsCommand(bot, chatId) {
  const ordersTotal = await Order.count()
  const uniqueUsers = await Order.select('chatId').groupBy('chatId').all()

  const orders = await Order.where('chatId', chatId).get()
  await bot.sendMessage({
    chat_id: chatId,
    text: 'There are ' + ordersTotal + ' active searches and ' + uniqueUsers.length + ' unique users.',
  })
}

export async function debugListCommand(bot, chatId) {
  const orders = await Order.where('chatId', chatId).get()
  await bot.sendMessage({
    chat_id: chatId,
    text: orders,
  })
}

export async function unknownCommand(bot, chatId) {
  await bot.sendMessage({
    chat_id: chatId,
    text: 'I don\'t know that command.',
  })
}

export async function callbackQuery(bot, chatId, messageId, queryId, queryData) {
  try {
    await Order.deleteById(queryData)
  } catch (error) {
    await bot.answerCallbackQuery({
      callback_query_id: queryId,
      text: 'There was a problem. Nothing is removed.',
    })
    return
  }
  await bot.answerCallbackQuery({
    callback_query_id: queryId,
    text: 'Job done!',
  })
  try {
    await bot.editMessageText({
      chat_id: chatId,
      message_id: messageId,
      text: '~Which one would you like to remove?~ Removed',
      parse_mode: 'MarkdownV2',
    })
  } catch(e) {
    console.log("Couldn't edit message in callback query. The user probably clicked multiple buttons.")
  }
}

export async function checkAllOrders(bot) {
  const allOrders = await Order.all()
  for (const order of allOrders) {
    try {
      const newItems = await getNewToriItems(order.url, order.newestToriItemId, order.newestToriItemDate)
      if (newItems.length > 0) {
        await Order.where('id', order.id).update('newestToriItemId', newItems[0].id)
        await Order.where('id', order.id).update('newestToriItemDate', newItems[0].date)
      }
      for (const item of newItems) {
        await bot.sendMessage({
          chat_id: order.chatId,
          text: 'New item online: ' + item.url,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
}
