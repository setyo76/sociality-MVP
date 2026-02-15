import React, { InputHTMLAttributes, ReactNode } from "react";

// Menerima props standar input HTML + props khusus untuk Icon
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode; // Ikon di kiri (Mail, Lock, User)
  rightElement?: ReactNode; // Elemen di kanan (Eye toggle)
  error?: boolean; // Untuk styling border error
}

export const InputWithIcon = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightElement, error, ...props }, ref) => {
    return (
      <div className="relative group">
        {/* Left Icon Container */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-focus-within:text-purple-400 transition-colors">
            {leftIcon}
          </div>
        )}

        {/* Input Element */}
        <input
          type={type}
          className={`
            block w-full rounded-xl border bg-black/40 py-3 pr-4 text-sm text-white placeholder:text-zinc-500 
            focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all
            ${leftIcon ? "pl-10" : "pl-4"}
            ${error ? "border-red-500/50 focus:ring-red-500/50" : "border-white/10"}
            ${className}
          `}
          ref={ref}
          {...props}
        />

        {/* Right Element Container (e.g. Eye Icon) */}
        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white transition-colors">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";