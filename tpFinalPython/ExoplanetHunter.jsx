import React, { useState, useCallback } from 'react';

/**
 * Technical explanation of Kepler Object of Interest (KOI) parameters.
 */
const PARAMETER_METADATA = {
  koi_fpflag_nt: {
    label: 'Falso Positivo: No-Transitorio (NT Flag)',
    description: 'Indica si la curva de luz no muestra un patrón típico de tránsito planetario.',
    unit: 'binario',
  },
  koi_fpflag_ss: {
    label: 'Falso Positivo: Co-Tránsito Estelar (SS Flag)',
    description: 'Indica si el tránsito es consistente con una estrella binaria eclipsante o una estrella de fondo.',
    unit: 'binario',
  },
  koi_fpflag_co: {
    label: 'Falso Positivo: Desplazamiento del Centroide (CO Flag)',
    description: 'Indica si la ubicación de la fuente de luz se desplaza significativamente durante el tránsito.',
    unit: 'binario',
  },
  koi_slogg: {
    label: 'Gravedad de la Superficie Estelar (log(g))',
    description: 'El logaritmo en base 10 de la aceleración gravitacional en la superficie de la estrella hospedadora.',
    unit: 'log10(cm/s²)',
  },
  koi_srad: {
    label: 'Radio Estelar (R_sun)',
    description: 'El radio de la estrella hospedadora medido en múltiplos del radio solar.',
    unit: 'R☉',
  },
  ra: {
    label: 'Ascensión Recta (RA)',
    description: 'La coordenada de longitud celeste del objeto en el cielo.',
    unit: 'grados',
  },
  dec: {
    label: 'Declinación (DEC)',
    description: 'La coordenada de latitud celeste del objeto en el cielo.',
    unit: 'grados',
  },
  koi_kepmag: {
    label: 'Magnitud de Brillo Kepler (Kepmag)',
    description: 'Magnitud de brillo aparente de la estrella medida por el telescopio espacial Kepler.',
    unit: 'mag',
  },
};

/**
 * Preset data for testing purposes.
 * Includes a clean planet candidate and a clear false positive signature.
 */
const PRESETS = {
  CONFIRMED_PRESET: {
    koi_fpflag_nt: 0,
    koi_fpflag_ss: 0,
    koi_fpflag_co: 0,
    koi_slogg: 4.41,
    koi_srad: 1.05,
    ra: 291.95,
    dec: 48.12,
    koi_kepmag: 15.34,
  },
  FALSE_POSITIVE_PRESET: {
    koi_fpflag_nt: 1,
    koi_fpflag_ss: 0,
    koi_fpflag_co: 1,
    koi_slogg: 4.22,
    koi_srad: 1.54,
    ra: 292.12,
    dec: 43.85,
    koi_kepmag: 12.15,
  },
};

/**
 * Component: ParameterInputField
 * Renders a specialized stellar numeric parameter input with labels and units.
 */
export const ParameterInputField = React.memo(({ 
  id, 
  value, 
  onChange, 
  step = '0.01',
  min = '0',
  max,
}) => {
  const metadata = PARAMETER_METADATA[id];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {metadata.label}
        </label>
        {metadata.unit !== 'binario' && (
          <span className="text-[10px] font-mono text-amber-500/80 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">
            {metadata.unit}
          </span>
        )}
      </div>
      <input
        type="number"
        id={id}
        name={id}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-900/90 border border-slate-700/60 rounded px-3 py-2 text-sm text-slate-100 font-mono focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 focus:outline-none transition-colors duration-200"
      />
      <p className="text-[11px] text-slate-400/80 leading-relaxed font-sans">
        {metadata.description}
      </p>
    </div>
  );
});

ParameterInputField.displayName = 'ParameterInputField';

/**
 * Component: FlagSelector
 * Renders binary flag selectors for exoplanet false-positive classifications.
 */
