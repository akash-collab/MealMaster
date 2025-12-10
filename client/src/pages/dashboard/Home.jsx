import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";

export default function Home() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8 text-foreground">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome back, {user?.name || "Food Lover"} 👋
        </h1>

        <p className="text-muted-foreground mt-1">
          Here’s a quick look at your week.
        </p>
      </div>

      {/* QUICK ACTION CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <QuickActionCard
          title="Meal Planner"
          desc="Plan meals for the week"
          emoji="📅"
          to="/dashboard/planner"
        />
        <QuickActionCard
          title="Grocery List"
          desc="Generate ingredients & manage your list"
          emoji="🛒"
          to="/dashboard/grocery"
        />
        <QuickActionCard
          title="Browse Recipes"
          desc="Search 500+ meal ideas"
          emoji="🍲"
          to="/dashboard/recipes"
        />
      </section>

      {/* STATS ROW */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatTile label="Saved Recipes" value="12" />
        <StatTile label="Meals Planned This Week" value="7" />
        <StatTile label="Grocery Items" value="18" />
      </section>

      {/* RECOMMENDED SECTION */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Recommended for you 🍽️</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RecommendedCard
            img="https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg"
            title="Butter Chicken"
            area="Indian"
          />
          <RecommendedCard
            img="https://www.themealdb.com/images/media/meals/wrssvt1511556563.jpg"
            title="Chicken Alfredo"
            area="Italian"
          />
          <RecommendedCard
            img="https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
            title="Beef Stir Fry"
            area="Chinese"
          />
        </div>
      </section>
    </div>
  );
}

/* ------------------ QUICK ACTION CARD ------------------ */

function QuickActionCard({ title, desc, emoji, to }) {
  return (
    <Link
      to={to}
      className="
        block p-6 rounded-2xl border border-border 
        bg-card text-card-foreground 
        shadow-sm hover:shadow-lg hover:-translate-y-1 
        transition
      "
    >
      <div className="text-4xl mb-3">{emoji}</div>

      {/* Title always black in light, white in dark */}
      <h3 className="font-semibold text-lg truncate text-foreground">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground mt-1">{desc}</p>
    </Link>
  );
}

/* ------------------ STATS TILE ------------------ */

function StatTile({ label, value }) {
  return (
    <div
      className="
        p-6 rounded-2xl 
        bg-primary text-primary-foreground
        shadow flex flex-col items-start gap-1
      "
    >
      <span className="text-3xl font-extrabold">{value}</span>
      <span className="text-sm opacity-80">{label}</span>
    </div>
  );
}

/* ------------------ RECOMMENDED CARD ------------------ */

function RecommendedCard({ img, title, area }) {
  return (
    <div
      className="
        rounded-2xl overflow-hidden 
        bg-card text-card-foreground 
        shadow hover:shadow-xl transition cursor-pointer
      "
    >
      <img src={img} alt={title} className="h-40 w-full object-cover" />

      <div className="p-3">
        <h4 className="font-semibold text-sm text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{area} Cuisine</p>
      </div>
    </div>
  );
}