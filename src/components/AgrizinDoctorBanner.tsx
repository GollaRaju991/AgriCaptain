import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ScanLine, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import agrizinDoctor from '@/assets/agrizin-doctor.png';

const AgrizinDoctorBanner = () => {
  const [showScanner, setShowScanner] = useState(false);

  return (
    <div className="w-full px-2 md:px-4 py-3">
      <div className="relative bg-gradient-to-r from-green-50 to-green-100 rounded-2xl overflow-hidden shadow-sm border border-green-200">
        <div className="flex items-stretch">
          {/* Text Content */}
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-center">
            <span className="inline-block bg-white text-foreground text-xs md:text-sm font-medium px-3 py-1 rounded-full border border-green-200 w-fit mb-2">
              Need Help?
            </span>
            <h3 className="text-base md:text-xl font-bold text-foreground leading-tight">
              Chat with Agrizin Doctor
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              for crop health advise.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <Link to="/contact">
                <Button
                  size="sm"
                  className="bg-green-700 hover:bg-green-800 text-white text-xs md:text-sm font-semibold rounded-md px-3 md:px-4 py-2"
                >
                  Get Expert Support
                </Button>
              </Link>
              <a href="tel:+919999999999">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50 rounded-md px-2 py-2"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </a>
              <Button
                size="sm"
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50 rounded-md px-2 py-2"
                onClick={() => setShowScanner(true)}
              >
                <ScanLine className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Doctor Image */}
          <div className="w-[120px] md:w-[180px] flex-shrink-0 flex items-end justify-center">
            <img
              src={agrizinDoctor}
              alt="Agrizin Doctor"
              className="h-[140px] md:h-[200px] object-contain object-bottom"
            />
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-foreground mb-2">Scan Crop / Product</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use your camera to scan a crop leaf or product barcode for instant diagnosis.
            </p>
            <div className="aspect-square bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-green-300">
              <div className="text-center">
                <ScanLine className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Camera scanner</p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgrizinDoctorBanner;
