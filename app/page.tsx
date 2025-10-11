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



const words = ["Speech", "Hearing", "Confidence"];

const images = [
  {
    src: "/widex1.svg",
    alt: "Illustrations by my fav AarzooAly",
  },
  {
    src: "/widex2.svg",
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

          <div className="h-35 flex justify-center items-center p-30">
      <div className="text-5xl mx-auto font-semibold text-black">
       <h2>
       Empowering
       <FlipWords words={words} /> 
        </h2> 
        
      </div>
    </div>

          <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#ffff]">
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


     <div className="pt-20 grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
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



