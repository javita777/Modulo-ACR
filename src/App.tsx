import { useState } from "react";


import { Header } from "./components/Header";
import { Stepper } from "./components/Stepper";
import { Footer } from "./components/Footer";

import { GeneralAntecedents } from "./components/GeneralAntecedents";
import { ProblemDefinition } from "./components/ProblemDefinition";
import { PossibleCauses } from "./components/PossibleCauses";
import { Whys } from "./components/Whys";
// import { CausalTree } from "./components/CausalTree";
// import { ActionPlans } from "./components/ActionPlans";
// import { StandardizationImprovements } from "./components/StandardizationImprovements";
import { FormProvider } from "./components/FormProvider";


export const App = () => {
    const [currentStep, setCurrentStep] = useState(2);

    const handleNext = () => {
        if (currentStep < 7) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return <GeneralAntecedents />;
            case 2:
                return <ProblemDefinition />;
            case 3:
                return <PossibleCauses />;
            case 4:
                return <Whys />;
            //          case 5:
            //              return <CausalTree />;
            //          case 6:
            //              return <ActionPlans />;
            //          case 7:
            //              return <StandardizationImprovements />;
        }
    };

    return (
        <FormProvider>
            <div className="flex flex-col gap-7.5" >
                <Header />
                <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
                {renderContent()}
                <Footer currentStep={currentStep} onNext={handleNext} onPrev={handlePrev} />
            </div>
        </FormProvider>
    )
} 