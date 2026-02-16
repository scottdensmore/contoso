import ContactForm from "@/components/contact-form";

export default function ContactPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{ backgroundImage: "url('/images/contact-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-md">
            Get in Touch
          </h1>
          <p className="mt-4 text-xl text-gray-100 max-w-2xl mx-auto drop-shadow-sm">
            Ready for your next adventure? Our team is here to help you gear up.
          </p>
        </div>
        
        <ContactForm />
      </div>
    </main>
  );
}