// src/app/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginCredentials } from "@/types/auth";
import {
  Download,
  Smartphone,
  Zap,
  GraduationCap,
  Rocket,
  LockKeyhole,
  ArrowRight,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const credentials: LoginCredentials = {
      username,
      password,
    };

    try {
      const response = await fetch("/api/v1/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (e) {
      const error = e as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left Section - App Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 text-white relative">
        <div className="relative z-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl">
                <GraduationCap className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold">AIRApp</span>
            </div>

            <h1 className="text-5xl font-bold mb-6">
              Media
              <br />
              <span className="text-white/80">Pembelajaran</span>
            </h1>

            <p className="text-xl text-white/80 mb-12">
              Platform belajar dengan materi interaktif,
              <br />
              video berkualitas, dan kuis adaptif.
            </p>

            <div className="grid gap-6 mb-12">
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Akses Mudah</h3>
                  <p className="text-sm text-white/70">Akses dari mana saja</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Pembelajaran Cepat</h3>
                  <p className="text-sm text-white/70">
                    Metode efektif & efisien
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Progress Tracking</h3>
                  <p className="text-sm text-white/70">
                    Pantau perkembangan belajar
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="https://drive.google.com/file/d/1OHy90NfNdXgNNFPm6Pq7l3_YTlXD4m-j/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 w-full lg:w-auto"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Aplikasi Mobile
            </Button>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile App Download for small screens */}
          <div className="lg:hidden mb-8">
            <Link
              href="https://drive.google.com/file/d/1gRoBAN6cRfId3DxN3ZQTZurg3gyleJJn/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Aplikasi Mobile
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-2xl">
                <LockKeyhole className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back!
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Silakan login untuk mengakses dashboard admin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Layers className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Username"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockKeyhole className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
