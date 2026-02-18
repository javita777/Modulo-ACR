import '../index.css'

import { Info } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStepForm, useFormActions, type ProblemDefinitionValues } from './FormContext'

// ── Tooltips ──────────────────────────────────────────────────────────────────

const tooltipMap: Record<string, string> = {
    '¿Qué problema es?': 'Describe brevemente el defecto o falla detectada. Ej: "Producto con dimensión fuera de especificación".',
    '¿Dónde ocurrió?': 'Indica el lugar físico, línea de producción o proceso donde se identificó el problema.',
    '¿A quién le ocurrió?': 'Menciona el equipo, operario, cliente o área afectada por el problema.',
    '¿Cuándo ocurrió?': 'Especifica la fecha y hora en que se detectó o inició el problema.',
    '¿Cuál es la tendencia?': 'Indica si el problema va en aumento, disminución o se mantiene estable con el tiempo.',
    '¿Cuán grande es?': 'Cuantifica el impacto: número de piezas afectadas, porcentaje de defectos, costo estimado, etc.',
    'Descripción del problema': 'Detalla qué se observó antes, durante y después del problema. Incluye síntomas, condiciones y cualquier dato relevante.',
}

// Mapeo título → clave del formulario
const fieldKey: Record<string, keyof ProblemDefinitionValues> = {
    '¿Qué problema es?':    'queProblema',
    '¿Dónde ocurrió?':      'dondeOcurrio',
    '¿A quién le ocurrió?': 'aQuienOcurrio',
    '¿Cuándo ocurrió?':     'cuandoOcurrio',
    '¿Cuál es la tendencia?': 'cualTendencia',
    '¿Cuán grande es?':     'cuanGrande',
    'Descripción del problema': 'descripcion',
}


interface TooltipPortalProps {
    text: string
    anchorRef: React.RefObject<HTMLDivElement>
}

const TooltipPortal = ({ text, anchorRef }: TooltipPortalProps) => {
    const [coords, setCoords] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect()
            setCoords({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX + rect.width / 2,
            })
        }
    }, [anchorRef])

    return createPortal(
        <div
            style={{ top: coords.top, left: coords.left }}
            className="absolute z-[9999] -translate-x-1/2 w-56 rounded-md bg-gray-800 text-white text-xs px-3 py-2 shadow-lg pointer-events-none"
        >
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-800" />
            {text}
        </div>,
        document.body
    )
}


export const ProblemDefinition = () => {
    const form = useStepForm(2)
    const { registerStepSubmit } = useFormActions()
    const { register, handleSubmit, formState: { errors } } = form

    useEffect(() => {
        registerStepSubmit(2, handleSubmit(onSubmit))
    }, [])

    const onSubmit = (data: ProblemDefinitionValues) => {
        console.log("[Step 2] Form data:", data)
    }

    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const anchorRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({})

    Object.keys(tooltipMap).forEach((key) => {
        if (!anchorRefs.current[key]) {
            anchorRefs.current[key] = { current: null } as unknown as React.RefObject<HTMLDivElement>
        }
    })

    const handleMouseEnter = (title: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setActiveTooltip(title)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setActiveTooltip(null), 100)
    }

    const formUnitario = (title: string) => {
        const tooltip = tooltipMap[title]
        const key = fieldKey[title]
        const error = errors[key]

        return (
            <div className='flex flex-col gap-2 flex-1'>
                <div className='flex gap-2 items-center'>
                    <span className='text-body-small whitespace-nowrap'>{title}</span>
                    {tooltip && (
                        <div
                            ref={anchorRefs.current[title]}
                            className="relative inline-flex"
                            onMouseEnter={() => handleMouseEnter(title)}
                            onMouseLeave={handleMouseLeave}
                        >
                            <Info
                                color='var(--color-text-muted)'
                                size={20}
                                className="cursor-pointer hover:opacity-70 transition-opacity"
                            />
                            {activeTooltip === title && (
                                <TooltipPortal
                                    text={tooltip}
                                    anchorRef={anchorRefs.current[title]}
                                />
                            )}
                        </div>
                    )}
                </div>
                <input
                    id={title}
                    type="text"
                    placeholder="Value"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    {...register(key, { required: "Campo requerido" })}
                />
                {error && <span className="text-xs text-red-500">{error.message}</span>}
            </div>
        )
    }

    return (
        <div className="flex flex-col px-10 gap-2.5">
            <div className="card flex flex-col px-4 py-4 gap-4">
                <span className="text-[var(--color-text-muted)]">
                    ¿Qué fue observado? (antes, durante y luego del problema ocurrido)
                </span>
                <div className='flex gap-4'>
                    {formUnitario('¿Qué problema es?')}
                    {formUnitario('¿Dónde ocurrió?')}
                </div>
                <div className='flex gap-4'>
                    {formUnitario('¿A quién le ocurrió?')}
                    {formUnitario('¿Cuándo ocurrió?')}
                </div>
                <div className='flex gap-4'>
                    {formUnitario('¿Cuál es la tendencia?')}
                    {formUnitario('¿Cuán grande es?')}
                </div>
                {formUnitario('Descripción del problema')}
            </div>
        </div>
    )
}
