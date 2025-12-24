// client/src/pages/community/CommunityRecipes.jsx
import React, { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import * as ReactWindow from "react-window";
const { VariableSizeList: List } = ReactWindow;
import {
  fetchCommunityRecipes,
  createCommunityRecipe,
  reactToPost,
  addComment,
  fetchCommunityComments,
  fetchCommunityPost,
} from "../../services/communityService";
import { useAuthStore } from "../../store/authStore";
import { toggleBookmark } from "../../services/bookmarkService";

const EMOJI_OPTIONS = ["❤️", "😂", "😍", "🤤", "🔥", "😢"];

export default function CommunityRecipes() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const queryClient = useQueryClient();

  const [sort, setSort] = useState("new");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openPost, setOpenPost] = useState(null);

  const {
    data: feedData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["community-recipes", sort],
    queryFn: () => fetchCommunityRecipes(sort),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 2,     // 2 minutes
    cacheTime: 1000 * 60 * 10,    // 10 minutes
    refetchOnWindowFocus: false,
  });

  const recipes = feedData?.recipes || [];

  /* CREATE POST */
  const createMutation = useMutation({
    mutationFn: createCommunityRecipe,
    onSuccess: (data) => {
      toast.success("Shared with community 🎉");
      queryClient.setQueryData(
        ["community-recipes", sort],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            recipes: [data.recipe, ...old.recipes],
          };
        }
      );
      setShowCreateModal(false);
    },
    onError: () => toast.error("Failed to share recipe"),
  });

  // REACT mutation (shared)
  const reactMutation = useMutation({
    mutationFn: reactToPost,
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["community-recipes", sort],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            recipes: old.recipes.map((r) =>
              r._id === variables.id
                ? { ...r, reactionCounts: data.reactionCounts }
                : r
            ),
          };
        }
      );
    },
  });

  // BOOKMARK mutation (shared)
  const bookmarkMutation = useMutation({
    mutationFn: toggleBookmark,
  });

  const handleOpenPost = React.useCallback((post) => {
    setOpenPost(post);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Community Recipes 👨‍🍳</h1>
          <p className="text-sm text-muted-foreground">Scroll through posts from the MealMaster community.</p>
        </div>

        <div className="inline-flex rounded-full border border-border bg-card p-1 text-xs">
          {["trending", "new"].map((key) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={`px-3 py-1 rounded-full transition ${sort === key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
            >
              {key === "trending" ? "🔥 Trending" : "🆕 New"}
            </button>
          ))}
        </div>
      </header>

      <p className="text-xs text-muted-foreground">All posts are public. Anyone can view shared recipes.</p>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {isError && <p className="text-sm text-destructive">Failed to load community feed.</p>}
      {!isLoading && recipes.length === 0 && <p className="text-sm text-muted-foreground">No posts yet. Be the first to share one!</p>}


      {recipes.length > 0 && (
        <VirtualizedFeed
          recipes={recipes}
          onOpenPost={handleOpenPost}
          reactMutation={reactMutation}
          bookmarkMutation={bookmarkMutation}
        />
      )}

      {/* Floating create button */}
      <button
        onClick={() => (isLoggedIn ? setShowCreateModal(true) : toast("Login to post ✨"))}
        className="fixed bottom-6 right-6 z-30 rounded-full px-4 py-2 bg-primary text-primary-foreground shadow-lg text-sm font-semibold flex items-center gap-2"
      >
        ➕ Share Recipe
      </button>

      {showCreateModal && (
        <CreateRecipeModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
          isSubmitting={createMutation.isLoading}
        />
      )}

      {openPost && (
        <PostModal
          recipe={openPost}
          onClose={() => setOpenPost(null)}
        />
      )}
    </div>
  );
}

function VirtualizedFeed({ recipes, onOpenPost, reactMutation, bookmarkMutation }) {
  const getItemSize = (index) => {
    if (index === 0) return 460;
    return 380;
  };

  const Row = ({ index, style }) => {
    const recipe = recipes[index];

    return (
      <div style={style} className="p-2">
        <CommunityPostCard
          recipe={recipe}
          highlight={index === 0}
          onOpenPost={onOpenPost}
          reactMutation={reactMutation}
          bookmarkMutation={bookmarkMutation}
        />
      </div>
    );
  };

  return (
    <List
      height={window.innerHeight - 220}
      itemCount={recipes.length}
      itemSize={getItemSize}
      width="100%"
    >
      {Row}
    </List>
  );
}

/* ------------------------- CommunityPostCard ------------------------- */
const CommunityPostCard = React.memo(function CommunityPostCard({ recipe, highlight, onOpenPost, reactMutation, bookmarkMutation, }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const [bookmarked, setBookmarked] = useState(recipe.isBookmarked || false);
  const reactionCounts = recipe.reactionCounts || {};
  const commentsCount = recipe.commentsCount ?? recipe.comments?.length ?? 0;
  const imgSrc = recipe.imageUrl || `${import.meta.env.VITE_API_URL}/community/${recipe._id}/image`;

  const handleSelectReaction = (emoji) => {
    if (!isLoggedIn) return toast("Login to react ❤️");
    reactMutation.mutate({ id: recipe._id, emoji });
  };

  return (
    <article
      onClick={() => onOpenPost && onOpenPost(recipe)}
      className={`rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-xl hover:-translate-y-1 transition overflow-hidden cursor-pointer ${highlight ? "md:col-span-2 xl:col-span-3" : ""}`}
    >
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
            {recipe.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="text-sm font-semibold">{recipe.user?.name || "Anonymous"}</div>
            <div className="text-[12px] text-muted-foreground">{new Date(recipe.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            bookmarkMutation.mutate(recipe._id, {
              onSuccess: (data) => setBookmarked(data.bookmarked),
            });
          }}
          className="text-xl hover:scale-110 transition"
        >
          {bookmarked ? "⭐" : "☆"}
        </button>
      </div>
      {imgSrc && (
        <div role="button" onClick={() => onOpenPost(recipe)}>
          <img
            src={imgSrc}
            loading="lazy"
            decoding="async"
            alt={recipe.title}
            onError={(e) => (e.currentTarget.style.display = "none")}
            className={`w-full object-cover ${highlight ? "h-72" : "h-56"}`}
          />
        </div>
      )}

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{recipe.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">{recipe.description}</p>

        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 4).map((t) => (
              <span key={t} className="px-2 py-0.5 bg-muted rounded-full text-[11px]">#{t}</span>
            ))}
            {recipe.tags.length > 4 && (
              <span className="text-[11px] text-muted-foreground">+{recipe.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* ACTIONS ROW — ADD SHARE LINK HERE */}
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-5">
            <ReactionBar
              reactionCounts={reactionCounts}
              onSelectReaction={handleSelectReaction}
              showCount
            />

            {/* Comment link */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPost(recipe);
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="text-lg">💬</span>
              <span className="font-semibold">{commentsCount}</span>
            </button>

            {/* ⭐ ADDED SHARE LINK (beside Comment) ⭐ */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = window.location.origin + `/p/${recipe._id}`;
                navigator.clipboard.writeText(url).then(() => toast.success("Link copied!"));
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="text-lg">🔗</span>
              <span>Share</span>
            </button>

          </div>

          <span className="text-xs text-muted-foreground">Tap to open</span>
        </div>

        {recipe.comments?.length > 0 && (
          <div className="mt-2">
            <span className="font-semibold text-sm">{recipe.comments[0].user?.name || "User"}</span>{" "}
            <span className="text-muted-foreground">{recipe.comments[0].text}</span>
          </div>
        )}

      </div>
    </article>
  );
});

/* --------------- POST MODAL --------------- */
function PostModal({ recipe, onClose }) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;
  const queryClient = useQueryClient();
  const reactionCounts = recipe.reactionCounts || {};
  const [serverData, setServerData] = useState(null);
  const [bookmarked, setBookmarked] = useState(recipe.isBookmarked || false);

  useQuery({
    queryKey: ["community-post", recipe._id],
    queryFn: () => fetchCommunityPost(recipe._id),
    onSuccess: (res) => {
      setServerData(res.recipe || recipe);
    },
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: false,
  });

  const userReaction = serverData?.userReaction;

  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: ["community-comments", recipe._id],
    queryFn: () => fetchCommunityComments(recipe._id),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const comments = commentsData?.comments || [];
  const commentsCount = commentsData?.commentsCount ?? comments.length;

  const reactMutation = useMutation({
    mutationFn: reactToPost,
    onSuccess: (res) => {
      setServerData((prev) => ({
        ...prev,
        reactionCounts: res.reactionCounts,
        userReaction: res.userReaction,
      }));
    },
  });

  const commentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries(["community-comments", recipe._id]);
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(recipe._id),
    onSuccess: (data) => {
      setBookmarked(data.bookmarked);
      queryClient.invalidateQueries(["community-post", recipe._id]);
    },
  });

  const imgSrc = recipe.imageUrl || `${import.meta.env.VITE_API_URL}/community/${recipe._id}/image`;

  return (
    <div
      className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card text-card-foreground w-full max-w-6xl rounded-3xl grid md:grid-cols-2 overflow-hidden max-h-[90vh]">
        <div className="bg-black/5 flex items-center justify-center">
          {imgSrc && (
            <img src={imgSrc} loading="lazy"
              decoding="async" className="w-full h-full object-cover" alt={recipe.title} />
          )}
        </div>

        <div className="flex flex-col">
          <div className="p-6 border-b flex justify-between">
            <div>
              <div className="text-lg font-semibold">{recipe.user?.name}</div>
              <div className="text-sm text-muted-foreground">{new Date(recipe.createdAt).toLocaleString()}</div>
            </div>
            <button onClick={onClose}>✕</button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">{recipe.title}</h2>
            <p className="text-sm mb-4">{recipe.description}</p>

            {/* TAGS */}
            {recipe.tags?.length > 0 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {recipe.tags.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 bg-muted rounded-full text-xs"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* INGREDIENTS */}
            {recipe.ingredients?.length > 0 && (
              <section className="mb-5">
                <h3 className="text-lg font-semibold mb-1">Ingredients</h3>
                <ul className="list-disc ml-5 space-y-1 text-sm">
                  {recipe.ingredients.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* STEPS */}
            {recipe.steps?.length > 0 && (
              <section className="mb-3">
                <h3 className="text-lg font-semibold mb-1">Steps</h3>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                  {recipe.steps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          {/* ACTIONS */}
          <div className="px-6 py-4 border-b flex gap-6 items-center">
            <ReactionBar
              reactionCounts={reactionCounts}
              userReaction={userReaction}
              onSelectReaction={(emoji) => {
                reactMutation.mutate({ id: recipe._id, emoji });
              }}
            />

            <span className="flex items-center gap-2 text-sm">
              💬 Comments <b>{commentsCount}</b>
            </span>

            <button
              className="flex items-center gap-2 text-sm"
              onClick={() => {
                const url = window.location.origin + `/p/${recipe._id}`;
                navigator.clipboard.writeText(url).then(() => toast.success("Link copied!"));
              }}
            >
              🔗 Share
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                bookmarkMutation.mutate(recipe._id, {
                  onSuccess: (data) => setBookmarked(data.bookmarked),
                });
              }}
              className="text-xl hover:scale-110 transition"
            >
              {bookmarked ? "⭐" : "☆"}
            </button>
          </div>

          {/* COMMENTS */}
          <div className="p-6 border-t max-h-56 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-3">
              Comments ({commentsCount})
            </h3>
            {loadingComments ? (
              <p className="text-sm text-muted-foreground">Loading comments…</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c._id} className="mb-3 border-b pb-2">
                  <div className="font-semibold">{c.user?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm mt-1">{c.text}</div>
                </div>
              ))
            )}

            <CommentInputForModal
              recipeId={recipe._id}
              onPosted={() => {
                queryClient.invalidateQueries(["community-comments", recipe._id]);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
const ReactionBar = React.memo(function ReactionBar({ reactionCounts = {}, onSelectReaction }) {
  const entries = Object.entries(reactionCounts || {});
  const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 3);
  const total = entries.reduce((s, [, c]) => s + c, 0);
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {open && (
        <div className="absolute -top-14 left-0 z-50 flex gap-2 px-3 py-2 rounded-full bg-card border shadow-lg">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => {
                e.stopPropagation();
                onSelectReaction?.(emoji);
                setOpen(false);
              }}
              className="text-xl hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <span>{top.map(([e]) => e).join(" ") || "🤍"}</span>
        {total > 0 && <span className="text-xs">{total}</span>}
      </button>
    </div>
  );
});

/* ------------------------- Modal Comment Input ------------------------- */
function CommentInputForModal({ recipeId, onPosted }) {
  const [text, setText] = useState("");
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      setText("");
      onPosted();
      queryClient.invalidateQueries(["community-comments", recipeId]);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!user) return toast("Login to comment");
        if (!text.trim()) return;
        mutation.mutate({ id: recipeId, text });
      }}
      className="flex items-center gap-3"
    >
      <input
        className="flex-1 rounded-full border px-4 py-2 text-sm"
        placeholder="Add a comment…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="text-primary font-semibold">Post</button>
    </form>
  );
}

/* ------------------------- CreateRecipeModal ------------------------- */
function CreateRecipeModal({ user, onClose, onSubmit, isSubmitting }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [tagsText, setTagsText] = useState("");

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-card rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-4 border-b flex justify-between">
          <h2 className="text-sm font-semibold">Create Recipe</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !desc.trim())
              return toast.error("Title and description required");

            onSubmit({
              title,
              description: desc,
              imageFile,
              imageUrl,
              ingredients: ingredientsText.split("\n").map((x) => x.trim()).filter(Boolean),
              steps: stepsText.split("\n").map((x) => x.trim()).filter(Boolean),
              tags: tagsText.split(",").map((x) => x.trim()).filter(Boolean),
            });
          }}
          className="p-5 space-y-4"
        >
          <p className="text-xs text-muted-foreground">
            Posting as <b>{user?.name}</b>
          </p>

          {/* image upload */}
          <div>
            <label className="text-xs">Image</label>

            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                loading="lazy"
                decoding="async"
                className="w-full h-56 object-cover rounded-2xl my-2"
              />
            )}

            {!imageFile && imageUrl && (
              <img src={imageUrl} loading="lazy"
                decoding="async" className="w-full h-56 object-cover rounded-2xl my-2" />
            )}

            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="border rounded-xl text-center py-2 text-xs">
                  Upload Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </label>

              <input
                className="flex-1 border rounded-xl px-3 py-2 text-xs"
                placeholder="Or paste image URL"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setImageFile(null);
                }}
              />
            </div>
          </div>

          {/* title */}
          <div>
            <label className="text-xs">Title *</label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* desc */}
          <div>
            <label className="text-xs">Description *</label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-sm"
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* rest */}
          <div>
            <label className="text-xs">Ingredients (one per line)</label>
            <textarea
              rows={3}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs">Steps (one per line)</label>
            <textarea
              rows={3}
              className="w-full border rounded-xl px-3 py-2 text-sm"
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs">Tags (comma separated)</label>
            <input
              className="w-full border rounded-xl px-3 py-2 text-sm"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-full mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting…" : "Share with community"}
          </button>
        </form>
      </div>
    </div>
  );
}