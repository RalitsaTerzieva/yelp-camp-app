const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { description, places } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected!')
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
    await Campground.deleteMany({})
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            author: '5f5c330c2cd79d538f2c66d9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(description)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251/1600X900',
            description: "Unwind in nature's embrace at our secluded campgrounds, where the only sounds you'll hear are the rustle of leaves and the chirping of birds.",
            price
        })
        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close()
})
