import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityRecipe", required: true },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default mongoose.models.Bookmark ||
  mongoose.model("Bookmark", bookmarkSchema);