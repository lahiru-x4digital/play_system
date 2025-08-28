"use client";
import React, { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Circle, ChevronRight, ChevronDown, ArrowRight, ArrowDown } from "lucide-react";

// Utility function for classNames
const cn = (...args) => args.filter(Boolean).join(" ");

// Compute step status
const getStepStatus = (index, currentStep, errorStep) => {
  if (errorStep === index) return "error";
  if (index < currentStep) return "completed";
  if (index === currentStep) return "active";
  return "inactive";
};

// 🔹 Arrow Connector with enhanced animations
const ArrowConnector = ({ status, isVertical, size, arrowStyle = "chevron" }) => {
  const ArrowIcon = isVertical 
    ? (arrowStyle === "chevron" ? ChevronDown : ArrowDown)
    : (arrowStyle === "chevron" ? ChevronRight : ArrowRight);
  
  const containerClasses = isVertical 
    ? "flex justify-center my-2" 
    : "flex items-center justify-center mx-3 flex-shrink-0";

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  };

  const arrowVariants = {
    inactive: { 
      scale: 0.8, 
      opacity: 0.4,
      x: 0,
      y: 0
    },
    active: { 
      scale: 1.1, 
      opacity: 0.8,
      x: isVertical ? 0 : 3,
      y: isVertical ? 3 : 0
    },
    completed: { 
      scale: 1, 
      opacity: 1,
      x: isVertical ? 0 : 2,
      y: isVertical ? 2 : 0
    },
    error: { 
      scale: 0.9, 
      opacity: 0.6,
      x: 0,
      y: 0
    }
  };

  const pulseVariants = {
    inactive: { scale: 1 },
    active: { 
      scale: [1, 1.2, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    completed: { scale: 1 },
    error: { scale: 1 }
  };

  return (
    <motion.div
      initial="inactive"
      animate={status}
      className={cn(containerClasses, "relative")}
    >
      {/* Background pulse effect for active state */}
      <motion.div
        variants={pulseVariants}
        className={cn(
          "absolute inset-0 rounded-full",
          {
            "bg-blue-200": status === "active",
            "bg-green-200": status === "completed",
            "opacity-30": status === "active" || status === "completed"
          }
        )}
      />
      
      {/* Main Arrow */}
      <motion.div
        variants={arrowVariants}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0.0, 0.2, 1],
          type: "spring",
          damping: 15,
          stiffness: 200
        }}
        className={cn(
          "relative z-10 p-2 rounded-full transition-colors duration-300",
          {
            "text-green-500 bg-green-50": status === "completed",
            "text-blue-500 bg-blue-50": status === "active",
            "text-red-500 bg-red-50": status === "error",
            "text-gray-400 bg-gray-50": status === "inactive"
          }
        )}
      >
        <ArrowIcon className={iconSizes[size]} strokeWidth={2} />
      </motion.div>

      {/* Progress line behind arrow */}
      <div className={cn(
        "absolute z-0",
        isVertical ? "left-1/2 transform -translate-x-px w-0.5 h-full" : "top-1/2 transform -translate-y-px h-0.5 w-full",
        "transition-colors duration-500",
        {
          "bg-green-300": status === "completed",
          "bg-blue-300": status === "active",
          "bg-gray-200": status === "inactive" || status === "error"
        }
      )} />
    </motion.div>
  );
};

