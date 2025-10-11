// components/TrustSection.tsx
import Image from "next/image";

const logos = [
  { name: "Widex", path: "/idDek6O_wm_1760187229708.png", width: 120, height: 40 },
  { name: "Signia", path: "/idavFTmm1v_1760187674551.png", width: 120, height: 15 },
  { name: "Phonak", path: "/Phonak_idzGop50O3_1.svg", width: 80, height: 42 },
  { name: "ReSound", path: "/ReSound NA_idna1tHzXI_0.png", width: 110, height: 28 },
  // Add more logos here to make the scroll effect more apparent
];

const TrustSection = () => {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-md text-gray-500 mb-8">
          Used by companies and people working at
        </p>

        {/* --- Marquee Container with Fade Edges --- */}
        <div
          className="relative flex gap-10 overflow-hidden 
          [mask-image:linear-gradient(to_right,transparent,white_15%,white_55%,transparent)]
          dark:[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
        >
          {/* --- The scrolling element --- */}
          <div className="flex min-w-full shrink-0 items-center gap-10 animate-[scroll_40s_linear_infinite]">
            {logos.map((logo, index) => (
              <Image
                key={index}
                src={logo.path}
                alt={`${logo.name} logo`}
                width={logo.width}
                height={logo.height}
                className="filter grayscale transition hover:grayscale-100"
              />
            ))}
          </div>

          {/* --- The second set of logos for a seamless loop --- */}
          <div className="flex min-w-full shrink-0 items-center gap-10 animate-[scroll_40s_linear_infinite]">
            {logos.map((logo, index) => (
              <Image
                key={index + logos.length}
                src={logo.path}
                alt={`${logo.name} logo`}
                width={logo.width}
                height={logo.height}
                className="filter grayscale transition hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
