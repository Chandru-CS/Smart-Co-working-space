import React from 'react';

export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin ${className}`} />
  );
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Spinner size="lg" />
    </div>
  );
}
