const Joi=require('joi');

module.exports.listingSchema=Joi.object({
    listing : Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        duration:Joi.number().required().min(1),
        price:Joi.number().required().min(0),
        offer:Joi.number().min(0).max(100).allow("", null).optional(),
        image:Joi.string().allow("",null)
    }).required()
})

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        rating:Joi.number().required(),
        comment:Joi.string().required()
    }).required()
})