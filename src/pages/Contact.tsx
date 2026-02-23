import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import useScrollToTop from '@/hooks/useScrollToTop';

const Contact = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-muted-foreground">We'd love to hear from you. Reach out to us anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Phone</h3>
              <p className="text-muted-foreground">9912365550</p>
              <p className="text-sm text-muted-foreground">Mon-Sat 9AM-7PM</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Email</h3>
              <p className="text-muted-foreground">agrizincontact@gmail.com</p>
              <p className="text-sm text-muted-foreground">24/7 Support</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Address</h3>
              <p className="text-muted-foreground">Nanakramguda Rd, Financial District</p>
              <p className="text-muted-foreground">Serilingampalle (M), Hyderabad</p>
              <p className="text-muted-foreground">Telangana 500032</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 flex items-start space-x-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
              <p className="text-muted-foreground">Monday - Saturday: 9:00 AM - 7:00 PM</p>
              <p className="text-muted-foreground">Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Send Us a Message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Your Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                <input type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Your Phone Number" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Your Email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Message</label>
              <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Your Message"></textarea>
            </div>
            <button type="button" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
      
      <div className="h-20 lg:hidden"></div>
      <Footer />
    </div>
  );
};

export default Contact;
