import { useState, useRef, useEffect } from "react"
import { Controller } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { ImagePlus, X } from "lucide-react"
import { FormCombobox } from "./ui/form/FormCombobox"
import { FormDatePicker } from "./ui/form/FormDatePicker"
import { FormInput } from "./ui/form/FormInput"
import { FormSelect } from "./ui/form/FormSelect"
import { useStepForm, useFormActions, type GeneralAntecedentsValues } from "./FormContext"
import { PRACTICAS, MODOS_DE_FALLA } from "./FormProvider"

type ImagePreview = { src: string; name: string }

export const GeneralAntecedents = () => {
    const form = useStepForm(1)
    const { registerStepSubmit } = useFormActions()
    const { control, register, handleSubmit, setValue, watch, formState: { errors } } = form


    useEffect(() => {
        registerStepSubmit(1, handleSubmit(onSubmit))
    }, [])

    const onSubmit = (data: GeneralAntecedentsValues) => {
        console.log("[Step 1] Form data:", data)
    }

    const practicaSeleccionada = watch("practica")
    const mostrarModoDeFalla = practicaSeleccionada.includes("MP")

    const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success">("idle")
    const fileInputRef = useRef<HTMLInputElement>(null)
    const evidencias = watch("evidencias")

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (!files.length) return
        setUploadStatus("uploading")
        const loaded: ImagePreview[] = []
        let count = 0
        files.forEach((file) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                loaded.push({ src: reader.result as string, name: file.name })
                if (++count === files.length) {
                    setTimeout(() => {
                        setValue("evidencias", [...evidencias, ...loaded])
                        setUploadStatus("success")
                        if (fileInputRef.current) fileInputRef.current.value = ""
                    }, 700)
                }
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index: number) => {
        const next = evidencias.filter((_, i) => i !== index)
        setValue("evidencias", next)
        if (next.length === 0) setUploadStatus("idle")
    }

    return (
        <div className="flex flex-col px-10 gap-2.5">
            <div className="card flex flex-col px-4 py-4 gap-4">
                <div className="flex w-full">

                    {/* Planta/TDR | Nº Desvío */}
                    <div className="flex flex-col gap-4 w-full">
                        <Controller name="plantaTDR" control={control} rules={{ required: "Campo requerido" }}
                            render={({ field }) => (
                                <FormSelect title="Planta/TDR"
                                    options={[{ label: "Planta 1", value: "planta-1" }, { label: "Planta 2", value: "planta-2" }]}
                                    value={field.value} onChange={field.onChange} error={errors.plantaTDR?.message} />
                            )} />
                        <Controller name="nroDesvio" control={control}
                            render={({ field }) => (
                                <FormInput title="Nº Desvío" value={field.value} onChange={field.onChange} error={errors.nroDesvio?.message} />
                            )} />
                    </div>

                    {/* Área | Nº ST */}
                    <div className="flex flex-col gap-4 w-full">
                        <Controller name="area" control={control} rules={{ required: "Campo requerido" }}
                            render={({ field }) => (
                                <FormSelect title="Área"
                                    options={[{ label: "Área 1", value: "área-1" }, { label: "Área 2", value: "área-2" }]}
                                    value={field.value} onChange={field.onChange} error={errors.area?.message} />
                            )} />
                        <Controller name="nroST" control={control}
                            render={({ field }) => (
                                <FormInput title="Nº ST" value={field.value} onChange={field.onChange} error={errors.nroST?.message} />
                            )} />
                    </div>

                    {/* Línea | Nº.OM /OB */}
                    <div className="flex flex-col gap-4 w-full">
                        <Controller name="linea" control={control} rules={{ required: "Campo requerido" }}
                            render={({ field }) => (
                                <FormSelect title="Línea"
                                    options={[{ label: "Línea 1", value: "línea-1" }, { label: "Línea 2", value: "línea-2" }]}
                                    value={field.value} onChange={field.onChange} error={errors.linea?.message} />
                            )} />
                        <Controller name="nroOmOb" control={control}
                            render={({ field }) => (
                                <FormInput title="Nº.OM /OB" value={field.value} onChange={field.onChange} error={errors.nroOmOb?.message} />
                            )} />
                    </div>

                    {/* Equipo (CC) | Nº. Casos (SO) */}
                    <div className="flex flex-col gap-4 w-full">
                        <Controller name="equipoCC" control={control}
                            render={({ field }) => (
                                <FormInput title="Equipo (CC)" value={field.value} onChange={field.onChange} error={errors.equipoCC?.message} />
                            )} />
                        <Controller name="nroCasosSO" control={control}
                            render={({ field }) => (
                                <FormInput title="Nº. Casos (SO)" value={field.value} onChange={field.onChange} error={errors.nroCasosSO?.message} />
                            )} />
                    </div>

                    {/* Código | Fecha */}
                    <div className="flex flex-col gap-4 w-full">
                        <Controller name="codigo" control={control}
                            render={({ field }) => (
                                <FormInput title="Código" value={field.value} onChange={field.onChange} error={errors.codigo?.message} />
                            )} />
                        <Controller name="fecha" control={control} rules={{ required: "Seleccione una fecha" }}
                            render={({ field }) => (
                                <FormDatePicker title="Fecha" value={field.value} onChange={field.onChange} error={errors.fecha?.message} />
                            )} />
                    </div>
                </div>

                {/* Práctica */}
                <Controller name="practica" control={control} rules={{ required: "Seleccione al menos una práctica" }}
                    render={({ field }) => (
                        <FormCombobox title="Práctica" items={PRACTICAS}
                            defaultValue={field.value} onChange={field.onChange} error={errors.practica?.message} />
                    )} />

                {/* Modo de falla — solo visible cuando práctica incluye 'MP' */}
                {mostrarModoDeFalla && (
                    <Controller name="modoDeFalla" control={control} rules={{ required: "Seleccione al menos un modo de falla" }}
                        render={({ field }) => (
                            <FormCombobox title="Modo de falla" items={MODOS_DE_FALLA}
                                defaultValue={field.value} onChange={field.onChange} error={errors.modoDeFalla?.message} />
                        )} />
                )}
            </div>

            <div className="flex gap-2.5">
                {/* Evidencia del problema */}
                <div className="card flex flex-col px-4 py-4 gap-4 flex-1">
                    <span className="text-body-small font-medium">Evidencia del problema</span>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                    <div className="flex gap-2.5 px-1.5 items-center">
                        <Button variant="outline" type="button"
                            className="flex items-center gap-2 border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-all"
                            onClick={() => fileInputRef.current?.click()} disabled={uploadStatus === "uploading"}>
                            {uploadStatus === "uploading" ? (
                                <><svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>Subiendo...</>
                            ) : (
                                <><ImagePlus className="size-4" strokeWidth={2} />Añadir</>
                            )}
                        </Button>
                    </div>
                    {evidencias.length > 0 && (
                        <div className="flex flex-wrap gap-3 px-1.5">
                            {evidencias.map((img, i) => (
                                <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-red-200 shadow-sm">
                                    <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="size-3" strokeWidth={2.5} />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-[9px] truncate">{img.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Acciones inmediatas */}
                <div className="card flex flex-col px-4 py-4 gap-4 flex-1">
                    <span className="text-body-small font-medium">Acciones inmediatas</span>
                    <div className="flex flex-col gap-3 px-1.5">
                        {([0, 1, 2, 3, 4] as const).map((index) => (
                            <div key={index} className="flex items-center gap-2.5">
                                <span className="flex items-center justify-center min-w-8 h-8 rounded-md bg-[var(--color-primary)] text-white text-body-small font-medium select-none">
                                    {index + 1}
                                </span>
                                <Input type="text" placeholder="Value" className="flex-1"
                                    {...register(`accionesInmediatas.${index}`)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
