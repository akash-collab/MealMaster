export const categorizeIngredient = (name) => {
  const n = name.toLowerCase();

  if (/tomato|onion|potato|carrot|spinach|lettuce|broccoli/.test(n))
    return "produce";

  if (/chicken|beef|mutton|pork|fish|egg/.test(n))
    return "protein";

  if (/milk|cheese|butter|yogurt|cream/.test(n))
    return "dairy";

  if (/rice|flour|bread|pasta|noodles|wheat/.test(n))
    return "staples";

  if (/salt|pepper|cumin|turmeric|masala|spice/.test(n))
    return "spices";

  return "others";
};

export const CATEGORY_LABELS = {
  produce: "🥬 Produce",
  protein: "🍗 Proteins",
  dairy:   "🥛 Dairy",
  staples: "🍚 Staples",
  spices:  "🌶 Spices",
  others:  "🧺 Others",
  done:    "✔ Completed",
};