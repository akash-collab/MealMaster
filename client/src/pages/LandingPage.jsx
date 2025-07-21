import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <header className="bg-white shadow-md py-2 px-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <img src="/logo.png" alt="MealMaster Logo" className="h-16 w-16 object-contain" />
                    <span className="text-lg sm:text-xl font-bold text-green-600 hidden sm:inline">MealMaster</span>
                </Link>
                <nav className="space-x-4 text-sm sm:text-base">
                    <Link to="/login" className="text-gray-700 hover:text-green-600">
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700"
                    >
                        Get Started
                    </Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-br from-green-200 via-green-100 to-white animate-fade-in">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-5">
                    Your Personal <span className="animate-pulse text-green-600">AI Meal Planner</span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mb-8 animate-fade-in delay-100">
                    Discover, plan, and track meals like never before. Smart suggestions powered by AI and
                    personalized nutrition insights tailored just for you.
                </p>
                <Link
                    to="/signup"
                    className="bg-green-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-md hover:bg-green-700 transition-all duration-300 animate-bounce-slow"
                >
                    Start Free Today
                </Link>
            </section>

            {/* Features Section */}
            <section className="bg-white py-14 px-6">
                <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
                    <FeatureCard
                        title="AI Meal Suggestions"
                        desc="Get personalized meal plans crafted by AI based on your preferences."
                    />
                    <FeatureCard
                        title="Track Your Nutrition"
                        desc="Monitor calories, macros, and nutrients daily with visual insights."
                    />
                    <FeatureCard
                        title="Save Your Favorites"
                        desc="Bookmark and easily access your go-to meals for quick planning."
                    />
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-green-50 py-12 text-center">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                    Join thousands mastering their meals.
                </h3>
                <Link
                    to="/signup"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700"
                >
                    Sign Up Now
                </Link>
            </section>

            {/* Footer */}
            <footer className="bg-white py-6 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} MealMaster. All rights reserved.
            </footer>
        </div>
    );
}

function FeatureCard({ title, desc }) {
    return (
        <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition">
            <h4 className="text-xl font-semibold text-green-600 mb-2">{title}</h4>
            <p className="text-gray-600">{desc}</p>
        </div>
    );
}