const express=require("express")
const router =express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js")
const Listing=require("../models/listing.js")
const { isLoggedIn } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer')

const { storage } = require("../cloudConfig.js");

const upload = multer({ storage })


const validateListing=(req,res,next)=>{
let {error}=listingSchema.validate(req.body);   //validation check 
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg)
    }else{
        next();
    }
}

router
    .route("/")
    .get(wrapAsync(listingController.index))

    //create route
    .post(
        // isLoggedIn,
        // validateListing,
        upload.single('listing[image]'),
        wrapAsync(listingController.createListing)
    );
    
//new route
router.get("/new",isLoggedIn,listingController.renderNewForm)


    
router.route("/:id")
    //Show route
    .get(
    wrapAsync(listingController.showListing))

    ////Update Route
    .put(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing))

    //delete route
    .delete(
    isLoggedIn,
    wrapAsync(listingController.destroyListing))



//Edit route
router.get("/:id/edit",
    isLoggedIn,
    wrapAsync(listingController.renderEditForm))


module.exports=router;