"use client";
import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Circle } from "lucide-react";

// Utility function for classNames
const cn = (...args) => args.filter(Boolean).join(" ");

// Compute step status
const getStepStatus = (index, currentStep, errorStep) => {
  if (errorStep === index) return "error";
  if (index < currentStep) return "completed";
  if (index === currentStep) return "active";
  return "inactive";
};

// 🔹 Step Icon with Motion
const StepIcon = ({ status, index, showNumbers, size = "md", customIcon }) => {
  const sizeClasses = { 
    sm: "h-8 w-8", 
    md: "h-10 w-10", 
    lg: "h-12 w-12" 
  };
  
  const iconSizes = { 
    sm: "h-4 w-4", 
    md: "h-5 w-5", 
    lg: "h-6 w-6" 
  };
  
  const textSizes = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  const baseClasses = `
    relative flex items-center justify-center rounded-full 
    ${sizeClasses[size]} 
    transition-all duration-300 ease-out
    border-2 font-semibold ${textSizes[size]}
  `;

  const variants = {
    inactive: { 
      scale: 0.95, 
      opacity: 0.7,
      y: 0
    },
    active: { 
      scale: 1.05, 
      opacity: 1,
      y: -2
    },
    completed: { 
      scale: 1, 
      opacity: 1,
      y: 0
    },
    error: { 
      scale: 1.02, 
      opacity: 1,
      y: 0
    },
  };

  const getIconContent = () => {
    if (status === "completed") {
      return <Check className={iconSizes[size]} strokeWidth={2.5} />;
    }
    
    if (status === "error") {
      return <X className={iconSizes[size]} strokeWidth={2.5} />;
    }
    
    if (status === "active" && customIcon) {
      return React.cloneElement(customIcon, { 
        className: iconSizes[size],
        strokeWidth: 2
      });
    }
    
    if (showNumbers) {
      return <span className="leading-none">{index + 1}</span>;
    }
    
    if (customIcon && status === "inactive") {
      return React.cloneElement(customIcon, { 
        className: iconSizes[size],
        strokeWidth: 1.5
      });
    }
    
    return <Circle className={iconSizes[size]} strokeWidth={1.5} />;
  };

  return (
    <motion.div
      initial={false}
      animate={status}
      variants={variants}
      transition={{ 
        duration: 0.35, 
        ease: [0.4, 0.0, 0.2, 1],
        type: "spring",
        damping: 15,
        stiffness: 300
      }}
      className={cn(baseClasses, {
        // Completed state - Green icon, background, and border
        "bg-green-500 border-green-600 text-white shadow-lg shadow-green-200": 
          status === "completed",
        
        // Error state  
        "bg-red-50 border-red-500 text-red-700 shadow-sm shadow-red-200": 
          status === "error",
        
        // Active state
        "bg-blue-50 border-blue-500 text-blue-700 shadow-md shadow-blue-200": 
          status === "active",
        
        // Inactive state
        "bg-gray-50 border-gray-300 text-gray-500": 
          status === "inactive",
      })}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {getIconContent()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

// 🔹 Step Connector Line
const StepConnector = ({ status, isVertical, size }) => {
  const lineClasses = isVertical 
    ? "w-0.5 h-8 ml-5 my-1" 
    : "h-0.5 flex-1 mx-4";
    
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        lineClasses,
        "transition-colors duration-500",
        {
          "bg-green-300": status === "completed",
          "bg-blue-300": status === "active", 
          "bg-gray-200": status === "inactive" || status === "error"
        }
      )}
    />
  );
};

