import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  username?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const UserAvatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, username, size = "md", className }, ref) => {
    // Size mapping
    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-xl",
    };

    // Fallback initial jika tidak ada gambar
    const initial = username ? username.charAt(0).toUpperCase() : "?";

    return (
      <div 
        ref={ref}
        className={`
          relative flex shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800
          ${sizes[size]} ${className}
        `}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt || username} 
            className="aspect-square h-full w-full object-cover"
            onError={(e) => {
              // Jika gambar error, ganti elemen ke elemen inisial (fallback JS)
              e.currentTarget.style.display = 'none';
              // (Untuk fallback HTML murni tanpa JS, biasanya pakai state error boundary, 
              // tapi sederhananya pakai style inline error handler di sini)
            }}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-medium text-zinc-300">
            {initial}
          </span>
        )}
      </div>
    );
  }
);

UserAvatar.displayName = "UserAvatar";