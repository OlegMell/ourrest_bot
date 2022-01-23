const mongoose = require('mongoose');
const { Schema } = mongoose;
const RestaurantSchema = require('./restaurant.schema');

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    menu: [{ RestaurantSchema }]
});

module.exports = UserSchema;
