"use client";

import { Button, type ButtonProps } from "@/components/ui/button"
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ExpandableProps {
  children: React.ReactNode;
  trigger?: (
    isOpen: boolean,
    setOpen: (open: boolean) => void,
    isOverflowing: boolean
  ) => React.ReactNode;
  maxLines: number;
  className?: string;
}

export function Expandable({
  children,
  trigger,
  maxLines,
  className,
}: ExpandableProps) {
  const [open, setOpen] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const clampClass = `line-clamp-${maxLines}`;

  useEffect(() => {
    if (open) return;
    const el = contentRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsOverflowing(el.scrollHeight > el.clientHeight);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, open, maxLines]);

  return (
    <div
      ref={contentRef}
      className={cn(
        !open && clampClass,
        className
      )}
    >
      {children}
      {trigger?.(open, setOpen, isOverflowing)}
    </div>
  );
}

type Props = {
  isOpen: boolean
  setOpen: (open: boolean) => void,
} & Omit<ButtonProps, "onClick">

export function ToggleButton({
  isOpen,
  setOpen,
  className,
  ...props
}: Props) {
  return (
    <Button
      size="xs"
      variant="ghost"
      className={cn(
        "bg-gradient-to-b from-transparent to-background hover:bg-none",
        className
      )}
      onClick={() => setOpen(!isOpen)}
      {...props}
    />
  )
}
