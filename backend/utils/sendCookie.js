import jwt from "jsonwebtoken"

export const sendCookies = async (data, res, statusCode, user) => {
    try {

        const token = jwt.sign(data,process.env.JWT_SECRET, {expiresIn:"7d"})
        const isDevelopment = process.env.NODE_ENV !== "production";

        res.status(statusCode).cookie("token",token,{
            httpOnly: false,
            sameSite: "None",
            secure:true,
            path:"/",
            maxAge: 7*24*60*60*1000,
            domain: undefined
        }).json({
            success: true,
            user:{
                id:user._id,
                walletAddress: user.walletAddress,
            },
            token,
        })
        
    } catch (error) {
        console.log(error);
    }
}