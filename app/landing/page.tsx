import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Workflow from "../components/Workflow";
import About from "../components/About";
import UserRoles from "../components/UserRoles";
import Statistics from "../components/Statistics";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <About />
      <UserRoles />
      <Statistics />
      <CallToAction />
      <Footer />
    </main>
  );
}
