import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  fetchCommunityRecipes,
  createCommunityRecipe,
  toggleLike,
  addComment,
  fetchCommunityComments,
} from "../../services/communityService";

import { useAuthStore } from "../../store/authStore";

const EMOJI_OPTIONS = ["❤️", "😂", "😍", "🤤", "🔥", "😢"];

export default function CommunityRecipes() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const queryClient = useQueryClient();

  const [sort, setSort] = useState("trending");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["community-recipes", sort],
    queryFn: () => fetchCommunityRecipes(sort),
  });

  const recipes = data?.recipes || [];

  /* ---------------------- CREATE POST ---------------------- */
  const createMutation = useMutation({
    mutationFn: createCommunityRecipe,
    onSuccess: () => {
      toast.success("Shared with community 🎉");
      queryClient.invalidateQueries(["community-recipes"]);
      setShowCreateModal(false);
    },
    onError: () => toast.error("Failed to share recipe"),
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Community Recipes 👨‍🍳
          </h1>
          <p className="text-sm text-muted-foreground">
            Scroll through posts from the MealMaster community.
          </p>
        </div>

        {/* Sort tabs */}
        <div className="inline-flex rounded-full border border-border bg-card p-1 text-xs">
          {["trending", "new"].map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1 rounded-full transition ${
                sort === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {key === "trending" ? "🔥 Trending" : "🆕 New"}
            </button>
          ))}
        </div>
      </header>

      <p className="text-xs text-muted-foreground">
        All community posts are public. Anyone can view shared recipes.
      </p>

      {/* Feed state */}
      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
      {isError && (
        <p className="text-sm text-destructive">
          Failed to load community feed.
        </p>
      )}

      {!isLoading && recipes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No posts yet. Be the first to create one!
        </p>
      )}

      {/* Main feed */}
      {recipes.length > 0 && (
        <div className="space-y-6">
          {/* Hero first post (full width) */}
          <CommunityPostCard
            recipe={recipes[0]}
            highlight
          />

          {/* Remaining posts in grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recipes.slice(1).map((post) => (
              <CommunityPostCard
                key={post._id}
                recipe={post}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Create Button */}
      <button
        onClick={() =>
          isLoggedIn ? setShowCreateModal(true) : toast("Login to post ✨")
        }
        className="fixed bottom-6 right-6 z-30 rounded-full px-4 py-2 
        bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5
        text-sm font-semibold flex items-center gap-2"
      >
        ➕ Share Recipe
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateRecipeModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          isSubmitting={createMutation.isPending}
        />
      )}
    </div>
  );
}

/* ==============================================================
   POST CARD (grid + hero)
============================================================== */

