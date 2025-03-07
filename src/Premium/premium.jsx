import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Leaf, Bot, MessageSquare, Check, Crown, ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

// Utility function to replace @/lib/utils import
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// FeatureShowcase Component
const FeatureShowcase = ({
  title,
  description,
  icon,
  imageSrc,
  reversed = false,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center gap-10 p-8 rounded-2xl bg-black/50 border border-green-500/20",
        reversed && "lg:flex-row-reverse",
        className
      )}
    >
      <div className="flex-1 space-y-4">
        <div className="feature-icon text-green-500">{icon}</div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
      
      {imageSrc && (
        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-xl border border-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-transparent opacity-60"></div>
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// PricingCard Component
const PricingCard = ({
  title,
  price,
  description,
  features,
  popular = false,
  buttonText = "Get Started",
  onClick,
}) => {
  return (
    <div 
      className={cn(
        "relative flex flex-col p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 h-full",
        popular 
          ? "border-green-500 bg-black/80 animate-pulse-glow" 
          : "border-white/10 bg-black/30 hover:border-green-500/50"
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 px-4 py-1 rounded-full text-sm font-semibold text-black">
          Most Popular
        </div>
      )}
      
      <div className="mb-5">
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <div className="flex items-end mb-1">
          <span className="text-3xl font-bold text-white">{price}</span>
          <span className="text-gray-400 ml-1 mb-1">/month</span>
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      
      <div className="flex-grow flex flex-col space-y-3 my-5">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            {feature.included ? (
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            ) : (
              <X className="h-5 w-5 text-gray-500/50 mr-2 flex-shrink-0" />
            )}
            <span className={feature.included ? "text-white" : "text-gray-500"}>{feature.name}</span>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onClick}
        className={cn(
          "w-full py-3 rounded-lg font-medium transition-all duration-300 mt-auto",
          popular 
            ? "bg-green-500 text-black hover:bg-green-400" 
            : "bg-green-500/10 text-white border border-green-500/20 hover:bg-green-500/20"
        )}
      >
        {buttonText}
      </button>
    </div>
  );
};

// Main Premium Page Component
const Premium = () => {
  const [activeDemo, setActiveDemo] = useState("chat");

  const handleSubscribe = (plan) => {
    toast.success(`You selected the ${plan} plan!`, {
      description: "This would connect to your payment processor in a real app.",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md shadow-md border-b border-green-500/20">
        <div className="container mx-auto py-4 px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">Nourish</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/home" className="text-gray-400 hover:text-white transition-colors duration-200">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-green-500/10 to-transparent opacity-50"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <motion.h1 
                className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Elevate Your Nutrition Journey with
                <span className="bg-gradient-to-r from-green-500 to-green-300 bg-clip-text text-transparent"> Premium</span>
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-400 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Unlock powerful tools and personalized nutrition advice to achieve your health goals faster.
              </motion.p>
              <motion.div 
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <button 
                  className="bg-green-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-green-400 transition-all duration-300"
                  onClick={() => handleSubscribe("Ultimate")}
                >
                  Get Premium Now
                </button>
                <a 
                  href="#features" 
                  className="bg-green-500/10 text-white px-6 py-3 rounded-lg font-medium border border-green-500/20 hover:bg-green-500/20 transition-all duration-300"
                >
                  Explore Features
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 bg-black/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3 text-white">Premium Features</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Powerful tools and personalized guidance for your nutrition journey
              </p>
            </div>

            <div className="grid gap-8 max-w-4xl mx-auto">
              <FeatureShowcase
                title="NutriBuddy - Your AI-Powered Nutritionist"
                description="Ask anything, anytime! Our smart AI Dietitian chatbot provides instant answers to all your nutrition and wellness queries, making healthy eating effortless."
                icon={<Bot className="w-8 h-8" />}
                imageSrc="https://images.unsplash.com/photo-1550831107-1553da8c8464?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              />
              
              <FeatureShowcase
                title="Expert Nutrition Guidance, Anytime!"
                description="Get real-time advice from certified dietitians for personalized meal plans, blood sugar management, and holistic nutrition strategies—because your health deserves expert care!"
                icon={<MessageSquare className="w-8 h-8" />}
                reversed={true}
                imageSrc="https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-3 text-white">Choose Your Plan</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Select the plan that best fits your nutrition goals
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
              <div className="md:col-span-1">
                <PricingCard
                  title="Free"
                  price="Rs.0"
                  description="Basic tracking features"
                  features={[
                    { name: "Basic calorie tracking", included: true },
                    { name: "Basic food database", included: true },
                    { name: "Community forum access", included: true },
                    { name: "AI Nutrition Assistant", included: false },
                    { name: "Expert Nutrition Guidance", included: false },
                  ]}
                  buttonText="Current Plan"
                />
              </div>
              
              {/* <div className="md:col-span-1">
                <PricingCard
                  title="Pro"
                  price="Rs.100/month"
                  description="AI-powered nutrition assistant"
                  features={[
                    { name: "Advanced tracking", included: true },
                    { name: "Expanded food database", included: true },
                    { name: "Community access", included: true },
                    { name: "AI Nutrition Assistant", included: true },
                    { name: "Expert Nutrition Guidance", included: false },
                  ]}
                  buttonText="Get Pro"
                  onClick={() => handleSubscribe("Pro")}
                />
              </div> */}
              
              <div className="md:col-span-1">
                <PricingCard
                  title="Ultimate"
                  price="Rs.100"
                  description="Complete nutrition guidance"
                  features={[
                    { name: "Advanced tracking", included: true },
                    { name: "Complete food database", included: true },
                    { name: "Community access", included: true },
                    { name: "AI Nutrition Assistant", included: true },
                    { name: "Expert Nutrition Guidance", included: true },
                  ]}
                  popular={true}
                  buttonText="Get Ultimate"
                  onClick={() => handleSubscribe("Ultimate")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-10">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-black border border-green-500/20 text-center">
              <div className="w-12 h-12 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-white">Ready to Transform Your Nutrition Journey?</h2>
              <p className="mb-6 max-w-xl mx-auto text-gray-300">
                Join thousands of members achieving their health goals with Nourish Premium.
              </p>
              <button 
                className="bg-green-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-green-400 transition-all duration-300 inline-flex items-center gap-2"
                onClick={() => handleSubscribe("Ultimate")}
              >
                Get Premium Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default Premium;