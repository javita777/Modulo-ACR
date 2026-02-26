import { useRef } from "react"
import { useForm } from "react-hook-form"
import {
    FormContext,
    type AllFormData,
    type GeneralAntecedentsValues,
    type ProblemDefinitionValues,
    type PossibleCausesValues,
    type WhysValues,
    type CausalTreeValues,
    type ActionPlansValues,
    type StandardizationImprovementsValues,
    type ApprovalValues,
} from "./FormContext"


export const FormProvider = ({ children, initialValues }: { children: React.ReactNode; initialValues?: AllFormData | null }) => {
    // Un useForm por cada step
    const form1 = useForm<GeneralAntecedentsValues>({
        defaultValues: initialValues?.step1 ?? {
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
        defaultValues: initialValues?.step2 ?? {
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
        defaultValues: initialValues?.step3 ?? { causas: [{ descripcion: '', clasificacion: '', verificado: false }] },
    })

    const form4 = useForm<WhysValues>({
        defaultValues: initialValues?.step4 ?? { sections: [] },
    })

    const form5 = useForm<CausalTreeValues>({
        defaultValues: initialValues?.step5 ?? { hechos: [{ value: "" }], diagrama: null },
    })

    const form6 = useForm<ActionPlansValues>({
        defaultValues: initialValues?.step6 ?? {
            acciones: [{ Que: "", Como: "", Quien: "", Cuando: undefined, Estado: "" }],
        },
    })

    const form7 = useForm<StandardizationImprovementsValues>({
        defaultValues: initialValues?.step7 ?? { items: [{ Item: "", Codigo: "", Contenido: "", Responsable: "", Cuando: undefined, Estado: "", Expansible: false }] },
    })

    const form8 = useForm<ApprovalValues>({
        defaultValues: initialValues?.step8 ?? { participantes: [{ fotoBD: null, fotoEscaneada: null, nombre: "", rol: "", participa: true }] },
    })

    const getAllValues = (): AllFormData => ({
        step1: form1.getValues(),
        step2: form2.getValues(),
        step3: form3.getValues(),
        step4: form4.getValues(),
        step5: form5.getValues(),
        step6: form6.getValues(),
        step7: form7.getValues(),
        step8: form8.getValues(),
    })

    // Registro de callbacks de submit por step
    const stepSubmitMap = useRef<Map<number, () => void>>(new Map())

    const registerStepSubmit = (step: number, fn: () => void) => {
        stepSubmitMap.current.set(step, fn)
    }

    const submitCurrentStep = () => {
        // Llama solo el step registrado más recientemente
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
        console.log("[Step 8] Form data:", form8.getValues())
    }

    return (
        <FormContext.Provider value={{
            forms: { 1: form1, 2: form2, 3: form3, 4: form4, 5: form5, 6: form6, 7: form7, 8: form8 },
            submitCurrentStep,
            submitAllSteps,
            registerStepSubmit,
            getAllValues,
        }}>
            {children}
        </FormContext.Provider>
    )
}
