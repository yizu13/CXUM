import { motion } from "framer-motion";
import Iconify from "../../../components/modularUI/IconsMock";
import type { CertificateStep, ThemeAwareProps } from "./types";
import { mutedText } from "./ui";

interface StepDefinition {
  id: CertificateStep;
  label: string;
  icon: string;
}

const STEPS: StepDefinition[] = [
  { id: "template", label: "Plantilla", icon: "solar:gallery-wide-bold-duotone" },
  { id: "areas", label: "Areas", icon: "solar:crop-bold-duotone" },
  { id: "text", label: "Texto", icon: "solar:text-bold-duotone" },
  { id: "data", label: "Datos", icon: "solar:database-bold-duotone" },
  { id: "generations", label: "Generaciones", icon: "solar:archive-bold-duotone" },
];

interface StepTabsProps extends ThemeAwareProps {
  active: CertificateStep;
  onChange: (step: CertificateStep) => void;
  disabledSteps: CertificateStep[];
}

export default function StepTabs({ active, onChange, disabledSteps, isDark }: StepTabsProps) {
  return (
    <div
      className="mb-6 flex gap-1 overflow-x-auto border-b pb-0"
      style={{ borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)" }}
    >
      {STEPS.map((step) => {
        const disabled = disabledSteps.includes(step.id);
        const selected = active === step.id;
        return (
          <button
            key={step.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(step.id)}
            className="relative flex shrink-0 items-center gap-2 px-3 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-35"
            style={{ color: selected ? "#f59e0b" : mutedText(isDark) }}
          >
            <Iconify Size={16} IconString={step.icon} Style={{ color: "currentColor" }} />
            {step.label}
            {selected && (
              <motion.div
                layoutId="certificate-generator-step"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "#f59e0b" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
