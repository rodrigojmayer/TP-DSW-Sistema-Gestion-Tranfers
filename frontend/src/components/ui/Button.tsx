import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'w-full flex justify-center items-center px-4 py-2 text-sm font-semibold rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-amber-500 hover:bg-amber-400 text-slate-900 focus:ring-amber-500',
    secondary:
      'bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-900 border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
};
