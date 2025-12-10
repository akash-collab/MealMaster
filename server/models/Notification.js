import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    message: { type: String, required: true },

    scheduleTime: { type: Date, required: true },

    status: { type: String, enum: ["pending", "sent"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);