# GooseNet Color Guidelines

This document defines the color palette used throughout the GooseNet application to ensure consistency across all pages.

## Primary Colors

### Blue (Primary Brand Color)
- **Primary Blue**: `bg-blue-600` / `text-blue-600` / `border-blue-600`
  - Light mode: `#2563eb` (blue-600)
  - Dark mode: `#3b82f6` (blue-400) for text/icons
- **Hover States**: `hover:bg-blue-700` / `hover:text-blue-500`
- **Focus Rings**: `focus:ring-blue-600` / `dark:focus:ring-blue-500`

### Purple (Accent for Gradients)
- **Gradient Purple**: `from-purple-600` / `via-purple-600` / `to-purple-600`
  - Light mode: `#9333ea` (purple-600)
  - Dark mode: `#a855f7` (purple-400) for gradients
- **Glow Effects**: `bg-purple-500/30` / `dark:bg-purple-500/20`

## Background Colors

### Light Mode
- **Page Background**: `bg-white` (`#ffffff`)
- **Card/Section Background**: `bg-white`
- **Dark Sections**: `bg-gray-50` / `bg-gray-100`

### Dark Mode
- **Page Background**: `dark:bg-gray-900` (`#111827`)
- **Card/Section Background**: `dark:bg-gray-800` (`#1f2937`)
- **Input Background**: `dark:bg-gray-700` (`#374151`)

## Text Colors

### Light Mode
- **Primary Text**: `text-gray-900` (`#111827`)
- **Secondary Text**: `text-gray-700` (`#374151`)
- **Tertiary Text**: `text-gray-600` (`#4b5563`)
- **Muted Text**: `text-gray-400` (`#9ca3af`)

### Dark Mode
- **Primary Text**: `dark:text-gray-100` (`#f3f4f6`)
- **Secondary Text**: `dark:text-gray-200` (`#e5e7eb`)
- **Tertiary Text**: `dark:text-gray-300` (`#d1d5db`)
- **Muted Text**: `dark:text-gray-400` (`#9ca3af`)

## Border Colors

### Light Mode
- **Default Border**: `border-gray-200` (`#e5e7eb`)
- **Input Border**: `ring-gray-300` (`#d1d5db`)
- **Hover Border**: `hover:border-gray-400` (`#9ca3af`)

### Dark Mode
- **Default Border**: `dark:border-gray-800` (`#1f2937`)
- **Input Border**: `dark:ring-gray-600` (`#4b5563`)
- **Hover Border**: `dark:hover:border-gray-600` (`#4b5563`)

## Button Colors

### Primary Buttons
- **Background**: `bg-blue-600` (`#2563eb`)
- **Hover**: `hover:bg-blue-700` (`#1d4ed8`)
- **Text**: `text-white`
- **Focus**: `focus:ring-blue-600`

### Secondary Buttons
- **Background**: `bg-white` / `dark:bg-gray-800`
- **Border**: `border-gray-300` / `dark:border-gray-700`
- **Hover**: `hover:bg-gray-50` / `dark:hover:bg-gray-700`
- **Text**: `text-gray-700` / `dark:text-gray-200`

### Gradient Buttons (Hero/CTA)
- **Background**: `bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600`
- **Dark Mode**: `dark:from-blue-400 dark:via-purple-400 dark:to-blue-400`
- **Shadow**: `shadow-lg shadow-purple-500/50`

## Status Colors

### Success
- **Background**: `bg-green-50` / `dark:bg-green-900/20`
- **Border**: `border-green-200` / `dark:border-green-800`
- **Text**: `text-green-800` / `dark:text-green-300`
- **Icon**: `text-green-600` / `dark:text-green-400`

### Error
- **Background**: `bg-red-50` / `dark:bg-red-900/20`
- **Border**: `border-red-200` / `dark:border-red-800`
- **Text**: `text-red-800` / `dark:text-red-300`
- **Icon**: `text-red-600` / `dark:text-red-400`

## Input Fields

### Light Mode
- **Background**: `bg-white`
- **Border**: `ring-gray-300`
- **Focus**: `focus:ring-blue-600`
- **Placeholder**: `placeholder:text-gray-400`

### Dark Mode
- **Background**: `dark:bg-gray-700`
- **Border**: `dark:ring-gray-600`
- **Focus**: `dark:focus:ring-blue-500`
- **Placeholder**: `dark:placeholder:text-gray-500`

## Usage Examples

### Primary CTA Button
```tsx
className="bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-600"
```

### Secondary Button
```tsx
className="border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
```

### Input Field
```tsx
className="bg-white dark:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600 focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 text-gray-900 dark:text-gray-100"
```

### Card Container
```tsx
className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
```

### Text Headings
```tsx
className="text-gray-900 dark:text-gray-100"
```

### Text Body
```tsx
className="text-gray-700 dark:text-gray-300"
```

### Muted Text
```tsx
className="text-gray-600 dark:text-gray-400"
```

## Notes

- Always include both light and dark mode variants
- Use Tailwind's opacity modifiers (e.g., `/30`, `/20`) for glow effects
- Maintain consistent spacing and border radius (`rounded-lg` for most elements)
- Use `transition-colors` for smooth color changes on hover/focus
- Ensure sufficient contrast ratios for accessibility
