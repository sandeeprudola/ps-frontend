"use client";

import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React, { useRef } from "react";
import { Autoplay, EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { cn } from "@/lib/utils";

const Skiper47 = () => {
  const images = [
    { src: "/widex1.svg", alt: "Illustrations by my fav AarzooAly" },
    { src: "/images/x.com/13.jpeg", alt: "Illustrations by my fav AarzooAly" },
    { src: "/images/x.com/32.jpeg", alt: "Illustrations by my fav AarzooAly" },
    { src: "/images/x.com/20.jpeg", alt: "Illustrations by my fav AarzooAly" },
    { src: "/images/x.com/21.jpeg", alt: "Illustrations by my fav AarzooAly" },
    { src: "/images/x.com/19.jpeg", alt: "Illustrations by my fav AarzooAly" },
  ];

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center bg-white px-4">
      <Carousel_001 images={images} showPagination showNavigation loop autoplay />
    </div>
  );
};

export { Skiper47 };

const Carousel_001 = ({
  images,
  className,
  showPagination = false,
  showNavigation = false,
  loop = true,
  autoplay = false,
  spaceBetween = 40,
}: {
  images: { src: string; alt: string }[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
}) => {
  const swiperRef = useRef<any>(null);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn("w-full max-w-5xl relative", className)}
    >
      {/* Navigation buttons */}
      {showNavigation && (
        <>
          <div
            className="absolute top-1/2 -left-6 z-20 cursor-pointer"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <ChevronLeftIcon className="h-8 w-8 text-gray-800 hover:text-gray-500 transition" />
          </div>
          <div
            className="absolute top-1/2 -right-6 z-20 cursor-pointer"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <ChevronRightIcon className="h-8 w-8 text-gray-800 hover:text-gray-500 transition" />
          </div>
        </>
      )}

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={spaceBetween}
        slidesPerView={1.2}
        centeredSlides
        loop={loop}
        grabCursor
        effect="coverflow"
        coverflowEffect={{
          rotate: 0,
          slideShadows: false,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
        }}
        pagination={showPagination ? { clickable: true } : false}
        autoplay={
          autoplay
            ? { delay: 2500, disableOnInteraction: false }
            : false
        }
        breakpoints={{
          640: { slidesPerView: 1.3 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 2.5 },
          1280: { slidesPerView: 3 },
        }}
        modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
        className="h-[320px] md:h-[400px]"
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={index}
            className="rounded-3xl overflow-hidden shadow-lg flex items-center justify-center"
          >
            <img
              src={image.src}
              alt={image.alt}
              className="h-full w-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export { Carousel_001 };
