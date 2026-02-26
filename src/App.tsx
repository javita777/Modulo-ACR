import { useState } from "react";


import { Header } from "./components/Header";
import { Stepper } from "./components/Stepper";
import { Footer } from "./components/Footer";

import { GeneralAntecedents } from "./components/GeneralAntecedents";
import { ProblemDefinition } from "./components/ProblemDefinition";
import { PossibleCauses } from "./components/PossibleCauses";
import { Whys } from "./components/Whys";
import { CausalTree } from "./components/CausalTree";
import { ActionPlans } from "./components/ActionsPlan";
import { StandardizationImprovements } from "./components/StandardizationImprovements";
import { Summary } from "./components/Summary";

import { FormProvider } from "./components/FormProvider";


export const App = () => {
    const [currentStep, setCurrentStep] = useState(1);

    const handleNext = () => {
        if (currentStep < 8) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const renderContentForm = () => {
        switch (currentStep) {
            case 1:
                return <GeneralAntecedents />;
            case 2:
                return <ProblemDefinition />;
            case 3:
                return <PossibleCauses />;
            case 4:
                return <Whys />;
            case 5:
                return <CausalTree />;
            case 6:
                return <ActionPlans />;
            case 7:
                return <StandardizationImprovements />;
        }
    };

    const renderContent = () => {
        switch (currentStep) {
            case 8:
                return (
                    <div className="flex flex-col gap-7.5">
                        <Header />
                        <Footer currentStep={currentStep} onNext={handleNext} onPrev={handlePrev} />
                        <Summary />
                    </div>

                )
            default:
                return (
                    <div className="flex flex-col gap-7.5" >
                        <Header />
                        <Stepper currentStep={currentStep} onStepClick={setCurrentStep} />
                        {renderContentForm()}
                        <Footer currentStep={currentStep} onNext={handleNext} onPrev={handlePrev} />
                    </div>
                )
        }
    }

    return (
        <FormProvider>
            {renderContent()}
        </FormProvider>
    )
} 