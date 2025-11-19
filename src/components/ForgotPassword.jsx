import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email is invalid");
      return;
    }

    setError("");

    // --- Optional back-end request (keep commented until backend ready) ---
    // try {
    //   const res = await fetch(`${API_URL}/auth/forgot-password`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email }),
    //   });
    //
    //   const data = await res.json();
    //   if (!res.ok) throw new Error(data.error || "Failed to send email");
    //
    //   setSuccess("Password reset link sent! Check your inbox.");
    //   setEmail("");
    // } catch (err) {
    //   setError(err.message);
    //   return;
    // }

    // Mock Success (current behavior)
    setSuccess("Password reset link sent! Check your inbox.");
    console.log("Password reset requested for:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>

      <p className="text-gray-600 mb-6 text-center max-w-md">
        Enter your email address and we’ll send you a link to reset your password.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md flex flex-col gap-4"
      >
        {/* Success message */}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded text-center">
            {success}
          </div>
        )}

        {/* Email Field */}
        <div className="flex flex-col">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            className={`border rounded-lg px-3 py-2 ${
              error ? "border-red-500" : ""
            }`}
          />
          {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Send Reset Link
        </button>

        <div className="text-center text-sm mt-2">
          Remembered your password?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
