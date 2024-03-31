const express = require('express');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const CampGround = require('../models/campground');
const router = express.Router();


const validateCampground = (req, res, next) => {
    console.log(req.body)
    const { error } = campgroundSchema.validate(req.body)
    console.log(req.body)
    if(error) {
        const message = error.details.map(msg => msg.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}


router.get('/', async (req, res) => {
    const campgrounds = await CampGround.find({})
    res.render('campgrounds/index', { campgrounds })
});


router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new CampGround(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`) 
}))

router.get('/:id',catchAsync( async (req, res) => {
    const camp = await CampGround.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', { camp })
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
}));

router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const campground = await CampGround.findByIdAndUpdate(req.params.id, req.body.campground)
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    await CampGround.findByIdAndDelete(id)
    res.redirect(`/campgrounds`)
}))




module.exports = router;
