"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewAdminPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "admin",
    caninvite: true,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:3000/api/v1/admin/signup",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.msg || "New admin created successfully!");
      router.push("/Dashboard/admin");
    } catch (err: any) {
      alert(err.response?.data?.msg || "Error creating admin");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 border rounded-xl p-8 shadow-sm bg-white dark:bg-neutral-900">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Create New Admin
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>First Name</Label>
          <Input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Last Name</Label>
          <Input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label>Username</Label>
          <Input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Creating..." : "Create Admin"}
        </Button>
      </form>
    </div>
  );
}
