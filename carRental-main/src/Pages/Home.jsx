import Hero from "../components/Hero";
import BookCar from "../components/BookCar";
import PlanTrip from "../components/PlanTrip";
import PickCar from "../components/PickCar";
import Banner from "../components/Banner";
import ChooseUs from "../components/ChooseUs";
import Testimonials from "../components/Testimonials";
import Faq from "../components/Faq";
import Download from "../components/Download";
import Footer from "../components/Footer";
import wupLogo from '../images/logo/wup.jpg'
import callLogo from '../images/logo/call.png'

function Home() {
  return (
    <>

      <Hero />
      <BookCar />
      <PlanTrip />
      <PickCar />
      <Banner />
      <ChooseUs />
      <Testimonials />
      <Faq />
      <Download />
      <Footer />
      <div  style={{position: 'fixed', bottom: '100px', right: '40px'}}>
        <div >
          <div style={{ padding: '7px'}}>
            <a href="https://wa.me/9082091099">
              <img src={wupLogo} alt="" width={'50px'} />
            </a>
          </div>
          <div style={{padding: '7px', textAlign: 'center'}}>
            <a
              href={`tel:9082091099`}
              style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img src={callLogo} alt="" width={'40px'} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
