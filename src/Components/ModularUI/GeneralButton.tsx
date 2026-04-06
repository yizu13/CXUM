import { motion } from "framer-motion"
import Iconify from "./IconsMock"
import { useState } from "react"
import { useSettings } from "../../hooks/context/SettingsContext"

interface DefaultButtonType {
  textString: string
  inverted?: boolean
  onClick?: () => void
  color?: string
}

export default function DefaultButton({
  textString,
  inverted = false,
  onClick,
  color,
}: DefaultButtonType) {
  const [buttonAnimation, setAnimation] = useState(false)
  const { theme } = useSettings()

  const isDark = theme === "dark"

  const filledStyles = {
    backgroundColor: isDark ?  color? color : "rgba(255,255,255,1)" : color? color :"rgba(2,6,23,1)",
    color: isDark ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)",
    borderColor: "rgba(255,255,255,0)",
  }

  const outlineStyles = {
    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.45)",
    color: isDark ? "rgba(255,255,255,1)" : "rgba(15,23,42,1)",
    borderColor: isDark
      ? "rgba(255,255,255,0.22)"
      : "rgba(15,23,42,0.18)",
  }

  const currentStyles = inverted
    ? buttonAnimation
      ? filledStyles
      : outlineStyles
    : buttonAnimation
    ? outlineStyles
    : filledStyles

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        ...currentStyles,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setAnimation(true)}
      onHoverEnd={() => setAnimation(false)}
      onClick={onClick}
      className="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full border px-7 py-2.5 text-[0.85rem] font-bold cursor-pointer transition-all shadow-md"
    >
      <span className={color && isDark?"text-white" : ""}>{textString}</span>

      <motion.span
        animate={{
          width: buttonAnimation ? 16 : 0,
          opacity: buttonAnimation ? 1 : 0,
          x: buttonAnimation ? 0 : -5,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <Iconify IconString="ep:arrow-right-bold" Size={14} />
      </motion.span>
    </motion.button>
  )
}