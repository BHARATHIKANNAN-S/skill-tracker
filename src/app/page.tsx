import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import {
  Features, WhyChooseUs, Stats, CompanyLogos,
  Testimonials, FAQ, Contact, Footer,
} from "@/components/landing/sections";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <WhyChooseUs />
      <Stats />
      <CompanyLogos />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
