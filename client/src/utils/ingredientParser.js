export function extractIngredients(meal) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ing && ing.trim() !== "") {
      ingredients.push({
        name: ing.trim(),
        quantity: measure?.trim() || "",
        checked: false,
        _id: crypto.randomUUID(),
      });
    }
  }

  return ingredients;
}