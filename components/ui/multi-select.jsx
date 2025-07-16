"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const MultiSelect = React.forwardRef(({ 
  className, 
  disabled, 
  placeholder,
  value = [],
  onValueChange,
  children,
  ...props 
}, ref) => {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selectedValue) => {
    if (disabled) return
    const newValue = value.includes(selectedValue)
      ? value.filter(v => v !== selectedValue)
      : [...value, selectedValue]
    onValueChange?.(newValue)
  }

  return (
    <div className="relative">
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          disabled && "cursor-not-allowed opacity-50",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          className
        )}
      >
        {value.length > 0 ? (
          value.map((item) => (
            <Badge key={item} variant="secondary" className="max-w-[200px] truncate">
              {props.getDisplayValue?.(item) || item}
              <button
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background hover:bg-secondary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSelect(item)
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-1">
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  key: child.key || `multi-select-item-${index}`,
                  onClick: () => {
                    handleSelect(child.props.value)
                    setOpen(false)
                  },
                  className: cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    value.includes(child.props.value) && "bg-accent text-accent-foreground",
                    child.props.className
                  )
                })
              }
              return child
            })}
          </div>
        </div>
      )}
    </div>
  )
})
MultiSelect.displayName = "MultiSelect"

const MultiSelectItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
})
MultiSelectItem.displayName = "MultiSelectItem"

export { MultiSelect, MultiSelectItem } 