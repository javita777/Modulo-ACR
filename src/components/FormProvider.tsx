import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import {
    FormContext,
    type GeneralAntecedentsValues,
    type ProblemDefinitionValues,
    type PossibleCausesValues,
    type WhysValues,
    type CausalTreeValues,
    type ActionPlansValues,
    type StandardizationImprovementsValues,
} from "./FormContext"

// Constantes exportadas para defaultValues del step 1
export const PRACTICAS: string[] = ['CI', 'GA', 'DE', '5S', 'SO', 'ME', 'MA', 'MP', 'PC', 'LTD']
export const MODOS_DE_FALLA: string[] = [
    'Falla Métodos o Errores de Operación y Mantenimiento',
    'Falla alimentación eléctrica',
    'Falla en sensores o transductores',
    'Falla de refrigeración o sobrecalentamiento',
    'Falla en dispositivos de seguridad',
    'Falla de comunicación',
    'Falla en actuadores, transmisiones o motores',
    'Falla de procesamiento o control (software)',
    'Falla en el cableado o conexiones',
    'Falla en las interfaces de usuario',
    'Falla en sistemas hidráulicos o neumáticos',
    'Falla en los sistemas de protección',
    'Modos de Falla en Control de Calidad',
]

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
    // Un useForm por cada step
    const form1 = useForm<GeneralAntecedentsValues>({
        defaultValues: {
            plantaTDR: "", area: "", linea: "", equipoCC: "", codigo: "",
            nroDesvio: "", nroST: "", nroOmOb: "", nroCasosSO: "",
            fecha: undefined,
            practica: [PRACTICAS[0]],
            modoDeFalla: [MODOS_DE_FALLA[0]],
            evidencias: [],
            accionesInmediatas: ["", "", "", "", ""],
        },
    })

    const form2 = useForm<ProblemDefinitionValues>({
        defaultValues: {
            queProblema: "",
            dondeOcurrio: "",
            aQuienOcurrio: "",
            cuandoOcurrio: "",
            cualTendencia: "",
            cuanGrande: "",
            descripcion: "",
        },
    })

    const form3 = useForm<PossibleCausesValues>({
        defaultValues: { causas: [] },
        })

    const form4 = useForm<WhysValues>({
        defaultValues: { why1: "", why2: "", why3: "", why4: "", why5: "" },
    })

    const form5 = useForm<CausalTreeValues>({
        defaultValues: { causaRaiz: "", notas: "" },
    })

    const form6 = useForm<ActionPlansValues>({
        defaultValues: {
            acciones: [{ descripcion: "", responsable: "", fechaLimite: undefined }],
        },
    })

    const form7 = useForm<StandardizationImprovementsValues>({
        defaultValues: { estandarizacion: "", mejoras: "" },
    })

    // Registro de callbacks de submit por step
    const stepSubmitMap = useRef<Map<number, () => void>>(new Map())

    const registerStepSubmit = (step: number, fn: () => void) => {
        stepSubmitMap.current.set(step, fn)
    }

    const submitCurrentStep = () => {
        // Llama solo el step registrado más recientemente (compatibilidad)
        const fns = [...stepSubmitMap.current.values()]
        fns.at(-1)?.()
    }

    const submitAllSteps = () => {
        stepSubmitMap.current.forEach(fn => fn())
    }

    return (
        <FormContext.Provider value={{
            forms: { 1: form1, 2: form2, 3: form3, 4: form4, 5: form5, 6: form6, 7: form7 },
            submitCurrentStep,
            submitAllSteps,
            registerStepSubmit,
        }}>
            {children}
        </FormContext.Provider>
    )
}
