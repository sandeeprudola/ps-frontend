
// components/TrustSection.tsx
import Image from 'next/image';

const logos = [
  { name: 'Google', path: '/logos/google.svg', width: 120, height: 40 },
  { name: 'Microsoft', path: '/logos/microsoft.svg', width: 120, height: 26 },
  { name: 'Cisco', path: '/logos/cisco.svg', width: 80, height: 42 },
  { name: 'Zomato', path: '/logos/zomato.svg', width: 110, height: 28 },
  // Add more logos here to make the scroll effect more apparent
  { name: 'Strapi', path: '/logos/strapi.svg', width: 100, height: 30 },
  { name: 'Neon', path: '/logos/neon.svg', width: 90, height: 30 },
];

const TrustSection = () => {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-md text-gray-500 mb-8">
          Used by companies and people working at
        </p>

        {/* --- Marquee Container --- */}
        <div
          className="relative flex gap-10 overflow-hidden"
        >
          {/* --- The scrolling element --- */}
          <div className="flex min-w-full shrink-0 items-center gap-10 animate-[scroll_40s_linear_infinite]">
            {/* Render logos for the first time */}
            {logos.map((logo, index) => (
              <Image
                key={index}
                src={logo.path}
                alt={`${logo.name} logo`}
                width={logo.width}
                height={logo.height}
                className="filter grayscale transition hover:grayscale-0"
              />
            ))}
          </div>

          {/* --- The second set of logos for a seamless loop --- */}
          <div className="flex min-w-full shrink-0 items-center gap-10 animate-[scroll_40s_linear_infinite]">
            {/* Render logos for the second time */}
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