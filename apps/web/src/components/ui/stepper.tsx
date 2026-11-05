"use client";

// Stepper from Origin UI (21st.dev/@originui/components/stepper), adapted:
// lucide icons (the project's icon library) and display-only items; the landing
// page marks stations, it does not let visitors jump between them.

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StepState = "active" | "completed" | "inactive";

// "responsive": stacked on phones, a row from the md breakpoint up.
type Orientation = "horizontal" | "vertical" | "responsive";
type StepperContextValue = { activeStep: number; orientation: Orientation };
type StepItemContextValue = { step: number; state: StepState };

const StepperContext = React.createContext<StepperContextValue | undefined>(undefined);
const StepItemContext = React.createContext<StepItemContextValue | undefined>(undefined);

function useStepper() {
  const context = React.useContext(StepperContext);
  if (!context) throw new Error("useStepper must be used within a Stepper");
  return context;
}

function useStepItem() {
  const context = React.useContext(StepItemContext);
  if (!context) throw new Error("useStepItem must be used within a StepperItem");
  return context;
}

type StepperProps = React.ComponentProps<"ol"> & {
  value: number;
  orientation?: Orientation;
};

function Stepper({ value, orientation = "horizontal", className, ...props }: StepperProps) {
  return (
    <StepperContext.Provider value={{ activeStep: value, orientation }}>
      <ol
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "group/stepper flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col data-[orientation=responsive]:flex-col md:data-[orientation=responsive]:flex-row",
          className,
        )}
        {...props}
      />
    </StepperContext.Provider>
  );
}

type StepperItemProps = React.ComponentProps<"li"> & { step: number };

function StepperItem({ step, className, children, ...props }: StepperItemProps) {
  const { activeStep } = useStepper();
  const state: StepState = step < activeStep ? "completed" : step === activeStep ? "active" : "inactive";
  return (
    <StepItemContext.Provider value={{ step, state }}>
      <li
        data-slot="stepper-item"
        data-state={state}
        aria-current={state === "active" ? "step" : undefined}
        className={cn("group/step relative flex", className)}
        {...props}
      >
        {children}
      </li>
    </StepItemContext.Provider>
  );
}

function StepperIndicator({ className, ...props }: React.ComponentProps<"span">) {
  const { state, step } = useStepItem();
  return (
    <span
      data-slot="stepper-indicator"
      data-state={state}
      aria-hidden="true"
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors",
        className,
      )}
      {...props}
    >
      <span className="transition-all group-data-[state=completed]/step:scale-0 group-data-[state=completed]/step:opacity-0">
        {step}
      </span>
      <CheckIcon
        className="absolute size-4 scale-0 opacity-0 transition-all group-data-[state=completed]/step:scale-100 group-data-[state=completed]/step:opacity-100"
        strokeWidth={3}
      />
    </span>
  );
}

function StepperTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 data-slot="stepper-title" className={cn("font-bold", className)} {...props} />;
}

function StepperDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="stepper-description" className={cn("text-muted-foreground", className)} {...props} />;
}

function StepperSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-separator"
      aria-hidden="true"
      className={cn("block bg-rule group-data-[state=completed]/step:bg-turquoise", className)}
      {...props}
    />
  );
}

export { Stepper, StepperDescription, StepperIndicator, StepperItem, StepperSeparator, StepperTitle };
