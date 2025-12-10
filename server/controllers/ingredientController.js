export const getIngredients = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );

    const data = await response.json();
    const meal = data.meals?.[0];

    if (!meal) return res.status(404).json({ message: "Not found" });

    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (ing && ing.trim() !== "") {
        ingredients.push({
          name: ing.trim(),
          measure: measure?.trim() || "",
        });
      }
    }

    res.json({ ingredients });
  } catch (err) {
    console.error("Ingredient fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
};