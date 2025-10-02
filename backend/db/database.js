import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI,{
        dbName:"Voting"
    })
    .then((c)=> console.log(`Database connected to ${c.connection.host}`))
    .catch((err) => consol.log(err))
}

export default connectDB