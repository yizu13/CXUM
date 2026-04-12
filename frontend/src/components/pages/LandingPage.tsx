import { useAnimation } from "../../hooks/context/AnimationContext";
import { useSEO } from "../../hooks/useSEO";
import NavBar from "../layout/NavBar";
import Hero from "../Sections/Hero";
import OurImpact from "../Sections/OurImpact";
import OurWork from "../Sections/OurWork";
import WhoWeAre from "../Sections/WhoWeAre";
import CollectionMap from "../Sections/CollectionMap";
import RecentNews from "../Sections/RecentNews";
import ScrollToTopButton from "../modularUI/ScrollToTopButton";
import OurTeam from "../Sections/OurTeam";
import MisionVisionValores from "../Sections/MisionVisionValores";
import FAQs from "../Sections/FAQs";
import Footer from "../layout/Footer";

export default function LandingPage() {
  const { navReady } = useAnimation();
  useSEO();
  
  return (
    <>
      <NavBar />
      {navReady && (
        <main>
          <Hero />
          <OurWork />
          <OurImpact />
          <WhoWeAre />
          <MisionVisionValores />
          <CollectionMap />
          <OurTeam/>
          <RecentNews />
          <FAQs />
          <ScrollToTopButton heroId="inicio" />
          <Footer/>
        </main>
      )}
    </>
  );
}
