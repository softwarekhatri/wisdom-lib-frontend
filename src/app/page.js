import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Gallery from '@/components/landing/Gallery';
import Features from '@/components/landing/Features';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';
import AboutSection from '@/components/landing/About';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <AboutSection />
      <Gallery />
      <Features />
      <Contact />
      <Footer />
    </main>
  );
}
