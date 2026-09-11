import React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-bold tracking-tight select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none active:scale-[0.98] cursor-pointer text-center",
  {
    variants: {
      variant: {
        primary: 
          "bg-[#2C3E50] hover:bg-[#1E2B37] active:bg-[#34495E] text-white shadow-xs hover:shadow focus-visible:ring-[#2C3E50]",
        secondary: 
          "bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white shadow-xs hover:shadow focus-visible:ring-brand-cyan",
        cyan: 
          "bg-brand-cyan hover:bg-[#0087a3] active:bg-[#00768e] text-white shadow-xs hover:shadow focus-visible:ring-brand-cyan",
        outline: 
          "border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-[#2C3E50] active:bg-slate-100 focus-visible:ring-slate-400",
        outlineNavy: 
          "border-2 border-[#2C3E50] bg-transparent text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white active:bg-[#1E2B37] focus-visible:ring-[#2C3E50]",
        outlineCyan: 
          "border-2 border-brand-cyan bg-transparent text-brand-cyan hover:bg-brand-cyan hover:text-white active:bg-[#0087a3] focus-visible:ring-brand-cyan",
        outlinePurple: 
          "border-2 border-brand-cyan bg-transparent text-brand-cyan hover:bg-brand-cyan hover:text-white active:bg-[#0087a3] focus-visible:ring-brand-cyan",
        outlineWhite: 
          "border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#2C3E50] active:bg-slate-100 focus-visible:ring-white",
        ghost: 
          "bg-transparent text-slate-600 hover:text-[#2C3E50] hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-300",
        ghostCyan: 
          "bg-transparent text-brand-cyan hover:text-[#0087a3] hover:bg-cyan-50 active:bg-cyan-100 focus-visible:ring-brand-cyan",
        ghostPurple: 
          "bg-transparent text-brand-cyan hover:text-[#0087a3] hover:bg-cyan-50 active:bg-cyan-100 focus-visible:ring-brand-cyan",
        danger: 
          "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs hover:shadow focus-visible:ring-rose-500",
        dangerOutline: 
          "border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 hover:border-rose-300 active:bg-rose-200 focus-visible:ring-rose-400",
        success: 
          "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs hover:shadow focus-visible:ring-emerald-500",
        successOutline: 
          "border border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 active:bg-emerald-200 focus-visible:ring-emerald-500",
        whatsapp: 
          "bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white shadow-xs hover:shadow focus-visible:ring-emerald-400",
      },
      size: {
        xs: "h-7 px-2.5 text-xs rounded-lg gap-1.5 [&_svg]:size-3.5",
        sm: "h-8.5 px-3.5 text-xs rounded-xl gap-1.5 [&_svg]:size-3.5",
        md: "h-10 px-4 py-2 text-xs sm:text-sm rounded-xl gap-2 [&_svg]:size-4",
        lg: "h-12 px-6 py-2.5 text-sm md:text-base rounded-xl gap-2.5 [&_svg]:size-4.5",
        xl: "h-14 px-8 py-3.5 text-base rounded-xl gap-3 [&_svg]:size-5",
        "icon-xs": "size-7 p-0 rounded-lg [&_svg]:size-3.5",
        "icon-sm": "size-8.5 p-0 rounded-xl [&_svg]:size-4",
        "icon-md": "size-10 p-0 rounded-xl [&_svg]:size-4.5",
        "icon-lg": "size-12 p-0 rounded-xl [&_svg]:size-5",
      },
      fullWidth: {
        true: "w-full flex",
        false: "inline-flex",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  }
);

export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'cyan'
  | 'outline'
  | 'outlineNavy'
  | 'outlinePurple'
  | 'outlineWhite'
  | 'ghost'
  | 'ghostPurple'
  | 'danger'
  | 'dangerOutline'
  | 'success'
  | 'successOutline'
  | 'whatsapp';

export type ButtonSize = 
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'icon-xs'
  | 'icon-sm'
  | 'icon-md'
  | 'icon-lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...rest
    } = props;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...rest}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin text-current shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

