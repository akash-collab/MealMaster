// src/pages/grocery/GroceryList.jsx
import React from "react";  
import { useEffect, useState,useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGroceryList, saveGroceryList } from "../../services/groceryService";

import { categorizeItem } from "../../utils/groceryCategories";
import { categoryIcons } from "../../utils/groceryCategoryIcons";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { DragOverlay } from "@dnd-kit/core";

import SortableItem from "../../components/SortableItem";

export default function GroceryList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["grocery-list"],
    queryFn: fetchGroceryList,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  // Add item state
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newUnit, setNewUnit] = useState("");

  // Load items
  useEffect(() => {
    if (data?.list?.items) {
      setItems(
        data.list.items.map((item) => ({
          ...item,
          _id: item._id || crypto.randomUUID(),
        }))
      );
    }
  }, [data]);

  // Group by categories
  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      const category = item.checked ? "Completed" : categorizeItem(item.name);
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const saveMutation = useMutation({
    mutationFn: (updatedItems) => saveGroceryList(updatedItems),
    onSuccess: () => queryClient.invalidateQueries(["grocery-list"]),
  });

  let saveTimeout;

  const updateAndSave = (arr) => {
    setItems(arr);

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveMutation.mutate(arr);
    }, 500);
  };

  // Add item
  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const item = {
      _id: crypto.randomUUID(),
      name: newName.trim(),
      quantity: newQty.trim() || "1",
      unit: newUnit.trim(),
      checked: false,
    };

    updateAndSave([...items, item]);
    setNewName("");
    setNewQty("");
    setNewUnit("");
  };

  const toggleChecked = (index) => {
    const updated = [...items];
    updated[index].checked = !updated[index].checked;
    updateAndSave(updated);
  };

  const removeItem = (index) => {
    updateAndSave(items.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    updateAndSave(items.filter((i) => !i.checked));
  };

  // Drag Handlers
  const onDragStart = (event) => {
    const item = items.find((i) => i._id === event.active.id);
    setActiveItem(item || null);
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);

    updateAndSave(arrayMove(items, oldIndex, newIndex));
  };

  const DragPreview = React.memo(({ item }) => {
    if (!item) return null;
    return (
      <div className="p-4 rounded-2xl bg-card border shadow-xl text-sm">
        <p className="font-semibold">{item.name}</p>
        <p className="text-muted-foreground">
          {item.quantity} {item.unit}
        </p>
      </div>
    );
  });

  if (isLoading) return <p className="text-muted-foreground p-6">Loading grocery list...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 text-foreground">

      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Grocery List</h1>
          <p className="text-muted-foreground text-sm">
            Organize your ingredients in a clean bento-style layout.
          </p>
        </div>

        {items.some((i) => i.checked) && (
          <button
            onClick={clearCompleted}
            className="px-4 py-2 rounded-full bg-destructive text-white shadow hover:bg-destructive/80 transition"
          >
            Clear Completed
          </button>
        )}
      </div>

      {/* ADD ITEM BAR */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col md:flex-row bg-card border border-border p-4 rounded-3xl shadow gap-3"
      >
        <input
          type="text"
          placeholder="Add item (e.g. Chicken Breast)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary"
        />

        <input
          type="number"
          placeholder="Qty"
          value={newQty}
          onChange={(e) => setNewQty(e.target.value)}
          className="w-20 border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary"
        />

        <select
          value={newUnit}
          onChange={(e) => setNewUnit(e.target.value)}
          className="w-28 border border-border rounded-xl px-3 py-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary"
        >
          <option value="">Unit</option>
          <option>kg</option>
          <option>g</option>
          <option>pcs</option>
          <option>cup</option>
          <option>L</option>
          <option>ml</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm shadow-md hover:bg-primary/90 transition"
        >
          + Add
        </button>
      </form>

      {/* BENTO GRID */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <DragOverlay>
          <DragPreview item={activeItem} />
        </DragOverlay>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {Object.entries(grouped).map(([category, itemsInCategory]) => {
            const Icon = categoryIcons[category] || categoryIcons.Other;

            return (
              <div
                key={category}
                className="rounded-3xl bg-card text-card-foreground border border-border shadow-sm hover:shadow-xl transition flex flex-col overflow-hidden"
              >
                {/* CATEGORY HEADER */}
                <div className="px-4 py-3 border-b border-border bg-muted flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Icon size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{category}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {itemsInCategory.length} item
                      {itemsInCategory.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* ITEMS */}
                <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                  <SortableContext
                    items={itemsInCategory.map((i) => i._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {itemsInCategory.map((item) => (
                      <SortableItem key={item._id} id={item._id}>
                        <div className="flex items-center justify-between bg-card border border-border p-3 rounded-2xl shadow-sm hover:shadow-md transition">

                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() =>
                                toggleChecked(items.findIndex((i) => i._id === item._id))
                              }
                              className="w-5 h-5"
                            />

                            <div>
                              <p
                                className={`text-sm font-semibold ${item.checked ? "line-through text-muted-foreground" : ""
                                  }`}
                              >
                                {item.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {item.quantity} {item.unit}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              removeItem(items.findIndex((i) => i._id === item._id))
                            }
                            className="text-destructive text-xs hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </SortableItem>
                    ))}
                  </SortableContext>
                </div>

              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}