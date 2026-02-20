import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FormDatePickerProps {
    title: string
    value?: Date
    onChange?: (date: Date | undefined) => void
    error?: string
    direction?: Direction
}

type Direction = "flex-row" | "flex-col"

export const FormDatePicker = ({ title, value, onChange, error, direction, }: FormDatePickerProps) => {
    return (
        <div className={`flex flex-1 ${direction} gap-2.5 px-1.5 ${direction === 'flex-row' ? 'items-center' : ''}`}>
            <span className="text-body-small whitespace-nowrap">{title}</span>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" type="button"
                        data-empty={!value}
                        className="data-[empty=true]:text-muted-foreground flex-1 justify-between text-left font-normal">
                        {value ? format(value, "PPP") : <span>Seleccione fecha</span>}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={value} onSelect={onChange} defaultMonth={value} />
                </PopoverContent>
            </Popover>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    )
}
