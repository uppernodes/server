import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  refreshToken: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Token", tokenSchema);
