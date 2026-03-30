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
                <li><a href="#" className="theme-link">Help Center</a></li>
                <li><a href="#" className="theme-link">Documentation</a></li>
                <li><a href="#" className="theme-link">Contact Us</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="theme-heading type-label">Legal</h4>
              <ul className="theme-text-muted space-y-4 text-sm font-medium">
                <li><a href="#" className="theme-link">Terms of Service</a></li>
                <li><a href="#" className="theme-link">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-[color:rgba(192,184,122,0.55)] pt-8 md:flex-row">
          <p className="theme-text-muted type-label">
            &copy; {new Date().getFullYear()} ScholarsAlger. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="theme-text-muted theme-link">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>
            <a href="#" className="theme-text-muted theme-link">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
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
