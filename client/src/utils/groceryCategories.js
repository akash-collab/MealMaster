export function categorizeItem(name) {
  const item = name.toLowerCase();

  if (["tomato", "onion", "potato", "carrot", "spinach", "lettuce", "broccoli"].some(v => item.includes(v)))
    return "Vegetables";

  if (["apple", "banana", "orange", "grape", "mango"].some(v => item.includes(v)))
    return "Fruits";

  if (["chicken", "fish", "prawn", "egg", "beef", "mutton"].some(v => item.includes(v)))
    return "Meat & Seafood";

  if (["milk", "cheese", "yogurt", "butter", "paneer"].some(v => item.includes(v)))
    return "Dairy & Eggs";

  if (["rice", "wheat", "pasta", "noodles", "oats"].some(v => item.includes(v)))
    return "Grains & Rice";

  if (["salt", "pepper", "turmeric", "cumin", "masala"].some(v => item.includes(v)))
    return "Spices & Herbs";

  if (["chips", "biscuits", "cookies", "chocolate"].some(v => item.includes(v)))
    return "Snacks";

  if (["bread", "bun", "cake", "roll"].some(v => item.includes(v)))
    return "Bakery";

  if (["water", "juice", "soda", "coffee", "tea"].some(v => item.includes(v)))
    return "Beverages";

  return "Other";
}