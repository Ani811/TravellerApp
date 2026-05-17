const Listing=require("../models/listing")
const paypal = require('@paypal/checkout-server-sdk');

function paypalClient(){
    const clientId = process.env.PAYPAL_CLIENT_ID || '';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    const env = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    return new paypal.core.PayPalHttpClient(env);
}

const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports.index=async (req, res) => {
    const search = req.query.search?.trim();
    let allListings;
    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        allListings = await Listing.find({ title: searchRegex });
    } else {
        allListings = await Listing.find({});
    }
    res.render("listings/index.ejs", { allListings, search });
}

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs")
}
module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id.trim())
        .populate("reviews")
        .populate("owner");
    if(!listing){
        req.flash("error","Listing yoou requested for does not exist!")
        return res.redirect("/listings");
    }
    // console.log(listing);   
    res.render("listings/show.ejs",{listing})
}
module.exports.createListing=async (req,res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New listing Created")
    res.redirect("/listings");
}
 module.exports.renderEditForm=async(req,res) =>{
    let {id}=req.params;
    const listing=await Listing.findById(id.trim());
    if(!listing){
        req.flash("error","Listing yoou requested for does not exist!")
        return res.redirect("/listings");
    }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250")

    res.render("listings/edit.ejs",{listing,originalImageUrl})
}

module.exports.updateListing=async (req,res)=>{
    let { id }=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});//req.body.listing is a js file,there have all parameter
    if(typeof req.file !== "undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
};
module.exports.destroyListing=async(req,res)=>{
    let { id }=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted")
    res.redirect("/listings")
};

module.exports.createPayPalOrder = async (req, res) => {
    const { id } = req.params;
    const days = Number(req.body.days) || 1;
    const listing = await Listing.findById(id.trim());
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    const basePrice = Number(listing.price || 0);
    const offer = Number(listing.offer || 0);
    const originalTotal = basePrice * days;
    const total = Math.round(originalTotal * (1 - offer / 100) * 100) / 100; // two decimals

    const client = paypalClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'INR',
                value: total.toFixed(2)
            },
            description: listing.title || 'Booking'
        }]
    });
    try {
        const order = await client.execute(request);
        return res.json({ id: order.result.id });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to create PayPal order' });
    }
};

module.exports.capturePayPalOrder = async (req, res) => {
    const { orderID } = req.body;
    if (!orderID) return res.status(400).json({ error: 'orderID required' });
    const client = paypalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    try {
        const capture = await client.execute(request);
        return res.json({ status: 'COMPLETED', details: capture.result });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'Failed to capture PayPal order' });
    }
};