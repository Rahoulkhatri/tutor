"use client";

import { Zap, X } from 'lucide-react';
import { useState } from "react";

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-lg">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg">AI Web Scraping</h3>
          <p className="text-sm text-white/90">Automatically discover and collect leads, profiles and other data</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-white text-blue-600 font-medium px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
          Configure AI Settings
        </button>
        <button onClick={() => setIsVisible(false)} className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
