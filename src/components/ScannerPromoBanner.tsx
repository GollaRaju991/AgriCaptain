import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import scannerPhoneMockup from '@/assets/scanner-phone-mockup.png';

const ScannerPromoBanner = () => {
  const { translations } = useLanguage();

  return (
    <div className="w-full px-2 md:px-4 py-3">
      <Link to="/scanner">
        <div className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl overflow-hidden shadow-sm border border-green-100 flex items-stretch min-h-[100px] md:min-h-[100px] md:max-h-[120px]">
          {/* Left Content */}
          <div className="flex-1 p-3 md:p-5 flex flex-col justify-center z-10">
            <h3 className="text-xl md:text-2xl font-extrabold leading-tight">
              <span className="text-gray-800">{translations.scanner_crop_disease?.split(' ').slice(0, -1).join(' ') || 'Crop Disease'}</span>
              <br />
              <span className="text-green-600">{translations.scanner_crop_disease?.split(' ').slice(-1)[0] || 'Scanner'}</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mt-1.5 leading-snug">
              {translations.scanner_detect_subtitle}
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-bold px-5 py-2 rounded-full transition-colors shadow-md">
                {translations.scanner_scan_now}
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Sparkle accent */}
          <div className="absolute left-[38%] top-[35%] text-amber-400 text-xl font-bold select-none pointer-events-none z-10">
            ✦
          </div>

          {/* Right Image */}
          <div className="w-[45%] md:w-[40%] relative flex items-end justify-center">
            <img
              src={scannerPhoneMockup}
              alt="Phone scanning a crop leaf"
              className="w-full h-full object-contain object-bottom drop-shadow-lg"
            />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ScannerPromoBanner;
