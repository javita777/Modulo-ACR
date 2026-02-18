
interface FooterProps {
    currentStep: number;
    onNext: () => void;
    onPrev: () => void;
}

export const Footer = ({ currentStep, onNext, onPrev }: FooterProps) => {
    return (
        <div
        className="flex flex-col gap-7.5 px-10"
            // style={
            //     {
            //         gap: '1.875rem',
            //         padding: ' 0rem 2.5rem',
            //         display: 'flex',
            //         flexDirection: 'column'
            //     }
            // }
            >
            {/* Divisor */}
            <div 
            className="h-0.5 bg-slate-300"
            //     style={{
            //     height: 2,
            //     backgroundColor: '#CAC4D0',
            // }}
            >
            </div>
            {/* botones */}
            <div 
                className={`flex gap-4 pb-1.5 ${
                  currentStep > 1 ? "justify-between" : "justify-end"
                }`}
              
            // style={{
            //     display: 'flex',
            //     gap: '1rem',
            //     paddingBottom: '0.375rem',
            //     justifyContent: currentStep > 1 ? 'space-between' : 'flex-end',
            // }}
            >
                {currentStep > 1 ?
                    <button
                        className="btn btn-primary"
                        onClick={onPrev} > Anterior </button> : <></>}
                <button 
                    className="btn btn-primary"
                    onClick={onNext}> Siguiente </button>
            </div>
        </div>
    )
}