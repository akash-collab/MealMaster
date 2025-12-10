import { create } from "zustand";

export const usePlannerStore = create((set) => ({
  selectedMeals: {},

  setMeal: (day, mealType, recipe) =>
    set((state) => ({
      selectedMeals: {
        ...state.selectedMeals,
        [day]: {
          ...state.selectedMeals[day],
          [mealType]: recipe,
        },
      },
    })),
}));