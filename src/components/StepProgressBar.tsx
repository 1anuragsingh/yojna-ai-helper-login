import { Check } from "lucide-react";

interface StepProgressBarProps {
  steps: string[];
  currentStep: number;
}

const StepProgressBar = ({ steps, currentStep }: StepProgressBarProps) => {
  return (
    <div className="flex items-center justify-center gap-0 px-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
            </div>
            <span className="mt-1.5 max-w-[4rem] text-center text-[10px] font-medium text-muted-foreground">
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-1 h-0.5 w-8 rounded-full transition-all ${
                index < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepProgressBar;
