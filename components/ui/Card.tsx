/**
 * Card Component - Reusable card with variants and hover effects
 *
 * Features:
 * - Multiple variants (default, interactive, featured, status)
 * - Hover lift animation with shadow
 * - Gradient accents for featured cards
 * - Status-based styling (success, warning, error, info)
 */

import React from 'react';

// Card variants with hover effects
const cardVariants = {
  default: 'bg-card text-card-foreground border',
  interactive: 'bg-card text-card-foreground border hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 hover:border-primary/50 cursor-pointer',
  featured: 'bg-gradient-to-br from-card to-muted/50 border-2 border-primary/20 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1',
  ghost: 'bg-transparent',
  elevated: 'bg-card text-card-foreground shadow-md hover:shadow-xl hover:-translate-y-1',
  outline: 'bg-transparent border-2 border-dashed hover:border-primary/50 hover:bg-muted/30',
};

const statusVariants = {
  none: '',
  success: 'border-emerald-500/30 bg-emerald-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  error: 'border-red-500/30 bg-red-500/5',
  info: 'border-blue-500/30 bg-blue-500/5',
};

const sizeVariants = {
  sm: 'p-4 rounded-lg',
  default: 'p-6 rounded-xl',
  lg: 'p-8 rounded-2xl',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof cardVariants;
  status?: keyof typeof statusVariants;
  size?: keyof typeof sizeVariants;
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', status = 'none', size = 'default', children, ...props }, ref) => {
    const classes = [
      'transition-all duration-300 ease-out',
      cardVariants[variant],
      statusVariants[status],
      sizeVariants[size],
      className,
    ].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 ${className || ''}`}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

// Card Title
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

// Card Description
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground ${className || ''}`}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

// Card Content
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`pt-0 ${className || ''}`} {...props} />
  )
);
CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center pt-4 ${className || ''}`}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

// Feature Card - Pre-styled card for feature highlights
export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, iconBg = 'bg-primary/10', title, description, badge, badgeColor = 'bg-primary/10 text-primary', className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="interactive"
      className={`group ${className || ''}`}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{title}</h3>
            {badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
    </Card>
  )
);
FeatureCard.displayName = 'FeatureCard';

// Stat Card - Pre-styled card for statistics
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  iconBg?: string;
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    positive: boolean;
  };
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon, iconBg = 'bg-primary/10', label, value, change, className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="default"
      size="sm"
      className={`hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${className || ''}`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <span className={`text-xs font-medium ${change.positive ? 'text-emerald-500' : 'text-red-500'}`}>
                {change.positive ? '↑' : '↓'} {change.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
);
StatCard.displayName = 'StatCard';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FeatureCard,
  StatCard,
};
