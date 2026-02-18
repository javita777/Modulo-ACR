import { useRef, useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress"

import logo from '../assets/Logo-transparente.png'
import '../index.css'
import { useFormActions, useStepForm, GA_PROGRESS_FIELDS, PD_PROGRESS_FIELDS } from './FormContext';

export const Header = () => {
    const { submitAllSteps } = useFormActions()

    // ── Step 1: Antecedentes Generales ────────────────────────────────────────
    const form1 = useStepForm(1)
    const watchedStep1 = form1.watch(GA_PROGRESS_FIELDS)
    const progressStep1 = Math.round(
        (watchedStep1.filter((val) => {
            if (val === undefined || val === null) return false
            if (typeof val === "string") return val.trim() !== ""
            if (Array.isArray(val)) return val.length > 0
            return true
        }).length / GA_PROGRESS_FIELDS.length) * 100
    )

    // ── Step 2: Definición del Problema ───────────────────────────────────────
    const form2 = useStepForm(2)
    const watchedStep2 = form2.watch(PD_PROGRESS_FIELDS)
    const progressStep2 = Math.round(
        (watchedStep2.filter((val) => {
            if (val === undefined || val === null) return false
            if (typeof val === "string") return val.trim() !== ""
            return true
        }).length / PD_PROGRESS_FIELDS.length) * 100
    )

    // ── Step 3: Posibles Causas ────────────────────────────────────────────────
    const form3 = useStepForm(3)
    const causas = form3.watch("causas") ?? []
    const progressStep3 = causas.length === 0
        ? 0
        : Math.round(
            (causas.filter(c => c.descripcion?.trim() !== '' && c.clasificacion !== '').length
                / causas.length) * 100
        )

    // ── Progreso total (promedio de todos los steps) ──────────────────────────
    const progress = Math.round((progressStep1 + progressStep2 + progressStep3) / 3)

    const [logoContainerHeight, setLogoContainerHeight] = useState<number | undefined>(undefined);
    const titleContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeight = () => {
            if (titleContainerRef.current) {
                setLogoContainerHeight(titleContainerRef.current.clientHeight);
            }
        };
        updateHeight();
        setTimeout(updateHeight, 0);
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return (
        <div className='card flex justify-between w-full items-stretch box-border'>
            <div className='flex items-stretch h-fit'>
                {/* Logo */}
                <div className='flex items-center' style={{ height: logoContainerHeight }}>
                    <img src={logo} alt="B2exc logo" className='h-full w-auto' />
                </div>

                {/* Título y botones */}
                <div ref={titleContainerRef} className='gap-4 p-1 h-fit flex flex-col'>
                    <h2 className='text-[32px] font-bold'>
                        ACR - Análisis Causa Raíz
                    </h2>
                    <div className='flex gap-4 pb-1.5'>
                        <button className="btn btn-secondary">Restablecer</button>
                        <button
                            className="btn btn-primary"
                            onClick={submitAllSteps}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>

            {/* Progreso */}
            <div className='px-5 py-1.5'>
                <div className='card h-fit p-1.5'>
                    <div className='flex justify-between gap-16'>
                        <span className="text-body-strong text-text-placeholder">Progreso</span>
                        <span className='text-body-strong text-text-placeholder'>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-[60%]" />
                </div>
            </div>
        </div>
    )
}
