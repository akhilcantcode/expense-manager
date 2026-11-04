import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    let baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    let sizeStyles = "h-10 px-4 py-2 text-sm rounded-lg";
    if (size === "sm") {
      sizeStyles = "h-8 px-3 text-xs rounded-md";
    } else if (size === "lg") {
      sizeStyles = "h-12 px-6 text-base rounded-full";
    }

    let variantStyles = "bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm";
    if (variant === "outline") {
      variantStyles =
        "border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent";
    } else if (variant === "ghost") {
      variantStyles = "text-zinc-400 hover:text-white hover:bg-zinc-800/80 bg-transparent";
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
