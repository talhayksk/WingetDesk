import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const { i18n } = useTranslation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Kapanma olayını dinle
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('appLanguage', lng);
        setMenuOpen(false);
    };

    const currentLang = i18n.language || 'en';

    return (
        <div className="fixed top-1.5 left-14 z-50 no-drag" ref={menuRef}>
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="relative px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700/60 transition-all duration-200 border border-gray-700/50 bg-gray-800/40 backdrop-blur-sm"
                title="Change Language"
            >
                {currentLang.toUpperCase()}
            </button>

            {menuOpen && (
                <div className="absolute left-0 top-full mt-1 w-32 bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-slideDown">
                    <div className="py-1">
                        <button
                            onClick={() => changeLanguage('tr')}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700/50 transition-colors flex items-center justify-between ${currentLang === 'tr' ? 'text-blue-400 font-medium' : 'text-gray-300'}`}
                        >
                            Türkçe {currentLang === 'tr' && '✓'}
                        </button>
                        <button
                            onClick={() => changeLanguage('en')}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700/50 transition-colors flex items-center justify-between ${currentLang === 'en' ? 'text-blue-400 font-medium' : 'text-gray-300'}`}
                        >
                            English {currentLang === 'en' && '✓'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
