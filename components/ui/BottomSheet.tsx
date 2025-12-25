/**
 * BottomSheet - Mobile-friendly bottom sheet modal
 *
 * Features:
 * - Swipe to dismiss
 * - Drag handle
 * - Snap points (partial/full)
 * - Backdrop click to close
 * - Keyboard accessible
 * - Body scroll lock
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  snapPoints?: ('partial' | 'full')[];
  defaultSnap?: 'partial' | 'full';
  showHandle?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM SHEET COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  snapPoints = ['partial', 'full'],
  defaultSnap = 'partial',
  showHandle = true,
  showCloseButton = true,
  className,
}) => {
  const [currentSnap, setCurrentSnap] = useState<'partial' | 'full'>(defaultSnap);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentTranslateY = useRef(0);

  // Get height based on snap point
  const getHeight = (snap: 'partial' | 'full') => {
    return snap === 'full' ? '90vh' : '50vh';
  };

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Touch/mouse event handlers for drag
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartY.current = clientY;
    currentTranslateY.current = 0;
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;

    const deltaY = clientY - dragStartY.current;
    // Only allow dragging down
    const newOffset = Math.max(0, deltaY);
    setDragOffset(newOffset);
    currentTranslateY.current = newOffset;
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    const threshold = 100; // px to trigger close or snap change

    if (currentTranslateY.current > threshold) {
      if (currentSnap === 'partial') {
        // Close if already partial
        onClose();
      } else {
        // Snap to partial if full
        setCurrentSnap('partial');
      }
    } else if (currentTranslateY.current < -threshold && snapPoints.includes('full')) {
      // Snap to full on upward drag
      setCurrentSnap('full');
    }

    setDragOffset(0);
    currentTranslateY.current = 0;
  }, [currentSnap, onClose, snapPoints]);

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers (for desktop testing)
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientY);
  }, [handleDragMove]);

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Add/remove global mouse listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
        className={`fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 ${className || ''}`}
        style={{
          height: getHeight(currentSnap),
          transform: `translateY(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out, height 0.3s ease-out',
        }}
      >
        {/* Drag Handle */}
        {showHandle && (
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-4 py-2 border-b">
            <div>
              {title && (
                <h2 id="bottom-sheet-title" className="text-lg font-semibold">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 -mr-1.5 hover:bg-muted rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {children}
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// BOTTOM SHEET TRIGGER
// ═══════════════════════════════════════════════════════════════════════════

export interface BottomSheetTriggerProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export const BottomSheetTrigger: React.FC<BottomSheetTriggerProps> = ({
  children,
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </button>
);

// ═══════════════════════════════════════════════════════════════════════════
// ACTION SHEET - Common pattern for mobile action menus
// ═══════════════════════════════════════════════════════════════════════════

export interface ActionSheetOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  options,
  cancelLabel = 'Cancel',
}) => {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      snapPoints={['partial']}
      defaultSnap="partial"
      showCloseButton={false}
    >
      <div className="space-y-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              option.onClick();
              onClose();
            }}
            disabled={option.disabled}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
              option.destructive
                ? 'text-red-500 hover:bg-red-500/10'
                : 'hover:bg-muted'
            } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {option.icon && (
              <span className="shrink-0">{option.icon}</span>
            )}
            <span className="font-medium">{option.label}</span>
          </button>
        ))}
      </div>

      {/* Cancel button */}
      <button
        onClick={onClose}
        className="w-full mt-4 py-3 rounded-xl bg-muted font-medium hover:bg-muted/80 transition-colors"
      >
        {cancelLabel}
      </button>
    </BottomSheet>
  );
};

export default BottomSheet;
