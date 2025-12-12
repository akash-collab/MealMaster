import CommunityRecipe from "../models/CommunityRecipe.js";

export const getMyPosts = async (req, res) => {
  try {
    const posts = await CommunityRecipe.find({ user: req.userId })
      .lean()
      .exec();

    const postsWithReactions = posts.map((p) => ({
      ...p,
      reactionsTotal: Object.values(p.reactionCounts || {}).reduce(
        (a, b) => a + b,
        0
      ),
    }));

    res.json({ posts: postsWithReactions });
  } catch (error) {
    res.status(500).json({ message: "Failed to load your posts" });
  }
};