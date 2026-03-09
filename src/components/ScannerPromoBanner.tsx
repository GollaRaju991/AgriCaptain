import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ScanLine, ShieldCheck, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    icon: ScanLine,
    title: 'Scan Leaf',
    desc: 'Point camera at your crop leaf',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: ShieldCheck,
    title: 'Get Diagnosis',
    desc: 'AI detects the disease instantly',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: ShoppingCart,
    title: 'Buy Solution',
    desc: 'Get recommended products',
    color: 'bg-blue-100 text-blue-700',
  },
];

const ScannerPromoBanner = () => {
  return (
    <div className="w-full px-2 md:px-4 py-4">
      <div className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-2xl p-4 md:p-6 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold leading-tight">🌿 AI Crop Disease Scanner</h3>
            <p className="text-[11px] text-green-100">Scan your plant leaf to detect diseases instantly</p>
          </div>
        </div>

        {/* Animated Steps */}
        <div className="flex gap-2 mb-4">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center relative animate-fade-in"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60 z-10 hidden sm:block" />
              )}
              <div className={`w-8 h-8 ${step.color} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                <step.icon className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-semibold leading-tight">{step.title}</p>
              <p className="text-[9px] text-green-200 mt-0.5 hidden sm:block">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link to="/scanner">
          <Button className="w-full bg-white text-green-700 hover:bg-green-50 font-bold rounded-xl h-10 text-sm shadow-lg">
            <ScanLine className="w-4 h-4 mr-2" />
            Scan Your Crop Now — It's Free!
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ScannerPromoBanner;
