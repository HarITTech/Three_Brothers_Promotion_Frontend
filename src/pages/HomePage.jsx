import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';
import ResultsSection from '../components/ResultsSection';
import ProtocolSection from '../components/ProtocolSection';
import PackagesSection from '../components/PackagesSection';
import FaqSection from '../components/FaqSection';
import TestimonialsSection from '../components/TestimonialsSection';
import TeamSection from '../components/TeamSection';
import ContactSection from '../components/ContactSection';
import LeadModal from '../components/LeadModal';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <ResultsSection />
        <ProtocolSection />
        <PackagesSection />
        <FaqSection />
        <TestimonialsSection />
        <TeamSection />
        <ContactSection />
      </main>
      <Footer />
      <LeadModal />
    </>
  );
}
