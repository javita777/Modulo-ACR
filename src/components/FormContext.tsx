import { createContext, useContext } from "react"
import { type UseFormReturn, useForm } from "react-hook-form"

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de cada formulario
// ─────────────────────────────────────────────────────────────────────────────

type ImagePreview = { src: string; name: string }

export type GeneralAntecedentsValues = {
    plantaTDR: string
    area: string
    linea: string
    equipoCC: string
    codigo: string
    nroDesvio: string
    nroST: string
    nroOmOb: string
    nroCasosSO: string
    fecha: Date | undefined
    practica: string[]
    modoDeFalla: string[]
    evidencias: ImagePreview[]
    accionesInmediatas: [string, string, string, string, string]
}

export type ProblemDefinitionValues = {
    queProblema: string
    dondeOcurrio: string
    aQuienOcurrio: string
    cuandoOcurrio: string
    cualTendencia: string
    cuanGrande: string
    descripcion: string
}

export type PossibleCausesValues = {
    causas: {
        descripcion: string
        clasificacion: string
        verificado: boolean
    }[]
}

export type WhyNodeKind = 'cv' | 'why' | 'root'

export type WhyNode = {
    id: string
    kind: WhyNodeKind
    col: number
    row: number
    text: string
    isRootCause: boolean
    parentId: string | null
}

export type WhySection = {
    id: string
    causaValidada: string   // nombre de la causa validada (origen)
    nodes: WhyNode[]
}

export type WhysValues = {
    sections: WhySection[]
}

export type CausalTreeValues = {
    causaRaiz: string
    notas: string
}

export type ActionPlansValues = {
    acciones: { descripcion: string; responsable: string; fechaLimite: Date | undefined }[]
}

export type StandardizationImprovementsValues = {
    estandarizacion: string
    mejoras: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Contexto
// ─────────────────────────────────────────────────────────────────────────────

export type StepForms = {
    1: UseFormReturn<GeneralAntecedentsValues>
    2: UseFormReturn<ProblemDefinitionValues>
    3: UseFormReturn<PossibleCausesValues>
    4: UseFormReturn<WhysValues>
    5: UseFormReturn<CausalTreeValues>
    6: UseFormReturn<ActionPlansValues>
    7: UseFormReturn<StandardizationImprovementsValues>
}

type FormContextValue = {
    forms: StepForms
    submitCurrentStep: () => void
    submitAllSteps: () => void
    registerStepSubmit: (step: number, fn: () => void) => void
}

const FormContext = createContext<FormContextValue | null>(null)

export const useStepForm = <T extends keyof StepForms>(step: T): StepForms[T] => {
    const ctx = useContext(FormContext)
    if (!ctx) throw new Error("useStepForm must be used inside FormProvider")
    return ctx.forms[step] as StepForms[T]
}

export const useFormActions = () => {
    const ctx = useContext(FormContext)
    if (!ctx) throw new Error("useFormActions must be used inside FormProvider")
    return {
        submitCurrentStep: ctx.submitCurrentStep,
        submitAllSteps: ctx.submitAllSteps,
        registerStepSubmit: ctx.registerStepSubmit,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Campos que cuentan para el progreso del step 1
// ─────────────────────────────────────────────────────────────────────────────

export const GA_PROGRESS_FIELDS: (keyof GeneralAntecedentsValues)[] = [
    "plantaTDR", "area", "linea", "equipoCC", "codigo",
    "nroDesvio", "nroST", "nroOmOb", "nroCasosSO",
    "fecha", "practica", "evidencias",
]

export const PD_PROGRESS_FIELDS: (keyof ProblemDefinitionValues)[] = [
    "queProblema", "dondeOcurrio", "aQuienOcurrio", "cuandoOcurrio",
    "cualTendencia", "cuanGrande", "descripcion",
]

export { FormContext }
