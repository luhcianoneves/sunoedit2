import React, { useState, useEffect } from 'react';
import { generateSongs } from './services/geminiService';
import { generateSongsOpenRouter } from './services/openrouterService';
import { Song, GeneratorFormData, AppSettings, DEFAULT_SETTINGS, AppMode, SeriesPreset, AlbumPlan, SyncSettings, DEFAULT_SYNC_SETTINGS } from './types';
import SongCard from './components/SongCard';
import LoadingState from './components/LoadingState';
import RhythmLibrary from './components/RhythmLibrary';
import SettingsModal from './components/SettingsModal';
import ModeToggle from './components/ModeToggle';
import AlbumPlannerView from './components/AlbumPlannerView';
import { exportQuickPDF } from './services/pdfExportService';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_SERIES_PRESETS } from './data/seriesPresets';

// --- CONFIGURAÇÃO DA SENHA ---
// Altere o valor abaixo para mudar a senha de acesso
const APP_PASSWORD = "123";

const SETTINGS_STORAGE_KEY = 'suno_architect_settings';
const SERIES_PRESETS_STORAGE_KEY = 'suno_architect_series_presets';
const ALBUM_PLANS_STORAGE_KEY = 'suno_architect_album_plans';
const SYNC_SETTINGS_STORAGE_KEY = 'suno_architect_sync_settings';

