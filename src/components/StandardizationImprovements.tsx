import { Controller, useFieldArray } from "react-hook-form"

import { Trash2 } from 'lucide-react';

import { FormSelect } from "./ui/form/FormSelect"
import { FormInput } from "./ui/form/FormInput";
import { FormDatePicker } from "./ui/form/FormDatePicker";
import { useStepForm, useFormActions } from "./FormContext"
import { Button } from "@/components/ui/button"
import { Switch } from '@/components/ui/switch';

export const StandardizationImprovements = () => {
    const form = useStepForm(7)
    const { registerStepSubmit } = useFormActions()
    const { control, register, handleSubmit, setValue, watch, formState: { errors } } = form
    const { fields, append, remove } = useFieldArray({ control, name: "items" })

    const agregarItem = () => append({ Item: "", Codigo: "", Contenido: "", Responsable: "", Cuando: undefined, Estado: "", Expansible: false })
    const eliminarItem = (index: number) => remove(index)
    return (
        <div className="flex flex-col px-10 gap-2.5 flex-1">
            {/* lista */}
            <div className="flex flex-col gap-4">
                {fields.map((_field, index) => (
                    // card
                    <div key={_field.id} className="card flex flex-col gap-4 px-4 py-4">
                        {/* título y eliminar */}
                        <div className="flex justify-between">
                            <span
                                className="text-[var(--color-text-muted)]">Ítem {index + 1}</span>
                            <button
                                onClick={() => eliminarItem(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Ítem | Código | Contenido */}
                        <div className="flex w-full justify-between">
                            {/* Ítem */}
                            <Controller name={`items.${index}.Item`} control={control} rules={{ required: "Campo requerido" }}
                                render={({ field }) => (
                                    <FormSelect title="Ítem"
                                        options={[{ label: "LUP", value: "lup" }, { label: "POEV", value: "poev" }, { label: "CAPACITACIÓN", value: "capacitación" }, { label: "CHECK LIST", value: "check-list DOC. SGI" }, { label: "DOC. SGI", value: "doc-sgi" }, { label: "RDM", value: "rdm" }, { label: "PLAN DE MANTENIMIENTO", value: "plan-de-mantenimiento" }]}
                                        value={field.value} onChange={field.onChange} error={errors.items?.[index]?.Item?.message} direction="flex-col" />
                                )} />
                            {/* Código */}
                            <Controller name={`items.${index}.Codigo`} control={control}
                                render={({ field }) => (
                                    <FormInput title="Código" value={field.value} onChange={field.onChange} error={errors.items?.[index]?.Codigo?.message} direction="flex-col"
                                    />
                                )} />
                            {/* Contenido */}
                            <Controller name={`items.${index}.Contenido`} control={control}
                                render={({ field }) => (
                                    <FormInput title="Contenido" value={field.value} onChange={field.onChange} error={errors.items?.[index]?.Contenido?.message} direction="flex-col"
                                    />
                                )} />
                        </div>
                        {/* Responsable | Cuándo | Estado | Expansible */}
                        <div className="flex w-full justify-between">
                            {/* Responsable */}
                            <Controller name={`items.${index}.Responsable`} control={control}
                                render={({ field }) => (
                                    <FormInput title="Responsable" value={field.value} onChange={field.onChange} error={errors.items?.[index]?.Responsable?.message} direction="flex-col"
                                    />
                                )} />
                            {/* Cuándo */}
                            <Controller name={`items.${index}.Cuando`} control={control} rules={{ required: "Seleccione una fecha" }}
                                render={({ field }) => (
                                    <FormDatePicker title="¿Cuándo?" value={field.value} onChange={field.onChange} error={errors.items?.[index]?.Cuando?.message} direction="flex-col" />
                                )} />
                            {/* Estado */}
                            <Controller name={`items.${index}.Estado`} control={control} rules={{ required: "Campo requerido" }}
                                render={({ field }) => (
                                    <FormSelect title="Estado"
                                        options={[{ label: "En proceso", value: "en-proceso" }, { label: "Completado", value: "completado" }]}
                                        value={field.value} onChange={field.onChange} error={errors.items?.[index]?.Estado?.message} direction="flex-col" />
                                )} />
                            {/* Expansible */}
                            <div className='flex flex-col gap-2.5 px-1.5'>
                            <span className="text-body-small whitespace-nowrap">Expansible</span>
                            <Controller
                                control={control}
                                name={`items.${index}.Expansible`}
                                render={({ field }) => (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-red-500"
                                        />
                                        <span className="text-xs font-medium text-gray-600">
                                            {field.value ? 'SÍ' : 'NO'}
                                        </span>
                                    </div>
                                )}
                            />
                            </div>
                            
                        </div>


                    </div>
                ))}
                <Button variant="outline" size="sm" className="self-start text-[var(--color-primary-100)] border-gray-300 rounded-xl hover:text-[var(--color-primary-100)]" onClick={agregarItem}>
                    Agregar Ítem
                </Button>
            </div>

        </div>
    )
}