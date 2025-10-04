import jwt from "jsonwebtoken"
import User from "../model/user.js"
import { ErrorHandler } from "./error.js"

export const authenticateUser = async (req, res, next) => {
    try {

        const {token} = req.cookies;

        if(!token) return next(new ErrorHandler('Access token required', 401));

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decode.userId);

        if(!user) return next(new ErrorHandler('User not found', 404));

        req.user = user;
        req.userId = user._id;
        req.walletAddress = user.walletAddress;

        next();
        
    } catch (error) {
        console.log(error)
            if (error.name === 'JsonWebTokenError') {
              return next(new ErrorHandler('Invalid token', 401));
            }
            if (error.name === 'TokenExpiredError') {
              return next(new ErrorHandler('Token expired', 401));
            }
            next(new ErrorHandler('Authentication failed', 401));
    }
}