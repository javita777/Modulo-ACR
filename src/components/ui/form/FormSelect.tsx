import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface FormSelectProps {
    title: string
    options: { label: string; value: string }[]
    placeholder?: string
    value?: string
    onChange?: (value: string) => void
    error?: string
    direction?: Direction
}

type Direction = "flex-row" | "flex-col"

export const FormSelect = ({
    title,
    options,
    placeholder = "Select",
    value,
    onChange,
    error,
    direction,
}: FormSelectProps) => {
    return (
        <div className={`flex ${direction} gap-2.5 px-1.5 items-center`}>
            <span className="text-body-small whitespace-nowrap">{title}</span>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}