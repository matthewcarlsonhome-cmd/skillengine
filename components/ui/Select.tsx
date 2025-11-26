
import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    const containerClasses = `relative`;
    const selectClasses = `flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className || ''}`;
    const iconClasses = "absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50";

    return (
      <div className={containerClasses}>
        <select className={selectClasses} ref={ref} {...props}>
          {children}
        </select>
        <ChevronDown className={iconClasses} />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
