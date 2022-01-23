const mongoose = require('mongoose');

const { Schema } = mongoose;
const MenuItemSchema = require('./menu-item.schema');

const RestaurantSchema = new Schema({
    name: String,
    country: {
        type: String,
        default: 'Украина'
    },
    city: {
        type: String,
        default: 'Днепр'
    },
    menu: [{ MenuItemSchema }],
    password: String
});

module.exports = RestaurantSchema;
