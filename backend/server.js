import connectDB from "./db/database.js"
import connectCloudinary from "./utils/cloudinary.js"
import app from "./app.js";
import Poll from "./model/poll.js";
import cron from "node-cron";

connectDB();
connectCloudinary();

const port = process.env.PORT || 5000;

cron.schedule("* * * * *", async () => {
  console.log("🕒 Running scheduled poll check at:", new Date().toLocaleString());

  try {
    const now = Date.now();

    // Find all polls whose endTime < now and are still active
    const expiredPolls = await Poll.find({ endTime: { $lt: now }, isActive: true });

    if (expiredPolls.length === 0) {
      console.log("✅ No expired polls found at this time.");
      return;
    }

    // Update them to inactive
    const pollIds = expiredPolls.map((poll) => poll.pollId);
    await Poll.updateMany(
      { pollId: { $in: pollIds } },
      { $set: { isActive: false } }
    );

    console.log(`✅ ${expiredPolls.length} poll(s) marked inactive.`);
  } catch (err) {
    console.error("❌ Error in scheduled task:", err);
  }
}, {
  timezone: "Asia/Kolkata" // ✅ Ensures it runs at 12AM, 6AM, 12PM, 6PM India time
});

app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`);
})