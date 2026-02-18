import '../index.css'

import { Fragment } from 'react'
import { ChevronRight, Check } from 'lucide-react'

const steps = [
    { id: 1, label: "Antecedentes Generales" },
    { id: 2, label: "Definición problemas (5W+1H)" },
    { id: 3, label: "Posibles causas (lluvia de ideas)" },
    { id: 4, label: "5 por qué" },
    { id: 5, label: "Árbol causal" },
    { id: 6, label: "Planes de acción" },
    { id: 7, label: "Estandarización de mejoras" },
];

interface StepperProps {
    currentStep: number;
    onStepClick?: (stepId: number) => void;
}

export const Stepper = ({ currentStep, onStepClick }: StepperProps) => {
    return (
        <div className="px-10 flex flex-wrap justify-center gap-2 w-full items-center box-border">

            {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const isPending = step.id > currentStep;

                return (
                    <Fragment key={step.id}>
                        {/* Paso */}
                        <div
                            className="flex gap-2 items-center cursor-pointer group"
                            onClick={() => onStepClick && onStepClick(step.id)}
                        >
                            {/* Número / check */}
                            <div
                                className={[
                                    'text-body-small-strong',
                                    'rounded-full h-7 w-7 flex items-center justify-center',
                                    'border-2',
                                    isActive
                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                        : isPending
                                            ? 'bg-[#E1E1E6] text-[#8D8D99] border-[#8d8d99]'
                                            : 'bg-white text-[#8D8D99] border-[var(--color-primary)]',
                                ].join(' ')}
                            >
                                {isCompleted
                                    ? <Check color="var(--color-primary)" />
                                    : step.id
                                }
                            </div>

                            {/* Texto */}
                            <div
                                className={[
                                    'text-body-small-strong leading-none text-center',
                                    isActive ? 'text-[#323238]' : 'text-[#8d8d99]',
                                ].join(' ')}
                            >
                                {step.label.split('(').map((part, i) => (
                                    <p key={i}>{i === 1 ? `(${part}` : part}</p>
                                ))}
                            </div>
                        </div>

                        {/* Flecha */}
                        {index < steps.length - 1 && (
                            <div className="mx-2 flex-shrink-0">
                                <ChevronRight />
                            </div>
                        )}
                    </Fragment>
                );
            })}

        </div>
    );
};