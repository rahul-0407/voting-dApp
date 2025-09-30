import ShaderBackground from "../components/ShaderBackground"
import HeroContent from "../components/HeroContent"
import PulsingCircle from "../components/PulsingCircle"
import Features from "../components/Features"
import Stats from "../components/Stats"
import Work from "../components/HowItWorks"
import CTA from "../components/CTA"
import Testimonial from "../components/Testimonials"
// import Clients from "../components/Clients"
// import FlexibilityEfficiency from "../components/FlexibilityEfficiency"
import Footer from "../components/Footer"

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen">
        <ShaderBackground>
           <HeroContent />
           <PulsingCircle />
        </ShaderBackground>
      </section>
      
      {/* Stats Section */}
      <Stats />

      {/* Features Section */}
      <Features />
      <Work />
      <Testimonial />
      <CTA />

      {/* Clients Section */}
      {/* <Clients /> */}

      {/* Flexibility & Efficiency Section */}
      {/* <FlexibilityEfficiency /> */}

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home
