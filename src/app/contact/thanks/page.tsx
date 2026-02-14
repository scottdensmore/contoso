import ContactThanks from "@/components/contact-thanks";

export default function ContactThanksPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/contact-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 backdrop-blur-sm p-12 rounded-xl shadow-2xl">
        <ContactThanks />
      </div>
    </main>
  );
}
