const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const CampGroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String, 
    image: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]

});


CampGroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})


module.exports = mongoose.model('CampGround', CampGroundSchema);
