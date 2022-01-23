const mongoose = require("mongoose");

const UserSchema = require('./schemas/user.schema');
const RestaurantSchema = require('./schemas/restaurant.schema');
const MenuItemSchema = require('./schemas/menu-item.schema');

module.exports = {
    User: mongoose.model('User', UserSchema),
    Restaurant: mongoose.model('Restaurant', RestaurantSchema),
    MenuItem: mongoose.model('MenuItem', MenuItemSchema),
};
