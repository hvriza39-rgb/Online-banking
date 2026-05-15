'use client' 

import React, { useState } from 'react';

export default function BankLandingPage() {
  const [exchangeAmount, setExchangeAmount] = useState('1000');
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="border-b border-slate-900 backdrop-blur-md sticky top-0 z-50 bg-slate-950/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center font-bold text-slate-950 text-lg">
              Ω
            </div>
            <span className="font-semibold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              ORION
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#rates" className="hover:text-white transition-colors">Global Markets</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#company" className="hover:text-white transition-colors">Company</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Log In
            </button>
            <button className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 h-9 rounded-lg transition-all shadow-lg shadow-blue-600/20 active:scale-95">
              Open Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 lg:pt-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs font-medium text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Next-Gen Global Trading Live
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            The banking platform <br />
            built for global markets.
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
            Move money seamlessly, hold multi-currency accounts, and execute trades with institutional-grade routing. No hidden fees. Total transparency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button className="w-full sm:w-auto px-6 h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95">
              Get Started Free
            </button>
            <button className="w-full sm:w-auto px-6 h-12 border border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-300 font-medium rounded-xl transition-colors backdrop-blur-sm">
              Talk to Markets Desk
            </button>
          </div>
        </div>

        {/* Hero Interactive Widget Layout (Wise/Mercury Style) */}
        <div className="lg:col-span-5 relative w-full max-w-md mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl opacity-20 blur-md" />
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Live Converter</h3>
            
            {/* Input Row */}
            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 focus-within:border-blue-500 transition-colors">
                <label className="block text-xs text-slate-500 mb-1">You Send</label>
                <div className="flex items-center justify-between">
                  <input 
                    type="number" 
                    value={exchangeAmount} 
                    onChange={(e) => setExchangeAmount(e.target.value)}
                    className="bg-transparent text-xl font-bold text-white focus:outline-none w-full" 
                  />
                  <span className="text-sm font-bold bg-slate-800 px-2.5 py-1 rounded text-slate-300">USD</span>
                </div>
              </div>

              {/* Dynamic Rates Ticker */}
              <div className="px-4 py-1 text-xs space-y-2 border-l-2 border-dashed border-slate-800 ml-6 text-slate-400">
                <div className="flex justify-between"><span>Fee (0.15%)</span><span>$1.50</span></div>
                <div className="flex justify-between text-emerald-400 font-medium"><span>Guaranteed Rate</span><span>1.0842</span></div>
              </div>

              {/* Output Row */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs text-slate-500 mb-1">They Receive</label>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-slate-300">
                    {isNaN(Number(exchangeAmount)) ? '0.00' : (Number(exchangeAmount) * 1.0842 - 1.5).toFixed(2)}
                  </span>
                  <span className="text-sm font-bold bg-slate-800 px-2.5 py-1 rounded text-slate-300">EUR</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-5 h-11 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-colors">
              Lock This Rate
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-900 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl"> Engineered for modern capital management.</h2>
          <p className="text-slate-400 text-sm sm:text-base">Everything you need to control, scale, and secure your company balances globally.</p>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Box 1: Large Feature (Dashboard UI Component Preview) */}
          <div className="md:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/20 p-6 flex flex-col justify-between overflow-hidden relative group hover:border-slate-800 transition-all">
            <div className="space-y-2 max-w-md">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-sm font-bold">📊</div>
              <h3 className="text-lg font-semibold text-white">Advanced Navigation Analytics</h3>
              <p className="text-sm text-slate-400">Track balance velocity, ongoing asset allocations, and instant dynamic position changes from a unified window.</p>
            </div>
            {/* Simulated mini dashboard layout */}
            <div className="mt-8 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-xs font-semibold text-slate-400">Portfolio Overview</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded">+14.2% YoY</span>
              </div>
              <div className="h-24 flex items-end gap-1.5 pt-2">
                <div className="bg-slate-800 w-full h-1/3 rounded-t" />
                <div className="bg-slate-800 w-full h-1/2 rounded-t" />
                <div className="bg-blue-600/80 w-full h-3/4 rounded-t" />
                <div className="bg-emerald-500/80 w-full h-full rounded-t" />
              </div>
            </div>
          </div>

          {/* Box 2: Small Feature */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 flex flex-col justify-between hover:border-slate-800 transition-all">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">🛡️</div>
              <h3 className="text-lg font-semibold text-white">Military-Grade Security</h3>
              <p className="text-sm text-slate-400">Programmable multi-signature controls, hardware-bound isolation keys, and instant token freezing mechanisms.</p>
            </div>
            <div className="pt-6 flex justify-start">
              <span className="text-xs font-mono text-slate-600">AES-256 ENCRYPTED</span>
            </div>
          </div>

          {/* Box 3: Small Feature */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/20 p-6 flex flex-col justify-between hover:border-slate-800 transition-all">
            <div className="space-y-2">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-sm font-bold">💬</div>
              <h3 className="text-lg font-semibold text-white">Contextual Concierge</h3>
              <p className="text-sm text-slate-400">Integrated priority support featuring absolute live route navigation tracking to pinpoint trade anomalies in real-time.</p>
            </div>
            <div className="pt-6">
              <span className="text-xs text-blue-400 font-medium hover:underline cursor-pointer">Learn about routing &rarr;</span>
            </div>
          </div>

          {/* Box 4: Medium/Large Feature */}
          <div className="md:col-span-2 rounded-2xl border border-slate-900 bg-slate-900/20 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-800 transition-all">
            <div className="space-y-2 max-w-sm">
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-sm font-bold">🌍</div>
              <h3 className="text-lg font-semibold text-white">Sovereign Multi-Currency</h3>
              <p className="text-sm text-slate-400">Ditch legacy cross-border delays. Instantly issue dedicated localized routing numbers for USD, EUR, GBP, and SGD global vaults.</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-medium text-slate-300">IBAN</span>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-medium text-slate-300">ACH</span>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-medium text-slate-300">SEPA</span>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-medium text-slate-300">SWIFT</span>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
