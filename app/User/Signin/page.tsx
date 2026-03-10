"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signup", formData);
      console.log("Signup success:", response.data);
      alert("Signup successful!");
    } catch (error: any) {
      console.error("Signup failed:", error.response?.data || error.message);
      alert("Signup failed. Please check your input or try again.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md bg-white p-6 md:p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Sign Up</h2>
      <p className="text-sm text-gray-600 mb-6">
        Create your account at PS Speech & Hearing
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

        {/* First & Last Name */}
        <div className="flex space-x-2">
          <LabelInputContainer className="flex-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
            />
          </LabelInputContainer>
          <LabelInputContainer className="flex-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
            />
          </LabelInputContainer>
        </div>

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

        {/* Role */}
        <LabelInputContainer>
          <Label htmlFor="role">Service Type</Label>
          <select
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="" disabled>
              Select Service
            </option>
            <option value="hearing">Hearing</option>
            <option value="speech">Speech</option>
            <option value="both">Both</option>
          </select>
        </LabelInputContainer>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
        >
          Sign Up
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
