import Image from "next/image";
"use client";
"use client";
"use client";
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NavbarDemo } from "@/components/layout/Navbar/NavbarDemo";
import TrustSection from "@/components/layout/TrustSection/TrustSection";
import FeaturesSectionDemo from "@/components/features-section-demo-2";
import { WobbleCard } from "@/components/ui/wobble-card";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import FooterGlow from "@/components/layout/Footer/Footer";
import { Carousel_001 } from "@/components/ui/skiper-ui/skiper47";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import Countup from "@/components/ui/Countup";
import { FlipWords } from "@/components/ui/flip-words";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import Link from "next/link";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxAlignTopLeft,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { Navbar } from "@/components/ui/resizable-navbar";



const words = ["Speech", "Hearing", "Confidence"];
const Skeleton = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
);


const words1 = ["Sound","Conversation","Clarity","Connection"];

const items = [
  {
    title: "Advanced Hearing Care",
    description: "From comprehensive hearing evaluations to fitting state-of-the-art digital hearing aids, we help you reconnect with the world of sound.",
    header: <Skeleton />,
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Speech-Language Therapy",
    description: "Our certified therapists work with children and adults to improve speech clarity, language skills, and overall communication confidence.",
    header: <Skeleton />,
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Comprehensive Hearing Evaluations",
    description: "Utilizing advanced diagnostic tools to provide an accurate and detailed understanding of your unique hearing profile.",
    header: <Skeleton />,
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "A Nurturing Start for Little Ones",
    description:
      "Specialized pediatric care to support children in developing crucial speech, language, and hearing skills from an early age.",
    header: <Skeleton />,
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Fluency & Stuttering Therapy",
    description: "We offer evidence-based strategies and a supportive environment to help you or your loved ones speak smoothly and freely.",
    header: <Skeleton />,
    icon: <IconArrowWaveRightUp className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Professional Voice Care",
    description: "Tailored therapy for singers, teachers, and professionals to maintain vocal health and overcome voice disorders.",
    header: <Skeleton />,
    icon: <IconBoxAlignTopLeft className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "The Spirit of Adventure",
    description: "Embark on exciting journeys and thrilling discoveries.",
    header: <Skeleton />,
    icon: <IconBoxAlignRightFilled className="h-4 w-4 text-neutral-500" />,
  },
];

const images = [
  {
    src: "/1.svg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/2.svg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/3.svg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/4.svg",
    alt: "Illustrations by my fav AarzooAly",
  }
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
     
    <div className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:pt-20 pb-10 sm:pb-16 md:pb-20">

      <h1 className="relative z-10 mx-auto max-w-4xl text-center text-xl sm:text-2xl md:text-4xl lg:text-6xl font-bold text-slate-700 dark:text-slate-300 leading-tight px-2">
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
        <br className="block sm:hidden" /> {/* force line break on mobile */}
        <LayoutTextFlip
          text=""
          words={["Dehradun", "Vikasnagar", "Rishikesh", "Kotdwara", "Haridwar"]}
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
          className="relative z-10 mx-auto max-w-md sm:max-w-xl px-4 py-4 text-center text-[clamp(0.95rem,2.5vw,1.2rem)] md:text-[clamp(1rem,1.5vw,1.5rem)] font-normal text-neutral-600 dark:text-neutral-400 leading-relaxed break-words"
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
          className="relative z-10 mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4"
        >
          <Link
              href="/Signin"
              className="inline-block w-60 text-center transform rounded-lg bg-black px-6 py-2 
                        font-medium text-white transition-all duration-300 hover:-translate-y-0.5 
                        hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Signin
          </Link>
          <Link
              href="/Signin"
              className="inline-block w-60 text-center transform rounded-lg bg-black px-6 py-2 
                        font-medium text-white transition-all duration-300 hover:-translate-y-0.5 
                        hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Signin
          </Link>
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

          <div className="h-35 flex justify-center items-center p-30">
      <div className="text-5xl mx-auto font-semibold text-black">
       <h2>
       Empowering
       <FlipWords words={words} /> 
        </h2> 
        
      </div>
    </div>

    <div className="flex w-full items-center justify-center overflow-hidden bg-white py-10">

      <Carousel_001 className="" images={images} showPagination loop />
          </div>
      <div className="mt-20 pt-10 px-4">
        <h1
        className="relative z-10 mx-auto max-w-[90vw] sm:max-w-3xl text-center 
                  text-[clamp(1.125rem,5vw,1.75rem)] md:text-[clamp(1.5rem,3vw,2.25rem)] 
                  font-bold leading-snug text-slate-700 dark:text-slate-300 
                  whitespace-normal break-words"
      >
        {"Your Voice, Our Expertise"
          .split(" ")
          .map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.06,
                ease: "easeInOut",
              }}
              // important: make sure the word is inline so it can wrap naturally
              className="mr-1 inline"
              style={{ display: "inline" }}
            >
          {word}
        </motion.span>
      ))}
  </h1>
<div className="bg-white dark:bg-neutral-900">
<FeaturesSectionDemo />
</div>
  
</div>


    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-white dark:bg-neutral-950"> 
     <div className="p-20 text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
     Rediscover the Joy of
        <FlipWords words={words1} /> <br />
      </div>
     <BentoGrid className="max-w-4xl mx-auto">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={i === 3 || i === 6 ? "md:col-span-2" : ""}
        />
      ))}
    </BentoGrid>
     </div>

          <div className=" p-30 min-h-70 flex flex-col justify-center items-center bg-white dark:bg-black px-4">
          <TextGenerateEffect
              words="Results that speak for themselves — read why people trust us."
              className="text-center text-4xl md:text-6xl lg:text-4xl font-semibold"
              filter={true}
              duration={0.6}
      />
<div className="mx-auto max-w-6xl px-4 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
  {/* Stat 1 */}
  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm p-8">
    <h3 className="text-5xl font-bold text-blue-600 dark:text-blue-400">
    <Countup
              from={0}
              to={7000}
              separator=","
              direction="up"
              duration={1.2}
              className="count-up-text"
            />
      <span>+</span>
    </h3>
    <p className="mt-2 text-gray-700 dark:text-gray-300 text-lg font-medium">
      Happy Clients
    </p>
  </div>

  {/* Stat 2 */}
  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm p-8">
    <h3 className="text-5xl font-bold text-blue-600 dark:text-blue-400">
      <span>15+</span>
    </h3>
    <p className="mt-2 text-gray-700 dark:text-gray-300 text-lg font-medium">
      Certified Therapists
    </p>
  </div>

  {/* Stat 3 */}
  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 shadow-sm p-8">
    <h3 className="text-5xl font-bold text-blue-600 dark:text-blue-400">
      <span>10+</span>
    </h3>
    <p className="mt-2 text-gray-700 dark:text-gray-300 text-lg font-medium">
      Years of Experience
    </p>
  </div>
</div>
            
          </div>

          <div className=" rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
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



