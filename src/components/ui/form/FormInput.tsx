import { Input } from "@/components/ui/input"

interface FormInputProps {
    title: string
    placeholder?: string
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    type?: string
    error?: string
    direction?: Direction
}

type Direction = "flex-row" | "flex-col"

export const FormInput = ({
    title,
    placeholder = "Value",
    value,
    onChange,
    type = "text",
    error,
    direction,
}: FormInputProps) => {
    return (
        <div className={`flex ${direction} gap-2.5 px-1.5 items-center`}>
            <span className="text-body-small whitespace-nowrap">{title}</span>
            <Input
                id={title}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="flex-1"
            />
        </div>
    )
}