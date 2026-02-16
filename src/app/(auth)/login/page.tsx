"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { login, clearError } from "@/store/slices/authSlice";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Import komponen yang baru dibuat
import { InputWithIcon } from "@/components/ui/InputWithIcon";
import { CustomButton } from "@/components/ui/CustomButton";

// ZOD Schema untuk validasi form
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Pisahkan component yang menggunakan useSearchParams
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ← Ini yang butuh Suspense
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // State untuk toggle visibility password
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect jika sudah authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const returnTo = searchParams?.get("returnTo") || "/feed";
      router.push(returnTo);
    }
  }, [isAuthenticated, router, searchParams]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data: LoginFormValues) => {
    const resultAction = await dispatch(login(data));
    
    // Sesuai PRD: Login berhasil → redirect ke feed atau returnTo
    if (login.fulfilled.match(resultAction)) {
      const returnTo = searchParams?.get("returnTo") || "/feed";
      router.push(returnTo);
    }
  };

  return (
    // Background Container
    <div 
      className="flex min-h-screen w-full items-center justify-center bg-black relative overflow-hidden"
      style={{ backgroundImage: "url('/background-login.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Overlay hitam tipis */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[400px] space-y-8 rounded-2xl bg-white/5 p-8 shadow-2xl backdrop-blur-xl border border-white/10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center space-y-4 text-center">
          {/* Container Flex Row untuk Logo + Text Sociality */}
          <div className="flex items-center gap-3">
            {/* Logo dari public folder */}
            <img 
              src="/Logo.png" 
              alt="Sociality Logo" 
              className="w-[30px] h-[30px] object-contain" 
            />
            
            {/* Text Sociality */}
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
              Sociality
            </h2>
          </div>
          
          {/* Welcome Back Text */}
          <p className="text-3xl font-bold text-zinc-200">
            Welcome Back!
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* ERROR MESSAGE ALERT */}
          {error && (
            <div className="rounded-lg bg-[#460a0a] p-3 text-sm text-[#ef4444] border border-[#b91c1c] backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Input Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="sr-only">Email address</label>
            <InputWithIcon 
              id="email"
              type="email" 
              autoComplete="email" 
              placeholder="Enter your email"
              leftIcon={<Mail className="h-5 w-5" />}
              error={!!errors.email}
              {...register("email")} 
            />
            {errors.email && <p className="text-[10px] text-red-400 pl-1">{errors.email.message}</p>}
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="sr-only">Password</label>
            <InputWithIcon 
              id="password"
              type={showPassword ? "text" : "password"} 
              autoComplete="current-password"
              placeholder="Enter your password" 
              leftIcon={<Lock className="h-5 w-5" />}
              rightElement={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
              error={!!errors.password}
              {...register("password")}
            />
            {errors.password && <p className="text-[10px] text-red-400 pl-1">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <CustomButton 
            type="submit" 
            isLoading={isLoading} 
            variant="primary"
          >
            Login
          </CustomButton>
        </form>

        {/* Footer: Register Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-zinc-300">
            Don't have an account?{" "}
            <Link 
              href="/register" 
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component - Wrap LoginFormContent dengan Suspense
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="text-white text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}