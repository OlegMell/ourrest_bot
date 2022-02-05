const mongoose = require('mongoose');
const {Schema} = mongoose;
const RestaurantSchema = require('./restaurant.schema');

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    chatId: String,
    restaurants: [{type: Schema.Types.ObjectId, ref: 'Restaurant'}]
});

module.exports = UserSchema;
