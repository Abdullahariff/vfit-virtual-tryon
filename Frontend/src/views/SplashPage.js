import React from "react";
import "../../styles/splashPage.css";

const SplashPage = ({ onEnter }) => {
  return (
    <>
      <div className="splash">
        <div className="logo">VFIT</div>

        {/* Layer 1: Background */}
        <div className="big-v">V</div>

        {/* Layer 2: Robot Wrapper */}
        <div className="robot-container">
          <img src="/craiyon_091110_image.png" alt="robot" className="robot" />
        </div>

        {/* Layer 3: Interaction UI */}
        <div className="right">
          <p className="text">Experience Virtual Try-On like never before</p>
          <button className="btn" onClick={onEnter}>
            ENTER EXPERIENCE
          </button>
        </div>
      </div>
      {/* 
      <div className="about">
        <div className="bg-text">DIGITAL FASHION</div>
        <h1 className="about-hero">
          Don't just buy it—<span>vfit</span> it first.
        </h1>
        <div className="cards-container">
          <div className="about-card">
            <span className="card-num">THE GAMBLE</span>
            <p>
              Online shopping shouldn't be a guessing game. With inconsistent
              sizing across brands, "Medium" has lost its meaning.
            </p>
          </div>
          <div className="about-card">
            <span className="card-num">VIRTUAL FIT</span>
            <p>
              Our AI precisely scans your silhouette and dresses you in
              real-time. Experience the drape and fit virtually.
            </p>
          </div>
          <div className="about-card">
            <span className="card-num">SUSTAINABILITY</span>
            <p>
              By eliminating "return-culture," we reduce the carbon footprint of
              shipping. High-tech fashion that’s kind to the planet.
            </p>
          </div>
        </div>
      </div> */}

      {/* --- NEW CONTACT SECTION --- */}
      <section className="contact">
        <div className="contact-container">
          <div className="contact-info">
            <h2 className="contact-title">GET IN TOUCH</h2>
            <p className="contact-desc">
              Partner with us or inquire about our enterprise AI solutions.
              Let's redefine the digital fitting room.
            </p>
            <div className="contact-details">
              <div className="detail-item">
                <span>EMAIL</span>
                <p>hello@vfit.studio</p>
              </div>
              <div className="detail-item">
                <span>OFFICE</span>
                <p>New York, NY 10013</p>
              </div>
              <div className="detail-item">
                <span>SOCIAL</span>
                <p>@vfit.tech</p>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <input type="text" placeholder="NAME" required />
            </div>
            <div className="input-group">
              <input type="email" placeholder="EMAIL" required />
            </div>
            <div className="input-group">
              <textarea placeholder="MESSAGE" rows="4" required></textarea>
            </div>
            <button type="submit" className="btn contact-btn">
              SEND INQUIRY
            </button>
          </form>
        </div>
        <footer className="footer-small">
          © 2026 VFIT STUDIO. ALL RIGHTS RESERVED.
        </footer>
      </section>
    </>
  );
};

export default SplashPage;
