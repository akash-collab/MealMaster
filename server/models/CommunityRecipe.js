// server/models/CommunityRecipe.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

const communityRecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    image: {
      data: Buffer,
      contentType: String,
    },

    imageUrl: { type: String },

    ingredients: [String],
    steps: [String],
    tags: [String],

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    reactions: [reactionSchema],

    comments: [commentSchema],
  },
  { timestamps: true }
);

export default mongoose.models.CommunityRecipe ||
  mongoose.model("CommunityRecipe", communityRecipeSchema);