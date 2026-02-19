import { useRef, useState } from "react"
import { useStepForm, useFormActions, type CausalTreeValues } from "./FormContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, X, FileText } from 'lucide-react';

import '../index.css'

export const CausalTree = () => {
    const form = useStepForm(5)
    const { registerStepSubmit } = useFormActions()
    const { register, setValue, watch } = form
    const [hechos, setHechos] = useState([0])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const diagrama = watch("diagrama")

    const agregarHecho = () => setHechos(prev => [...prev, prev.length])
    const eliminarHecho = () => setHechos(prev => prev.slice(0, -1))

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            setValue("diagrama", {
                src: reader.result as string,
                name: file.name,
                type: file.type,
            })
        }
        reader.readAsDataURL(file)
    }

    const handleRemoveFile = () => {
        setValue("diagrama", null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <div className="flex gap-4 px-10">
            {/* contenedor hechos */}
            <div className="card flex flex-col px-4 py-4 gap-4 flex-1">
                {/* título */}
                <span className="text-body-small font-medium">Hechos</span>
                {/* lista */}
                <div className="flex flex-col gap-3 px-1.5">
                    {hechos.map((index) => (
                        <div key={index} className="flex items-center gap-2.5">
                            <span className="flex items-center justify-center min-w-8 h-8 rounded-md bg-[var(--color-primary-100)] text-white text-body-small font-medium select-none">
                                {index + 1}
                            </span>
                            <Input type="text" placeholder="Value" className="flex-1"
                                {...register(`hechos.${index}`)} />
                            <button
                                onClick={eliminarHecho}
                                className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <Button variant="outline" size="sm" className="self-start text-[var(--color-primary-100)] border-gray-300 rounded-xl hover:text-[var(--color-primary-100)]" onClick={agregarHecho}>
                    Agregar Hecho
                </Button>
            </div>

            {/* subir archivo */}
            <div className="card flex flex-col px-4 py-4 gap-4 flex-1">
                {/* título */}
                <span className="text-body-small font-medium">Diagrama de flujo</span>

                {/* botón subir archivo */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Button
                    variant="outline"
                    size="sm"
                    className="self-start text-[var(--color-primary-100)] border-gray-300 rounded-xl hover:text-[var(--color-primary-100)] gap-2"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="w-4 h-4" />
                    Subir archivo
                </Button>

                {/* preview del archivo */}
                {diagrama && (
                    <div className="flex flex-col gap-2">
                        {/* nombre del archivo + botón eliminar */}
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[var(--color-primary-100)] shrink-0" />
                            <span className="text-body-small text-gray-700 truncate flex-1">{diagrama.name}</span>
                            <button
                                onClick={handleRemoveFile}
                                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* contenido */}
                        {diagrama.type.startsWith("image/") ? (
                            <img
                                src={diagrama.src}
                                alt={diagrama.name}
                                className="w-full rounded-md border border-gray-200 object-contain max-h-72"
                            />
                        ) : (
                            <iframe
                                src={diagrama.src}
                                title={diagrama.name}
                                className="w-full h-72 rounded-md border border-gray-200"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}