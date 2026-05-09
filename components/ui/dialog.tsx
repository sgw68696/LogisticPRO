'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // Animate
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        // Layout
        'fixed inset-0 z-50',
        // Dark rich overlay with subtle blue tint
        'bg-[rgba(2,6,18,0.75)] backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Positioning
          'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          // Sizing
          'w-full max-w-[calc(100%-2rem)] sm:max-w-lg',
          // Glass dark surface — matches your modals in shipments page
          'bg-[rgba(8,14,28,0.97)]',
          'backdrop-blur-xl',
          'border border-[rgba(14,165,233,0.18)]',
          'rounded-2xl',
          'shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(14,165,233,0.07)]',
          // Light mode override
          'dark:bg-[rgba(8,14,28,0.97)]',
          '[.light_&]:bg-[rgba(255,255,255,0.98)]',
          '[.light_&]:border-[rgba(99,102,241,0.15)]',
          '[.light_&]:shadow-[0_24px_64px_rgba(0,0,0,0.12)]',
          // Top edge gradient accent line
          'before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl',
          'before:bg-gradient-to-r before:from-transparent before:via-[rgba(14,165,233,0.5)] before:to-transparent',
          // Layout
          'grid gap-0 p-0',
          // Animations
          'duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=open]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              'absolute top-4 right-4',
              // Size + shape
              'w-7 h-7 flex items-center justify-center rounded-lg',
              // Default state
              'bg-white/[0.04] border border-[rgba(14,165,233,0.15)]',
              'text-slate-400',
              // Hover
              'hover:bg-[rgba(239,68,68,0.12)] hover:border-[rgba(239,68,68,0.3)]',
              'hover:text-red-400',
              // Transitions
              'transition-all duration-200',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-[rgba(14,165,233,0.4)] focus:ring-offset-0',
              // Light mode
              '[.light_&]:bg-slate-100/60 [.light_&]:border-slate-200',
              '[.light_&]:hover:bg-red-50 [.light_&]:hover:border-red-200 [.light_&]:hover:text-red-500',
              // SVG
              '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-3.5',
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex flex-col gap-1.5',
        'px-6 pt-6 pb-5',
        'border-b border-[rgba(14,165,233,0.1)]',
        '[.light_&]:border-[rgba(99,102,241,0.1)]',
        'text-left',
        className,
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        'px-6 py-4',
        'border-t border-[rgba(14,165,233,0.1)]',
        '[.light_&]:border-[rgba(99,102,241,0.1)]',
        className,
      )}
      {...props}
    />
  )
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('px-6 py-5', className)}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        // Uses your nb-crumb-active gradient text from globals.css
        'nb-crumb-active text-[1rem] leading-none',
        className,
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-[0.8rem] text-muted-foreground leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}