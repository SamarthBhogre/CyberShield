import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Target, BarChart, Gem, Star, ArrowUpRight } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function HomePage() {
  return (
    <div className="bg-gray-900 text-white font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <AboutSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}

// --- NEW Navbar Component based on your design ---
const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 p-4">
      <nav className="container mx-auto max-w-7xl bg-black/30 backdrop-blur-sm border border-white/10 rounded-full p-2 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center space-x-2 pl-4">
          <ShieldCheck className="text-cyan-400 h-7 w-7" />
          <span className="text-xl font-bold tracking-wide">CyberShield</span>
        </Link>

        {/* Main Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 bg-black/20 border border-white/10 rounded-full px-6 py-2">
          <a href="#services" className="text-gray-300 hover:text-cyan-400 transition-colors">Services</a>
          <a href="#about" className="text-gray-300 hover:text-cyan-400 transition-colors">About</a>
          <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors">Pricing</a>
          <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 transition-colors">Clients</a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4 pr-2">
          {!user ? (
            <>
              <Link to="/login" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium px-4 py-2">
                Login
              </Link>
              <Link to="/register" className="bg-cyan-500 text-gray-900 font-bold py-2 px-5 rounded-full flex items-center gap-1 hover:bg-cyan-400 transition-colors">
                Sign Up <ArrowUpRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <span className="text-cyan-400 font-bold hidden md:block">Hi, {user.username}</span>
              <button
                onClick={logout}
                className="bg-cyan-500 text-gray-900 font-bold py-2 px-5 rounded-full hover:bg-cyan-400 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};


// --- Sections (No changes below this line) ---
const HeroSection = () => (
  <section id="home" className="min-h-[calc(100vh-80px)] flex items-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(17,24,39,0.8), rgba(17,24,39,1)), url('/Background.png')", }}>
    <div className="container mx-auto px-6 text-center">
      <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">Fortifying Your Digital Frontier</h2>
      <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
        We provide cutting-edge cybersecurity solutions, from threat intelligence to incident response, ensuring your business remains secure and resilient.
      </p>
      <a href="#services" className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-3 px-8 rounded-lg text-lg transition-transform hover:scale-105 inline-block">
        Explore Our Services
      </a>
    </div>
  </section>
);

const ServicesSection = () => {
  const services = [
    { icon: <Target className="h-10 w-10 text-cyan-400" />, title: "Phishing Email Detector", description: "Identifies suspicious or fraudulent emails.", link: "/phishing-detector" },
    { icon: <ShieldCheck className="h-10 w-10 text-cyan-400" />, title: "URL Checker", description: "Analyzes and flags potentially harmful web links.", link: "/url-checker" },
    { icon: <BarChart className="h-10 w-10 text-cyan-400" />, title: "Password Checker", description: "Evaluates password strength and suggests improvements.", link: "/password-checker" },
    { icon: <Gem className="h-10 w-10 text-cyan-400" />, title: "Fake News Detector", description: "Detects misleading or false information in news content.", link: "/news-detector" },
  ];

  return (
    <section id="services" className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Core Services</h2>
          <p className="text-gray-400 mt-2">Tailored solutions to protect your most valuable assets.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Link to={service.link} key={index} className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-cyan-500 hover:-translate-y-2 transition-all duration-300 block">
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const AboutSection = () => (
  <section id="about" className="py-20 bg-gray-800">
    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Who We Are</h2>
        <p className="text-gray-300 mb-4">
          CyberShield was founded by a team of veteran security professionals with a single mission: to make enterprise-grade cybersecurity accessible to all businesses. We believe that robust security is not a luxury, but a fundamental right in the digital age.
        </p>
        <p className="text-gray-300">
          Our approach combines advanced technology with human expertise, creating a proactive and adaptive defense against the ever-evolving landscape of cyber threats. We are your trusted partners in digital resilience.
        </p>
      </div>
      <div>
        <img src="https://askit.dextheme.net/shieldx/wp-content/uploads/sites/18/2024/07/SD4KJG2a.jpg" alt="CyberShield Team" className="rounded-2xl shadow-lg" />
      </div>
    </div>
  </section>
);

const PricingSection = () => {
  const plans = [
    {
      name: "Essential",
      price: "499",
      features: [
        "Phishing Email Detection",
        "Basic URL Safety Checks",
        "Standard Password Strength Checking",
        "Email Support"
      ]
    },
    {
      name: "Professional",
      price: "1,499",
      features: [
        "AI-powered Phishing Detection",
        "Advanced URL Analyzer",
        "Fake News Detection",
        "Priority Phone Support"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Custom Security Integrations",
        "Bulk Phishing/URL Scans",
        "API Access for Password and News Checking",
        "24/7 Expert Support"
      ]
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Transparent Pricing</h2>
          <p className="text-gray-400 mt-2">Choose the plan that fits your security needs.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`bg-gray-800 p-8 rounded-2xl border ${plan.popular ? 'border-cyan-500' : 'border-gray-700'} flex flex-col`}>
              {plan.popular && <div className="text-center bg-cyan-500 text-gray-900 font-bold py-1 px-4 rounded-full -mt-12 mx-auto">Most Popular</div>}
              <h3 className="text-2xl font-bold text-center mt-4">{plan.name}</h3>
              <div className="text-5xl font-bold text-center my-4">
                {plan.price.startsWith('Custom') ? 'Custom' : `$${plan.price}`}
                {!plan.price.startsWith('Custom') && <span className="text-lg font-normal text-gray-400">/mo</span>}
              </div>
              <ul className="space-y-4 text-gray-300 flex-grow">
                {plan.features.map(feature => <li key={feature} className="flex items-center"><ShieldCheck className="h-5 w-5 text-cyan-400 mr-3" />{feature}</li>)}
              </ul>
              <a href="#contact" className={`mt-8 text-center font-bold py-3 px-4 rounded-lg transition-colors ${plan.popular ? 'bg-cyan-500 text-gray-900 hover:bg-cyan-400' : 'bg-gray-700 hover:bg-gray-600'}`}>
                {plan.price.startsWith('Custom') ? 'Contact Us' : 'Choose Plan'}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection = () => {
  const testimonials = [
    { quote: "CyberShield transformed our security posture. Their team is incredibly knowledgeable and responsive. We finally have peace of mind.", name: "Jane Doe", company: "CEO, Tech Innovators" },
    { quote: "The penetration test was thorough and eye-opening. They found critical vulnerabilities we never would have known about. Highly recommended.", name: "John Smith", company: "CTO, FinCorp" },
  ];
  return (
    <section id="testimonials" className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">What Our Clients Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-900 p-8 rounded-2xl">
              <div className="flex text-yellow-400 mb-4">
                <Star /><Star /><Star /><Star /><Star />
              </div>
              <p className="text-gray-300 mb-6">"{testimonial.quote}"</p>
              <div>
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-gray-400">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer id="contact" className="bg-gray-900 border-t border-gray-800 py-8">
    <div className="container mx-auto px-6 text-center text-gray-500">
      <p>&copy; 2025 CyberShield Security. All Rights Reserved.</p>
      <p className="mt-2">Digital Resilience.</p>
    </div>
  </footer>
);

