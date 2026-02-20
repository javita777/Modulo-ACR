import { Controller, useFieldArray } from "react-hook-form"

import { Trash2 } from 'lucide-react';

import { FormInput } from "./ui/form/FormInput"
import { useStepForm, useFormActions } from "./FormContext"
import { Button } from "@/components/ui/button"
import { FormSelect } from "./ui/form/FormSelect"
import { FormDatePicker } from "./ui/form/FormDatePicker"

export const ActionPlans = () => {
    const form = useStepForm(6)
    const { registerStepSubmit } = useFormActions()
    const { control, register, handleSubmit, setValue, watch, formState: { errors } } = form
    const { fields, append, remove } = useFieldArray({ control, name: "acciones" })

    const agregarAccion = () => append({ Que: "", Como: "", Quien: "", Cuando: undefined, Estado: "" })
    const eliminarAccion = (index: number) => remove(index)
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
                                className="text-[var(--color-text-muted)]">Acción {index + 1}</span>
                            <button
                                onClick={() => eliminarAccion(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Qué */}
                        <Controller name={`acciones.${index}.Que`} control={control}
                            render={({ field }) => (
                                <FormInput title="¿Qué? (Causa Raíz)" value={field.value} onChange={field.onChange} error={errors.acciones?.[index]?.Que?.message} direction="flex-col"
                                />
                            )} />
                        {/* Cómo */}
                        <Controller name={`acciones.${index}.Como`} control={control}
                            render={({ field }) => (
                                <FormInput title="¿Cómo? (Acción Correctiva)" value={field.value} onChange={field.onChange} error={errors.acciones?.[index]?.Como?.message} direction="flex-col"
                                />
                            )} />
                        {/* responsable | cuándo | estado */}
                        <div className="flex w-full justify-between">
                            {/* Quién */}
                            <Controller name={`acciones.${index}.Quien`} control={control}
                                render={({ field }) => (
                                    <FormInput title="¿Quién?" value={field.value} onChange={field.onChange} error={errors.acciones?.[index]?.Quien?.message} direction="flex-col"
                                    />
                                )} />
                            {/* Cuándo */}
                            <Controller name={`acciones.${index}.Cuando`} control={control} rules={{ required: "Seleccione una fecha" }}
                                render={({ field }) => (
                                    <FormDatePicker title="¿Cuándo?" value={field.value} onChange={field.onChange} error={errors.acciones?.[index]?.Cuando?.message} direction="flex-col" />
                                )} />
                            {/* Estado */}
                            <Controller name={`acciones.${index}.Estado`} control={control} rules={{ required: "Campo requerido" }}
                                render={({ field }) => (
                                    <FormSelect title="Estado"
                                        options={[{ label: "En proceso", value: "en-proceso" }, { label: "Completado", value: "completado" }]}
                                        value={field.value} onChange={field.onChange} error={errors.acciones?.[index]?.Estado?.message} direction="flex-col" />
                                )} />
                        </div>
                    </div>
                ))}
                <Button variant="outline" size="sm" className="self-start text-[var(--color-primary-100)] border-gray-300 rounded-xl hover:text-[var(--color-primary-100)]" onClick={agregarAccion}>
                    Agregar Acción
                </Button>
            </div>

        </div>
    )
}