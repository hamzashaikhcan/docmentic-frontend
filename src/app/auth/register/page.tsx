"use client";

import { useState } from "react";
import { register } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Lock, Building } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
    };

    // Validation logic
    if (!fullName.trim()) {
      newErrors.fullName = "Required";
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Required";
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Required";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Min 8 characters";
      valid = false;
    } else if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = "Missing uppercase, number or special char";
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      valid = false;
    }

    if (!company.trim()) {
      newErrors.company = "Required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email: email,
        password: password,
        full_name: fullName,
        company: company,
      };

      const result = await register(payload);

      if (result.success) {
        toast.success(result.message || "Registration successful!");
        router.push("/auth/login");
      } else {
        toast.error(result.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(
        error?.response?.data?.message ||
          "An error occurred during registration",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1a2234] to-[#0f172a] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 relative">
            <Link href={"/"}>
              <Image
                src="/og_image_white.png"
                alt="Docmentic Logo"
                width={128}
                height={128}
                className="object-fill"
                onError={(e) => {
                  // Fallback if logo image fails to load
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%234299e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E";
                }}
              />
            </Link>
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-black/40 border border-white/10 shadow-2xl rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-xl"></div>

          <CardHeader className="relative z-10 py-4 space-y-0.5">
            <CardTitle className="text-xl font-bold text-center text-white">
              Create Account
            </CardTitle>
            <CardDescription className="text-gray-400 text-center text-sm">
              Join Docmentic to manage your documents
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="relative z-10 p-4 sm:p-5">
              <div className="grid gap-3">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      id="fullName"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`pl-8 h-9 bg-black/30 border-white/10 text-white w-full rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-sm ${errors.fullName ? "border-red-500" : ""}`}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-400 mt-0.5">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-8 h-9 bg-black/30 border-white/10 text-white w-full rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-sm ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-0.5">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                      <Building className="h-4 w-4" />
                    </div>
                    <Input
                      id="company"
                      placeholder="Company Name"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className={`pl-8 h-9 bg-black/30 border-white/10 text-white w-full rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-sm ${errors.company ? "border-red-500" : ""}`}
                    />
                    {errors.company && (
                      <p className="text-xs text-red-400 mt-0.5">
                        {errors.company}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute mb-4 inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-8 pr-8 h-9 bg-black/30 border-white/10 text-white w-full rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-sm ${errors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute mb-4 inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {errors.password ? (
                      <p className="text-xs text-red-400 mt-0.5">
                        {errors.password}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">
                        8+ chars with uppercase, number & special char
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-8 pr-8 h-9 bg-black/30 border-white/10 text-white w-full rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500 text-sm ${errors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-400 mt-0.5">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  type="submit"
                  className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-md shadow-blue-500/10 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Creating...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </CardContent>

            <CardFooter className="relative z-10 px-4 sm:px-5 pt-0 pb-4 flex flex-col gap-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-black/30 text-gray-400">
                    or sign up with
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/30 transition-colors"
                >
                  <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-md border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-black/30 transition-colors"
                >
                  <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24">
                    <path
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      fill="#1877F2"
                    />
                    <path
                      d="M15.893 14.89l.443-2.89h-2.773v-1.876c0-.791.387-1.562 1.63-1.562h1.26v-2.46s-1.144-.195-2.238-.195c-2.285 0-3.777 1.384-3.777 3.89V12h-2.54v2.89h2.54v6.988C9.16 21.954 9.97 22 10 22s.84-.046 1.168-.122v-6.988h2.33z"
                      fill="#ffffff"
                    />
                  </svg>
                  Facebook
                </button>
              </div>

              <div className="text-center text-xs text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-3 text-center text-xs text-gray-500">
          <p>
            By creating an account, you agree to our{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
