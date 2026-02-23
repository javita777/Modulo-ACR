
interface FooterProps {
    currentStep: number;
    onNext: () => void;
    onPrev: () => void;
}

export const Footer = ({ currentStep, onNext, onPrev }: FooterProps) => {
    return (
        <div
            className="flex flex-col gap-7.5 px-10"
        >
            {/* Divisor */}
            {currentStep < 8 ?
                <div
                    className="h-0.5 bg-slate-300"
                >
                </div> : <></>}


            {/* botones */}
            <div
                className={`flex gap-4 pb-1.5 ${currentStep > 1 ? currentStep < 8 ? "justify-between" : "justify-start" : "justify-end"
                    }`}
            >
                {currentStep > 1 ?
                    <button
                        className="btn btn-primary"
                        onClick={onPrev} > Anterior </button> : <></>}
                {currentStep < 8 ?
                    <button
                        className="btn btn-primary"
                        onClick={onNext}> Siguiente </button> : <></>
                }

            </div>
        </div>
    )
}