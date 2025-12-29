import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
    const faqs = [
        {
            question: "How do I book a home blood test?",
            answer: "You can book directly through our website by selecting your test and clicking 'Book Now', which opens WhatsApp for quick confirmation. Or simply call us at +91 9876543210."
        },
        {
            question: "Is home sample collection free?",
            answer: "Yes, we offer free home sample collection across BTM Layout and surrounding areas in Bangalore for orders above ₹500."
        },
        {
            question: "When will I get my reports?",
            answer: "Most routine test reports are delivered within 6-12 hours via WhatsApp and Email. Specialised tests may take 24-48 hours."
        },
        {
            question: "Are your labs NABL certified?",
            answer: "Absolutely. We partner exclusively with NABL and CAP accredited labs to ensure 100% accurate hospital-grade results."
        }
    ];

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <section className="py-20 bg-blue-50/50">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0b3c65] mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600">
                        Everything you need to know about our home diagnostic services.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`} className="border-b-gray-100 last:border-0">
                                <AccordionTrigger className="text-[#0b3c65] font-bold text-lg hover:text-[#be2c2d] hover:no-underline text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-600 leading-relaxed text-base pb-6">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Inject Schema for SEO/AEO */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            </div>
        </section>
    );
};

export default FAQ;
