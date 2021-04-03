import Order from './models/Order.js'
import { getNewToriItems, getToriItemName } from './tori.js'

export async function startCommand(bot, chatId) {
  await bot.sendMessage({
    chat_id: chatId,
    text: `Hello! I am Toripoliisi. I will keep an eye on your Tori searches and notify you for new items. Tori also provides ` +
          `such feature (called 'Hakuvahti'), but the notification is sent only daily which often is not enough. I check Tori ` +
          `for new items every minute. Source code can be found from [Github](https://github.com/Migho/toripoliisi). Some of ` +
          `the apartments can cause issues because Tori keeps updating the listing time (wtf tori?), this is a known issue.\n\n`

          `3.4.2021 Toripoliisi had full reset, because it was malfunctioning + Tori made major changes to the ID logic of ` +
          `items. Sorry for this!\n\n` +

          `Commands:\n` +
          `/add - order me to keep track of a new search. Paste a tori search url in the same message after the command.\n` +
          `/list - list all your personal searches\n` +
          `/remove - remove an order\n` +
          `/stats - get common user statistics\n`,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  })
}

export async function removeCommand(bot, chatId) {
  const orders = await Order.where('chatId', chatId).get()
  if (orders.length === 0) {
    await bot.sendMessage({
      chat_id: chatId,
      text: 'You have no active searches.',
    })
  } else {
    const listOfRemovableOrders = orders.map(o => [{text: getToriItemName(o.url), callback_data: o.id}])
    await bot.sendMessage({
      chat_id: chatId,
      text: 'Which one would you like to remove?',
      reply_markup: { inline_keyboard: listOfRemovableOrders },
    })
  }
}

export async function addCommand(bot, chatId, url) {
  if (url === undefined) {
    await bot.sendMessage({
      chat_id: chatId,
      text: 'Please provide the URL after the command.',
    })
  } else {
    try {
      if (url.includes('m.tori.fi/')) {
        url = url.replace('m.tori.fi/', 'tori.fi/')
      }
      const newestItem = await getNewToriItems(url)
      if (newestItem.length > 0) {
        await Order.create({
          chatId: chatId,
          url: url,
          newestToriItemId: newestItem[0].id,
          newestToriItemTimestamp: newestItem[0].timestamp,
        })
      } else {
        await Order.create({
          chatId: chatId,
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
  if (orders.length === 0) {
    await bot.sendMessage({
      chat_id: chatId,
      text: 'You have no active searches.',
    })
  } else {
    const listOfItems = orders.map(o => `[${getToriItemName(o.url)}](${o.url})`).join('\n')
    await bot.sendMessage({
      chat_id: chatId,
      text: 'You have ' + orders.length + ' active search(es):\n\n' + listOfItems,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    })
  }
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
    disable_web_page_preview: true,
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
      const newItems = await getNewToriItems(order.url, order.newestToriItemId, order.newestToriItemTimestamp)
      if (newItems.length > 0) {
        // First item should always be the newest item
        await Order.where('id', order.id).update('newestToriItemId', newItems[0].id)
        await Order.where('id', order.id).update('newestToriItemTimestamp', newItems[0].timestamp)
      }
      for (const item of newItems) {
        const subject = item.subject.replace("[", "(").replace("]", ")")
        await bot.sendMessage({
          chat_id: order.chatId,
          text: `New item: [${subject}](${item.url})${item.price ? ` - ${item.price}` : ``}`,
          parse_mode: 'Markdown',
          // disable_web_page_preview: true,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }
}
