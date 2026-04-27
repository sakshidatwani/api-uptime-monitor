const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * @desc    Protect routes by verifying JWT
 * @param   {object} req - The request object
 * @param   {object} res - The response object
 * @param   {function} next - The next middleware function
 */

const protect = asyncHandler(async(req, res, next)=>{
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        try{
            token = req.headers.authorization.split(' ')[1];
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decode.id).select('-password'); //important for security measures {Keep an eye on it}

            if(!req.user){
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            next();
        }catch(error){
            console.log(error);
            res.status(401);
            throw new Error('Not authorizedm no token provided');
        }
    }
}) 

module.exports = {protect};