import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {Link} from "react-router-dom";
import { cn } from "../cn";
import BackgroundGradient from "../CardBackgroundGradient/CardBackgroundGradient";
import {Image} from "@nextui-org/react";

const HoverEffect = ({ items, className }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10 ${className}`} >
      {items.map((item, idx) => (
        <Link
          href={item.link}
          key={item.link}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <BackgroundGradient>
            <Link to={item.link} target="blank">
              <Card>
                <CardTitle>{item.title}</CardTitle><br />
                <div className="w-300px h-300px"><Image src={item.image} width={'300px'} /></div>
                <CardDescription>{item.description}</CardDescription>
              </Card>
            </Link>
          </BackgroundGradient>
        </Link>
      ))}
    </div>
  );
};

const Card = ({ className, children }) => {
  return (
    <div className={`flex flex-col justify-center items-center align-middle rounded-3xl h-[450px] w-full p-2 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20 ${className}`} >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const CardTitle = ({ className, children }) => {
  return (
    <h4 className={`text-zinc-100 font-bold tracking-wide mt-4 ${className}`}>
      {children}
    </h4>
  );
};

const CardDescription = ({ className, children }) => {
  return (
    <p className={`mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm ${className}`}>
      {children}
    </p>
  );
};

export default HoverEffect;