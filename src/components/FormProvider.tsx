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
import { PRACTICAS, MODOS_DE_FALLA } from "./GeneralAntecedents"

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
    // Un useForm por cada step
    const form1 = useForm<GeneralAntecedentsValues>({
        defaultValues: {
            plantaTDR: "", area: "", linea: "", equipoCC: "", codigo: "",
            nroDesvio: "", nroST: "", nroOmOb: "", nroCasosSO: "",
            fecha: undefined,
            practica: [],
            modoDeFalla: [],
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
        defaultValues: { causas: [{ descripcion: '', clasificacion: '', verificado: false }] },
    })

    const form4 = useForm<WhysValues>({
        defaultValues: { sections: [] },
    })

    const form5 = useForm<CausalTreeValues>({
        defaultValues: { hechos: [{ value: "" }], diagrama: null },
    })

    const form6 = useForm<ActionPlansValues>({
        defaultValues: {
            acciones: [{ Que: "", Como: "", Quien: "", Cuando: undefined, Estado: "" }],
        },
    })

    const form7 = useForm<StandardizationImprovementsValues>({
        defaultValues: {  items: [{ Item: "", Codigo: "", Contenido: "", Responsable: "", Cuando: undefined, Estado: "", Expansible: false }], },
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
        console.log("[Step 1] Form data:", form1.getValues())
        console.log("[Step 2] Form data:", form2.getValues())
        console.log("[Step 3] Form data:", form3.getValues())
        console.log("[Step 4] Form data:", form4.getValues())
        console.log("[Step 5] Form data:", form5.getValues())
        console.log("[Step 6] Form data:", form6.getValues())
        console.log("[Step 7] Form data:", form7.getValues())
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