const App: React.FC = () => {
  // Estado de Autenticação
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // Modo do App: Rápido (fluxo original) vs Planejador de Álbum
  const [appMode, setAppMode] = useState<AppMode>('quick');
  const [seriesPresets, setSeriesPresets] = useLocalStorage<SeriesPreset[]>(SERIES_PRESETS_STORAGE_KEY, DEFAULT_SERIES_PRESETS);
  const [albumPlans, setAlbumPlans] = useLocalStorage<AlbumPlan[]>(ALBUM_PLANS_STORAGE_KEY, []);
  const [syncSettings, setSyncSettings] = useLocalStorage<SyncSettings>(SYNC_SETTINGS_STORAGE_KEY, DEFAULT_SYNC_SETTINGS);

  // Estados do App Principal
  const [formData, setFormData] = useState<GeneratorFormData>({
    topic: '',
    rhythm: '',
    mode: 'full', // Default: Completo
    quantity: 10 // Default: Álbum
  });

  const [songs, setSongs] = useState<Song[]>([]);
  const [albumCovers, setAlbumCovers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado do Modal da Biblioteca
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  // Estado de Configurações
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  // --- LÓGICA DE LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // --- LÓGICA DO PDF ---
  const handleExportPDF = () => exportQuickPDF(formData, songs);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModeChange = (mode: 'full' | 'instrumental') => {
    setFormData(prev => ({ ...prev, mode }));
  };

  const handleQuantityChange = (quantity: 1 | 10) => {
    setFormData(prev => ({ ...prev, quantity }));
  };

  const handleRhythmSelect = (selectedRhythm: string) => {
    setFormData(prev => ({ ...prev, rhythm: selectedRhythm }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setSongs([]);
    setAlbumCovers([]);

    try {
      let response;
      if (settings.provider === 'openrouter') {
        response = await generateSongsOpenRouter(
          formData.topic,
          formData.rhythm,
          formData.mode,
          formData.quantity,
          settings.openrouterApiKey,
          settings.openrouterModel
        );
      } else {
        response = await generateSongs(formData.topic, formData.rhythm, formData.mode, formData.quantity);
      }

      if (response && response.songs) {
        setSongs(response.songs);
        if (response.albumCovers) {
          setAlbumCovers(response.albumCovers);
        }
      } else {
        setError('O formato da resposta foi inválido. Tente novamente.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro ao gerar as músicas. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // RENDERIZAÇÃO CONDICIONAL: TELA DE LOGIN OU APP
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-dark-800 rounded-xl shadow-2xl p-8 border border-dark-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-suno-400 to-purple-500 mb-2">
              Acesso Restrito
            </h1>
            <p className="text-gray-400">Suno Architect</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-suno-500 focus:border-transparent outline-none transition-all"
                placeholder="Digite a senha..."
              />
              {authError && (
                <p className="text-red-400 text-sm mt-2">Senha incorreta.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-suno-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-suno-500/25 transition-all"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // APP PRINCIPAL
  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 pb-20 font-sans">
      <RhythmLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectRhythm={handleRhythmSelect}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />

      {/* Hero / Header Section */}
      <header className="bg-gradient-to-b from-dark-800 to-dark-900 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="relative text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-suno-400 via-purple-500 to-indigo-500 mb-3">
              Suno Architect
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Produção musical profissional com IA. Crie letras, prompts de estilo e instrumentais otimizados.
            </p>
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <ModeToggle mode={appMode} onChange={setAppMode} />
            </div>

            {/* Settings Button + Provider Badge */}
            <div className="absolute top-0 right-0 flex items-center gap-2">
              {/* Provider indicator */}
              <span className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${settings.provider === 'openrouter'
                  ? 'bg-suno-900/40 border-suno-700 text-suno-400'
                  : 'bg-blue-900/40 border-blue-700 text-blue-400'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {settings.provider === 'openrouter' ? 'OpenRouter' : 'Gemini'}
              </span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="Configurações de IA"
                className="p-2.5 rounded-xl bg-dark-800 border border-dark-700 text-gray-400 hover:text-white hover:border-suno-600 hover:bg-dark-700 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
      {appMode === 'quick' && (
        <>
        {/* Input Card */}
        <div className="bg-dark-800 rounded-2xl shadow-2xl shadow-black/50 border border-dark-700 p-6 md:p-8 mb-12 relative z-10 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Mode & Quantity Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mode Selection */}
              <div className="bg-dark-900 p-1 rounded-lg border border-dark-700 flex">
                <button
                  type="button"
                  onClick={() => handleModeChange('full')}
                  className={`flex-1 py-2 px-2 rounded-md text-sm font-bold transition-all ${formData.mode === 'full'
                      ? 'bg-suno-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                    }`}
                >
                  Canção Completa
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('instrumental')}
                  className={`flex-1 py-2 px-2 rounded-md text-sm font-bold transition-all ${formData.mode === 'instrumental'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                    }`}
                >
                  Instrumental
                </button>
              </div>

              {/* Quantity Selection */}
              <div className="bg-dark-900 p-1 rounded-lg border border-dark-700 flex">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className={`flex-1 py-2 px-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.quantity === 1
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                    }`}
                >
                  <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded">1</span> Single
                </button>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(10)}
                  className={`flex-1 py-2 px-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.quantity === 10
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                    }`}
                >
                  <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded">10</span> Álbum
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">

              {/* Topic Input */}
              <div className="space-y-2">
                <label htmlFor="topic" className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                  1. Sobre o que é a música? (Vibe ou Tema)
                </label>
                <textarea
                  id="topic"
                  name="topic"
                  rows={2}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-suno-500 focus:border-transparent transition duration-200 resize-none text-lg"
                  placeholder="Ex: Uma viagem noturna de carro pensando em um amor antigo..."
                  value={formData.topic}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Rhythm Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="rhythm" className="block text-sm font-bold text-gray-300 uppercase tracking-wide">
                    2. Qual o Ritmo / Estilo?
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="text-xs flex items-center gap-1 text-suno-400 hover:text-suno-300 transition-colors font-bold uppercase tracking-wider bg-dark-900 px-3 py-1 rounded-full border border-dark-600 hover:border-suno-500"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Biblioteca de Ritmos
                  </button>
                </div>
                <input
                  type="text"
                  id="rhythm"
                  name="rhythm"
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 text-lg"
                  placeholder="Ex: Synthwave Anos 80, Vocal Feminino, 120bpm"
                  value={formData.rhythm}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !formData.topic || !formData.rhythm}
                className={`
                  w-full py-5 rounded-xl font-bold text-xl shadow-lg transform transition-all duration-200 flex items-center justify-center space-x-2
                  ${isLoading || !formData.topic || !formData.rhythm
                    ? 'bg-dark-700 text-gray-500 cursor-not-allowed border border-dark-600'
                    : 'bg-gradient-to-r from-suno-600 to-purple-700 text-white hover:scale-[1.01] hover:shadow-suno-500/25 border border-suno-500/50'}
                `}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{formData.mode === 'full' ? 'Compondo Músicas...' : 'Criando Instrumentais...'}</span>
                  </>
                ) : (
                  <>
                    <span>Gerar {formData.quantity} {formData.mode === 'full' ? 'Músicas' : 'Instrumentais'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Output Section */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-300 px-6 py-4 rounded-lg mb-8 text-center max-w-4xl mx-auto">
            {error}
          </div>
        )}

        {isLoading && <LoadingState />}

        {!isLoading && songs.length > 0 && (
          <div className="animate-fade-in-up pb-12">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-suno-600 w-2 h-8 rounded-full"></span>
                Resultados Prontos ({songs.length})
              </h2>

              {/* Botão Exportar PDF */}
              <button
                onClick={handleExportPDF}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Baixar Roteiro em PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {songs.map((song, index) => (
                <SongCard key={index} song={song} index={index} albumTitle={formData.topic} />
              ))}
            </div>
          </div>
        )}

        {/* Seção de Capas de Álbum */}
        {!isLoading && albumCovers.length > 0 && (
          <div className="animate-fade-in-up mt-16 pb-12">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="bg-purple-600 w-2 h-8 rounded-full"></span>
                Modelos de Capa de Álbum (Formato 1:1)
              </h2>
              <p className="text-gray-400 text-sm">Otimizados para Midjourney, DALL-E e Leonardo AI</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {albumCovers.map((coverPrompt, idx) => (
                <div key={idx} className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/10 transition-all duration-300 flex flex-col h-full group">
                  {/* Mockup da Capa */}
                  <div className="aspect-square bg-gradient-to-br from-dark-900 via-purple-900/20 to-indigo-900/30 flex items-center justify-center p-6 border-b border-dark-700 relative">
                    <svg className="w-16 h-16 text-purple-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-[10px] font-bold text-purple-400 px-2 py-1 rounded">OPÇÃO 0{idx + 1}</div>
                  </div>
                  {/* Texto do Prompt */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="bg-dark-900 rounded-lg p-3 border border-dark-700/50 text-xs font-mono text-gray-300 leading-relaxed max-h-40 overflow-y-auto scrollbar-thin">
                      {coverPrompt}
                    </div>
                    
                    {/* Botão Copiar */}
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(coverPrompt);
                          const btn = document.getElementById(`btn-cover-${idx}`);
                          if (btn) {
                            btn.innerText = 'Prompt Copiado!';
                            btn.classList.add('bg-green-600');
                            btn.classList.remove('bg-purple-600', 'hover:bg-purple-500');
                            setTimeout(() => {
                              btn.innerText = 'Copiar Prompt';
                              btn.classList.remove('bg-green-600');
                              btn.classList.add('bg-purple-600', 'hover:bg-purple-500');
                            }, 2000);
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      id={`btn-cover-${idx}`}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      Copiar Prompt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && songs.length === 0 && !error && (
          <div className="text-center py-12 opacity-40">
            <div className="inline-block p-6 rounded-full bg-dark-800 mb-4">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
            <p className="text-lg font-medium text-gray-400">Aguardando sua inspiração...</p>
          </div>
        )}
        </>
      )}

      {appMode === 'planner' && (
        <AlbumPlannerView
          seriesPresets={seriesPresets}
          setSeriesPresets={setSeriesPresets}
          albumPlans={albumPlans}
          setAlbumPlans={setAlbumPlans}
          settings={settings}
          syncSettings={syncSettings}
          setSyncSettings={setSyncSettings}
        />
      )}
      </main>
    </div>
  );
};

export default App;
