
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-transparent pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Separator line to mark the beginning of the footer */}
        <div className="w-full h-[1px] bg-slate-200/60 mb-16"></div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <h1 className="text-2xl font-black text-[#1a1b3a] tracking-tight font-rounded">ScholarsAlger</h1>
            </div>
            {/* Description removed as per requested edit */}
          </div>

          {/* Links Columns */}
          <div className="md:col-span-6 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest font-rounded">Resources</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest font-rounded">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © {new Date().getFullYear()} ScholarsAlger. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


