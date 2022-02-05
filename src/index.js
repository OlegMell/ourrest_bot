require('dotenv').config();
const {Telegraf, Markup} = require('telegraf');

const mongoose = require('mongoose');

const {User, Restaurant, MenuItem} = require('./db.config');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(process.env.DB_URL);

    let currentFoodItem = [];
    let btns = [];
    let restaurants = [];

    // User.create({
    //     name: 'Олег',
    //     email: 'oleg.mel123@gmail.com',
    //     password: '12345q'
    // });


    const bot = new Telegraf(process.env.BOT_TOKEN);

    bot.start(async (ctx) => {
        const chatId = ctx.chat.id;

        if (!chatId) {
            return;
        }

        const foundUser = await User.findOne({
            chatId
        }).exec();

        if (foundUser) {
            ctx.reply(foundUser);
        } else {
            ctx.reply('First start msg!')
        }

    });

    bot.command('keyboard', (ctx) => {
        ctx.reply(
            'Кафе',
            Markup.inlineKeyboard([
                Markup.button.callback('Добавить блюдо', 'addFood'),
                Markup.button.callback('Посмотреть список', 'showList'),
            ])
        );
    });

    bot.on('callback_query', async (ctx) => {
        const action = ctx.update.callback_query.data;


        switch (action) {
            case 'addFood':
                ctx.reply('Введите в формате\nНазвание кафе - Название Блюда - Цена (грн.) - Оценка (0-10)');

                bot.on('text', (ctx) => {

                    currentFoodItem = ctx.message.text.split('-');

                    const [ rest, food, price, rate ] = currentFoodItem;

                    if (currentFoodItem.length < 2 || (!rest || !food)) {
                        ctx.reply('Вы что-то забыли ввести, проверьте, пожалуйста');
                        return;
                    }

                    const itemResult = `Вы добавляете:\nКафе: ${rest?.trim()}\nБлюдо: ${food?.trim()}\nЦена: ${price ? price.trim() + ' грн.' : 'Не указана'}\nОценка: ${rate?.trim() || 'Не указана'}`;
                    ctx.reply(itemResult);

                    ctx.reply(
                        'Сохранить ?',
                        Markup.inlineKeyboard([
                            Markup.button.callback('Да', 'saveFood'),
                            Markup.button.callback('Нет', 'removeFood'),
                        ])
                    );
                })
                break;

            case 'saveFood':

                const currentUser = await User.findOne({
                    chatId: ctx.chat.id
                }, {raw: false}).exec();

                if (currentUser) {

                    const restaurantName = currentFoodItem[0]?.trim();

                    const menuItem = await MenuItem.create({
                        name: currentFoodItem[1]?.trim() || '',
                        price: currentFoodItem[2]?.trim() || 0,
                        rate: currentFoodItem[3]?.trim() || ''
                    });

                    let restaurant = await Restaurant.findOne({
                        name: restaurantName,
                    }).exec();


                    if (restaurant) {
                        await Restaurant.updateOne({
                            name: restaurantName
                        }, {
                            $addToSet: {
                                menu: [
                                    menuItem
                                ]
                            }
                        });
                    } else {
                        restaurant = await Restaurant.create({
                            name: restaurantName,
                            menu: [
                                menuItem
                            ]
                        });
                    }

                    if (restaurant && !currentUser?.restaurants.find(r => r.name === restaurant.name)) {
                        await User.updateOne({
                            chatId: ctx.chat.id
                        }, {
                            $addToSet: {
                                restaurants: [
                                    restaurant
                                ]
                            }
                        });
                    }
                }

                ctx.reply('Сохранили)');

                break;

            case 'showList':

                const user = await User.findOne({
                    chatId: ctx.chat.id
                })
                    .populate({
                        path: 'restaurants',
                        populate: {path: 'menu'}
                    })
                    .exec();

                if (!user) {
                    return
                }

                restaurants = user?.restaurants;
                btns = restaurants?.map(r => Markup.button.callback(r.name, r._id),)

                ctx.reply(
                    'Кафе / Рестораны',
                    Markup.inlineKeyboard([...btns])
                );

                break;

        }

        const foundRest = restaurants.find(r => {
            return r._id.toString() === action
        });

        let foodList = '';

        if (foundRest) {

            foundRest?.menu?.forEach(menuItem => {
                foodList = `${foundRest?.name}\nБлюдо: ${menuItem?.name}\nЦена: ${menuItem?.price ? menuItem?.price + ' грн.' : 'Не установлена'}\nОценка: ${menuItem?.rate || 'Не установлена'}\n`
                ctx.reply(foodList);
            });

        }

    });

    await bot.launch();
}
