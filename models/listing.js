const mongoose=require("mongoose");
const review = require("./review");
const Schema= mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
       type: String,
       default:"https://images.pexels.com/photos/12112985/pexels-photo-12112985.jpeg",
       set:(v)=> v===""?"https://images.pexels.com/photos/12112985/pexels-photo-12112985.jpeg":v,
    },
    price:Number,
    duration:{
        type:Number,
        default:3
    },
    location:String,
    country:String,
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"review",
        },
    ]
})

listingSchema.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await Review.deleteMany({_id:{$in: listing.reviews}})
    }
})
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;
