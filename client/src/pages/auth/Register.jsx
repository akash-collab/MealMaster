// client/src/pages/auth/Register.jsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { saveOnboarding } from "../../services/userService";
import toast from "react-hot-toast";

const STEPS = {
  ACCOUNT: 0,
  DIET: 1,
  ALLERGIES: 2,
  CUISINE: 3,
  CALORIES: 4,
};

function MultiSelect({ options, selected, setSelected }) {
  const toggle = (opt) => {
    setSelected(
      selected.includes(opt)
        ? selected.filter((x) => x !== opt)
        : [...selected, opt]
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`
              px-4 py-2 rounded-xl border text-sm transition font-medium
              ${active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-neutral-300 dark:border-neutral-700 hover:bg-muted"
              }
            `}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function Register() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const setUser = useAuthStore((s) => s.setUser);

  const isOAuth = Boolean(user?.oauthProvider && !user.onboardingCompleted);

  const [step, setStep] = useState(isOAuth ? STEPS.DIET : STEPS.ACCOUNT);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [dietPreferences, setDietPreferences] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);

  const mutation = useMutation({
    mutationFn: isOAuth ? saveOnboarding : registerUser,
    onSuccess: (data) => {
      if (isOAuth && data?.user) {
        setUser(data.user);
        window.location.href = "/dashboard";
        return;
      }

      if (data?.user && data?.accessToken) {
        loginSuccess(data.user, data.accessToken);
        window.location.href = "/dashboard";
      }
    },
    onError: () => toast.error("Registration failed"),
  });

  const submit = () => {
    const payload = { dietPreferences, allergies, cuisinePreferences, calorieGoal };
    mutation.mutate(isOAuth ? payload : { ...form, ...payload });
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* LEFT PANEL */}
      <div
        className="hidden md:flex relative items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/img-1.png')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-12 text-white">
          <h1 className="text-5xl font-extrabold mb-16">
            Welcome to MealMaster
          </h1>
          <p className="text-lg text-white/90">
            Smart meal planning, personalized nutrition, and AI-powered
            recommendations — built just for you.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center px-6 bg-white dark:bg-neutral-950">
        <div className="w-full max-w-md space-y-8">

          {/* STEP 1 — EMAIL SIGNUP ONLY */}
          {step === STEPS.ACCOUNT && (
            <>
              <h2 className="text-3xl font-bold">Create your account</h2>

              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <Input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />

              <Input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <Button className="w-full" onClick={() => setStep(STEPS.DIET)}>
                Continue
              </Button>

              {/* GOOGLE SIGNUP */}
              <button
                type="button"
                onClick={() =>
                  (window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`)
                }
                className="
                  w-full mt-3 border py-2.5 rounded-xl flex items-center justify-center gap-2
                  border-neutral-300 dark:border-neutral-700
                  bg-neutral-50 dark:bg-neutral-800
                "
              >
                <img src="/google.svg" className="w-5" alt="google" />
                Continue with Google
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === STEPS.DIET && (
            <>
              <h2 className="text-2xl font-bold">Diet Preferences</h2>
              <MultiSelect
                options={["Vegetarian", "Vegan", "Keto", "Paleo", "Low-Carb"]}
                selected={dietPreferences}
                setSelected={setDietPreferences}
              />
              <NavButtons back={() => setStep(STEPS.ACCOUNT)} next={() => setStep(STEPS.ALLERGIES)} />
            </>
          )}

          {/* STEP 3 */}
          {step === STEPS.ALLERGIES && (
            <>
              <h2 className="text-2xl font-bold">Allergies</h2>
              <MultiSelect
                options={["Peanuts", "Dairy", "Soy", "Gluten", "Seafood"]}
                selected={allergies}
                setSelected={setAllergies}
              />
              <NavButtons back={() => setStep(STEPS.DIET)} next={() => setStep(STEPS.CUISINE)} />
            </>
          )}

          {/* STEP 4 */}
          {step === STEPS.CUISINE && (
            <>
              <h2 className="text-2xl font-bold">Favorite Cuisines</h2>
              <MultiSelect
                options={["Indian", "Italian", "Mexican", "Chinese", "Thai", "American"]}
                selected={cuisinePreferences}
                setSelected={setCuisinePreferences}
              />
              <NavButtons back={() => setStep(STEPS.ALLERGIES)} next={() => setStep(STEPS.CALORIES)} />
            </>
          )}

          {/* STEP 5 — CALORIE GOAL */}
          {step === STEPS.CALORIES && (
            <>
              <h2 className="text-2xl font-bold">Daily Calorie Goal</h2>

              <p className="text-sm text-muted-foreground mb-4">
                This helps us personalize your meal plans.
              </p>

              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1000}
                  max={5000}
                  step={50}
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  kcal / day
                </span>
              </div>

              <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
                <button onClick={() => setCalorieGoal(1800)} className="underline">
                  1800
                </button>
                <button onClick={() => setCalorieGoal(2000)} className="underline">
                  2000
                </button>
                <button onClick={() => setCalorieGoal(2200)} className="underline">
                  2200
                </button>
                <button onClick={() => setCalorieGoal(2500)} className="underline">
                  2500
                </button>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(STEPS.CUISINE)}
                  className="text-sm underline"
                >
                  Back
                </button>
                <Button onClick={submit}>
                  {mutation.isPending ? "Saving…" : "Finish & Enter"}
                </Button>
              </div>
            </>
          )}

          {/* ✅ LOGIN LINK (Issue-1 fixed) */}
          <p className="text-center text-sm pt-4">
            Already have an account?{" "}
            <a href="/login" className="text-primary ml-1">
              Login
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}

function NavButtons({ back, next }) {
  return (
    <div className="flex justify-between mt-6">
      <button onClick={back} className="text-sm underline">
        Back
      </button>
      <Button onClick={next}>Continue</Button>
    </div>
  );
}