import Image from "next/image";
"use client";
"use client";
"use client";
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { NavbarDemo } from "@/components/layout/Navbar/NavbarDemo";
import ImageCarousel from "@/components/ui/Carousel";
import TrustSection from "@/components/layout/TrustSection/TrustSection";
import FeaturesSectionDemo from "@/components/features-section-demo-2";
import { WobbleCard } from "@/components/ui/wobble-card";
import { HeroHighlight,Highlight } from "@/components/ui/hero-highlight";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import FooterGlow from "@/components/layout/Footer/Footer";
import { Carousel_001 } from "@/components/ui/skiper-ui/skiper47";


const images = [
  {
    src: "/images/x.com/11.jpeg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/images/x.com/13.jpeg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/images/x.com/32.jpeg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/images/x.com/20.jpeg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/images/x.com/21.jpeg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/images/x.com/19.jpeg",
    alt: "Illustrations by my fav AarzooAly",
  },
];

const testimonials = [
  {
    quote:
      "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
    name: "Charles Dickens",
    title: "A Tale of Two Cities",
  },
  {
    quote:
      "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
    name: "William Shakespeare",
    title: "Hamlet",
  },
  {
    quote: "All that we see or seem is but a dream within a dream.",
    name: "Edgar Allan Poe",
    title: "A Dream Within a Dream",
  },
  {
    quote:
      "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
    name: "Jane Austen",
    title: "Pride and Prejudice",
  },
  {
    quote:
      "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
    name: "Herman Melville",
    title: "Moby-Dick",
  },
];

export const clinicServices = [
  {
    src: "/images/speech-therapy.jpg",
    title: "Advanced Speech Therapy",
    category: "Speech & Language",
    content: (
      <div>
        <p>Our certified therapists provide personalized plans for children and adults to improve articulation, fluency, and language skills. We use modern techniques to ensure effective and engaging sessions.</p>
      </div>
    ),
  },
  {
    src: "/images/hearing-aid.jpg",
    title: "Modern Hearing Aids",
    category: "Audiology Services",
    content: (
      <div>
        <p>Discover a new world of sound with our state-of-the-art digital hearing aids. We offer professional fitting, programming, and follow-up care to ensure optimal performance and comfort.</p>
      </div>
    ),
  },
  {
    src: "/images/occupational-therapy.jpg",
    title: "Occupational Therapy",
    category: "Pediatric Care",
    content: (
      <div>
        <p>Our occupational therapy programs help children develop the skills needed for daily living, improving fine motor skills, sensory processing, and overall independence.</p>
      </div>
    ),
  },
  // ... Add as many other cards as you need
];


const slides = [
  {
    title: "Advanced Speech Therapy",
    button: "Book Appointment",
    src: "/images/speech-therapy.jpg",
  },
  {
    title: "Hearing Aid Services",
    button: "Explore Now",
    src: "/images/hearing-aid.jpg",
  },
  {
    title: "Occupational Therapy",
    button: "Learn More",
    src: "/images/occupational-therapy.jpg",
  },
];

export const LayoutTextFlip = ({
  text = "Build Amazing",
  words = ["Landing Pages", "Component Blocks", "Page Sections", "3D Shaders"],
  duration = 3000,
}: {
  text: string;
  words: string[];
  duration?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <motion.span
        layoutId="subtext"
        className="text-4xl font-bold tracking-tight md:text-4xl"
      >
        {text}
      </motion.span>

      <motion.span
        layout
        className="relative w-fit overflow-hidden bg-transparent px-4 py-2 font-sans text-2xl font-bold tracking-tight text-black shadow-none ring-0 drop-shadow-none md:text-4xl lg:text-6xl dark:bg-transparent dark:text-white"
      >
        <AnimatePresence mode="popLayout">
          <motion.span
            key={currentIndex}
            initial={{ y: -40, filter: "blur(10px)" }}
            animate={{
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{ y: 50, filter: "blur(10px)", opacity: 0 }}
            transition={{
              duration: 0.5,
            }}
            className={cn("inline-block whitespace-nowrap")}
          >
            {words[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </>
  );
};



export default function HeroSectionOne() {
  return (
    <div className="relative mx-auto my-10 flex max-w-7xl flex-col items-center justify-center">
      <NavbarDemo/>
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="px-4 py-10 md:py-20">
        <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-6xl dark:text-slate-300">
          {"Expert Speech & Hearing Services In"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
            <LayoutTextFlip text=""
              words={["Dehradun","Vikasnagar","Rishikesh","Kotdwara","Haridwar"]}
              duration={3000}
              />
        </h1>
        
        <motion.p
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1, 
          }}
          transition={{
            duration: 0.3,
            delay: 0.8,
          }}
          className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
        >
          Expert audiology and compassionate speech therapy for every stage of life.
        </motion.p>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 0.3,
            delay: 1,
          }}
          className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
            Signin
          </button>
          <button className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900">
            Login
          </button>
        </motion.div>
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.3,
            delay: 1.2,
          }}
          className=""
        >
          <div className="relative z-10 mt-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400">
            <TrustSection/>
          </div>

          <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
      <Carousel_001 className="" images={images} showPagination loop />
    </div>

          <div className="mt-20 pt-10">
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold leading-tight text-slate-700 sm:text-3xl md:text-4xl lg:text-5xl dark:text-slate-300">
                {"Expert Speech Therapy with a Personal Touch"
                  .split(" ")
                  .map((word, index) => (
                    <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>
            <FeaturesSectionDemo/>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
              <WobbleCard containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]" className="text-white">
              <h2 className="text-2xl font-bold mb-2">Card One</h2>
              <p className="text-sm opacity-80">
                This is a wobble card with a cool 3D hover effect.
              </p>
            </WobbleCard>
            <WobbleCard containerClassName="col-span-1 min-h-[300px]">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          No shirt, no shoes, no weapons.
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          If someone yells “stop!”, goes limp, or taps out, the fight is over.
        </p>
        </WobbleCard>
        <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
        <div className="max-w-sm">
          <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
            Signup for blazing-fast cutting-edge state of the art Gippity AI
            wrapper today!
          </h2>
          <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
            With over 100,000 mothly active bot users, Gippity AI is the most
            popular AI platform for developers.
          </p>
        </div>
        <img
          src="/linear.webp"
          width={500}
          height={500}
          alt="linear demo image"
          className="absolute -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl"
        />
        </WobbleCard>

          </div>

          <div>
            <HeroHighlight containerClassName="h-[40rem]">
              <h1 className="text-4xl sm:text-6xl font-bold text-center text-gray-900 dark:text-white leading-snug"> Why are we Best in {" "}
              <Highlight>Dehradun</Highlight>
              </h1>
            </HeroHighlight>
          </div>

          <div className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
    </div>

            <div>
              <FooterGlow></FooterGlow>
            </div>

        </motion.div>
      </div>
    </div>
  );
}



