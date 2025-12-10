import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "transform 0.15s ease-out" : transition,
    zIndex: isDragging ? 99 : "auto",
    opacity: isDragging ? 0.7 : 1,
    scale: isDragging ? "1.03" : "1",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`sortable-item ${isDragging ? "dragging" : ""}`}
    >
      {children}
    </div>
  );
}