"use client";

import React, { useState } from "react";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";

export const NavbarDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", link: "#home" },
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "Contact", link: "#contact" },
  ];

  return (
    <Navbar>
      {/* 💻 Desktop Navbar */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <NavbarButton href="#get-started" variant="gradient">
          Get Started
        </NavbarButton>
      </NavBody>

      {/* 📱 Mobile Navbar */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isOpen}
            onClick={() => setIsOpen(!isOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              className="block w-full rounded-md px-4 py-2 text-lg font-medium text-neutral-800 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </a>
          ))}
          <NavbarButton href="#get-started" className="mt-2" variant="gradient">
            Get Started
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};
