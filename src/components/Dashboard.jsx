import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

/* Components */
import DashboardHeader from "./dashboard/DashboardHeader";
import QuickActions from "./dashboard/QuickActions";
import WeeklyTrend from "./dashboard/WeeklyTrend";
import ExpenseCard from "./ExpenseCard";
import AddExpenseModal from "./AddExpenseModal";
import ChatPanel from "./ChatPanel";
import NewsFeed from "./NewsFeed";
import SplitBillModal from "./SplitBillModal";
import MultiStockWidget from "./dashboard/MultiStockWidget";

/* Assets */
import heroImg from "../assets/dashboard/hero.jpg";
import addExpenseImg from "../assets/dashboard/add-expense.jpg";
import splitBillImg from "../assets/dashboard/split-bill.jpg";
import insightsImg from "../assets/dashboard/insights.jpg";
import paymentsImg from "../assets/dashboard/payments.jpg";

const COLORS = ["#FF6A00", "#FFD6B8", "#F0F0F0", "#FFA86B"];

// Backend base URL (fallback when env missing)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  const [trend, setTrend] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dashboardUsers = ["Alice", "Bob", "Charlie"];

  // Helper: get token or redirect
  const getTokenOrRedirect = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return token;
  };

  /* ---------------- Fetch expenses from backend on mount ---------------- */
  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError("");
      const token = getTokenOrRedirect();
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) {
            // invalid token -> redirect to login
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error("Failed to fetch expenses");
        }
        const data = await res.json();
        // Ensure consistent shape and order property for reordering
        const normalized = data.map((e, idx) => ({ ...e, order: e.order ?? idx }));
        // Sort by order desc (new first) or date if no order
        normalized.sort((a, b) => (b.order ?? 0) - (a.order ?? 0));
        setExpenses(normalized);
        updateSummaryAndTrend(normalized);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
    // we only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- summary & trend computation ---------------- */
  const updateSummaryAndTrend = (data) => {
    const categoryMap = {};
    data.forEach((e) => {
      const cat = e.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount || 0);
    });
    const total = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;

    setSummary(
      Object.entries(categoryMap).map(([name, raw]) => ({
        name,
        raw,
        value: Math.round((raw / total) * 100),
      }))
    );

    // Weekly trend
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const weekly = weekDays.map((d) => ({ day: d, spend: 0 }));

    data.forEach((e) => {
      if (!e.date) return;
      const expenseDate = new Date(e.date);
      const diffDays = Math.floor((today.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        weekly[expenseDate.getDay()].spend += Number(e.amount || 0);
      }
    });

    setTrend(weekly);
  };

  /* ---------------- Backend CRUD helpers ---------------- */
  // Add single expense to backend and state
  const addExpenseToBackend = async (expense) => {
    const token = getTokenOrRedirect();
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(expense),
      });
      if (!res.ok) {
        throw new Error("Failed to save expense");
      }
      const saved = await res.json();
      return saved;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save expense");
      return null;
    }
  };

  // Update one expense
  const updateExpenseToBackend = async (id, payload) => {
    const token = getTokenOrRedirect();
    if (!token) return null;
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update expense");
      const updated = await res.json();
      return updated;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update expense");
      return null;
    }
  };

  // Delete one expense
  const deleteExpenseFromBackend = async (id) => {
    const token = getTokenOrRedirect();
    if (!token) return false;
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete expense");
      return true;
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete expense");
      return false;
    }
  };

  /* ---------------- Operations called by UI ---------------- */
  const saveExpensesLocal = (data) => {
    // local state update + recalc charts
    setExpenses(data);
    updateSummaryAndTrend(data);
  };

  const handleAddExpense = async (expense) => {
    // prepare expense payload: remove id client-side, backend will create _id
    const payload = {
      category: expense.category || "Other",
      amount: Number(expense.amount || 0),
      date: expense.date || new Date().toISOString().split("T")[0],
      description: expense.description || "",
      order: Date.now(), // put newest on top
    };

    // optimistic UI: show while saving
    const optimistic = [{ ...payload, _id: `temp-${Date.now()}`, order: payload.order }, ...expenses];
    saveExpensesLocal(optimistic);

    const saved = await addExpenseToBackend(payload);
    if (saved) {
      // replace temp item with real saved item
      const replaced = [saved, ...expenses];
      saveExpensesLocal(replaced);
    } else {
      // rollback: remove temp
      saveExpensesLocal(expenses);
    }
    setShowAdd(false);
  };

  const handleEditExpense = async (updatedExpense) => {
    // optimistic update
    const prev = expenses;
    const updated = expenses.map((e) => (e._id === updatedExpense._id ? updatedExpense : e));
    saveExpensesLocal(updated);

    const saved = await updateExpenseToBackend(updatedExpense._id, updatedExpense);
    if (!saved) {
      // rollback on error
      saveExpensesLocal(prev);
    } else {
      // ensure server version (in case server modified)
      const after = updated.map((e) => (e._id === saved._id ? saved : e));
      saveExpensesLocal(after);
    }
  };

  const handleDeleteExpense = async (id) => {
    const prev = expenses;
    const filtered = expenses.filter((e) => e._id !== id);
    saveExpensesLocal(filtered);

    const ok = await deleteExpenseFromBackend(id);
    if (!ok) {
      // rollback
      saveExpensesLocal(prev);
    }
  };

  // Reorder handler: updates order locally and persist 'order' field to backend for each item
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(expenses);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Reassign order indexes (higher order -> earlier in list)
    const newWithOrder = reordered.map((item, idx) => ({ ...item, order: reordered.length - idx }));

    // Optimistic update
    saveExpensesLocal(newWithOrder);

    // Persist order for each (fire-and-forget; could be batched)
    for (const item of newWithOrder) {
      // skip temporary items
      if (!item._id || item._id.toString().startsWith("temp-")) continue;
      // only update if order changed
      try {
        await updateExpenseToBackend(item._id, { ...item, order: item.order });
      } catch (err) {
        // ignore individual update errors; the local UI remains consistent
        console.error("Failed to persist order for", item._id, err);
      }
    }
  };

  /* ---------------- UI pieces ---------------- */
  const quickActions = [
    { img: addExpenseImg, title: "Add Expense", onClick: () => setShowAdd(true) },
    { img: insightsImg, title: "Insights", onClick: () => navigate("/dashboard/insights") },
    { img: paymentsImg, title: "Payments", onClick: () => navigate("/dashboard/payments") },
    { img: splitBillImg, title: "Split Bill", onClick: () => setShowSplit(true) },
  ];

  // Convert HTTP API_URL to WS URL for chat panel
  const wsUrl = (() => {
    try {
      const url = new URL(API_URL);
      const proto = url.protocol === "https:" ? "wss:" : "ws:";
      return `${proto}//${url.host}/ws/chat/`;
    } catch {
      // fallback
      return API_URL.replace(/^http/, "ws") + "/ws/chat/";
    }
  })();

  return (
    <div
      className="space-y-6 px-4 md:px-8"
      style={{
        background: "linear-gradient(135deg, #fff 0%, #fff7f2 40%, #ffe6d5 100%)",
      }}
    >
      <DashboardHeader
        title="Welcome back"
        subtitle="Overview of your shared and personal finances."
        image={heroImg}
        action={{ label: "View Insights", onClick: () => navigate("/dashboard/insights") }}
      />

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((a, i) => (
          <QuickActions key={i} {...a} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Loading / error */}
          {loading && <div className="p-4 bg-white rounded shadow text-center">Loading...</div>}
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded shadow">
              {error}
            </div>
          )}

          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary}
                  dataKey="raw"
                  nameKey="name"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(2)}%`}
                >
                  {summary.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${parseFloat(value).toFixed(2)}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Trend */}
          <WeeklyTrend data={trend} color={COLORS[0]} />

          {/* Drag-and-Drop Expenses */}
          {expenses.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="expenses">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 overflow-y-auto rounded-xl p-2"
                    style={{ maxHeight: "700px" }}
                  >
                    {expenses.map((expense, idx) => (
                      <Draggable key={expense._id || expense.id || `temp-${idx}`} draggableId={(expense._id || expense.id || `temp-${idx}`).toString()} index={idx}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="expense-card">
                            <ExpenseCard
                              expense={expense}
                              onEdit={handleEditExpense}
                              onDelete={() => handleDeleteExpense(expense._id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <ChatPanel wsUrl={wsUrl} />
          <NewsFeed />

          <div className="bg-white rounded-xl shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium p-4">Featured</div>
            </div>
            <div className="grid gap-3 p-4">
              <MultiStockWidget symbols={["GOOGL","AMZN","AAPL","TSLA","MSFT","RELIANCE.NS","TCS.NS","HDFCBANK.NS"]} />
            </div>
          </div>
        </aside>
      </div>

      {/* Modals */}
      <AddExpenseModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddExpense} />
      <SplitBillModal
        open={showSplit}
        users={dashboardUsers}
        onClose={() => setShowSplit(false)}
        onAdd={async (newExpenses) => {
          // If SplitBillModal returns multiple expenses (array), insert them individually
          const created = [];
          for (const ne of newExpenses) {
            const saved = await addExpenseToBackend({
              category: ne.category,
              amount: Number(ne.amount),
              date: ne.date || new Date().toISOString().split("T")[0],
              description: ne.description || "",
              order: Date.now(),
            });
            if (saved) created.push(saved);
          }
          if (created.length) {
            const merged = [...created, ...expenses];
            saveExpensesLocal(merged);
          }
        }}
      />
    </div>
  );
}
