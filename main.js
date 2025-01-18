import { Bot } from "grammy";
import axios from "axios";
import fs from "fs";
import cron from "node-cron";

const config = JSON.parse(fs.readFileSync("config.json"));
const bot = new Bot(config.token);

const sendToEachChat = (fileId) => {
    for (const chatId of config.groups) {
        bot.api.sendSticker(chatId, fileId);
    }
}

bot.api.getMe().then((me) => {
    console.log(`Bot is running as @${me.username}`);

    for (const chatId of config.groups) {
        bot.api.getChat(chatId).then((chat) => {
            console.log(`Enabled chat ${chat.title} (${chatId})`);
        });
    }

    cron.schedule("0 0 * * *", () => {
        axios.get("https://api.sunrise-sunset.org/json?lat=22.3193&lng=114.1694&date=today&formatted=0").then((response) => {
            const data = response.data.results;

            const sunrise = new Date(data.sunrise);
            const sunset = new Date(data.sunset);

            const now = new Date();
            const sunriseTimeout = sunrise.getTime() - now.getTime();
            const sunsetTimeout = sunset.getTime() - now.getTime();

            // Sunrise task
            if (sunriseTimeout > 0) {
                setTimeout(() => {
                    sendToEachChat("CAACAgUAAxkBAAMHZ4ut-28xMqYvC4wXYwVVoZbuhaMAAogUAAIsOUhUyqEiJeTyByE2BA");
                }, sunriseTimeout);
            }

            // if (sunsetTimeout > 0) {
            //     setTimeout(() => { }, sunsetTimeout);
            // }

            console.log(`Sunrise: ${sunrise}`);
        });
    })

    bot.on(":new_chat_members:me", (ctx) => {
        config.groups.push(ctx.chat.id);
        config.groups = [...new Set(config.groups)];

        bot.api.getChat(ctx.chat.id).then((chat) => {
            console.log(`New chat ${chat.title} (${ctx.chat.id})`);
        });

        fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
    })

    bot.on("message", (ctx) => {
        const chatId = ctx.chat.id;

        switch (ctx.message.text) {
            case "?": case "？":
                bot.api.sendSticker(chatId, "CAACAgUAAxkBAAMLZ4uzwND_OWxKsWxMxA-pd1qkQ30AAqgTAAKT1phXli3_YLkdr_c2BA");
                break;
            case "高興": case "高兴":
                bot.api.sendSticker(chatId, "CAACAgUAAxkBAAMMZ4uz8QS8fOhn3MbnasnxWwQdOqsAApgYAAKmAAFIVF0GuOiRSxXBNgQ");
                break;
        }
    })

    // bot.on("message:sticker", (ctx) => {
    //     console.log(ctx.message);
    // })
});

bot.start()