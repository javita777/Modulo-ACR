import { useEffect } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useStepForm, useFormActions, type PossibleCausesValues } from './FormContext';

const CLASIFICACIONES = [
    "Materiales",
    "Medio Ambiente",
    "Máquina",
    "Mano de obra",
    "Método",
    "Medición"
];

export const PossibleCauses = () => {
    const form = useStepForm(3)
    const { registerStepSubmit } = useFormActions()
    const { control, register, handleSubmit } = form

    useEffect(() => {
        registerStepSubmit(3, handleSubmit(onSubmit))
    }, [])

    const onSubmit = (data: PossibleCausesValues) =>
        console.log("[Step 3] Form data:", data)

    const { fields, append, remove } = useFieldArray({
        control,
        name: "causas"
    });

    const addCause = () => {
        append({
            descripcion: '',
            clasificacion: '',
            verificado: false
        });
    };

    return (
        <div className="flex flex-col px-10 gap-2.5">
            {/* Tabla */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Header */}
                <div className="grid grid-cols-[auto_1fr_400px_140px] gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="w-16"></div>
                    <div className="font-semibold text-gray-700">Causa</div>
                    <div className="font-semibold text-gray-700">Clasificación</div>
                    <div className="font-semibold text-gray-700 text-center">
                        Causa<br />comprobada
                    </div>
                </div>

                {/* Filas */}
                <div className="divide-y divide-gray-200">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="grid grid-cols-[auto_1fr_400px_140px] gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                        >
                            {/* Número + eliminar */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-red-500 text-white flex items-center justify-center font-semibold">
                                    {index + 1}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Causa */}
                            <Input
                                {...register(`causas.${index}.descripcion`)}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                                placeholder="Descripción de la causa"
                            />

                            {/* Clasificacion */}
                            <Controller
                                control={control}
                                name={`causas.${index}.clasificacion`}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                                            <SelectValue placeholder="Seleccionar clasificación" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CLASIFICACIONES.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {/* Causa comprobada */}
                            <Controller
                                control={control}
                                name={`causas.${index}.verificado`}
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
                    ))}
                </div>
            </div>

            {/* Agregar */}
            <Button
                type="button"
                onClick={addCause}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white"
            >
                Agregar Causa
            </Button>
        </div>
    );
};
