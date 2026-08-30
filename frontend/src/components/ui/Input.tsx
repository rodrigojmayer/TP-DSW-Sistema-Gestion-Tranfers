import  { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <input
          ref={ref}
          className={`px-3 py-2 border text-sm rounded-md outline-none transition focus:ring-2 ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-slate-300 focus:ring-amber-400 focus:border-amber-500'
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-red-500 font-medium">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
