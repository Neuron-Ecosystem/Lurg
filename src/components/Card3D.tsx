'use client';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function Card3D({ image, text, rank }: { image: string, text: string, rank: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [20, -20]);
  const rotateY = useTransform(x, [-100, 100], [-20, 20]);

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative w-72 h-[420px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl"
    >
      <div className="absolute top-4 right-4 bg-white text-black font-black px-3 py-1 rounded-full z-10">
        {rank}
      </div>
      <img src={image} className="w-full h-2/3 object-cover" alt="Lurg" />
      <div className="p-5">
        <p className="text-white/90 italic font-medium">"{text}"</p>
        <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-green-400 w-full animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
