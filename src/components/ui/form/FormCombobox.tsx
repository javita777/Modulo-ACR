import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"

type Direction = "flex-row" | "flex-col"

interface FormComboboxProps {
    title: string
    items: string[]
    defaultValue?: string[]
    value?: string[]
    onChange?: (value: string[]) => void
    error?: string
    direction?: Direction
}

export const FormCombobox = ({
    title,
    items,
    defaultValue,
    value,
    onChange,
    error,
    direction,
}: FormComboboxProps) => {
    const anchor = useComboboxAnchor()

    return (
        <div className={`flex ${direction} gap-2.5 px-1.5 items-center w-full`}>
            <span className="text-body-small whitespace-nowrap">{title}</span>
            <Combobox
                multiple
                autoHighlight
                items={items}
                defaultValue={defaultValue}
                value={value}
                onValueChange={onChange}
            >
                <ComboboxChips ref={anchor} className="flex-1 justify-between flex-nowrap">
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 overflow-hidden">
                        <ComboboxValue>
                            {(values: string[]) => (
                                <>
                                    {values.map((value) => (
                                        <ComboboxChip
                                            key={value}
                                            className="bg-[var(--color-primary-50)] text-black hover:bg-[#c42328] border-none"
                                        >
                                            {value}
                                        </ComboboxChip>
                                    ))}
                                    <ComboboxChipsInput />
                                </>
                            )}
                        </ComboboxValue>
                    </div>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item: string) => (
                            <ComboboxItem key={item} value={item}>
                                {item}
                            </ComboboxItem>
                        )}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    )
}