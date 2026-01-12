import React, { useCallback } from "react";
import { Link } from "react-router-dom";
import DotGrid from "../components/DotGrid";
import { useTranslation } from "../contexts/LanguageContext";
import homeDemo from "../assets/Home.png";
import onboardingDemo from "../assets/OnBoarding.png";


function Home() {
  const { t } = useTranslation();
  const handleDemoClick = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem("sayfeDemoAccess", "true");
    } catch (error) {
      console.warn("Unable to persist demo access flag:", error);
    }
  }, []);
  const problemPoints = t("home.problem.points") || [];
  const solutionSteps = t("home.solution.steps") || [];
  const socialProofItems = t("home.socialProof.items") || [];

  return (
    <div className="App">
      <main className="page-main home-main">
        
        <DotGrid
          className="dotGrid-background"
          dotSize={12}
          gap={18}
          baseColor="#73ac84"
          activeColor="#73ac84"
          baseOpacity={0.12}
          activeOpacity={0.26}
          proximity={140}
          shockRadius={260}
          shockStrength={4.2}
          resistance={820}
          returnDuration={1.45}
          style={{ width: "100%", height: "100%" }}
        />
        
        {/* === Demo Section === */}
        <section className="demo-section">
          <div className="section-shell demo-shell">
            <div className="demo-content">
              <h2
                className="demo-title"
                dangerouslySetInnerHTML={{ __html: t("home.demoTitle") }}
              ></h2>
              <p
                className="demo-text"
                dangerouslySetInnerHTML={{ __html: t("home.demoText") }}
              ></p>
              <Link to="/demo" className="demo-btn" onClick={handleDemoClick}>
                <span
                  dangerouslySetInnerHTML={{ __html: t("home.demoCta") }}
                ></span>
              </Link>
            </div>

            <div className="demo-visual">
              <div className="phone-stack">
                <div className="phone-frame phone-left">
                  <img
                    src={homeDemo}
                    alt="besayfe App home screen preview"
                    className="phone-screen"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
                <div className="phone-frame phone-right">
                  <img
                    src={onboardingDemo}
                    alt="besayfe onboarding flow preview"
                    className="phone-screen"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* === Problem Section === */}
        <section className="problem">
          <div className="section-shell">
            <div className="section-heading">
              <p
                className="section-eyebrow"
                dangerouslySetInnerHTML={{ __html: t("home.problemEyebrow") }}
              ></p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.problemTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.problemIntro") }}
              ></p>
            </div>
            <div className="problem-grid">
              {problemPoints.map(point => (
                <article className="problem-card" key={point.title}>
                  <span className="problem-icon" aria-hidden="true">
                    {point.icon}
                  </span>
                  <div className="problem-copy">
                    <h4
                      dangerouslySetInnerHTML={{ __html: point.title }}
                    ></h4>
                    <p
                      dangerouslySetInnerHTML={{ __html: point.text }}
                    ></p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Solution Section === */}
        <section className="solution">
          <div className="section-shell">
            <div className="section-heading section-heading--center">
              <p className="section-eyebrow" dangerouslySetInnerHTML={{__html: t("home.solutionEyebrow")}}></p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.solutionTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.solutionIntro") }}
              ></p>
            </div>
            <div className="solution-grid">
              {solutionSteps.map(step => (
                <article className="solution-card" key={step.title}>
                  <span className="solution-icon" aria-hidden="true">
                    {step.icon}
                  </span>
                  <h4
                    dangerouslySetInnerHTML={{ __html: step.title }}
                  ></h4>
                  <p
                    dangerouslySetInnerHTML={{ __html: step.text }}
                  ></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Social Proof Section === */}
        <section className="social-proof">
          <div className="section-shell">
            <div className="section-heading">
              <p
                className="section-eyebrow"
                dangerouslySetInnerHTML={{ __html: t("home.socialProofEyebrow") }}
              ></p>
              <h3
                className="section-title"
                dangerouslySetInnerHTML={{ __html: t("home.socialProofTitle") }}
              ></h3>
              <p
                className="section-intro"
                dangerouslySetInnerHTML={{ __html: t("home.socialProofIntro") }}
              ></p>
            </div>
            <div className="social-proof-grid">
              {socialProofItems.map(item => (
                <article className="social-proof-card" key={item.title}>
                  <span className="social-proof-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <p
                    className="social-proof-label"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  ></p>
                  <p
                    className="social-proof-detail"
                    dangerouslySetInnerHTML={{ __html: item.text }}
                  ></p>
                  {item.meta && (
                    <span
                      className="social-proof-meta"
                      dangerouslySetInnerHTML={{ __html: item.meta }}
                    ></span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* === Final CTA Section === */}
        <section className="home-cta">
          <div className="section-shell">
            <div className="home-cta-card">
              <p
                className="section-eyebrow"
                dangerouslySetInnerHTML={{ __html: t("home.ctaEyebrow") }}
              ></p>
              <h3
                dangerouslySetInnerHTML={{ __html: t("home.ctaTitle") }}
              ></h3>
              <p
                dangerouslySetInnerHTML={{ __html: t("home.ctaText") }}
              ></p>
              <div className="cta-actions">
                <Link to="/demo" className="cta-btn" onClick={handleDemoClick}>
                  <span
                    dangerouslySetInnerHTML={{ __html: t("home.ctaButton") }}
                  ></span>
                </Link>
                <Link to="/contact" className="ghost-btn">
                  <span
                    dangerouslySetInnerHTML={{ __html: t("home.ctaSecondary") }}
                  ></span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