export const FlagSelector = React.memo(({ 
  id, 
  value, 
  onChange 
}) => {
  const metadata = PARAMETER_METADATA[id];
  return (
    <div className="flex flex-col gap-1.5 p-3 rounded bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/50 transition-all duration-200">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {metadata.label}
        </label>
        <span className="text-[10px] font-mono text-amber-500/80 bg-amber-950/20 px-1.5 py-0.5 rounded border border-amber-900/30">
          {metadata.unit}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(id, 0)}
          className={`flex-1 text-xs font-mono py-1.5 rounded border transition-all duration-200 ${
            value === 0
              ? 'bg-slate-800 text-slate-100 border-slate-600 shadow-inner font-bold'
              : 'bg-slate-950/50 text-slate-500 border-slate-900 hover:border-slate-800 hover:text-slate-400'
          }`}
        >
          0 (Negativo)
        </button>
        <button
          type="button"
          onClick={() => onChange(id, 1)}
          className={`flex-1 text-xs font-mono py-1.5 rounded border transition-all duration-200 ${
            value === 1
              ? 'bg-amber-950/30 text-amber-300 border-amber-800/60 shadow-inner font-bold'
              : 'bg-slate-950/50 text-slate-500 border-slate-900 hover:border-slate-800 hover:text-slate-400'
          }`}
        >
          1 (Positivo)
        </button>
      </div>
      <p className="text-[11px] text-slate-400/80 leading-relaxed mt-1">
        {metadata.description}
      </p>
    </div>
  );
});

FlagSelector.displayName = 'FlagSelector';

/**
 * Component: PredictionLoader
 * SVG/CSS Loader that simulates slow orbital mechanics (transit dynamics)
 */
export const PredictionLoader = () => (
  <div className="flex flex-col items-center justify-center py-12 gap-6 transition-all duration-300">
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Central Star */}
      <div className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.4)] animate-pulse" />
      
      {/* Orbital Path 1 */}
      <div className="absolute w-20 h-20 rounded-full border border-slate-800" />
      
      {/* Orbiting Exoplanet (Slow rotation simulation) */}
      <div className="absolute w-full h-full animate-[spin_6s_linear_infinite]">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
      </div>

      {/* Transit line simulation */}
      <div className="absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
    </div>
    
    <div className="text-center">
      <span className="text-xs uppercase tracking-widest text-amber-500/90 font-mono">
        Procesando Muestra Estelar
      </span>
      <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">
        Ejecutando Modelos de Machine Learning
      </p>
    </div>
  </div>
);

PredictionLoader.displayName = 'PredictionLoader';

/**
 * Component: ExoplanetResultCard
 * Displays the analytical result of the exoplanet prediction.
 */
export const ExoplanetResultCard = React.memo(({ prediction, rawData }) => {
  if (!prediction) return null;

  const isConfirmed = prediction.includes('CONFIRMADO');

  return (
    <div className={`mt-8 p-6 rounded border transition-all duration-500 ease-in-out ${
      isConfirmed
        ? 'bg-emerald-950/20 border-emerald-900/60 shadow-[0_4px_30px_rgba(16,185,129,0.05)]'
        : 'bg-slate-900/40 border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.2)]'
    }`}>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              Clasificacion de Objeto de Interes
            </span>
            <h3 className={`text-xl font-bold uppercase tracking-wide mt-1 ${
              isConfirmed ? 'text-emerald-400' : 'text-slate-400'
            }`}>
              {prediction}
            </h3>
          </div>
          <div className={`w-3.5 h-3.5 rounded-full ${
            isConfirmed 
              ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' 
              : 'bg-slate-600 shadow-[0_0_8px_rgba(100,116,139,0.4)]'
          }`} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono mt-2">
          <div className="bg-slate-950/40 p-3 rounded border border-slate-900">
            <span className="text-slate-500 block mb-1">Brillo (Kepmag)</span>
            <span className="text-sm font-semibold text-slate-200">
              {rawData.koi_kepmag.toFixed(2)} mag
            </span>
          </div>

          <div className="bg-slate-950/40 p-3 rounded border border-slate-900">
            <span className="text-slate-500 block mb-1">Falsos Positivos</span>
            <span className="text-sm font-semibold text-slate-200">
              {rawData.koi_fpflag_nt + rawData.koi_fpflag_ss + rawData.koi_fpflag_co > 0 
                ? 'Anomalias Detectadas' 
                : 'Firma Limpia'}
            </span>
          </div>

          <div className="bg-slate-950/40 p-3 rounded border border-slate-900">
            <span className="text-slate-500 block mb-1">Gravedad / Radio</span>
            <span className="text-sm font-semibold text-slate-200">
              {rawData.koi_slogg.toFixed(2)} g / {rawData.koi_srad.toFixed(2)} R☉
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 leading-relaxed mt-2 pt-2 border-t border-slate-800/40">
          La prediccion se calcula escalando las caracteristicas de la muestra estelar con respecto a la poblacion del telescopio espacial Kepler y procesando los coeficientes del modelo clasificador entrenado.
        </div>
      </div>
    </div>
  );
});

