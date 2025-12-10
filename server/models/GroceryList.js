import mongoose from "mongoose";

const groceryListSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        name: String,
        quantity: String,
        unit: String,
        checked: { type: Boolean, default: false },
        _id: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("GroceryList", groceryListSchema);