import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col w-full items-center justify-center py-12 ${className}`}
    >
      {icon && (
        <div className="bg-primary-accent rounded-full p-6 mb-4">{icon}</div>
      )}
      <h3 className="text-lg font-bold text-primary-text mb-2">{title}</h3>
      <p className="text-secondary-text text-sm text-center max-w-md mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
