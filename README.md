# Toripoliisi

Toripoliisi is a Telegram bot made for checking new items from Tori.fi searches periodically. Users can ask Toripoliisi to keep checking specific URL:s for new items, and of course also to remove them. This bot was developed because Tori's own similar feature called Hakuvahti sends notifications only daily, and more than often popular items are already gone at that point. The bot should be running in Telegram bebind a nickname called [@Toripoliisibot](https://t.me/toripoliisibot).

## Starting the bot locally

This bot is written using Deno. To start the bot, install [Deno](https://deno.land/manual/getting_started/installation) and run the following command:

`deno run --allow-net --allow-env --allow-read --allow-write .\index.js`

In order for Bot to start successfully, you need .env file with telegram bot `TOKEN`. If you want Nodemon-like features where the server restarts when code changes are made, I recommend [Denon](https://deno.land/x/denon@2.4.6).

## Project future

I had plans to extend the bot to accept URL:s from other sites where you would like to get a notification about new items as soon as possible (such as new apartments at etuovi.com or oikotie.fi), but since they don't require that fast action, it's not very high on my todo-list. But if you have some time to spare and would like to further develop this code in any way, pull requests are very welcome. You can also message me via Telegram [@Mighop](https://t.me/mighop).