const express=require("express")
const router =express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js");
const {reviewSchema}=require("../schema.js")
const Review=require("../models/review.js");
const Listing=require("../models/listing.js")
const reviewController = require("../controllers/reviews.js");
const { isLoggedIn } = require("../middleware.js");
// const review = require("../models/reviews.js");

const validateReview=(req,res,next)=>{
if(req.body.review && req.body.review.rating) {
        req.body.review.rating = Number(req.body.review.rating);
    }
let {error}=reviewSchema.validate(req.body);   //validation check 
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg)
    }else{
        next();
    }
}
//Reviews
//Post review Route
router.post("/",validateReview,wrapAsync(reviewController.createrReview));

//Delete Review Route
router.delete(
    "/:reviewId",
    isLoggedIn,
    wrapAsync(reviewController.destroyReview)
)
module.exports=router;