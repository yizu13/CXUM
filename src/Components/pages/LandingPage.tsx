import { useAnimation } from "../../hooks/context/AnimationContext";
import NavBar from "../layout/NavBar";
import Hero from "../Sections/Hero";
import OurImpact from "../Sections/OurImpact";
import OurWork from "../Sections/OurWork";
import WhoWeAre from "../Sections/WhoWeAre";
import RecentNews from "../Sections/RecentNews";
import CollectionMap from "../Sections/CollectionMap";
import ScrollToTopButton from "../ModularUI/ScrollToTopButton";

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
          <CollectionMap />
          <RecentNews />
          <ScrollToTopButton heroId="inicio" />
        </main>
      )}
    </>
  );
}
