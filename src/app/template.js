'use client'

import { motion } from 'framer-motion';

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} // 1. Empieza invisible y un poco abajo
      animate={{ opacity: 1, y: 0 }}  // 2. Aparece y sube a su sitio
      transition={{ duration: 0.5, ease: "easeOut" }} // 3. Tarda medio segundo
    >
      {children}
    </motion.div>
  );
}