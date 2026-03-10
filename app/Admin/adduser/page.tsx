"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function CreateUserForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "both",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("ADMIN_TOKEN");
      if (!token) {
        throw new Error("Admin not authenticated");
      }

      const response = await axios.post(
        "http://localhost:3000/api/v1/admin/adduser",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("User created:", response.data);

      onSuccess?.();

      // Reset form
      setFormData({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        serviceType: "both",
      });
    } catch (err: any) {
      console.error("Create user failed:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-2 text-xl font-bold text-gray-800">
        Create New User
      </h2>
      <p className="mb-6 text-sm text-gray-600">
        Admin can create a new user account
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <LabelInputContainer>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="First name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Unique username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="password">Temporary Password</Label>
          <Input
            id="password"
            type="password"
            placeholder=" password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            placeholder="Optional phone number"
            value={formData.phone}
            onChange={handleChange}
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="serviceType">Service Type</Label>
          <select
            id="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="speech">Speech</option>
            <option value="hearing">Hearing</option>
            <option value="both">Both</option>
          </select>
        </LabelInputContainer>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black py-2 text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
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
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      {children}
    </div>
  );
};
