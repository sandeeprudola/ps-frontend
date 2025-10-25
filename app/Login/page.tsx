"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signin", formData);
      console.log("Signin success:", response.data);
      alert(`Signin success! Role: ${response.data.role}`);
      // You can save token to localStorage/sessionStorage if needed
      localStorage.setItem("token", response.data.token);
    } catch (error: any) {
      console.error("Signin failed:", error.response?.data || error.message);
      alert(error.response?.data?.msg || "Signin failed. Check your credentials.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Login</h2>
      <p className="text-sm text-gray-600 mb-6">
        Enter your credentials to login
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <LabelInputContainer>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Your username"
            type="text"
            value={formData.username}
            onChange={handleChange}
          />
        </LabelInputContainer>

        {/* Email */}
        <LabelInputContainer>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </LabelInputContainer>

        {/* Password */}
        <LabelInputContainer>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </LabelInputContainer>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex flex-col space-y-1", className)}>{children}</div>;
};
