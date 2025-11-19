import React, { useState } from "react";
import { motion } from "framer-motion";

const categories = ["Food", "Housing", "Utilities", "Transport", "Entertainment", "Other"];

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState(expense.category || "Other");
  const [shared, setShared] = useState(expense.shared || false);
  const [date, setDate] = useState(expense.date?.split("T")[0] || "");

  const handleSave = () => {
    onEdit({
      ...expense,
      title,
      amount: parseFloat(amount),
      category,
      shared,
      date,
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[#FFF7F2]">
        <div className="text-[#FF6A00] font-bold">
          {category[0] || "E"}
        </div>
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input
              className="border rounded p-1 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              type="number"
              className="border rounded p-1 text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <select
              className="border rounded p-1 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="border rounded p-1 text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={shared}
                onChange={(e) => setShared(e.target.checked)}
              />
              Shared
            </label>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="font-medium">{expense.title}</div>
              <div className="text-sm text-gray-600">
                {expense.date?.split("T")[0]}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {expense.category} • {expense.shared ? "Shared" : "Personal"}
            </div>
          </>
        )}
      </div>

      <div className="font-semibold">
        ₹{parseFloat(isEditing ? amount : expense.amount).toFixed(2)}
      </div>

      <div className="flex flex-col gap-1">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="text-green-500 text-xs font-semibold"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500 text-xs font-semibold"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-white bg-orange-600 px-2 py-1 text-xs rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(expense._id)}   // FIXED
              className="text-white bg-black px-2 py-1 text-xs rounded"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
