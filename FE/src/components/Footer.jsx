import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newsletterMsg, setNewsletterMsg] = useState("");

    async function subscribeToNewsletter(email) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email.endsWith("@gmail.com")) resolve({ success: true });
          else reject(new Error(t("layout.footer.newsletter.errorMsg")));
        }, 1000);
      });
    }

    const handleSubscribe = async (event) => {
      event.preventDefault();
      setNewsletterMsg("");
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setNewsletterMsg(t("layout.footer.newsletter.invalidEmail"));
        return;
      }
      setIsSubmitting(true);
      try {
        await subscribeToNewsletter(email);
        setNewsletterMsg(t("layout.footer.newsletter.successMsg"));
        setEmail("");
      } catch (err) {
        setNewsletterMsg(err.message || t("layout.footer.newsletter.errorMsg"));
      } finally {
        setIsSubmitting(false);
      }
    };

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
            {/* Đăng ký nhận tin */}
            <div>
              <h4 className="font-semibold mb-4">{t("layout.footer.newsletter.title")}</h4>
              <form className="flex flex-col gap-2" onSubmit={handleSubscribe}>
                <label htmlFor="newsletter-email" className="text-sm font-medium text-slate-200">{t("layout.footer.newsletter.emailLabel")}</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder={t("layout.footer.newsletter.emailPlaceholder")}
                  className="rounded px-3 py-2 text-white bg-slate-800 placeholder:text-slate-400"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  aria-label={t("layout.footer.newsletter.emailLabel")}
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-2 disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("layout.footer.newsletter.submitting") : t("layout.footer.newsletter.submitBtn")}
                </button>
                {newsletterMsg && (
                  <div className="text-xs mt-1" style={{ color: newsletterMsg.includes("thành công") || newsletterMsg.includes("Successfully") ? '#22c55e' : '#f87171' }}>{newsletterMsg}</div>
                )}
              </form>
              <p className="text-xs text-slate-400 mt-2">{t("layout.footer.newsletter.description")}</p>
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