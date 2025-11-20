"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const VerifyOtpPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !code) {
      alert("Please enter the OTP code.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/auth/verify_otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "OTP verification failed.");
        return;
      }

      alert("Email verified successfully! You can now log in.");
      console.log("Verified user:", data.user);

      // go back to signin page
      router.push("/signin");
    } catch (err) {
      console.error("Verify OTP error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "2rem",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          background: "white",
          minWidth: "320px",
        }}
      >
        <h2 style={{ marginBottom: "1rem", textAlign: "center" }}>Verify your email</h2>
        <p style={{ marginBottom: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
          We have sent a 6‑digit code to <strong>{email}</strong>.
        </p>

        <input
          type="text"
          placeholder="Enter 6‑digit OTP"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            marginBottom: "1rem",
            borderRadius: "0.375rem",
            border: "1px solid #ddd",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "0.6rem 0.75rem",
            borderRadius: "0.375rem",
            border: "none",
            background: "linear-gradient(to right, #f97316, #ef4444)",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;