function CommunityPostCard({ recipe, highlight = false }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const queryClient = useQueryClient();

  const navigateUrl = `/p/${recipe._id}`;

  const initialLikes = recipe.likesCount ?? recipe.likes?.length ?? 0;

  const [userReaction, setUserReaction] = useState(null);
  const [reactionCounts, setReactionCounts] = useState(() =>
    initialLikes ? { "❤️": initialLikes } : {}
  );

  // LIKE mutation (toggle like on/off)
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(recipe._id),
    onSuccess: () => {
      queryClient.invalidateQueries(["community-recipes"]);
    },
  });

  // COMMENTS FETCH
  const { data: commentsData } = useQuery({
    queryKey: ["community-comments", recipe._id],
    queryFn: () => fetchCommunityComments(recipe._id),
  });

  const comments = commentsData?.comments || [];
  const commentsCount = commentsData?.commentsCount ?? comments.length;

  const firstComment = comments[0] || null;

  // COMMENT MUTATION
  const [commentText, setCommentText] = useState("");
  const commentMutation = useMutation({
    mutationFn: ({ id, text }) => addComment({ id, text }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries(["community-comments", recipe._id]);
      queryClient.invalidateQueries(["community-recipes"]);
    },
    onError: () => toast.error("Failed to add comment"),
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!isLoggedIn) return toast("Login to comment 💬");
    if (!commentText.trim()) return;

    commentMutation.mutate({
      id: recipe._id,
      text: commentText.trim(),
    });
  };

  // REACTION HANDLER (emoji bar)
  const handleSelectReaction = (emoji) => {
    if (!isLoggedIn) {
      toast("Login to react ❤️");
      return;
    }

    setUserReaction((prevEmoji) => {
      let newEmoji = emoji;

      setReactionCounts((prevCounts) => {
        const map = { ...prevCounts };

        // toggle off if same emoji clicked
        if (prevEmoji === emoji) {
          newEmoji = null;
        }

        if (prevEmoji) {
          map[prevEmoji] = Math.max(0, (map[prevEmoji] || 0) - 1);
          if (map[prevEmoji] === 0) delete map[prevEmoji];
        }
        if (newEmoji) {
          map[newEmoji] = (map[newEmoji] || 0) + 1;
        }

        return map;
      });

      // Sync "liked" ↔ "unliked" with backend
      const wasLiked = !!prevEmoji;
      const willBeLiked = !!newEmoji;
      if (wasLiked !== willBeLiked) {
        likeMutation.mutate();
      }

      return newEmoji;
    });
  };

  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, c) => sum + c,
    0
  );

  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // max 3 emojis

  const imgSrc =
    recipe.imageUrl ||
    `${import.meta.env.VITE_API_URL}/community/${recipe._id}/image`;

  return (
    <article
      className={`
        rounded-2xl border border-border bg-card text-card-foreground
        shadow-sm hover:shadow-xl hover:-translate-y-1
        transition overflow-hidden flex flex-col
        ${highlight ? "md:col-span-2 xl:col-span-3" : ""}
      `}
    >
      {/* TOP: author + date */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
            {recipe.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">
              {recipe.user?.name || "Anonymous"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {new Date(recipe.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <a
          href={navigateUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Open post ↗
        </a>
      </div>

      {/* IMAGE */}
      {imgSrc && (
        <a
          href={navigateUrl}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <img
            src={imgSrc}
            alt={recipe.title}
            className={`w-full object-cover ${
              highlight ? "h-72" : "h-56"
            }`}
          />
        </a>
      )}

      {/* BODY */}
      <div className="p-4 flex flex-col gap-3">
        {/* Title + description */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {recipe.description}
          </p>
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-muted rounded-full text-[11px]"
              >
                #{tag}
              </span>
            ))}
            {recipe.tags.length > 4 && (
              <span className="text-[11px] text-muted-foreground">
                +{recipe.tags.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* ACTION ROW: reactions + comment count + share */}
        <div className="flex items-center justify-between text-xs mt-1">
          {/* Reactions */}
          <ReactionBar
            userReaction={userReaction}
            reactionCounts={reactionCounts}
            totalReactions={totalReactions}
            topReactions={topReactions}
            onSelectReaction={handleSelectReaction}
            isLoggedIn={isLoggedIn}
          />

          {/* Comment count */}
          <span className="text-muted-foreground">
            💬 {commentsCount || 0} comment
            {commentsCount === 1 ? "" : "s"}
          </span>

          {/* Share */}
          <button
            onClick={async () => {
              const url = window.location.origin + navigateUrl;
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: recipe.title,
                    text: recipe.description,
                    url,
                  });
                } else {
                  await navigator.clipboard.writeText(url);
                  toast.success("Link copied! 🔗");
                }
              } catch {
                // ignore cancel
              }
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            🔗 Share
          </button>
        </div>

        {/* FIRST COMMENT PREVIEW */}
        <div className="mt-2 space-y-1">
          {firstComment && (
            <p className="text-sm">
              <span className="font-semibold text-foreground">
                {firstComment.user?.name || "User"}
              </span>{" "}
              <span className="text-muted-foreground">
                {firstComment.text}
              </span>
            </p>
          )}

          {!firstComment && commentsCount > 0 && (
            <p className="text-xs text-muted-foreground">
              View all {commentsCount} comments
            </p>
          )}
        </div>

        {/* INLINE COMMENT INPUT */}
        <form
          onSubmit={handleCommentSubmit}
          className="mt-2 flex items-center gap-2 text-sm"
        >
          <input
            type="text"
            placeholder={
              isLoggedIn ? "Add a comment…" : "Login to add a comment"
            }
            className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="submit"
            disabled={commentMutation.isPending}
            className="text-primary font-semibold disabled:opacity-60"
          >
            Post
          </button>
        </form>
      </div>
    </article>
  );
}

/* ==============================================================
   REACTION BAR (emoji picker + summary)
============================================================== */

function ReactionBar({
  userReaction,
  reactionCounts,
  totalReactions,
  topReactions,
  onSelectReaction,
  isLoggedIn,
}) {
  const [open, setOpen] = useState(false);

  const displayEmojis =
    topReactions.length > 0
      ? topReactions.map(([emoji]) => emoji).join(" ")
      : "";

  const handleMainClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      toast("Login to react ❤️");
      return;
    }
    // On mobile: toggle picker
    setOpen((prev) => !prev);
  };

  const handleEmojiClick = (e, emoji) => {
    e.stopPropagation();
    onSelectReaction(emoji);
    setOpen(false);
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Emoji picker bubble */}
      {open && (
        <div
          className="absolute -top-9 left-0 z-20 flex gap-1 px-2 py-1
                     rounded-full bg-card border border-border shadow-md"
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={(e) => handleEmojiClick(e, emoji)}
              className="text-lg hover:scale-110 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main reaction button */}
      <button
        type="button"
        onClick={handleMainClick}
        className="flex items-center gap-1 text-xs"
      >
        <span className="text-base">
          {userReaction ? userReaction : "🤍"}
        </span>
        <span className="text-muted-foreground">
          {displayEmojis && (
            <span className="mr-1 align-middle">{displayEmojis}</span>
          )}
          {totalReactions > 0 && <span>{totalReactions}</span>}
        </span>
      </button>
    </div>
  );
}

/* ==============================================================
   CREATE POST MODAL (unchanged behavior, new styling)
============================================================== */

function CreateRecipeModal({ onClose, onSubmit, isSubmitting, user }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [tagsText, setTagsText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !desc.trim()) {
      return toast.error("Title and description are required");
    }

    const ingredients = ingredientsText
      .split("\n")
      .map((i) => i.trim())
      .filter(Boolean);

    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      title: title.trim(),
      description: desc.trim(),
      imageFile,
      imageUrl: imageUrl.trim(),
      ingredients,
      steps,
      tags,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center">
      <div className="bg-card text-card-foreground rounded-3xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-5 py-3 border-b border-border flex justify-between items-center">
          <h2 className="text-sm font-semibold">Create Recipe</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground">
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-sm">
          <p className="text-xs text-muted-foreground">
            Posting as <span className="font-medium">{user?.name}</span>
          </p>

          {/* Image Picker */}
          <div className="space-y-2">
            <label className="block text-xs font-medium">Image</label>

            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="w-full h-56 rounded-2xl object-cover mb-2"
              />
            )}

            {!imageFile && imageUrl && (
              <img
                src={imageUrl}
                alt="preview"
                className="w-full h-56 rounded-2xl object-cover mb-2"
              />
            )}

            <div className="flex gap-2 text-xs">
              <label className="flex-1 cursor-pointer">
                <span className="block w-full text-center px-3 py-2 rounded-xl border border-border hover:bg-muted">
                  Upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                />
              </label>

              <input
                type="text"
                placeholder="Or paste image URL"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setImageFile(null);
                }}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Title *
            </label>
            <input
              type="text"
              className="w-full border border-border rounded-xl px-3 py-2 bg-background"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Creamy Garlic Chicken Pasta"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2 bg-background resize-none"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Write a short caption like on Instagram..."
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Ingredients (one per line)
            </label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2 bg-background resize-none"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder={"e.g.\n- 200g pasta\n- 2 cloves garlic\n- 1 cup cream"}
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Steps (one per line)
            </label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2 bg-background resize-none"
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder={"e.g.\n1. Boil pasta\n2. Sauté garlic\n3. Add cream"}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full border border-border rounded-xl px-3 py-2 bg-background"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. dinner, quick, high protein"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow hover:shadow-md hover:-translate-y-0.5 transition disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Posting…" : "Share with community"}
          </button>
        </form>
      </div>
    </div>
  );
}