// 🔹 StepperItem
export const StepperItem = ({
  step,
  index,
  status,
  isVertical,
  showNumbers,
  size,
  onClick,
  clickable,
  isLast
}) => {
  const { title, description, optional, disabled, icon } = step;
  
  // Typography scales
  const titleSizes = {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg"
  };
  
  const descriptionSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  const content = (
    <div className={cn(
      "flex gap-4 w-full",
      isVertical ? "flex-row items-start" : "flex-col items-center text-center"
    )}>
      {/* Icon */}
      <div className="flex-shrink-0">
        <StepIcon 
          status={status} 
          index={index} 
          showNumbers={showNumbers} 
          size={size}
          customIcon={icon}
        />
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isVertical ? "pt-1" : "mt-3",
        !isVertical && "flex flex-col items-center"
      )}>
        {/* Title and Optional Badge */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <motion.h3
            animate={{
              color: status === "completed" ? "#15803d" 
                   : status === "active" ? "#1d4ed8"
                   : status === "error" ? "#dc2626" 
                   : "#4b5563"
            }}
            transition={{ duration: 0.3 }}
            className={cn(
              titleSizes[size],
              "font-semibold leading-tight",
              !isVertical && "text-center"
            )}
          >
            {title}
          </motion.h3>

          {optional && (
            <span className="
              px-2 py-0.5 text-xs font-medium 
              bg-amber-50 text-amber-700 border border-amber-200
              rounded-full whitespace-nowrap
            ">
              Optional
            </span>
          )}
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          {description && (
            <motion.p
              key={description}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                descriptionSizes[size],
                "text-gray-600 leading-relaxed",
                isVertical ? "mt-1 text-left" : "mt-2 text-center",
                "line-clamp-2"
              )}
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const wrapperClasses = cn(
    "group relative",
    isVertical ? "w-full" : "flex-1"
  );

  if (clickable && !disabled) {
    return (
      <div className={wrapperClasses}>
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "w-full p-4 rounded-xl text-left",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "transition-all duration-200 ease-out",
            {
              "focus:ring-blue-500 hover:bg-blue-50/50": status === "active",
              "focus:ring-green-500 hover:bg-green-50/30": status === "completed", 
              "focus:ring-red-500 hover:bg-red-50/30": status === "error",
              "focus:ring-gray-400 hover:bg-gray-50/50": status === "inactive"
            }
          )}
        >
          {content}
        </motion.button>
        
        {/* Connector line */}
        {!isLast && (
          <StepConnector 
            status={status} 
            isVertical={isVertical} 
            size={size}
          />
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <div className="p-4">
        {content}
      </div>
      
      {/* Connector line */}
      {!isLast && (
        <StepConnector 
          status={status} 
          isVertical={isVertical} 
          size={size}
        />
      )}
    </div>
  );
};

// 🔹 Main Stepper
export const Stepper = ({
  steps = [],
  activeStep = 0,
  orientation = "horizontal",
  showNumbers = false,
  clickable = true,
  size = "md",
  errorStep = null,
  onStepClick,
  StepComponent = StepperItem,
  className,
  ...props
}) => {
  const isVertical = orientation === "vertical";
  const safeActiveStep = Math.min(Math.max(0, activeStep), steps.length - 1);

  const stepsWithStatus = useMemo(
    () =>
      steps.map((step, i) => ({
        ...step,
        status: getStepStatus(i, safeActiveStep, errorStep),
        index: i,
      })),
    [steps, safeActiveStep, errorStep]
  );

  const handleStepClick = useCallback(
    (i) => {
      if (!clickable || !onStepClick) return;
      if (i <= safeActiveStep || steps[i]?.clickable !== false) {
        onStepClick(i);
      }
    },
    [clickable, onStepClick, safeActiveStep, steps]
  );

  return (
    <motion.nav
      aria-label="Progress stepper"
      className={cn(
        "w-full",
        "bg-white border border-gray-200 rounded-lg shadow-sm",
        isVertical ? "p-4" : "p-6",
        className
      )}
      {...props}
      layout
    >
      <ol className={cn(
        isVertical 
          ? "space-y-0 flex flex-col" 
          : "flex items-start justify-between"
      )}>
        {stepsWithStatus.map((step, i) => (
          <motion.li
            key={`step-${i}`}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: i * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={cn(
              isVertical ? "relative" : "flex-1",
              i === 0 && !isVertical && "flex-shrink-0",
              i === steps.length - 1 && !isVertical && "flex-shrink-0"
            )}
          >
            <StepComponent
              step={step}
              index={i}
              status={step.status}
              isVertical={isVertical}
              showNumbers={showNumbers}
              size={size}
              clickable={clickable && !step.disabled}
              onClick={() => handleStepClick(i)}
              isLast={i === steps.length - 1}
            />
          </motion.li>
        ))}
      </ol>
    </motion.nav>
  );
};