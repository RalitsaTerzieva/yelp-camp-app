const express = require('express');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const CampGround = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const router = express.Router();
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const { storage } = require('../cloudinary');
const multer  = require('multer')
const upload = multer({ storage })


router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))
    .post(upload.single('image'), (req, res) => {
        console.log(req.body, req.file)
        res.send('IT worked')
    })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))


module.exports = router;
