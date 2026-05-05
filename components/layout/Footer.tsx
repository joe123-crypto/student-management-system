import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-transparent px-6 pb-12 pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 h-[1px] w-full bg-[color:rgba(192,184,122,0.6)]"></div>

        <div className="mb-20 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          <div className="space-y-6 md:col-span-6">
            <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--theme-primary)] shadow-lg shadow-[rgba(0,95,2,0.18)]">
              <span className="text-xl font-bold text-white">S</span>
            </div>
              <h1 className="theme-heading type-brand text-2xl">ScholarsAlger</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:col-span-6">
            <div className="space-y-6">
              <h4 className="theme-heading type-label">Resources</h4>
              <ul className="theme-text-muted space-y-4 text-sm font-medium">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="theme-heading type-label">Legal</h4>
              <ul className="theme-text-muted space-y-4 text-sm font-medium">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-[color:rgba(192,184,122,0.55)] pt-8 md:flex-row">
          <p className="theme-text-muted type-label">
            &copy; {new Date().getFullYear()} ScholarsAlger. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
