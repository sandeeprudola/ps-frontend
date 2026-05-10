import Image from "next/image";
import Link from "next/link";
import { BatteryCharging, Bluetooth, CheckCircle2, Ear, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { NavbarDemo } from "@/components/layout/Navbar/NavbarDemo";
import FooterGlow from "@/components/layout/Footer/Footer";

const hearingAids = [
  {
    name: "Phonak Audéo Lumity",
    brand: "Phonak",
    type: "RIC Rechargeable",
    logo: "/Phonak_idzGop50O3_1.svg",
    bestFor: "Active adults who need clear speech in noisy places.",
    features: ["Rechargeable", "Bluetooth calling", "Speech in noise support"],
  },
  {
    name: "Widex Moment",
    brand: "Widex",
    type: "RIC / BTE",
    logo: "/idDek6O_wm_1760187229708.png",
    bestFor: "Natural sound quality and daily conversation comfort.",
    features: ["Natural sound", "App control", "Tinnitus support options"],
  },
  {
    name: "Signia Pure Charge&Go",
    brand: "Signia",
    type: "RIC Rechargeable",
    logo: "/idavFTmm1v_1760187674551.png",
    bestFor: "Patients who want sleek design with strong connectivity.",
    features: ["Rechargeable", "Own Voice Processing", "Bluetooth streaming"],
  },
  {
    name: "ReSound ONE",
    brand: "ReSound",
    type: "M&RIE / RIC",
    logo: "/ReSound NA_idna1tHzXI_0.png",
    bestFor: "Personalized hearing with a fuller sense of direction.",
    features: ["Directional hearing", "Rechargeable options", "Remote fine tuning"],
  },
  {
    name: "Behind-the-Ear Essential",
    brand: "Multi-brand",
    type: "BTE",
    logo: "/pslogo.png",
    bestFor: "Reliable amplification for moderate to severe hearing loss.",
    features: ["Durable body", "Easy handling", "Ear mold compatible"],
  },
  {
    name: "Invisible Comfort Series",
    brand: "Multi-brand",
    type: "CIC / IIC",
    logo: "/pslogo.png",
    bestFor: "Discreet daily use after ear-canal suitability assessment.",
    features: ["Small profile", "Custom fit", "Comfort-first fitting"],
  },
];

const categories = [
  { icon: Ear, label: "BTE, RIC, CIC and ITE styles" },
  { icon: BatteryCharging, label: "Rechargeable and battery models" },
  { icon: Bluetooth, label: "Bluetooth and app-enabled devices" },
  { icon: SlidersHorizontal, label: "Trial, fitting and fine tuning" },
];

export default function CataloguePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="relative mx-auto flex max-w-7xl flex-col px-4 pt-10 sm:px-6 lg:px-8">
        <NavbarDemo />

        <section className="pt-16 pb-12 text-center sm:pt-20">
          <p className="mx-auto mb-4 w-fit rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
            Hearing Aid Catalogue
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-slate-800 dark:text-slate-100 sm:text-5xl lg:text-6xl">
            Explore hearing aids for comfort, clarity and everyday confidence.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300 sm:text-lg">
            Browse popular device styles and brands available for consultation, trial, fitting and programming at PS Speech & Hearing Clinic.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/User/Login"
              className="w-60 rounded-lg bg-black px-6 py-3 text-center font-medium text-white transition hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Book Consultation
            </Link>
            <Link
              href="/#features"
              className="w-60 rounded-lg border border-neutral-200 px-6 py-3 text-center font-medium text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-900"
            >
              View Services
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 border-y border-neutral-200 py-6 dark:border-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 px-2 py-3">
              <Icon className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">{label}</span>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-5 py-12 md:grid-cols-2 lg:grid-cols-3">
          {hearingAids.map((aid) => (
            <article
              key={aid.name}
              className="flex min-h-[330px] flex-col rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{aid.brand}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">{aid.name}</h2>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{aid.type}</p>
                </div>
                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md bg-neutral-50 p-2 dark:bg-white">
                  <Image src={aid.logo} alt={`${aid.brand} logo`} width={92} height={42} className="max-h-10 object-contain" />
                </div>
              </div>

              <p className="mt-6 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{aid.bestFor}</p>

              <ul className="mt-6 space-y-3">
                {aid.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <Link
                  href="/User/Login"
                  className="inline-flex w-full items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                >
                  Ask for Trial
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="mb-8 rounded-lg border border-blue-100 bg-blue-50 px-6 py-8 text-center dark:border-blue-900/60 dark:bg-blue-950/30">
          <ShieldCheck className="mx-auto mb-4 size-8 text-blue-600 dark:text-blue-300" />
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Need help choosing?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
            The right hearing aid depends on hearing loss level, ear anatomy, lifestyle, comfort and budget. Final recommendations are made after assessment and trial.
          </p>
        </section>
      </div>

      <FooterGlow />
    </main>
  );
}
