const express = require('express');
const ExpressError = require('../utils/ExpressError');
const { campgroundSchema } = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const CampGround = require('../models/campground');
const router = express.Router();
const { isLoggedIn } = require('../middleware');


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


router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.post('/',isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
    const campground = new CampGround(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a campground!')
    res.redirect(`/campgrounds/${campground._id}`) 
}))

router.get('/:id', catchAsync( async (req, res) => {
    const camp =  await CampGround.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!camp) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { camp })
}));

router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await CampGround.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissions to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render('campgrounds/edit', { campground })
}));

router.put('/:id',isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id)
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permissions to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    const updatedCamp = await CampGround.findByIdAndUpdate(req.params.id, req.body.campground)
    
    req.flash('success', 'Successfully updated the campground!');
    res.redirect(`/campgrounds/${updatedCamp._id}`)
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params
    await CampGround.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect(`/campgrounds`)
}))




module.exports = router;
