import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & mô tả */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">{t("layout.header.title")}</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t("layout.footer.title_description")}
              </p>
              {/* Social icons */}
              <div className="flex gap-3 mt-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
                  <svg width="24" height="24" fill="currentColor"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12"></path></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-500">
                  <svg width="24" height="24" fill="currentColor"><path d="M21.8 8.001a2.75 2.75 0 0 0-1.936-1.946C18.077 6 12 6 12 6s-6.077 0-7.864.055A2.75 2.75 0 0 0 2.2 8.001 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .2 3.999 2.75 2.75 0 0 0 1.936 1.946C5.923 18 12 18 12 18s6.077 0 7.864-.055a2.75 2.75 0 0 0 1.936-1.946A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.2-3.999zM10 15V9l6 3-6 3z"></path></svg>
                </a>
                <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">
                  <svg width="24" height="24" fill="currentColor"><path d="M4 4h16v12H5.17L4 17.17V4zm0-2a2 2 0 0 0-2 2v20l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4z"></path></svg>
                </a>
              </div>
            </div>
            {/* Khám phá */}
            <div>
              <h4 className="font-semibold mb-4">{t("layout.footer.discover")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/search" className="hover:text-white transition-colors">{t("layout.footer.discoverItems.search")}</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">{t("layout.footer.discoverItems.genre")}</Link></li>
                <li><Link to="/search" className="hover:text-white transition-colors">{t("layout.footer.discoverItems.author")}</Link></li>
              </ul>
            </div>
            {/* Tài khoản */}
            <div>
              <h4 className="font-semibold mb-4">{t("layout.footer.account")}</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/login" className="hover:text-white transition-colors">{t("layout.footer.accountItems.login")}</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">{t("layout.footer.accountItems.register")}</Link></li>
                <li><Link to="/membership" className="hover:text-white transition-colors">{t("layout.footer.accountItems.membership")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t("layout.footer.contact")}</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:support@bookapp.vn" className="hover:text-white transition-colors">
                    support@bookapp.vn
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="mailto:contact@bookapp.vn" className="hover:text-white transition-colors">
                    contact@bookapp.vn
                  </a>
                </li>
              </ul>

              <div className="mt-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">{t("layout.footer.bank")}</p>
                <div className="flex items-center gap-2">
                  <div className="h-8 px-3 bg-white rounded flex items-center justify-center text-blue-600 text-xs font-bold border border-slate-200" title="Thanh toán QR tự động">
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M4 4h6v6H4V4zm2 2v2h2V6H6zm10-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6zm10-2h6v6h-6v-6zm2 2v2h2v-2h-2zm-6-8h2v2h-2V6zm0 10h2v2h-2v-2zm-2-2h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                    </svg>
                    QR AUTO
                  </div>
                  <div className="h-8 px-3 bg-white rounded flex items-center justify-center text-blue-800 text-xs font-bold border border-slate-200">
                    BANKING
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>{t("layout.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    )
};

export default Footer;