import { motion } from "framer-motion";
import Iconify from "../modularUI/IconsMock";

interface AuthErrorAlertProps {
  msg: string;
}

/**
 * Alerta de error de API animada.
 * Usado en las páginas de autenticación (login, register, restoreAccount).
 */
export default function AuthErrorAlert({ msg }: AuthErrorAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
      style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}
    >
      <Iconify Size={15} IconString="solar:danger-circle-bold-duotone" Style={{ flexShrink: 0 }} />
      {msg}
    </motion.div>
  );
}
