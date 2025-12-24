import { Link } from "react-router-dom";

export default function Launch() {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">

      {/* ================= HEADER ================= */}
      <header className="min-h-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 sm:px-10 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.webp" alt="MealMaster" className="h-9 w-9" />
          <span className="text-lg font-semibold">MealMaster</span>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 rounded-full border hover:bg-muted transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <main className="min-h-[calc(100svh-80px)] grid grid-cols-1 lg:grid-cols-2">

        {/* ---------- LEFT CONTENT ---------- */}
        <section className="flex flex-col justify-center px-10 lg:px-20 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-semibold leading-tight">
            Eat smarter.<br />
            Plan better.<br />
            <span className="text-primary">Powered by AI.</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-xl">
            Plan meals, track calories, manage groceries, and discover recipes —
            all in one intelligent platform.
          </p>

          <div className="flex gap-3 sm:ml-auto">
            <Link
              to="/register"
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
            >
              Start Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-full border"
            >
              Sign In
            </Link>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground pt-4">
            <span>Smart planning</span>
            <span>Live calories</span>
            <span>AI suggestions</span>
          </div>
        </section>

        {/* ---------- RIGHT VISUAL ---------- */}
        <section className="relative hidden lg:flex items-center justify-center -translate-y-8">

          {/* Floating calorie card */}
          <div className="absolute top-20 left-14 animate-[floatUp_7s_ease-in-out_infinite]">
            <div className="bg-card/90 border shadow-xl rounded-xl px-4 py-3 w-44 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground">Daily intake</p>
              <p className="text-xl font-semibold">1,820 kcal</p>
              <div className="mt-2 h-1 bg-muted rounded-full">
                <div className="h-full w-[92%] bg-primary rounded-full" />
              </div>
            </div>
          </div>

          {/* Floating recipe card */}
          <div className="absolute bottom-16 right-16 animate-[floatDown_8.5s_ease-in-out_infinite]">
            <div className="bg-card/90 border shadow-xl rounded-xl p-3 w-40 backdrop-blur-sm">
              <img
                src="/grilled.webp"
                alt="Grilled Chicken Bowl"
                className="h-16 w-full rounded-lg object-cover"
              />
              <p className="mt-2 text-xs font-medium truncate">
                Grilled Chicken Bowl
              </p>
              <p className="text-[11px] text-muted-foreground">
                480 kcal · High protein
              </p>
            </div>
          </div>

          {/* Hero image */}
          <img
            src="/hero.webp"
            alt="MealMaster AI Kitchen"
            className="relative z-10 w-[90%] max-w-180 rounded-3xl shadow-2xl object-cover animate-[floatMain_12s_ease-in-out_infinite]"
          />
        </section>
      </main>
    </div>
  );
}