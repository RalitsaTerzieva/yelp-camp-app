const express = require('express');
const router = express.Router({ mergeParams: true });
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const CampGround = require('../models/campground');
const catchAsync = require('../utils/catchAsync');
const { reviewSchema } = require('../schemas');



const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const message = error.details.map(msg => msg.message).join(',')
        throw new ExpressError(message, 400)
    } else {
        next();
    }
}


router.post('/',validateReview, catchAsync(async (req, res) => {
    const campground = await CampGround.findById(req.params.id)
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully post a review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params
    await campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`)
}));


module.exports = router;
