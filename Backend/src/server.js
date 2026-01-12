import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./DB/index.js";

dotenv.config();


// ✅ Connect to MongoDB
connectDB();

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