ExoplanetResultCard.displayName = 'ExoplanetResultCard';

/**
 * Main Application Component: ExoplanetHunter
 * Scientific exoplanet classification dashboard.
 */
export const ExoplanetHunter = () => {
  const [formData, setFormData] = useState({
    koi_fpflag_nt: 0,
    koi_fpflag_ss: 0,
    koi_fpflag_co: 0,
    koi_slogg: 4.4,
    koi_srad: 1.0,
    ra: 291.9,
    dec: 48.1,
    koi_kepmag: 15.3,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedCandidate, setLoadedCandidate] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  }, []);

  const handleFlagChange = useCallback((id, val) => {
    setFormData((prev) => ({
      ...prev,
      [id]: val,
    }));
  }, []);

  const loadPreset = useCallback((presetName) => {
    setFormData(PRESETS[presetName]);
    setPrediction(null);
    setError(null);
  }, []);

  const fetchAndFillCandidate = async (url) => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.detail || 'Error al obtener candidato.');
      }
      const candidate = await response.json();
      setFormData(candidate.features);
      setLoadedCandidate(candidate);
    } catch (err) {
      setError(err.message || 'Error de conexión con el catálogo Kepler.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    fetchAndFillCandidate(`http://127.0.0.1:8000/candidato/${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/predecir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al procesar la predicción en el servidor.');
      }

      const data = await response.json();
      setPrediction(data.prediccion);
    } catch (err) {
      setError('Error de conexión con el servidor analítico. Verifique la API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-[#070b13] to-[#03060a] text-slate-100 flex flex-col items-center justify-start p-4 md:p-8 font-sans selection:bg-amber-500/30 selection:text-slate-100">
      
      {/* Background Starfield Grid Pattern Simulation */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c1322_1px,transparent_1px),linear-gradient(to_bottom,#0c1322_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <main className="relative z-10 w-full max-w-4xl flex flex-col gap-8">
        
        {/* Institutional Header */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500/80">
              Kepler Database Analysis Tool
            </span>
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-100 mt-1">
              Cazador Automatico de Exoplanetas
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Sistema analitico institucional para la evaluacion y confirmacion de anomalias estelares capturadas en la mision Kepler, mediante clasificadores supervisados de Machine Learning.
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-stretch md:self-auto bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Servidor Activo
            </span>
          </div>
        </header>

        {/* Loaded Candidate Info Badge */}
        {loadedCandidate && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-amber-500/5 border border-amber-500/20 px-4 py-2.5 rounded text-xs font-mono text-amber-300/90 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Candidato Kepler Cargado: <strong className="text-slate-100">{loadedCandidate.kepoi_name}</strong></span>
              {loadedCandidate.kepler_name && <span className="text-slate-400">({loadedCandidate.kepler_name})</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Estado Real en Catálogo:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                loadedCandidate.koi_disposition === 'CONFIRMED'
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                  : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
              }`}>
                {loadedCandidate.koi_disposition === 'CONFIRMED' ? 'Confirmado (Planeta)' : 'Falso Positivo'}
              </span>
            </div>
          </div>
        )}

        {/* Action presets & Dynamic Catalog Loader */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0c1220]/40 border border-slate-800/50 p-4 rounded-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase block w-full md:w-auto mb-1 md:mb-0">Presets Rápidos:</span>
            <button
              type="button"
              onClick={() => { loadPreset('CONFIRMED_PRESET'); setLoadedCandidate(null); }}
              className="text-xs font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1.5 rounded transition-all duration-200"
            >
              Muestra 01: Confirmado
            </button>
            <button
              type="button"
              onClick={() => { loadPreset('FALSE_POSITIVE_PRESET'); setLoadedCandidate(null); }}
              className="text-xs font-mono bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-2.5 py-1.5 rounded transition-all duration-200"
            >
              Muestra 02: Falso Positivo
            </button>
            <span className="text-slate-700 hidden md:inline">|</span>
            <button
              type="button"
              onClick={() => fetchAndFillCandidate('http://127.0.0.1:8000/candidato/aleatorio?disposition=confirmed')}
              className="text-xs font-mono bg-emerald-950/20 border border-emerald-900/60 hover:border-emerald-800/80 text-emerald-400 px-2.5 py-1.5 rounded transition-all duration-200"
            >
              🎲 Confirmado Aleatorio
            </button>
            <button
              type="button"
              onClick={() => fetchAndFillCandidate('http://127.0.0.1:8000/candidato/aleatorio?disposition=false')}
              className="text-xs font-mono bg-rose-950/20 border border-rose-900/60 hover:border-rose-800/80 text-rose-400 px-2.5 py-1.5 rounded transition-all duration-200"
            >
              🎲 Falso Positivo Aleatorio
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-48">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Ej: K00752.01 o Kepler-22 b"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/60 font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded font-mono transition-all duration-200"
            >
              Buscar ID
            </button>
          </div>
        </section>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Area */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 flex flex-col gap-6 bg-[#0c1220]/80 border border-slate-800/80 p-6 rounded-lg shadow-2xl backdrop-blur-sm">
            
            {/* Form Section B: Stellar Dispositions Flags */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800/80 pb-2 mb-4">
                Banderas de Descarte Kepler (False Positive Flags)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FlagSelector
                  id="koi_fpflag_nt"
                  value={formData.koi_fpflag_nt}
                  onChange={handleFlagChange}
                />
                <FlagSelector
                  id="koi_fpflag_ss"
                  value={formData.koi_fpflag_ss}
                  onChange={handleFlagChange}
                />
                <FlagSelector
                  id="koi_fpflag_co"
                  value={formData.koi_fpflag_co}
                  onChange={handleFlagChange}
                />
              </div>
            </div>

            {/* Form Section C: Physical & Astronomical Properties */}
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800/80 pb-2 mb-4">
                Propiedades Fisicas y Coordenadas Estelares
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ParameterInputField
                  id="koi_slogg"
                  value={formData.koi_slogg}
                  onChange={handleInputChange}
                />
                <ParameterInputField
                  id="koi_srad"
                  value={formData.koi_srad}
                  onChange={handleInputChange}
                />
                <ParameterInputField
                  id="ra"
                  value={formData.ra}
                  onChange={handleInputChange}
                />
                <ParameterInputField
                  id="dec"
                  value={formData.dec}
                  onChange={handleInputChange}
                />
                <div className="md:col-span-2">
                  <ParameterInputField
                    id="koi_kepmag"
                    value={formData.koi_kepmag}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Action Trigger */}
            <div className="pt-4 border-t border-slate-800/80">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-3 px-4 rounded text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(255,255,255,0.05)] active:scale-[0.98]"
              >
                Ejecutar Analisis Estelar
              </button>
            </div>

          </form>

          {/* Response / Info Sidebar Panel */}
          <div className="flex flex-col gap-6">
            
            {/* Scientific Guide Sidebar Card */}
            <div className="bg-[#0b101c]/40 border border-slate-800/60 p-6 rounded-lg backdrop-blur-sm">
              <h2 className="text-xs font-mono uppercase tracking-widest text-amber-500/90 mb-3">
                Protocolo de Analisis
              </h2>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                Las firmas de transito capturadas se someten a evaluacion segun las tres banderas principales de descarte. La presencia de cualquiera de ellas (1) senala un fenomeno astrofisico no planetario o interferencia optica instrumental.
              </p>
              <ul className="text-[10px] text-slate-500 font-mono flex flex-col gap-2.5">
                <li>
                  <strong className="text-slate-400">NT FLAG:</strong> Si es 1, no es un transito regular (por ejemplo, ruido instrumental o variabilidad estelar extrema).
                </li>
                <li>
                  <strong className="text-slate-400">SS FLAG:</strong> Si es 1, el evento es producido por eclipses mutuos de sistemas estelares dobles.
                </li>
                <li>
                  <strong className="text-slate-400">CO FLAG:</strong> Si es 1, el transito no se origina en la estrella objetivo, sino en un objeto cercano desplazado.
                </li>
              </ul>
            </div>

            {/* Prediction Area */}
            <div className="flex flex-col justify-center">
              {loading && <PredictionLoader />}
              
              {error && (
                <div className="p-4 rounded border border-rose-950 bg-rose-950/10 text-xs font-mono text-rose-400 leading-normal">
                  {error}
                </div>
              )}

              <ExoplanetResultCard prediction={prediction} rawData={formData} />
            </div>

          </div>

        </div>

      </main>
      
      {/* Institutional Footer Copyright */}
      <footer className="mt-16 border-t border-slate-900 w-full max-w-4xl py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-mono tracking-wider uppercase">
        <span>Cazador Automatico de Exoplanetas &bull; Proyecto Kepler ML</span>
        <span>Uso Institucional Restringido</span>
      </footer>

    </div>
  );
};