// 🔹 Enhanced Step Icon with improved animations
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
    z-10
  `;

  const variants = {
    inactive: { 
      scale: 0.95, 
      opacity: 0.7,
      y: 0,
      rotateY: 0
    },
    active: { 
      scale: 1.1, 
      opacity: 1,
      y: -3,
      rotateY: 0
    },
    completed: { 
      scale: 1, 
      opacity: 1,
      y: 0,
      rotateY: 360
    },
    error: { 
      scale: 1.02, 
      opacity: 1,
      y: 0,
      rotateY: 0
    },
  };

  const glowVariants = {
    inactive: { opacity: 0, scale: 1 },
    active: { 
      opacity: [0, 0.6, 0],
      scale: [1, 1.5, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    completed: { opacity: 0.3, scale: 1.2 },
    error: { opacity: 0.2, scale: 1.1 }
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
      return <span className="leading-none font-bold">{index + 1}</span>;
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
    <div className="relative">
      {/* Glow effect */}
      <motion.div
        variants={glowVariants}
        className={cn(
          "absolute inset-0 rounded-full blur-md -z-10",
          {
            "bg-green-400": status === "completed",
            "bg-blue-400": status === "active",
            "bg-red-400": status === "error",
            "bg-gray-400": status === "inactive"
          }
        )}
      />

      <motion.div
        initial="inactive"
        animate={status}
        variants={variants}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0.0, 0.2, 1],
          type: "spring",
          damping: 15,
          stiffness: 300
        }}
        className={cn(baseClasses, {
          // Completed state - Green with enhanced styling
          "bg-gradient-to-br from-green-400 to-green-600 border-green-500 text-white shadow-lg shadow-green-200": 
            status === "completed",
          
          // Error state  
          "bg-gradient-to-br from-red-50 to-red-100 border-red-500 text-red-700 shadow-md shadow-red-200": 
            status === "error",
          
          // Active state - Enhanced with gradient
          "bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500 text-white shadow-lg shadow-blue-200": 
            status === "active",
          
          // Inactive state
          "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-500": 
            status === "inactive",
        })}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${status}-${index}`}
            initial={{ scale: 0, opacity: 0, rotateZ: -180 }}
            animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
            exit={{ scale: 0, opacity: 0, rotateZ: 180 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            {getIconContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// 🔹 StepperItem with enhanced layout
export const StepperItem = ({
  step,
  index,
  status,
  isVertical,
  showNumbers,
  size,
  onClick,
  clickable,
  isLast,
  arrowStyle
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
      "flex gap-4 w-full relative",
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
        isVertical ? "pt-2" : "mt-3",
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
              "font-bold leading-tight",
              !isVertical && "text-center"
            )}
          >
            {title}
          </motion.h3>

          {optional && (
            <motion.span 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="
                px-2 py-0.5 text-xs font-medium 
                bg-gradient-to-r from-amber-50 to-orange-50 
                text-amber-700 border border-amber-200
                rounded-full whitespace-nowrap shadow-sm
              "
            >
              Optional
            </motion.span>
          )}
        </div>

        {/* Description with enhanced animation */}
        <AnimatePresence mode="wait">
          {description && (
            <motion.p
              key={description}
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                descriptionSizes[size],
                "text-gray-600 leading-relaxed",
                isVertical ? "mt-2 text-left" : "mt-2 text-center",
                "line-clamp-2"
              )}
            >
              {description}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Step number indicator for horizontal layout */}
        {!isVertical && showNumbers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.6, scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 text-gray-600 text-xs font-bold rounded-full flex items-center justify-center"
          >
            {index + 1}
          </motion.div>
        )}
      </div>
    </div>
  );

  const wrapperClasses = cn(
    "group relative",
    isVertical ? "w-full" : "flex-1 min-w-0"
  );

  if (clickable && !disabled) {
    return (
      <div className={wrapperClasses}>
        <motion.button
          type="button"
          onClick={onClick}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98, y: 0 }}
          className={cn(
            "w-full p-4 rounded-xl text-left relative overflow-hidden",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            "transition-all duration-300 ease-out",
            "before:absolute before:inset-0 before:bg-gradient-to-r before:opacity-0 before:transition-opacity before:duration-300",
            {
              "focus:ring-blue-500 hover:bg-blue-50/70 before:from-blue-50 before:to-blue-100 hover:before:opacity-100": status === "active",
              "focus:ring-green-500 hover:bg-green-50/50 before:from-green-50 before:to-green-100 hover:before:opacity-100": status === "completed", 
              "focus:ring-red-500 hover:bg-red-50/50 before:from-red-50 before:to-red-100 hover:before:opacity-100": status === "error",
              "focus:ring-gray-400 hover:bg-gray-50/70 before:from-gray-50 before:to-gray-100 hover:before:opacity-100": status === "inactive"
            }
          )}
        >
          <div className="relative z-10">
            {content}
          </div>
        </motion.button>
        
        {/* Enhanced Arrow Connector */}
        {!isLast && (
          <ArrowConnector 
            status={status === "completed" ? "completed" : status === "active" ? "active" : "inactive"} 
            isVertical={isVertical} 
            size={size}
            arrowStyle={arrowStyle}
          />
        )}
      </div>
    );
  }

  return (
    <div className={wrapperClasses}>
      <motion.div 
        className="p-4 rounded-xl transition-all duration-300"
        whileHover={{ scale: 1.01 }}
      >
        {content}
      </motion.div>
      
      {/* Enhanced Arrow Connector */}
      {!isLast && (
        <ArrowConnector 
          status={status === "completed" ? "completed" : status === "active" ? "active" : "inactive"} 
          isVertical={isVertical} 
          size={size}
          arrowStyle={arrowStyle}
        />
      )}
    </div>
  );
};

// 🔹 Main Stepper with enhanced features
export const Stepper = ({
  steps = [],
  activeStep = 0,
  orientation = "horizontal",
  showNumbers = false,
  clickable = true,
  size = "md",
  errorStep = null,
  arrowStyle = "chevron", // "chevron" or "arrow"
  showProgress = true,
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

  const progressPercentage = ((safeActiveStep) / (steps.length - 1)) * 100;

  return (
    <motion.nav
      aria-label="Progress stepper"
      className={cn(
        "w-full relative",
        "bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-xl shadow-sm backdrop-blur-sm",
        isVertical ? "p-4" : "p-6",
        className
      )}
      {...props}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Progress indicator */}
      {showProgress && (
        <motion.div
          className="absolute top-2 right-4 text-sm text-gray-500 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {safeActiveStep + 1} of {steps.length}
        </motion.div>
      )}

      <ol className={cn(
        isVertical 
          ? "space-y-0 flex flex-col" 
          : "flex items-start justify-between"
      )}>
        {stepsWithStatus.map((step, i) => (
          <motion.li
            key={`step-${i}`}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className={cn(
              isVertical ? "relative" : "flex-1 min-w-0",
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
              arrowStyle={arrowStyle}
            />
          </motion.li>
        ))}
      </ol>

      {/* Overall progress bar */}
      {showProgress && !isVertical && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-xl overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
      )}
    </motion.nav>
  );
};