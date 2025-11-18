import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#FF6A00", "#FFD6B8", "#F0F0F0", "#FFA86B", "#6C63FF", "#00C49F"];

export default function Insights() {
  const [expenses, setExpenses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("expenses");
    const data = saved ? JSON.parse(saved) : [];
    setExpenses(data);
    updateCategoryData(data);
    updateWeeklyData(data);
  }, []);

  /** Summarize expenses by category */
  const updateCategoryData = (data) => {
    const categoryMap = {};
    data.forEach((e) => {
      const cat = e.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount || 0);
    });
    const total = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
    const formatted = Object.entries(categoryMap).map(([name, raw]) => ({
      name,
      value: parseFloat(raw.toFixed(2)),
      percent: parseFloat(((raw / total) * 100).toFixed(2)),
      raw: parseFloat(raw.toFixed(2)),
    }));
    setCategoryData(formatted);
  };

  /** Weekly spending trend */
  const updateWeeklyData = (data) => {
    const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const today = new Date();
    const weekly = weekDays.map((d) => ({ day: d, spend: 0 }));

    data.forEach((e) => {
      if (!e.date) return;
      const expenseDate = new Date(e.date);
      const diffDays = Math.floor((today.getTime() - expenseDate.getTime()) / (1000*60*60*24));
      if (diffDays < 7 && diffDays >= 0) {
        const idx = expenseDate.getDay();
        weekly[idx].spend += Number(e.amount || 0);
        weekly[idx].spend = parseFloat(weekly[idx].spend.toFixed(2));
      }
    });

    setWeeklyData(weekly);
  };

  return (
    <div className="space-y-6 px-4 md:px-8">
      <h1 className="text-2xl font-bold">Insights</h1>

      {/* Category Pie Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-2">Expenses by Category</h2>
        {categoryData.length ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(2)}%`}>
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${parseFloat(value).toFixed(2)}`} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 text-sm">No expenses yet</div>
        )}
      </div>

      {/* Weekly Spending Bar Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-2">Weekly Spending</h2>
        {weeklyData.length ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${parseFloat(value).toFixed(2)}`} />
              <Bar dataKey="spend" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-500 text-sm">No weekly data</div>
        )}
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-2">Category Summary</h2>
        {categoryData.length ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-1 px-2">Category</th>
                <th className="py-1 px-2">Amount</th>
                <th className="py-1 px-2">Percent</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((c) => (
                <tr key={c.name} className="border-b">
                  <td className="py-1 px-2">{c.name}</td>
                  <td className="py-1 px-2">₹{c.value.toFixed(2)}</td>
                  <td className="py-1 px-2">{c.percent.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500 text-sm">No expenses yet</div>
        )}
      </div>
    </div>
  );
}
