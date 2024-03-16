const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const CampGround = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
    console.log('Database connected!')
})

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await CampGround.find({})
    res.render('campgrounds/index', { campgrounds })
});

app.get('/campgrounds/:id', async (req, res) => {
    const camp = await CampGround.findById(req.params.id)
    res.render('campgrounds/show', { camp })
});

app.get('/makecampground', async (req, res) => {
    const camp = new CampGround({title: 'Yellow Camp', price: 400, description: 'Best camp in the Rila mountain!'})
    await camp.save();
    res.send(camp);
});

app.listen(3000, () => {
    console.log('Serving on PORT 3000!');
});
