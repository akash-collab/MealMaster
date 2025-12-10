export const normalizeIngredientName = (name) => {
  return name
    .toLowerCase()
    .replace(/s$/, "")
    .replace(/[^\w\s]/g, "") 
    .trim();
};