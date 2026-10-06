import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageContainer({
  children,
  title,
  subtitle,
}: PageContainerProps) {
  return (
    <div className="w-full min-h-full m-0 p-0">
      {(title || subtitle) && (
        <div className="p-6 pb-0">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}
