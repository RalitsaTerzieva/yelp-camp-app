const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');

const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const CampGround = require('./models/campground');
const morgan = require('morgan');


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'thisshouldbebettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(morgan('dev'))


app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error =  req.flash('error');
    next();
})


app.use((req,res,next) => {
    console.log(req.method, req.path)
    req.requestTime = Date.now();

    next();
})

app.use('/campgrounds/new', (req, res, next) => {
    console.log('New New')
    next();
});

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);


app.get('/', (req, res) => {
    console.log(`REQUEST TIME: ${req.requestTime}`)
    res.render('home');
});

app.get('/makecampground', catchAsync(async (req, res) => {
    const camp = new CampGround({title: 'Yellow Camp', price: 400, description: 'Best camp in the Rila mountain!'})
    await camp.save();
    res.send(camp);
}));

app.all('*', (err, req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, something get wrong!'
    res.status(statusCode).render('error', { err });
});


app.listen(3000, () => {
    console.log('Serving on PORT 3000!');
});
