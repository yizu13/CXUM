import { motion } from "framer-motion";
import Iconify from "../../components/modularUI/IconsMock";



export default function SubmitBtn({ loading, label, icon }: { loading: boolean; label: string; icon: string }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      className="w-full py-3.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #f59e0b, #fb923c)",
        opacity: loading ? 0.7 : 1,
        boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
      }}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Procesando…
        </>
      ) : (
        <>
          <Iconify Size={16} IconString={icon} />
          {label}
        </>
      )}
    </motion.button>
  );
}