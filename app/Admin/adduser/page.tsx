"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { api, getApiErrorMessage } from "@/lib/api";
import { clearStoredTokens, createAuthHeaders } from "@/lib/auth";

const isUnauthorizedError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === 401;

export default function CreateUserForm() {
  const router = useRouter();
  const { token, isCheckingAuth } = useAuthGuard({
    role: "admin",
    redirectTo: "/Admin/AdminLogin",
  });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "both",
    HearingServices: "None",
    SpeechServices: "None",
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
      if (!token) {
        throw new Error("Admin not authenticated");
      }

      const response = await api.post(
        "/admin/adduser",
        {
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.serviceType,
          HearingServices: formData.HearingServices,
          SpeechServices: formData.SpeechServices,
        },
        {
          headers: createAuthHeaders("admin"),
        }
      );

      console.log("User created:", response.data);

      setFormData({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        serviceType: "both",
        HearingServices: "None",
        SpeechServices: "None",
      });
    } catch (err: unknown) {
      console.error("Create user failed:", err);
      if (isUnauthorizedError(err)) {
        clearStoredTokens();
        router.replace("/Admin/AdminLogin");
      }
      setError(getApiErrorMessage(err, "Failed to create user"));
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Checking admin access...</p>
      </div>
    );
  }

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

        <LabelInputContainer>
          <Label htmlFor="HearingServices">Hearing Services</Label>
          <select
            id="HearingServices"
            value={formData.HearingServices}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="None">None</option>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
          </select>
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="SpeechServices">Speech Services</Label>
          <select
            id="SpeechServices"
            value={formData.SpeechServices}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="None">None</option>
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
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
