// server/models/CommunityRecipe.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

// Each reaction = which user, which emoji
const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true }, // e.g. "❤️", "🔥"
  },
  { _id: false }
);

const communityRecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Image stored in MongoDB as buffer
    image: {
      data: Buffer,
      contentType: String,
    },

    // Optional external URL (if user pasted instead of upload)
    imageUrl: { type: String },

    ingredients: [String],
    steps: [String],
    tags: [String],

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ✅ NEW: emoji reactions
    reactions: [reactionSchema],

    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.model("CommunityRecipe", communityRecipeSchema);