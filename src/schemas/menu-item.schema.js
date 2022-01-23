const mongoose = require('mongoose');

const {Schema} = mongoose;

const MenuItemSchema = new Schema({
    name: String,
    price: Number,
    comment: String,
    rate: Number
});

module.exports = MenuItemSchema;
