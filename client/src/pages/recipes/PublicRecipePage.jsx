// src/pages/community/PublicRecipePage.jsx
import { useParams } from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import {
  fetchCommunityPost,
  addComment,
  reactToPost,
} from "../../services/communityService";
import { useState } from "react";
const EMOJI_OPTIONS = ["❤️", "🔥", "😋", "🤩", "👍", "👎"];

export default function PublicRecipePage() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const queryClient = useQueryClient();

  // Fetch public recipe
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-recipe", id],
    queryFn: () => fetchCommunityPost(id),
  });

  const [commentText, setCommentText] = useState("");
  const recipe = data?.recipe;

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ id, text }) => addComment({ id, text }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries(["public-recipe", id]);
      toast.success("Comment added!");
    },
    onError: () => toast.error("Failed to add comment"),
  });

  // Reaction mutation
  const reactMutation = useMutation({
    mutationFn: ({ id, emoji }) => reactToPost({ id, emoji }),
    onSuccess: () => {
      queryClient.invalidateQueries(["public-recipe", id]);
    },
    onError: () => toast.error("Failed to react"),
  });

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (isError || !recipe) return <p className="p-6">Recipe not found</p>;

  // ✅ Build reaction stats
  const reactions = recipe.reactions || [];
  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // [ [emoji, count], ... ]

  const totalReactions = reactions.length;

  const currentUserReaction =
    (user &&
      reactions.find((r) => r.user === user._id || r.user?._id === user._id)
        ?.emoji) ||
    null;

  // ✅ Comments (show latest first)
  const allComments = [...(recipe.comments || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const topComment = allComments[0];
  const otherComments = allComments.slice(1, 3); // show a couple more

  const handleReact = (emoji) => {
    if (!isLoggedIn) {
      toast("Login to react ❤️");
      return;
    }
    reactMutation.mutate({ id, emoji });
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast("Login to comment 💬");
      return;
    }
    if (!commentText.trim()) return;

    commentMutation.mutate({ id, text: commentText.trim() });
  };

  const imageSrc =
    recipe.imageUrl ||
    `${import.meta.env.VITE_API_URL}/community/${recipe._id}/image`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
              {(recipe.user?.name || "M")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {recipe.user?.name || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(recipe.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <span className="text-[11px] px-3 py-1 rounded-full bg-muted text-muted-foreground">
            Community post
          </span>
        </header>

        {/* CARD */}
        <article className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
          {/* IMAGE */}
          {imageSrc && (
            <img
              src={imageSrc}
              alt={recipe.title}
              className="w-full max-h-[420px] object-cover"
            />
          )}

          {/* BODY */}
          <div className="p-4 space-y-4">
            {/* Title + description */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold">
                {recipe.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* Tags */}
            {recipe.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-muted text-[11px] font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Ingredients */}
            {recipe.ingredients?.length > 0 && (
              <section className="mt-2 space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Ingredients
                </h2>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Steps */}
            {recipe.steps?.length > 0 && (
              <section className="mt-3 space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Steps
                </h2>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                  {recipe.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </section>
            )}

            {/* REACTION BAR */}
            <section className="mt-4 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-3">
                {/* Emoji picker + summary */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Emoji picker */}
                  <div className="inline-flex flex-col sm:flex-row sm:items-center gap-1">
                    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReact(emoji)}
                          className={`text-xl leading-none transition transform hover:-translate-y-0.5 ${
                            currentUserReaction === emoji ? "scale-110" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Tap to react • tap again to remove.
                    </p>
                  </div>

                  {/* Top reactions */}
                  {topReactions.length > 0 && (
                    <div className="inline-flex items-center gap-2 text-sm">
                      <div className="flex -space-x-1">
                        {topReactions.map(([emoji], idx) => (
                          <span
                            key={emoji}
                            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs border border-border relative z-10"
                            style={{ zIndex: 10 - idx }}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {totalReactions} reaction
                        {totalReactions !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Share button */}
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied!");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  🔗 Share
                </button>
              </div>
            </section>

            {/* TOP COMMENT */}
            <section className="mt-4 space-y-2">
              <h2 className="text-sm font-semibold">Comments</h2>

              {topComment ? (
                <div className="space-y-2">
                  {/* Pinned latest comment */}
                  <div className="rounded-2xl bg-muted/60 px-3 py-2 text-sm">
                    <p className="text-xs font-semibold">
                      {topComment.user?.name || "User"}
                    </p>
                    <p>{topComment.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(topComment.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* A couple more comments */}
                  {otherComments.map((c) => (
                    <div
                      key={c._id}
                      className="border-b border-border pb-2 mb-2 text-sm"
                    >
                      <p className="text-xs font-semibold">
                        {c.user?.name || "User"}
                      </p>
                      <p>{c.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(c.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No comments yet. Be the first to say something!
                </p>
              )}

              {/* COMMENT INPUT */}
              <form
                onSubmit={handleSubmitComment}
                className="mt-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isLoggedIn
                      ? "Add a comment…"
                      : "Login to add a comment"
                  }
                  className="
                    flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm
                    focus:outline-none focus:ring-1 focus:ring-primary
                  "
                  disabled={!isLoggedIn || commentMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={!isLoggedIn || commentMutation.isPending}
                  className="
                    text-sm font-semibold text-primary
                    disabled:opacity-60
                  "
                >
                  Post
                </button>
              </form>
            </section>
          </div>
        </article>
      </main>
    </div>
  );
}