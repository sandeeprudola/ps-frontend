import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
  } from 'lucide-react';
  import Link from 'next/link';
  
  const data = {
    facebookLink: 'https://facebook.com',
    instaLink: 'https://instagram.com',
    emailLink: 'mailto:care@psspeechandhearing.com',
    services: {
      hearing: '#features',
      speech: '#features',
      pediatric: '#features',
      voice: '#features',
    },
    about: {
      clinic: '#home',
      locations: '#contact',
      brands: '#features',
      care: '#features',
    },
    help: {
      signup: '/User/Signin',
      login: '/User/Login',
      appointment: '/User/Login',
    },
    contact: {
      email: 'care@psspeechandhearing.com',
      phone: '+91 8637373116',
      address: 'Dehradun, Uttarakhand, India',
    },
    company: {
      name: 'PS Speech & Hearing Clinic',
      description:
        'Compassionate audiology, speech therapy, hearing aid consultation, and communication care for children, adults, and families.',
      logo: '/pslogo.png',
    },
  };
  
  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: data.facebookLink },
    { icon: Instagram, label: 'Instagram', href: data.instaLink },
    { icon: Mail, label: 'Email', href: data.emailLink },
  ];
  
  const aboutLinks = [
    { text: 'About the Clinic', href: data.about.clinic },
    { text: 'Locations Served', href: data.about.locations },
    { text: 'Trusted Brands', href: data.about.brands },
    { text: 'Patient Care', href: data.about.care },
  ];
  
  const serviceLinks = [
    { text: 'Hearing Evaluation', href: data.services.hearing },
    { text: 'Speech Therapy', href: data.services.speech },
    { text: 'Pediatric Care', href: data.services.pediatric },
    { text: 'Voice Therapy', href: data.services.voice },
  ];
  
  const helpfulLinks = [
    { text: 'Create Account', href: data.help.signup },
    { text: 'Patient Login', href: data.help.login },
    { text: 'Book Appointment', href: data.help.appointment, hasIndicator: true },
  ];
  
  const contactInfo = [
    { icon: Mail, text: data.contact.email, href: data.emailLink },
    { icon: Phone, text: data.contact.phone, href: `tel:${data.contact.phone.replace(/\s/g, '')}` },
    { icon: MapPin, text: data.contact.address, href: '#contact', isAddress: true },
  ];
  
  export default function Footer4Col() {
    return (
      <footer id="contact" className="bg-secondary dark:bg-secondary/20 mt-16 w-full place-self-end rounded-t-xl scroll-mt-24">
        <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div>
              <div className="text-primary flex justify-center gap-2 sm:justify-start">
                <img
                  src={data.company.logo || '/placeholder.svg'}
                  alt="logo"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-2xl font-semibold">
                  {data.company.name}
                </span>
              </div>
  
              <p className="text-foreground/50 mt-6 max-w-md text-center leading-relaxed sm:max-w-xs sm:text-left">
                {data.company.description}
              </p>
  
              <ul className="mt-8 flex justify-center gap-6 sm:justify-start md:gap-8">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <li key={label}>
                    <Link
                      prefetch={false}
                      href={href}
                      className="text-primary hover:text-primary/80 transition"
                    >
                      <span className="sr-only">{label}</span>
                      <Icon className="size-6" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
  
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
              <div className="text-center sm:text-left">
                <p className="text-lg font-medium">About Us</p>
                <ul className="mt-8 space-y-4 text-sm">
                  {aboutLinks.map(({ text, href }) => (
                    <li key={text}>
                      <a
                        className="text-secondary-foreground/70 transition"
                        href={href}
                      >
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
  
              <div className="text-center sm:text-left">
                <p className="text-lg font-medium">Our Services</p>
                <ul className="mt-8 space-y-4 text-sm">
                  {serviceLinks.map(({ text, href }) => (
                    <li key={text}>
                      <a
                        className="text-secondary-foreground/70 transition"
                        href={href}
                      >
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
  
              <div className="text-center sm:text-left">
                <p className="text-lg font-medium">Helpful Links</p>
                <ul className="mt-8 space-y-4 text-sm">
                  {helpfulLinks.map(({ text, href, hasIndicator }) => (
                    <li key={text}>
                      <a
                        href={href}
                        className={`${
                          hasIndicator
                            ? 'group flex justify-center gap-1.5 sm:justify-start'
                            : 'text-secondary-foreground/70 transition'
                        }`}
                      >
                        <span className="text-secondary-foreground/70 transition">
                          {text}
                        </span>
                        {hasIndicator && (
                          <span className="relative flex size-2">
                            <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                            <span className="bg-primary relative inline-flex size-2 rounded-full" />
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
  
              <div className="text-center sm:text-left">
                <p className="text-lg font-medium">Contact Us</p>
                <ul className="mt-8 space-y-4 text-sm">
                  {contactInfo.map(({ icon: Icon, text, href, isAddress }) => (
                    <li key={text}>
                      <a
                        className="flex items-center justify-center gap-1.5 sm:justify-start"
                        href={href}
                      >
                        <Icon className="text-primary size-5 shrink-0 shadow-sm" />
                        {isAddress ? (
                          <address className="text-secondary-foreground/70 -mt-0.5 flex-1 not-italic transition">
                            {text}
                          </address>
                        ) : (
                          <span className="text-secondary-foreground/70 flex-1 transition">
                            {text}
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
  
          <div className="mt-12 border-t pt-6">
            <div className="text-center sm:flex sm:justify-between sm:text-left">
              <p className="text-sm">
                <span className="block sm:inline">All rights reserved.</span>
              </p>
  
              <p className="text-secondary-foreground/70 mt-4 text-sm transition sm:order-first sm:mt-0">
                &copy; 2026 {data.company.name}
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
  
