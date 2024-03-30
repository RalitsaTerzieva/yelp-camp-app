const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const CampGround = require('./models/campground');
const morgan = require('morgan');
const { campgroundSchema, reviewSchema } = require('./schemas');
const campground = require('./models/campground');
const Review = require('./models/review');

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
app.use(morgan('dev'))
app.use((req,res,next) => {
    console.log(req.method, req.path)
    req.requestTime = Date.now();

    next();
})

app.use('/campgrounds/new', (req, res, next) => {
    console.log('New New')
    next();
})

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body)
    if(error) {
        const message = error.details.map(msg => msg.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const message = error.details.map(msg => msg.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}


app.get('/', (req, res) => {
    console.log(`REQUEST TIME: ${req.requestTime}`)
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await CampGround.find({})
    res.render('campgrounds/index', { campgrounds })
});


app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new CampGround(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`) 
}))

app.get('/campgrounds/:id',catchAsync( async (req, res) => {
    const camp = await CampGround.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', { camp })
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await CampGround.findByIdAndUpdate(req.params.id, req.body.campground)
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await CampGround.findByIdAndDelete(id)
    res.redirect(`/campgrounds`)
}))

app.get('/makecampground', catchAsync(async (req, res) => {
    const camp = new CampGround({title: 'Yellow Camp', price: 400, description: 'Best camp in the Rila mountain!'})
    await camp.save();
    res.send(camp);
}));

app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id)
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


app.all('*', (err, req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, something get wrong!'
    res.status(statusCode).render('error', { err });
})


app.listen(3000, () => {
    console.log('Serving on PORT 3000!');
});
