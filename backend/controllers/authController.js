import User from "../model/user.js";
import { sendCookies } from "../utils/sendCookie.js";
import { ErrorHandler } from "../middleware/error.js";

export const connectWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress)
      return next(new ErrorHandler("Wallet address is required", 400));

    let user = await User.findOne({ walletAddress });

    if (!user) {
      user = new User({ walletAddress });

      await user.save();

      console.log("New user created", user);
    } else {
        user.lastLogin = new Date();
        await user.save();
        console.log("Existing user logged in: ", walletAddress)
    }

    const data = {
        userId: user._id,
        walletAddress: user.walletAddress,
    }

    sendCookies(data, res, 200, user)

  } catch (error) {
    console.error("Connect wallet error:", error);
    next(new ErrorHandler("Failed to connect wallet", 500));
  }
};
