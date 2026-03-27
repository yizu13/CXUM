import { useAnimation } from "../../hooks/context/AnimationContext";
import NavBar from "../layout/NavBar";
import Hero from "../Sections/Hero";
import OurImpact from "../Sections/OurImpact";
import OurWork from "../Sections/OurWork";
import WhoWeAre from "../Sections/WhoWeAre";
import CollectionMap from "../Sections/CollectionMap";
import RecentNews from "../Sections/RecentNews";
import ScrollToTopButton from "../ModularUI/ScrollToTopButton";
import OurTeam from "../Sections/OurTeam";
import MisionVisionValores from "../Sections/MisionVisionValores";
import Footer from "../layout/Footer";

export default function LandingPage() {
  const { navReady } = useAnimation();
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
          <ScrollToTopButton heroId="inicio" />
        </main>
      )}
      <Footer/>
    </>
  );
}
