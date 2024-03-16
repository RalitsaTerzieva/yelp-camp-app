const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
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

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await CampGround.find({})
    res.render('campgrounds/index', { campgrounds })
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req, res) => {
    const campground = new CampGround(req.body);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
    const camp = await CampGround.findById(req.params.id)
    res.render('campgrounds/show', { camp })
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await CampGround.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
    const campground = await CampGround.findByIdAndUpdate(req.params.id, req.body)
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    await CampGround.findByIdAndDelete(id)
    res.redirect(`/campgrounds`)
})

app.get('/makecampground', async (req, res) => {
    const camp = new CampGround({title: 'Yellow Camp', price: 400, description: 'Best camp in the Rila mountain!'})
    await camp.save();
    res.send(camp);
});


app.listen(3000, () => {
    console.log('Serving on PORT 3000!');
});
