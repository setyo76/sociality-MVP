"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { registerUser } from "@/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

// Import komponen
import { InputWithIcon } from "@/components/ui/InputWithIcon";
import { CustomButton } from "@/components/ui/CustomButton";

// ZOD Schema untuk validasi form register - DISESUAIKAN DENGAN API
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // State untuk toggle visibility password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect to feed if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/feed");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterFormValues) => {
    // @ts-ignore
    const resultAction = await dispatch(registerUser({
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password,
    }));

    // Sesuai PRD: Register berhasil → diarahkan ke Feed
    if (registerUser.fulfilled.match(resultAction)) {
      router.push("/feed");
    }
  };

  return (
    // Background Container
    <div 
      className="flex min-h-screen w-full items-center justify-center bg-black relative overflow-hidden py-8"
      style={{ backgroundImage: "url('/background-login.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {/* Overlay hitam tipis */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-[400px] space-y-6 rounded-2xl bg-white/5 p-8 shadow-2xl backdrop-blur-xl border border-white/10">
        
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
          
          {/* Register Text */}
          <p className="text-3xl font-bold text-zinc-200">
            Register
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ERROR MESSAGE ALERT */}
          {error && (
            <div className="rounded-lg bg-[#460a0a] p-3 text-sm text-[#ef4444] border border-[#b91c1c] backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Input Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium text-white">Name</label>
            <InputWithIcon 
              id="name"
              type="text" 
              placeholder="Enter your name"
              error={!!errors.name}
              {...register("name")} 
            />
            {errors.name && <p className="text-[10px] text-red-400 pl-1">{errors.name.message}</p>}
          </div>

          {/* Input Username */}
          <div className="space-y-1.5">
            <label htmlFor="username" className="text-sm font-medium text-white">Username</label>
            <InputWithIcon 
              id="username"
              type="text" 
              placeholder="Enter your username"
              error={!!errors.username}
              {...register("username")} 
            />
            {errors.username && <p className="text-[10px] text-red-400 pl-1">{errors.username.message}</p>}
          </div>

          {/* Input Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-white">Email</label>
            <InputWithIcon 
              id="email"
              type="email" 
              placeholder="Enter your email"
              error={!!errors.email}
              {...register("email")} 
            />
            {errors.email && <p className="text-[10px] text-red-400 pl-1">{errors.email.message}</p>}
          </div>

          {/* Input Number Phone */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-white">Number Phone</label>
            <InputWithIcon 
              id="phone"
              type="tel" 
              placeholder="Enter your number phone"
              error={!!errors.phone}
              {...register("phone")} 
            />
            {errors.phone && <p className="text-[10px] text-red-400 pl-1">{errors.phone.message}</p>}
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-white">Password</label>
            <InputWithIcon 
              id="password"
              type={showPassword ? "text" : "password"} 
              autoComplete="new-password"
              placeholder="Enter your password" 
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

          {/* Input Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-white">Confirm Password</label>
            <InputWithIcon 
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"} 
              autoComplete="new-password"
              placeholder="Enter your confirm password" 
              rightElement={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
              error={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-[10px] text-red-400 pl-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <CustomButton 
              type="submit" 
              isLoading={isLoading} 
              variant="primary"
            >
              Submit
            </CustomButton>
          </div>
        </form>

        {/* Footer: Login Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-zinc-300">
            Already have an account?{" "}
            <Link 
              href="/login" 
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}