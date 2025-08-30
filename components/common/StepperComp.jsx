"use client";
import { motion } from "framer-motion";

export default function StepperComp({
  activeStep,
  onStepChange,
  disabledSteps,
}) {
  const steps = [
    { number: 1, label: "Mobile" },
    { number: 2, label: "Profile" },
    { number: 3, label: "Booking" },
    { number: 4, label: "Print" },
  ];

  return (
    <div className="flex items-center justify-center gap-6 w-full">
      {steps.map((step, idx) => {
        const isActive = activeStep === step.number;
        const isCompleted = activeStep > step.number;
        const isDisabled = disabledSteps?.includes(step.number);

        return (
          <div
            key={idx}
            className="flex flex-col items-center relative"
            onClick={() => {
              if (!isDisabled) onStepChange(step.number);
            }}
            style={{
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            <motion.div
              whileHover={isDisabled ? {} : { scale: 1.05 }}
              whileTap={isDisabled ? {} : { scale: 0.95 }}
              className={`w-20 h-20 flex flex-col justify-center items-center rounded-2xl border-2 transition-colors duration-300
                ${
                  isDisabled
                    ? "bg-gray-300 text-gray-400 border-gray-400"
                    : isActive
                    ? "bg-blue-500 text-white border-blue-500"
                    : isCompleted
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
            >
              <h3 className="text-lg font-bold text-center">
                {isCompleted ? "✓" : step.number}
              </h3>
              <h6 className="text-xs font-medium">{step.label}</h6>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
