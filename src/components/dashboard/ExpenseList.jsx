import React, { useRef, useState, useEffect } from "react";
import ExpenseCard from "../ExpenseCard";

export default function ExpenseList({ expenses = [], onEdit, onDelete, visibleCount = 5 }) {
  const containerRef = useRef(null);
  const [cardHeight, setCardHeight] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const firstCard = containerRef.current.querySelector(".expense-card");
      if (firstCard) {
        setCardHeight(firstCard.offsetHeight);
      }
    }
  }, [expenses]);

  if (!expenses.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow text-sm text-[#6F6F6F]">
        No expenses yet
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl p-4 shadow overflow-y-auto"
      style={{
        maxHeight: cardHeight ? `${cardHeight * visibleCount}px` : "auto",
      }}
    >
      <div className="grid md:grid-cols-2 gap-4">
        {expenses.map((e) => (
          <div key={e.id} className="expense-card">
            <ExpenseCard expense={e} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}
