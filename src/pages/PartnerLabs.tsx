import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Award, Microscope, Shield, Clock, Users } from "lucide-react";
import mouSigning from "@/assets/mou-signing.jpg";
import mouDocument from "@/assets/mou-document.jpg";
import labFacility from "@/assets/lab-facility.jpg";
import { openWhatsApp } from "@/lib/whatsapp";

const PartnerLabs = () => {
  const certifications = [
    { icon: Award, title: "NABL Accredited", description: "National Accreditation Board for Testing and Calibration Laboratories" },
    { icon: Shield, title: "ISO 9001:2015 Certified", description: "International quality management standards" },
    { icon: Microscope, title: "CAP Certified", description: "College of American Pathologists accreditation" },
  ];

  const features = [
    { icon: Clock, title: "4-8 Hour Reports", description: "Fast turnaround time for most tests" },
    { icon: Users, title: "Expert Pathologists", description: "Team of highly qualified specialists" },
    { icon: CheckCircle, title: "30 Min Response", description: "Quick customer support & query resolution" },
  ];

  return (
    <div className="min-h-screen bg-background glass-bg-pattern medical-pattern">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-12">
            <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-sm px-4 py-2">
              Our Trusted Partner
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary">
              Prima Diagnostics
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Bangalore's leading NABL-accredited diagnostic center with state-of-the-art technology and expert pathologists ensuring accurate, reliable test results.
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Story */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-primary">
                A Partnership Built on Trust
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We've partnered with Prima Diagnostics to bring you hospital-grade diagnostic services at your doorstep. With over 15 years of excellence in laboratory medicine, Prima Diagnostics processes thousands of samples daily with precision and care.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every sample collected by Alerzen is processed at Prima's cutting-edge facility, where advanced automation meets human expertise to deliver accurate results you can trust.
              </p>
              <Button
                size="lg"
                className="mt-4"
                onClick={() => openWhatsApp("Hi")}
              >
                Book Your Test Now
              </Button>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={labFacility}
                  alt="Prima Diagnostics Laboratory Facility"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
              World-Class Certifications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Prima Diagnostics maintains the highest standards of quality and accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="glass-card rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-6">
                  <cert.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{cert.title}</h3>
                <p className="text-muted-foreground text-sm">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOU Images */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
              Official Partnership Agreement
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sealed with commitment to deliver exceptional healthcare services together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={mouSigning}
                alt="MOU Signing Ceremony between Alerzen Health and Prima Diagnostics"
                className="w-full h-auto"
              />
              <div className="glass-card p-6 -mt-20 mx-6 relative z-10">
                <h3 className="text-xl font-bold text-primary mb-2">Partnership Signing</h3>
                <p className="text-muted-foreground text-sm">
                  Directors from Alerzen Health and Prima Diagnostics formalizing our collaboration.
                </p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={mouDocument}
                alt="Signed MOU Document"
                className="w-full h-auto"
              />
              <div className="glass-card p-6 -mt-20 mx-6 relative z-10">
                <h3 className="text-xl font-bold text-primary mb-2">Official Agreement</h3>
                <p className="text-muted-foreground text-sm">
                  Memorandum of Understanding establishing quality standards and service commitments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
              Why Prima Diagnostics?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-3xl p-8 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary">
              Experience Premium Diagnostics at Home
            </h2>
            <p className="text-xl text-muted-foreground">
              Book your test today and get results from Prima Diagnostics delivered to your phone.
            </p>
            <Button
              size="lg"
              className="mt-6"
              onClick={() => openWhatsApp("Hi")}
            >
              Book on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  );
};

export default PartnerLabs;