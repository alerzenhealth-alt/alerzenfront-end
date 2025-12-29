import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Users, Award, Clock, MapPin } from "lucide-react";
import { openWhatsApp } from "@/lib/whatsapp";

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-background glass-bg-pattern medical-pattern">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-primary/5 to-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6 mb-12">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary">
                            About Alerzen Health
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Revolutionizing healthcare delivery in Bangalore with hospital-grade diagnostics at your doorstep.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-xl">
                                <Heart className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                To make high-quality diagnostic services accessible, affordable, and convenient for everyone. We believe that healthcare should come to you, not the other way around. By eliminating the need to travel and wait in queues, we ensure that your health remains the top priority.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-xl">
                                <Shield className="w-8 h-8 text-accent" />
                            </div>
                            <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                To become Bangalore's most trusted home healthcare partner, known for accuracy, speed, and compassionate care. We aim to bridge the gap between patients and top-tier diagnostic labs through technology and dedicated service.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-16 md:py-24 bg-muted/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-primary mb-4">Why Choose Us?</h2>
                        <p className="text-lg text-muted-foreground">Built on a foundation of trust and excellence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Award,
                                title: "NABL Certified",
                                description: "We partner exclusively with NABL accredited labs to ensure 100% accurate reports."
                            },
                            {
                                icon: Clock,
                                title: "Fast Turnaround",
                                description: "Get your reports within 4-8 hours. We value your time and peace of mind."
                            },
                            {
                                icon: Users,
                                title: "Expert Team",
                                description: "Our phlebotomists are highly trained, vaccinated, and follow strict hygiene protocols."
                            },
                            {
                                icon: MapPin,
                                title: "Local Focus",
                                description: "Specialized focus on BTM Layout and surrounding areas for rapid response."
                            }
                        ].map((item, index) => (
                            <Card key={index} className="glass-card hover:shadow-lg transition-all border-none">
                                <CardContent className="pt-6 text-center space-y-4">
                                    <div className="inline-flex items-center justify-center p-3 bg-background rounded-full shadow-sm">
                                        <item.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-primary">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story / Context */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 rounded-3xl text-center space-y-8">
                        <h2 className="text-3xl font-bold text-primary">Our Story</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Alerzen Health was born from a simple observation: getting a blood test shouldn't be a hassle. In a busy city like Bangalore, traffic and long waiting times at clinics often deter people from regular health checkups. We set out to change that by bringing the lab to your living room.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Starting with a small team in BTM Layout, we have grown into a trusted network connecting patients with the best diagnostic centers. Our commitment to hygiene, punctuality, and accuracy has helped us serve thousands of satisfied customers.
                        </p>
                        <Button
                            size="lg"
                            className="mt-4"
                            onClick={() => openWhatsApp("Hi, I'd like to know more about Alerzen Health")}
                        >
                            Get in Touch
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />

        </div>
    );
};

export default AboutUs;
