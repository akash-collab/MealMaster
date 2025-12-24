import React from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { toggleBookmark } from "../services/bookmarkService"; // assumes toggleBookmark(postId) exists

export default function BookmarkCard({ bookmark }) {
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: () => toggleBookmark(bookmark.postId),
    onSuccess: () => {
      toast.success("Removed from saved ⭐");
      queryClient.invalidateQueries(["bookmarks"]);
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to remove");
    },
  });

  // Build a list of candidate image sources (prefer thumbnail, then imageUrl, then server endpoint)
  const candidates = [
    bookmark.thumbnail,
    bookmark.imageUrl,
    // backup to server image endpoint if postId present
    bookmark.postId ? `${import.meta.env.VITE_API_URL}/community/${bookmark.postId}/image` : null,
  ].filter(Boolean);

  // placeholder data-uri SVG (small, no external asset)
  const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dy='.35em' font-family='Arial,Helvetica,sans-serif' font-size='20' fill='%23999' text-anchor='middle'>No image</text></svg>`
    );

  // state to hold chosen src and to detect fallback
  const [srcIndex, setSrcIndex] = React.useState(0);
  const src = candidates[srcIndex] || PLACEHOLDER;

  const handleImgError = () => {
    // try next candidate, otherwise use placeholder
    if (srcIndex < candidates.length - 1) {
      setSrcIndex((i) => i + 1);
    } else {
      // set to placeholder (already if no candidates)
      setSrcIndex(candidates.length); // will map to PLACEHOLDER
    }
  };

  return (
    <div
      className="
        rounded-2xl overflow-hidden 
        bg-card text-card-foreground 
        border border-border 
        shadow hover:shadow-xl transition
        relative
      "
    >
      <Link to={`/p/${bookmark.postId}`} className="block">
        <div className="w-full h-40 bg-background overflow-hidden">
          <img
            src={src}
            alt={bookmark.title || "Saved post"}
            onError={handleImgError}
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />
        </div>
      </Link>

      <div className="p-3">
        <p className="font-semibold line-clamp-2 min-h-8">{bookmark.title || "Untitled post"}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (removeMutation.isLoading) return;
          removeMutation.mutate();
        }}
        aria-label="Remove bookmark"
        className="
          absolute top-2 right-2 
          text-2xl 
          bg-black/40 text-white 
          rounded-full px-2 py-1
          hover:scale-110 
          transition
        "
      >
        {removeMutation.isLoading ? "…" : "⭐"}
      </button>
    </div>
  );
}