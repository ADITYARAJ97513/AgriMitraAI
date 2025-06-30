'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const publicPaths = ['/login', '/signup'];
  
  if (publicPaths.includes(pathname)) {
    return null;
  }

  return (
    <footer className="bg-green-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xl font-bold">AgriMitraAI</span>
                <p className="text-sm text-green-200">AI Agritech Advisor</p>
              </div>
            </div>
            <p className="text-green-100 leading-relaxed">
              Empowering small farmers with AI-driven agricultural solutions. 
              Get personalized advice for crops, fertilizers, pest control, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/crop-advisor" className="text-green-200 hover:text-white transition-colors">Crop Advisor</Link></li>
              <li><Link href="/fertilizer-soil" className="text-green-200 hover:text-white transition-colors">Fertilizer Guide</Link></li>
              <li><Link href="/pest-disease" className="text-green-200 hover:text-white transition-colors">Pest Control</Link></li>
               <li><Link href="/community" className="text-green-200 hover:text-white transition-colors">Community Forum</Link></li>
              <li><Link href="/market-yield" className="text-green-200 hover:text-white transition-colors">Market</Link></li>
              <li><Link href="/govt-schemes" className="text-green-200 hover:text-white transition-colors">Subsidies</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-green-300" />
                <span className="text-green-200">1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-green-300" />
                <span className="text-green-200">help@agrimitraai.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-300" />
                <span className="text-green-200">India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-8 text-center">
          <p className="text-green-200">
            © 2024 AgriMitraAI. All rights reserved. Designed for small farmers with ❤️
          </p>
        </div>
      </div>
    </footer>
  );
}
