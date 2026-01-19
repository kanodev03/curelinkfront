import { Calendar, Zap, Pill, FileText, Bell, ChevronRight, Shield, Lock, Scale, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const [isDark, setIsDark] = useState(false);

  const handleAction = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
       

        <main className="flex flex-col items-center">
          {/* Hero Section */}
          <section className="w-full max-w-6xl px-6 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <h1 className="text-5xl lg:text-6xl font-black leading-tight" style={{ color: '#096187' }}>
                    Your Digital Health Companion
                  </h1>
                  <p className={`text-lg font-normal leading-relaxed max-w-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Empowering digital hospital systems and patient management with high-trust healthcare solutions. Secure, efficient, and patient-centered.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleAction}
                    className="flex items-center justify-center h-14 px-6 rounded-lg text-base font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#038474', minWidth: '180px' }}
                  >
                    {user ? 'Open Dashboard' : 'Book Appointment'}
                  </button>
                  {!user && (
                    <button
                      onClick={() => window.location.href = '/register'}
                      className="flex items-center justify-center h-14 px-6 rounded-lg text-base font-bold border-2 transition-all"
                      style={{ borderColor: '#038474', color: '#038474', backgroundColor: isDark ? 'transparent' : 'white' }}
                    >
                      Talk to AI
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full flex justify-center">
                <img 
                  src="/unnamed.png"
                  alt="Healthcare Platform"
                  className="w-full max-w-md rounded-2xl shadow-lg border"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgb(229, 231, 235)' }}
                />
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className={`w-full max-w-6xl px-6 py-20`}>
            <div className="flex flex-col items-center mb-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Our Key Features</h2>
              <div className="h-1.5 w-20 rounded-full" style={{ backgroundColor: '#038474' }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: Calendar, title: 'Doctor Booking', desc: 'Schedule visits with top specialists easily.' },
                { icon: Zap, title: 'AI Assistant', desc: '24/7 medical AI for symptom checks.' },
                { icon: Pill, title: 'Medicine Paths', desc: 'Clear guidance for your prescriptions.' },
                { icon: FileText, title: 'Medical Records', desc: 'Encrypted storage for all your data.' },
                { icon: Bell, title: 'Smart Reminders', desc: 'Never miss a dose or appointment.' }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border flex flex-col items-start gap-4 transition-transform hover:-translate-y-1 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-800' 
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#E8F5E9' }}>
                    <card.icon size={24} style={{ color: '#038474' }} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.title}</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section id="how-it-works" className={`w-full py-20 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="max-w-6xl px-6 mx-auto">
              <div className="flex flex-col items-center mb-16 text-center">
                <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                <p className={isDark ? 'text-gray-400 max-w-lg' : 'text-gray-600 max-w-lg'}>
                  Simple steps to take control of your healthcare journey with CureLink.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {[
                  { num: '1', title: 'Choose Specialist', desc: 'Browse through our verified network of doctors across all specialties.' },
                  { num: '2', title: 'Book Slot', desc: 'Pick a time that works for you. Instant confirmation via SMS and email.' },
                  { num: '3', title: 'Get Treatment', desc: 'Consult via video call or in-person. Get prescriptions digitally.' }
                ].map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div
                      className="w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-black mb-6 relative z-10"
                      style={{ backgroundColor: '#038474' }}
                    >
                      {step.num}
                    </div>
                    <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h4>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{step.desc}</p>
                  </div>
                ))}
                <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 -z-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB' }}></div>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section id="security" className={`w-full max-w-6xl px-6 py-20`}>
            <div 
              className="rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12"
              style={{ backgroundColor: '#096187' }}
            >
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <Shield size={16} />
                  Security First
                </div>
                <h2 className="text-4xl font-bold text-white mb-6">Your data is safe with us</h2>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  CureLink uses bank-grade 256-bit encryption. We are fully HIPAA and GDPR compliant, ensuring your medical history remains private and secure at all times.
                </p>

                <div className="flex flex-wrap gap-8 opacity-90">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Shield size={24} />
                    HIPAA Compliant
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Lock size={24} />
                    AES-256 Encrypted
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Scale size={24} />
                    GDPR Ready
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/3 flex justify-center">
                <div className="text-8xl opacity-20">🛡️</div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        
      </div>
    </div>
  );
}