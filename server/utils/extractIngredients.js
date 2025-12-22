export function extractIngredients(recipe) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const name = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    if (name && name.trim()) {
      ingredients.push({
        name: name.trim(),
        quantity: measure?.trim() || "to taste",
      });
    }
  }

  return ingredients;
}