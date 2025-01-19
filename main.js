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

let sunriseTask, sunsetTask;

const sunTask = () => {
    axios.get("https://api.sunrise-sunset.org/json?lat=22.3193&lng=114.1694&date=today&formatted=0").then((response) => {
        const data = response.data.results;

        const sunrise = new Date(data.sunrise);
        const sunset = new Date(data.sunset);

        const now = new Date();
        const sunriseTimeout = sunrise.getTime() - now.getTime();
        const sunsetTimeout = sunset.getTime() - now.getTime();

        // Sunrise task
        clearTimeout(sunriseTask);
        if (sunriseTimeout > 0) {
            sunriseTask = setTimeout(() => {
                sendToEachChat("CAACAgUAAxkBAAMHZ4ut-28xMqYvC4wXYwVVoZbuhaMAAogUAAIsOUhUyqEiJeTyByE2BA");
            }, sunriseTimeout);
        }

        // Sunset task
        clearTimeout(sunsetTask);
        if (sunsetTimeout > 0) {
            sunsetTask = setTimeout(() => {
                sendToEachChat("CAACAgUAAx0CS7SzgQABB4UkZ4vAMRzrildshqv3f0zQeZVYKlcAAgQXAAJxj2BU3JTJSWJFj602BA");
            }, sunsetTimeout);
        }

        console.log(`Sunrise: ${sunrise}, Sunset: ${sunset}`);
    });
}

bot.api.getMe().then((me) => {
    console.log(`Bot is running as @${me.username}`);

    for (const chatId of config.groups) {
        bot.api.getChat(chatId).then((chat) => {
            console.log(`Enabled chat ${chat.title} (${chatId})`);
        });
    }

    sunTask();
    cron.schedule("0 0 * * *", sunTask);

    bot.on(":new_chat_members:me", (ctx) => {
        config.groups.push(ctx.chat.id);
        config.groups = [...new Set(config.groups)];

        bot.api.getChat(ctx.chat.id).then((chat) => {
            console.log(`New chat ${chat.title} (${ctx.chat.id})`);
        });

        // Hello
        bot.api.sendSticker(ctx.chat.id, "CAACAgUAAx0CUjooDgABAiamZ4u3RX5hFRenn5UuvBdOnrgJtJQAApMYAAIb9phX8VH8V8j7IyY2BA");

        fs.writeFileSync("config.json", JSON.stringify(config, null, 4));
    })

    bot.on("message", (ctx) => {
        const chatId = ctx.chat.id;

        // console.log(ctx.message);

        switch (ctx.message.text) {
            case "?": case "？":
                bot.api.sendSticker(chatId, "CAACAgUAAxkBAAMLZ4uzwND_OWxKsWxMxA-pd1qkQ30AAqgTAAKT1phXli3_YLkdr_c2BA");
                break;
            case "高興": case "高兴":
                bot.api.sendSticker(chatId, "CAACAgUAAxkBAAMMZ4uz8QS8fOhn3MbnasnxWwQdOqsAApgYAAKmAAFIVF0GuOiRSxXBNgQ");
                break;
        }
    })
});

bot.start()