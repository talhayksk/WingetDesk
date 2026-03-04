import React, { useState, useEffect, useRef } from 'react';

const STATUS_CONFIG = {
    checking: {
        icon: '🔍',
        gradient: 'from-blue-600/20 to-cyan-600/20',
        border: 'border-blue-500/30',
        text: 'Güncelleme kontrol ediliyor...',
        showProgress: false,
    },
    available: {
        icon: '🚀',
        gradient: 'from-emerald-600/20 to-teal-600/20',
        border: 'border-emerald-500/30',
        text: 'Yeni güncelleme mevcut!',
        showProgress: false,
    },
    downloading: {
        icon: '⬇️',
        gradient: 'from-purple-600/20 to-indigo-600/20',
        border: 'border-purple-500/30',
        text: 'Güncelleme indiriliyor...',
        showProgress: true,
    },
    downloaded: {
        icon: '✅',
        gradient: 'from-green-600/20 to-emerald-600/20',
        border: 'border-green-500/30',
        text: 'Güncelleme indirildi! Yeniden başlatın.',
        showProgress: false,
    },
    error: {
        icon: '⚠️',
        gradient: 'from-red-600/20 to-orange-600/20',
        border: 'border-red-500/30',
        text: 'Güncelleme hatası',
        showProgress: false,
    },
    'not-available': {
        icon: '👍',
        gradient: 'from-gray-600/20 to-slate-600/20',
        border: 'border-gray-500/30',
        text: 'Uygulama güncel!',
        showProgress: false,
    },
};

export default function AppUpdateBanner() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(null);
    const [updateData, setUpdateData] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [appVersion, setAppVersion] = useState('');
    const [dismissed, setDismissed] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (window.api?.getAppVersion) {
            window.api.getAppVersion().then(v => setAppVersion(v));
        }

        if (window.api?.onUpdateStatus) {
            const cleanup = window.api.onUpdateStatus(({ status, data }) => {
                setUpdateStatus(status);
                setUpdateData(data);
                setDismissed(false);

                if (status === 'downloading' && data) {
                    setDownloadProgress(Math.round(data.percent || 0));
                }

                if (status === 'not-available') {
                    setTimeout(() => setDismissed(true), 4000);
                }
            });
            return cleanup;
        }
    }, []);

    // Menü dışına tıklanınca kapat
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCheckUpdate = async () => {
        setMenuOpen(false);
        if (window.api?.checkForAppUpdates) {
            setUpdateStatus('checking');
            setDismissed(false);
            await window.api.checkForAppUpdates();
        }
    };

    const handleDownload = async () => {
        if (window.api?.downloadAppUpdate) {
            await window.api.downloadAppUpdate();
        }
    };

    const handleInstall = () => {
        if (window.api?.installAppUpdate) {
            window.api.installAppUpdate();
        }
    };

    const openGitHub = () => {
        setMenuOpen(false);
        if (window.api?.openExternal) {
            window.api.openExternal('https://github.com/talhayksk/entropic-pathfinder');
        }
    };

    const openHelp = () => {
        setMenuOpen(false);
        if (window.api?.openExternal) {
            window.api.openExternal('https://github.com/talhayksk/entropic-pathfinder/issues');
        }
    };

    const config = updateStatus ? STATUS_CONFIG[updateStatus] : null;
    const showBanner = config && !dismissed;
    const hasUpdateBadge = updateStatus === 'available' || updateStatus === 'downloaded';

    return (
        <>
            {/* ── Sağ üst köşe dropdown menü ── */}
            <div className="fixed top-1 right-3 z-50 no-drag" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/60 transition-all duration-200"
                    title="Menü"
                >
                    {/* Hamburger / 3 dot icon */}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                    {/* Update badge */}
                    {hasUpdateBadge && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse border-2 border-gray-900" />
                    )}
                </button>

                {/* Dropdown */}
                {menuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-700/60 rounded-xl shadow-2xl shadow-black/40 overflow-hidden animate-slideDown">
                        {/* Versiyon bilgisi */}
                        {appVersion && (
                            <div className="px-4 py-2.5 border-b border-gray-700/40">
                                <p className="text-xs text-gray-500">Winget Manager</p>
                                <p className="text-xs text-gray-400 font-mono">v{appVersion}</p>
                            </div>
                        )}

                        {/* Menü öğeleri */}
                        <div className="py-1">
                            {/* Güncelleme Kontrol Et */}
                            <button
                                onClick={handleCheckUpdate}
                                disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg
                                    className={`w-4 h-4 text-blue-400 ${updateStatus === 'checking' ? 'animate-spin' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Güncelleme Kontrol Et
                                {hasUpdateBadge && (
                                    <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />
                                )}
                            </button>

                            {/* GitHub Repo */}
                            <button
                                onClick={openGitHub}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub Repo
                                <svg className="w-3 h-3 ml-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>

                            <div className="border-t border-gray-700/40 my-1" />

                            {/* Yardım */}
                            <button
                                onClick={openHelp}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                            >
                                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                                Yardım
                                <svg className="w-3 h-3 ml-auto text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Güncelleme Banner (sayfanın üstünde) ── */}
            {showBanner && (
                <div
                    className={`w-full max-w-2xl mx-auto bg-gradient-to-r ${config.gradient} backdrop-blur-md border ${config.border} rounded-xl px-5 py-3 mb-4 transition-all duration-500 animate-slideDown`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">{config.icon}</span>
                            <div>
                                <p className="text-sm font-medium text-white">{config.text}</p>
                                {updateStatus === 'available' && updateData?.version && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        v{appVersion} → v{updateData.version}
                                    </p>
                                )}
                                {updateStatus === 'error' && updateData && (
                                    <p className="text-xs text-red-300 mt-0.5 max-w-[300px] truncate">
                                        {typeof updateData === 'string' ? updateData : 'Bağlantı hatası'}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {updateStatus === 'available' && (
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/30"
                                >
                                    İndir & Güncelle
                                </button>
                            )}
                            {updateStatus === 'downloaded' && (
                                <button
                                    onClick={handleInstall}
                                    className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-green-900/30 animate-pulse"
                                >
                                    Yeniden Başlat
                                </button>
                            )}
                            {(updateStatus !== 'downloading' && updateStatus !== 'checking') && (
                                <button
                                    onClick={() => setDismissed(true)}
                                    className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {config.showProgress && (
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400">İndiriliyor...</span>
                                <span className="text-xs text-purple-300 font-mono">{downloadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${downloadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
