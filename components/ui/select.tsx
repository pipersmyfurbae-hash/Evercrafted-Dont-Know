import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * Minimal native-<select>-backed implementation matching the shadcn Select
 * export surface (Select/SelectTrigger/SelectValue/SelectContent/SelectItem)
 * used by callers in this app. Not a full Radix/Base UI listbox.
 */

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Select({ value, defaultValue, onValueChange, disabled, children }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const resolvedValue = value ?? internalValue;

  const items: { value: string; label: React.ReactNode }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === SelectContent) {
      React.Children.forEach((child.props as { children?: React.ReactNode }).children, (item) => {
        if (React.isValidElement(item) && item.type === SelectItem) {
          const props = item.props as SelectItemProps;
          items.push({ value: props.value, label: props.children });
        }
      });
    }
  });

  return (
    <select
      disabled={disabled}
      value={resolvedValue ?? ''}
      onChange={(e) => {
        setInternalValue(e.target.value);
        onValueChange?.(e.target.value);
      }}
      className={cn(
        'flex h-10 w-full border border-primary/10 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export function SelectTrigger({ children }: { children?: React.ReactNode; className?: string }) {
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <>{placeholder}</>;
}

export function SelectContent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

interface SelectItemProps {
  value: string;
  children?: React.ReactNode;
}

export function SelectItem({ children }: SelectItemProps) {
  return <>{children}</>;
}
