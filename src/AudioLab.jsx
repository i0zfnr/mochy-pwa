import React, { useState } from 'react';
import { ChevronLeft, Check, X, Sliders, Volume2, Sparkles, Disc, Radio, SlidersHorizontal } from 'lucide-react';
import {
  EQ_FREQUENCIES,
  EQ_PRESETS,
  AUDIO_EFFECTS,
  AUDIO_QUALITIES,
  TRANSITION_PRESETS,
} from './audio-lab';
import './audio-lab.css';

export function AudioLab({ settings, onChange, onBack }) {
  const [activeModal, setActiveModal] = useState(null);

  // Equalizer helpers
  const eqEnabled = settings.equalizer?.enabled ?? true;
  const currentPreset = settings.equalizer?.preset || 'custom';
  const eqBands = settings.equalizer?.bands || { b60: 4, b250: 2, b1k: 0, b4k: 2, b12k: 4 };

  const handleBandChange = (bandId, value) => {
    const nextBands = { ...eqBands, [bandId]: Number(value) };
    onChange({
      ...settings,
      equalizer: {
        ...settings.equalizer,
        enabled: true,
        preset: 'custom',
        bands: nextBands,
      },
    });
  };

  const handlePresetSelect = (presetKey) => {
    const preset = EQ_PRESETS[presetKey];
    if (!preset) return;
    onChange({
      ...settings,
      equalizer: {
        enabled: true,
        preset: presetKey,
        bands: { ...preset.bands },
      },
    });
  };

  const toggleEq = () => {
    onChange({
      ...settings,
      equalizer: {
        ...settings.equalizer,
        enabled: !eqEnabled,
      },
    });
  };

  const currentQualityObj = AUDIO_QUALITIES.find(q => q.id === settings.quality) || AUDIO_QUALITIES[0];
  const currentTransitionObj = TRANSITION_PRESETS.find(t => t.id === settings.transition) || TRANSITION_PRESETS[0];
  const currentEffectObj = AUDIO_EFFECTS.find(e => e.id === settings.effect) || AUDIO_EFFECTS[0];

  return (
    <div className="audiolab-page">
      <div className="al-topbar">
        <button className="al-back-btn" onClick={onBack} aria-label="Go back">
          <ChevronLeft size={22} />
        </button>
      </div>

      <div className="al-header">
        <h1 className="al-main-title">
          Audio<br />Lab
        </h1>
      </div>

      <div className="al-cards-stack">
        {/* 1. Equalizer Card */}
        <div className="al-card card-large" onClick={() => setActiveModal('equalizer')} role="button" tabIndex={0}>
          <div className="al-card-left">
            <span className="al-badge">
              <span className={`al-badge-dot ${eqEnabled ? '' : 'off'}`} />
              {eqEnabled ? (EQ_PRESETS[currentPreset]?.name || currentPreset).toUpperCase() : 'OFF'}
            </span>
            <h2 className="al-title-lg">Equalizer</h2>
          </div>
          <div className="al-card-right">
            <svg viewBox="0 0 100 80" className="al-art-eq" fill="none" stroke="currentColor">
              <line x1="22" y1="12" x2="22" y2="68" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="22" cy="46" r="6.5" strokeWidth="2.5" fill="none" />
              <line x1="50" y1="12" x2="50" y2="68" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="24" r="6.5" strokeWidth="2.5" fill="none" />
              <line x1="78" y1="12" x2="78" y2="68" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="78" cy="54" r="6.5" strokeWidth="2.5" fill="none" />
            </svg>
          </div>
        </div>

        {/* 2. Audio Effect Card */}
        <div className="al-card card-large" onClick={() => setActiveModal('effect')} role="button" tabIndex={0}>
          <div className="al-card-left">
            <span className="al-badge">
              <span className={`al-badge-dot ${settings.effect !== 'off' ? '' : 'off'}`} />
              {(currentEffectObj.name || settings.effect).toUpperCase()}
            </span>
            <h2 className="al-title-lg">Audio Effect</h2>
          </div>
          <div className="al-card-right">
            <svg viewBox="0 0 100 70" className="al-art-fx" fill="none" stroke="currentColor">
              <text x="8" y="54" fontSize="48" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" stroke="currentColor" strokeWidth="1.8" fill="none" letterSpacing="2">
                FX
              </text>
            </svg>
          </div>
        </div>

        {/* 3. Audio Quality Card */}
        <div className="al-card card-standard" onClick={() => setActiveModal('quality')} role="button" tabIndex={0}>
          <div className="al-card-left">
            <h3 className="al-title-sm">Audio Quality</h3>
            <p className="al-subtitle">{currentQualityObj.provider} · {currentQualityObj.name.toUpperCase()}</p>
          </div>
          <div className="al-card-right">
            <svg viewBox="0 0 110 32" className="al-art-waveform" stroke="currentColor">
              <line x1="8" y1="11" x2="8" y2="21" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="6" x2="16" y2="26" strokeWidth="2" strokeLinecap="round" />
              <line x1="24" y1="2" x2="24" y2="30" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="8" x2="32" y2="24" strokeWidth="2" strokeLinecap="round" />
              <line x1="44" y1="4" x2="44" y2="28" strokeWidth="2" strokeLinecap="round" />
              <line x1="52" y1="1" x2="52" y2="31" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="10" x2="60" y2="22" strokeWidth="2" strokeLinecap="round" />
              <line x1="68" y1="7" x2="68" y2="25" strokeWidth="2" strokeLinecap="round" />
              <line x1="80" y1="9" x2="80" y2="23" strokeWidth="2" strokeLinecap="round" />
              <line x1="88" y1="3" x2="88" y2="29" strokeWidth="2" strokeLinecap="round" />
              <line x1="96" y1="12" x2="96" y2="20" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 4. Transition Card */}
        <div className="al-card card-standard" onClick={() => setActiveModal('transition')} role="button" tabIndex={0}>
          <div className="al-card-left">
            <h3 className="al-title-sm">Transition</h3>
            <p className="al-subtitle">{currentTransitionObj.name.toUpperCase()}</p>
          </div>
          <div className="al-card-right">
            <svg viewBox="0 0 70 32" className="al-art-transition" fill="none" stroke="currentColor">
              <path d="M 6 26 C 24 26, 46 6, 64 6" strokeWidth="2" strokeLinecap="round" />
              <path d="M 6 6 C 24 6, 46 26, 64 26" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 5. Audio Pass Card */}
        <div className="al-card card-standard" onClick={() => setActiveModal('pass')} role="button" tabIndex={0}>
          <div className="al-card-left">
            <h3 className="al-title-sm">Audio Pass</h3>
            <p className="al-subtitle">{settings.audioPass ? 'CONNECTED · DIRECT' : 'NOT CONNECTED'}</p>
          </div>
          <div className="al-card-right">
            <svg viewBox="0 0 70 30" className="al-art-pass" fill="none" stroke="currentColor">
              <rect x="12" y="7" width="26" height="16" rx="4" strokeWidth="1.8" />
              <line x1="38" y1="12" x2="52" y2="12" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="38" y1="18" x2="52" y2="18" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="52" y1="15" x2="64" y2="15" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="15" x2="12" y2="15" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* 6. Atmosphere Beat Motion Card */}
        <div className="al-card card-standard" onClick={() => setActiveModal('beat')} role="button" tabIndex={0}>
          <div className="al-card-left">
            <h3 className="al-title-sm">Beat Motion</h3>
            <p className="al-subtitle">ATMOSPHERE · {(settings.beatIntensity || 'normal').toUpperCase()}</p>
          </div>
          <div className="al-card-right">
            <Sparkles size={22} style={{ opacity: 0.7 }} />
          </div>
        </div>
      </div>

      {/* --- MODAL: Equalizer --- */}
      {activeModal === 'equalizer' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ width: 490 }} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Equalizer</h2>
              <button className="icon-button" onClick={() => setActiveModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="al-modal-content">
              <div className="al-modal-row">
                <span style={{ fontSize: 13, color: '#d4d4d8' }}>Enable Equalizer</span>
                <button
                  className={`toggle ${eqEnabled ? 'on' : ''}`}
                  role="switch"
                  aria-checked={eqEnabled}
                  onClick={toggleEq}
                >
                  <span />
                </button>
              </div>

              {/* Presets Chips */}
              <div className="al-presets-scroll">
                {Object.entries(EQ_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    className={`al-preset-chip ${currentPreset === key ? 'active' : ''}`}
                    onClick={() => handlePresetSelect(key)}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>

              {/* 5-Band Vertical Slider Board */}
              <div className="al-eq-board">
                {EQ_FREQUENCIES.map(freq => {
                  const gainVal = eqBands[freq.id] ?? 0;
                  return (
                    <div key={freq.id} className="al-eq-band">
                      <span className="al-eq-gain">
                        {gainVal > 0 ? `+${gainVal}` : gainVal}dB
                      </span>
                      <div className="al-eq-slider-container">
                        <input
                          type="range"
                          className="al-eq-slider"
                          min="-12"
                          max="12"
                          step="1"
                          value={gainVal}
                          disabled={!eqEnabled}
                          onChange={e => handleBandChange(freq.id, e.target.value)}
                        />
                      </div>
                      <span className="al-eq-label">{freq.label}</span>
                      <span className="al-eq-name">{freq.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Audio Effect --- */}
      {activeModal === 'effect' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Audio Effect</h2>
              <button className="icon-button" onClick={() => setActiveModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="al-options-list">
              {AUDIO_EFFECTS.map(effect => {
                const isSelected = settings.effect === effect.id;
                return (
                  <button
                    key={effect.id}
                    className={`al-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onChange({ ...settings, effect: effect.id });
                      setActiveModal(null);
                    }}
                  >
                    <div className="al-option-info">
                      <strong>{effect.name}</strong>
                      <p>{effect.description}</p>
                    </div>
                    {isSelected && (
                      <span className="al-option-check">
                        <Check size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Audio Quality --- */}
      {activeModal === 'quality' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Audio Quality</h2>
              <button className="icon-button" onClick={() => setActiveModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="al-options-list">
              {AUDIO_QUALITIES.map(q => {
                const isSelected = settings.quality === q.id;
                return (
                  <button
                    key={q.id}
                    className={`al-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onChange({ ...settings, quality: q.id });
                      setActiveModal(null);
                    }}
                  >
                    <div className="al-option-info">
                      <strong>{q.name}</strong>
                      <p>{q.description}</p>
                    </div>
                    {isSelected && (
                      <span className="al-option-check">
                        <Check size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Transition --- */}
      {activeModal === 'transition' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Transition</h2>
              <button className="icon-button" onClick={() => setActiveModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="al-options-list">
              {TRANSITION_PRESETS.map(tr => {
                const isSelected = settings.transition === tr.id;
                return (
                  <button
                    key={tr.id}
                    className={`al-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onChange({ ...settings, transition: tr.id });
                      setActiveModal(null);
                    }}
                  >
                    <div className="al-option-info">
                      <strong>{tr.name}</strong>
                      <p>{tr.description}</p>
                    </div>
                    {isSelected && (
                      <span className="al-option-check">
                        <Check size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Audio Pass --- */}
      {activeModal === 'pass' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Audio Pass</h2>
              <button className="icon-button" onClick={() => setActiveModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="al-modal-content">
              <p style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.6 }}>
                Direct Audio Pass routes output directly to device hardware without intermediary software limits or extra equalization.
              </p>
              <div className="al-modal-row" style={{ background: '#202025', padding: '14px 18px', borderRadius: 14 }}>
                <span style={{ fontSize: 13, color: '#ffffff' }}>Direct Audio Pass</span>
                <button
                  className={`toggle ${settings.audioPass ? 'on' : ''}`}
                  role="switch"
                  aria-checked={settings.audioPass}
                  onClick={() => onChange({ ...settings, audioPass: !settings.audioPass })}
                >
                  <span />
                </button>
              </div>
              <div style={{ background: '#17171b', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 10, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1 }}>Output Route</span>
                <p style={{ fontSize: 12, color: '#e4e4e7', margin: '4px 0 0' }}>
                  {settings.audioPass ? 'Hardware Direct (Bypass DSP)' : 'Active Lab Pipeline (Equalizer & Surround)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Beat Motion --- */}
      {activeModal === 'beat' && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="modal" style={{ width: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Beat Motion</h2>
              <button className="icon-button" onClick={() => setActiveModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="al-options-list">
              {[
                { id: 'low', name: 'Low', description: 'Subtle and gentle ambient breathing' },
                { id: 'normal', name: 'Normal', description: 'Balanced Apple Music rhythm and bounce' },
                { id: 'aggressive', name: 'Aggressive', description: 'Deep, dynamic club expansion and luminescence' },
                { id: 'off', name: 'Off', description: 'Static ambient colors without movement' },
              ].map(b => {
                const isSelected = (settings.beatIntensity || 'normal') === b.id;
                return (
                  <button
                    key={b.id}
                    className={`al-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onChange({ ...settings, beatIntensity: b.id });
                      setActiveModal(null);
                    }}
                  >
                    <div className="al-option-info">
                      <strong>{b.name}</strong>
                      <p>{b.description}</p>
                    </div>
                    {isSelected && (
                      <span className="al-option-check">
                        <Check size={18} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
