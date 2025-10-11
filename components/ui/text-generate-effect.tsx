"use client";
import { useEffect, useRef } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  let wordsArray = words.split(" ");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          animate(
            "span",
            {
              opacity: 1,
              filter: filter ? "blur(0px)" : "none",
              y: 0,
            },
            {
              duration: duration || 1,
              delay: stagger(0.15),
              ease: "easeOut",
            }
          );
        }
      },
      { threshold: 0.3 } // Run when 30% of component is visible
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [scope.current]);

  const renderWords = () => (
    <motion.div ref={scope}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          className="dark:text-white text-black opacity-0 inline-block translate-y-2"
          style={{
            filter: filter ? "blur(10px)" : "none",
          }}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </motion.div>
  );

  return (
    <div ref={containerRef} className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="dark:text-white text-black text-4xl leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
