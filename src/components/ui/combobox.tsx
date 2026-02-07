"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
    value: string
    label: string
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    className?: string
    disabled?: boolean
    name?: string
    allowCustom?: boolean
}

export function Combobox({
    options,
    value: controlledValue,
    defaultValue,
    onChange,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    className,
    disabled = false,
    name,
    allowCustom = false
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(defaultValue || "")
    const [search, setSearch] = React.useState("")

    const value = controlledValue !== undefined ? controlledValue : internalValue

    const handleSelect = (currentValue: string) => {
        const newValue = currentValue === value ? "" : currentValue
        if (controlledValue === undefined) {
            setInternalValue(newValue)
        }
        onChange?.(newValue)
        setOpen(false)
        setSearch("")
    }

    const handleCustom = () => {
        if (!allowCustom || !search) return
        if (controlledValue === undefined) {
            setInternalValue(search)
        }
        onChange?.(search)
        setOpen(false)
        setSearch("")
    }

    const selectedLabel = options.find((option) => option.value === value)?.label || value

    return (
        <>
            {name && <input type="hidden" name={name} value={value} />}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between bg-background border-input text-foreground hover:bg-accent hover:text-accent-foreground",
                            className,
                            !value && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        {value ? selectedLabel : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 z-[100] bg-popover border-border text-popover-foreground">
                    <Command className="bg-popover text-popover-foreground">
                        <CommandInput
                            placeholder={searchPlaceholder}
                            value={search}
                            onValueChange={setSearch}
                            className="text-foreground placeholder:text-muted-foreground"
                        />
                        <CommandList>
                            <CommandEmpty className="py-2 text-sm text-center text-muted-foreground">
                                {allowCustom && search ? (
                                    <div
                                        className="px-2 py-1 cursor-pointer hover:bg-accent text-accent-foreground flex items-center justify-center gap-1"
                                        onClick={handleCustom}
                                    >
                                        <Check className="h-3 w-3 opacity-0" />
                                        使用 "{search}"
                                    </div>
                                ) : (
                                    emptyText
                                )}
                            </CommandEmpty>
                            <CommandGroup heading="選項" className="text-muted-foreground">
                                {options.map((option) => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label}
                                        onSelect={() => handleSelect(option.value)} // Use value not label
                                        className="text-foreground aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === option.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </>
    )
}
