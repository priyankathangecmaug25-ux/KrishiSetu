import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle = ({ className = "" }) => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-slate-700 px-3 py-2 rounded-xl transition-all hover:bg-white/20 active:scale-95 ${className}`}
            title="Change Language"
        >
            <Globe size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">
                {i18n.language === 'en' ? 'HI' : 'EN'}
            </span>
        </button>
    );
};

export default LanguageToggle;
