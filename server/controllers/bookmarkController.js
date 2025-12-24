import Bookmark from "../models/Bookmark.js";
import CommunityRecipe from "../models/CommunityRecipe.js";

export const toggleBookmark = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    const exists = await Bookmark.findOne({ userId, postId });

    if (exists) {
      await Bookmark.deleteOne({ _id: exists._id });
      return res.json({ bookmarked: false });
    }

    await Bookmark.create({ userId, postId });
    return res.json({ bookmarked: true });

  } catch (err) {
    console.error("toggleBookmark error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyBookmarks = async (req, res) => {
  try {
    const userId = req.userId;

    const bookmarks = await Bookmark.find({ userId }).lean()
      .populate("postId")
      .sort({ createdAt: -1 });

    const formatted = bookmarks.map((b) => ({
      _id: b._id,
      postId: b.postId?._id,
      title: b.postId?.title,
      thumbnail: b.postId?.imageUrl || null,
    }));

    res.json({ bookmarks: formatted });

  } catch (err) {
    console.error("getMyBookmarks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};