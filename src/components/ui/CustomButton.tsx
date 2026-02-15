import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, leftIcon, ...props }, ref) => {
    
    // Base styles - matching Figma specs
    const baseStyles = "w-full flex justify-center items-center gap-2 h-12 px-4 text-base font-semibold rounded-[100px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Variant styles - matching Figma design system
    const variants = {
      primary: "text-white bg-[rgb(124,58,237)] hover:bg-[rgb(109,40,217)] shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.23)] border-transparent focus:ring-2 focus:ring-[rgb(124,58,237)] focus:ring-offset-2 focus:ring-offset-black",
      secondary: "text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
      outline: "text-purple-400 bg-transparent hover:bg-purple-400/10 border border-purple-400/30 hover:border-purple-400",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className || ''}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <>
            {leftIcon}
            {children}
          </>
        )}
      </button>
    );
  }
);

CustomButton.displayName = "CustomButton";