// client/src/pages/profile/Profile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { getMyBookmarks } from "../../services/bookmarkService";
import { getMyPosts } from "../../services/communityService";
import BookmarkCard from "../../components/BookmarkCard";
import RecipeCard from "../../components/RecipeCard";

/**
 * Profile page — modern card-style UI with working:
 * - Edit profile (PUT /api/user/me)
 * - Change password (POST /api/user/change-password)
 * - Upload avatar (POST /api/user/avatar)
 * - Logout (POST /api/auth/logout) — optional call, local clearing always done
 *
 * NOTE: This expects backend routes mounted under /api (server).
 */

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  // fallback clearing function if store uses different API
  const clearAuth =
    useAuthStore((s) => s.logout) ||
    (() => {
      useAuthStore.setState({ user: null, accessToken: null });
    });
  const token = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  /* ------------------ BACKEND QUERIES ------------------ */
  const {
    data: bmData,
    isLoading: bmLoading,
    isError: bmError,
  } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: getMyBookmarks,
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  const bookmarks = bmData?.bookmarks || [];

  const {
    data: postsData,
    isLoading: postsLoading,
    isError: postsError,
  } = useQuery({
    queryKey: ["my-posts"],
    queryFn: getMyPosts,
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
  const myPosts = postsData?.posts || [];

  /* ------------------ RECENT VIEWS ------------------ */
  const [recentViews, setRecentViews] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentViews");
      const views = raw ? JSON.parse(raw) : [];
      if (Array.isArray(views)) setRecentViews(views);
    } catch {
      setRecentViews([]);
    }
  }, []);

  /* ------------------ DERIVED VALUES ------------------ */
  const achievements = useMemo(() => {
    const a = [];
    if (bookmarks.length > 0) a.push("⭐ First Bookmark");
    if (bookmarks.length >= 5) a.push("🔖 5+ Saved Posts");
    if (myPosts.length > 0) a.push("📝 First Post Shared");
    if (myPosts.length >= 5) a.push("🔥 5+ Posts Shared");
    return a;
  }, [bookmarks.length, myPosts.length]);

  const totalReactions = useMemo(
    () => myPosts.reduce((acc, p) => acc + (p.reactionsTotal || 0), 0),
    [myPosts]
  );

  /* ------------------ SETTINGS MUTATIONS ------------------ */
  // Edit profile (PUT /api/user/me)
  const editProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to update profile");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
      }
      queryClient.invalidateQueries(["bookmarks", "my-posts", "community-recipes"]);
      toast.success("Profile updated");
      closeEditModal();
    },
    onError: (err) => toast.error(err?.message || "Failed to update profile"),
  });

  // Change password (POST /api/user/change-password)
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to change password");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Password changed — logging out");
      // log out locally (server may also clear cookie)
      handleLogout();
    },
    onError: (err) => toast.error(err?.message || "Failed to change password"),
  });

  // Avatar upload (POST /api/user/avatar)
  const avatarMutation = useMutation({
    mutationFn: async (file) => {
      const token = useAuthStore.getState().accessToken;
      const form = new FormData();
      form.append("avatar", file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to upload avatar");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (user) {
        setUser({
          ...user,
          hasAvatar: true,
        });
      }
      queryClient.invalidateQueries(["bookmarks", "my-posts", "community-recipes"]);
      toast.success("Avatar updated");
    },
    onError: (err) => toast.error(err?.message || "Failed to upload avatar"),
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const token = useAuthStore.getState().accessToken;
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
      } catch {
        // ignore
      }
      return true;
    },
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Logged out");
    },
    onError: () => {
      clearAuth();
      toast.success("Logged out");
    },
  });

  /* ------------------ LOCAL UI STATE (modals) ------------------ */
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);
  const openChangePassword = () => setShowChangePassword(true);
  const closeChangePassword = () => setShowChangePassword(false);

  async function handleLogout() {
    logoutMutation.mutate();
  }

  /* ------------------ AVATAR INPUT REF ------------------ */
  const avatarInputRef = useRef(null);
  function onPickAvatar() {
    avatarInputRef.current?.click();
  }
  function onAvatarSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // simple client-side validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    avatarMutation.mutate(file);
  }

  /* ------------------ RENDER ------------------ */
  const avatarSrc = user?._id && user?.hasAvatar
  ? `${import.meta.env.VITE_API_URL}/user/avatar/${user._id}?t=${Date.now()}`
  : null;

  return (
    <div className="p-6 max-w-6xl mx-auto text-foreground space-y-10">
      {/* HEADERS */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white shadow-lg flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/8 flex items-center justify-center text-3xl font-extrabold overflow-hidden">
            {avatarSrc ? (
              // show avatar image
              <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{user?.name ? user.name[0].toUpperCase() : "U"}</span>
            )}
          </div>

          <button
            onClick={onPickAvatar}
            className="absolute -bottom-2 right-0 bg-white/10 px-2 py-1 rounded-full text-xs hover:bg-white/20 transition"
            title="Change photo"
          >
            Change photo
          </button>

          {/* hidden input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAvatarSelected}
          />
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user?.name ?? "Unknown User"}</h1>
          <p className="text-sm opacity-80">{user?.email ?? "No email"}</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={openEditModal}
              className="px-4 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20 transition"
            >
              Edit profile
            </button>
            <button
              onClick={openChangePassword}
              className="px-4 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20 transition"
            >
              Change password
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded-full text-sm hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* quick stats chip */}
        <div className="grid gap-2 text-center">
          <div className="px-4 py-2 rounded-xl bg-white/8">
            <div className="text-lg font-bold">{bookmarks.length}</div>
            <div className="text-xs opacity-80">Saved</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/8">
            <div className="text-lg font-bold">{myPosts.length}</div>
            <div className="text-xs opacity-80">Posts</div>
          </div>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Saved" value={bookmarks.length} gradient="from-indigo-500 to-purple-500" />
        <StatCard label="Posts" value={myPosts.length} gradient="from-emerald-500 to-teal-500" />
        <StatCard label="Reactions" value={totalReactions} gradient="from-amber-500 to-red-500" />
      </div>

      {/* GRID: Saved / My posts / Recently viewed */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Saved Posts */}
        <section className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Saved Posts ⭐</h3>
            <a href="/dashboard/bookmarks" className="text-xs text-primary hover:underline">View all</a>
          </div>

          {bmLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {bmError && <p className="text-sm text-destructive">Failed to load saved posts.</p>}
          {!bmLoading && bookmarks.length === 0 && <p className="text-sm text-muted-foreground">No saved posts yet.</p>}

          <div className="grid grid-cols-2 gap-3">
            {bookmarks.slice(0, 6).map((b) => (
              <BookmarkCard key={b.postId} bookmark={b} />
            ))}
          </div>
        </section>

        {/* My Posts */}
        <section className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Posts 👨‍🍳</h3>
            <a href="/dashboard/posts" className="text-xs text-primary hover:underline">Manage</a>
          </div>

          {postsLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {postsError && <p className="text-sm text-destructive">Failed to load your posts.</p>}
          {!postsLoading && myPosts.length === 0 && <p className="text-sm text-muted-foreground">You haven't shared anything yet.</p>}

          <div className="grid grid-cols-2 gap-3">
            {myPosts.slice(0, 6).map((p) => (
              <RecipeCard
                key={p._id}
                meal={{
                  id: p._id,
                  name: p.title,
                  image: p.imageUrl || `${import.meta.env.VITE_API_URL}/community/${p._id}/image`,
                }}
                linkTo={`/p/${p._id}`}
              />
            ))}
          </div>
        </section>

        {/* Recently Viewed / Achievements */}
        <aside className="rounded-2xl bg-card p-4 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="font-semibold mb-2">Recently Viewed 👀</h3>
            {recentViews.length === 0 && <p className="text-sm text-muted-foreground">No recent views.</p>}
            <div className="grid grid-cols-2 gap-2">
              {recentViews.slice(0, 6).map((id) => (
                <RecipeCard
                  key={id}
                  meal={{
                    id,
                    name: "Recipe",
                    image: `${import.meta.env.VITE_API_URL}/community/${id}/image`,
                  }}
                  linkTo={`/p/${id}`}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Achievements 🏅</h3>
            {achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No achievements yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {achievements.map((a) => (
                  <span key={a} className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-900 text-sm">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* MODALS */}
      {showEditModal && (
        <EditProfileModal
          initialName={user?.name || ""}
          initialEmail={user?.email || ""}
          onClose={closeEditModal}
          onSubmit={(payload) => editProfileMutation.mutate(payload)}
          isLoading={editProfileMutation.isLoading}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={closeChangePassword}
          onSubmit={(data) => changePasswordMutation.mutate(data)}
          isLoading={changePasswordMutation.isLoading}
        />
      )}
    </div>
  );
}

/* ------------------ Small presentational components ------------------ */

function StatCard({ label, value, gradient = "from-slate-600 to-slate-500" }) {
  return (
    <div className="rounded-2xl p-4 text-white shadow">
      <div className={`rounded-lg p-4 bg-gradient-to-br ${gradient}`}>
        <div className="text-xs opacity-90">{label}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </div>
    </div>
  );
}

/* ------------------ EditProfileModal ------------------ */
function EditProfileModal({ initialName, initialEmail, onClose, onSubmit, isLoading }) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    setName(initialName);
    setEmail(initialEmail);
  }, [initialName, initialEmail]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return toast.error("Name is required");
          onSubmit({ name: name.trim(), email: email.trim() });
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit profile</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground">✕</button>
        </div>

        <label className="block text-sm mb-2">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border" />
        </label>

        <label className="block text-sm mb-4">
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border" />
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-xl">
            {isLoading ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------ ChangePasswordModal ------------------ */
function ChangePasswordModal({ onClose, onSubmit, isLoading }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (!currentPassword || !newPassword) return toast.error("Both fields are required");
          if (newPassword.length < 6) return toast.error("New password should be at least 6 characters");
          onSubmit({ currentPassword, newPassword });
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Change password</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground">✕</button>
        </div>

        <label className="block text-sm mb-2">
          Current password
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border" />
        </label>

        <label className="block text-sm mb-4">
          New password
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-xl border" />
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary text-white rounded-xl">
            {isLoading ? "Saving…" : "Change"}
          </button>
        </div>
      </form>
    </div>
  );
}