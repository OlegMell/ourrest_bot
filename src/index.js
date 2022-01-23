require('dotenv').config();
const {Telegraf} = require('telegraf');

const mongoose = require('mongoose');

const {User, Restaurant, MenuItem} = require('./db.config');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.DB_URL);

    // User.create({
    //     name: 'Олег',
    //     email: 'oleg.mel123@gmail.com',
    //     password: '12345q'
    // });


    const bot = new Telegraf(process.env.BOT_TOKEN);

    const u = await User.findOne({
        email : "oleg.mel123@gmail.com",
    }).exec();

    bot.start((ctx) => ctx.reply(u));

    bot.hears('/reg', (ctx) => {
        ctx.reply('Как вас зовут?');

        bot.on('text', (ctx, next) => {
            console.log(ctx.message.text);
            ctx.reply(`Привет, ${ctx.message.text}`);

            ctx.reply('Придумай себе пароль: ');

            next(ctx);

            bot.on('text', (ctx) => {
                console.log(ctx.message.text);
            });
        });
    });

    bot.launch();
}
