import React, { useState, useEffect } from 'react';
import { AppSettings, OPENROUTER_FREE_MODELS } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: AppSettings) => void;
    currentSettings: AppSettings;
}

const CUSTOM_MODEL_SENTINEL = '__custom__';

const isModelInList = (modelId: string) =>
    OPENROUTER_FREE_MODELS.some(m => m.id === modelId);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
    const [localSettings, setLocalSettings] = useState<AppSettings>(currentSettings);
    const [showKey, setShowKey] = useState(false);
    const [saved, setSaved] = useState(false);
    // Se o modelo salvo não está na lista predefinida, começa em modo custom
    const [isCustomModel, setIsCustomModel] = useState(
        () => !isModelInList(currentSettings.openrouterModel)
    );

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(currentSettings);
            setSaved(false);
            setIsCustomModel(!isModelInList(currentSettings.openrouterModel));
        }
    }, [isOpen, currentSettings]);

    const handleSave = () => {
        onSave(localSettings);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 900);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl w-full max-w-lg p-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700 bg-gradient-to-r from-dark-900 to-dark-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-suno-600 to-purple-600 flex items-center justify-center shadow">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Configurações de IA</h2>
                            <p className="text-xs text-gray-500">Escolha o provedor e configure sua chave</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-dark-700"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-6">

                    {/* Provider Toggle */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                            Provedor de IA
                        </label>
                        <div className="bg-dark-900 p-1 rounded-xl border border-dark-700 flex gap-1">
                            <button
                                type="button"
                                onClick={() => setLocalSettings(prev => ({ ...prev, provider: 'gemini' }))}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${localSettings.provider === 'gemini'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                                    }`}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93V18a1 1 0 00-2 0v1.93A8.001 8.001 0 014.07 13H6a1 1 0 000-2H4.07A8.001 8.001 0 0111 4.07V6a1 1 0 002 0V4.07A8.001 8.001 0 0119.93 11H18a1 1 0 000 2h1.93A8.001 8.001 0 0113 19.93z" />
                                </svg>
                                Google Gemini
                            </button>
                            <button
                                type="button"
                                onClick={() => setLocalSettings(prev => ({ ...prev, provider: 'openrouter' }))}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${localSettings.provider === 'openrouter'
                                    ? 'bg-gradient-to-r from-suno-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                OpenRouter
                            </button>
                        </div>
                    </div>

                    {/* Gemini info */}
                    {localSettings.provider === 'gemini' && (
                        <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-sm text-blue-300">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Usando Google Gemini 2.5 Flash via variável de ambiente <code className="bg-blue-900/50 px-1 rounded text-xs">API_KEY</code>. Nenhuma configuração adicional necessária.</span>
                            </div>
                        </div>
                    )}

                    {/* OpenRouter fields */}
                    {localSettings.provider === 'openrouter' && (
                        <div className="space-y-4">
                            {/* API Key */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Chave da API (OpenRouter)
                                    </label>
                                    <a
                                        href="https://openrouter.ai/keys"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-suno-400 hover:text-suno-300 transition-colors flex items-center gap-1"
                                    >
                                        Obter chave grátis
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showKey ? 'text' : 'password'}
                                        value={localSettings.openrouterApiKey}
                                        onChange={(e) => setLocalSettings(prev => ({ ...prev, openrouterApiKey: e.target.value }))}
                                        placeholder="sk-or-v1-..."
                                        className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-suno-500 focus:border-transparent outline-none transition-all pr-12 font-mono text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowKey(!showKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showKey ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Model Selector */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Modelo
                                    </label>
                                    <a
                                        href="https://openrouter.ai/models?order=top-weekly&supported_parameters=free"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-suno-400 hover:text-suno-300 transition-colors flex items-center gap-1"
                                    >
                                        Ver todos os modelos free
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>

                                {/* Dropdown */}
                                <select
                                    value={isCustomModel ? CUSTOM_MODEL_SENTINEL : localSettings.openrouterModel}
                                    onChange={(e) => {
                                        if (e.target.value === CUSTOM_MODEL_SENTINEL) {
                                            setIsCustomModel(true);
                                            setLocalSettings(prev => ({ ...prev, openrouterModel: '' }));
                                        } else {
                                            setIsCustomModel(false);
                                            setLocalSettings(prev => ({ ...prev, openrouterModel: e.target.value }));
                                        }
                                    }}
                                    className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-suno-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer text-sm"
                                >
                                    {OPENROUTER_FREE_MODELS.map(m => (
                                        <option key={m.id} value={m.id}>{m.label}</option>
                                    ))}
                                    <option value={CUSTOM_MODEL_SENTINEL}>✏️ Digitar ID do modelo manualmente...</option>
                                </select>

                                {/* Custom model input */}
                                {isCustomModel && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={localSettings.openrouterModel}
                                            onChange={(e) => setLocalSettings(prev => ({ ...prev, openrouterModel: e.target.value }))}
                                            placeholder="ex: z-ai/glm-4.5-air:free"
                                            autoFocus
                                            className="w-full bg-dark-900 border border-suno-600 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-suno-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1.5">
                                            Cole o Model ID do{' '}
                                            <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-suno-400 hover:underline">openrouter.ai/models</a>
                                            {' '}— ex: <span className="font-mono text-gray-400">z-ai/glm-4.5-air:free</span>
                                        </p>
                                    </div>
                                )}

                                {!isCustomModel && (
                                    <p className="text-xs text-gray-600 mt-1.5">
                                        💡 modelos com <strong>:free</strong> = sem custo. Qualidade pode variar.
                                    </p>
                                )}
                            </div>

                            {/* Info tip */}
                            <div className="bg-suno-900/20 border border-suno-800/40 rounded-xl p-3 text-xs text-suno-300 flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Sua chave é salva apenas no navegador (localStorage) e nunca enviada para terceiros além do OpenRouter.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-dark-700 bg-dark-900/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saved}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${saved
                            ? 'bg-green-600 text-white'
                            : 'bg-gradient-to-r from-suno-600 to-purple-600 text-white hover:shadow-lg hover:shadow-suno-500/20 hover:scale-[1.02]'
                            }`}
                    >
                        {saved ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Salvo!
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Salvar Configurações
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
