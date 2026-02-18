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
}

export const FormDatePicker = ({ title, value, onChange, error }: FormDatePickerProps) => {
    return (
        <div className="flex gap-2.5 px-1.5 items-center">
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
