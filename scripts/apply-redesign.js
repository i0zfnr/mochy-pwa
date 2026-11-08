import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const mainPath = path.join(rootDir, 'src', 'main.jsx');

let code = fs.readFileSync(mainPath, 'utf8');

// 1. Update topbar breadcrumb to include 'new' and 'radio'
const breadcrumbTarget = "<strong>{({ home: 'Home', search: 'Search', library: 'Your library', likes: 'Liked songs', local: 'On this device', history: 'Listening history', playlist: playlist?.name, settings: 'Settings', audiolab: 'Audio Lab' })[page]}</strong>";
const breadcrumbReplacement = "<strong>{({ new: 'New', home: 'Home', radio: 'Radio', search: 'Search', library: 'Your library', likes: 'Liked songs', local: 'On this device', history: 'Listening history', playlist: playlist?.name, settings: 'Settings', audiolab: 'Audio Lab' })[page] || 'New'}</strong>";

if (code.includes(breadcrumbTarget)) {
  code = code.replace(breadcrumbTarget, breadcrumbReplacement);
  console.log('Updated breadcrumb');
} else {
  console.warn('Breadcrumb target not found');
}

// 2. Add transition quick toggle in topbar actions
const topbarActionsTarget = '<div className="topbar-actions">';
const topbarActionsReplacement = `<div className="topbar-actions"><button className="text-button" style={{ fontSize: 12, padding: '5px 12px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.08)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.08)' }} onClick={() => setTransitionModal(true)} title="Configure track transition">Transition: {audioLabSettings.transition === 'crossfade_5s' ? '5s' : audioLabSettings.transition === 'gapless' ? 'Gapless' : audioLabSettings.transition === 'off' ? 'Off' : 'Auto 3s'}</button>`;

if (code.includes(topbarActionsTarget)) {
  code = code.replace(topbarActionsTarget, topbarActionsReplacement);
  console.log('Added topbar transition action');
}

// 3. Update sidebar to Apple Music browse layout
const sidebarStart = '<aside className="sidebar">';
const sidebarEnd = '</aside>';
const sidebarStartIndex = code.indexOf(sidebarStart);
const sidebarEndIndex = code.indexOf(sidebarEnd, sidebarStartIndex);

if (sidebarStartIndex !== -1 && sidebarEndIndex !== -1) {
  const newSidebar = `<aside className="sidebar">
      <button className="am-brand" onClick={() => navigate('new')} aria-label="Apple Music">
        <span className="am-brand-logo">
          <svg viewBox="0 0 170 170" width="22" height="22" fill="currentColor">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.85-11.7-14.43-6.09-9.78-10.9-20.93-14.43-33.45-3.53-12.52-5.3-24.16-5.3-34.92 0-14.13 3.48-26.04 10.45-35.73 6.96-9.68 15.82-14.58 26.57-14.71 4.58 0 9.84 1.15 15.78 3.44 5.94 2.29 9.84 3.44 11.7 3.44 1.64 0 5.65-1.15 12.04-3.44 6.39-2.29 11.7-3.32 15.93-3.09 11.96.65 21.6 4.79 28.93 12.43-10.44 6.32-15.56 15.11-15.35 26.38.22 8.71 3.59 16.08 10.12 22.11 6.53 6.03 14.28 9.51 23.25 10.44-2.17 6.74-4.89 13.59-8.15 20.55zM119.22 32.64c0-7.39 2.61-14.35 7.83-20.87 5.22-6.52 11.63-10.76 19.23-12.72.65 1.52.98 3.15.98 4.89 0 7.39-2.72 14.46-8.15 21.2-5.44 6.74-11.96 10.76-19.57 12.06-.22-1.52-.32-3.04-.32-4.56z"/>
          </svg>
        </span>
        <span className="am-brand-text">Music</span>
      </button>

      <nav>
        {[
          [Search, 'Search', 'search'],
          [Home, 'Home', 'home'],
          [LayoutGrid, 'New', 'new'],
          [Radio, 'Radio', 'radio'],
          [Library, 'Your library', 'library'],
          [SlidersHorizontal, 'Audio Lab', 'audiolab']
        ].map(([Icon, name, key]) => (
          <button
            key={key}
            className={\`nav-item \${page === key ? 'selected am-active-pill' : ''}\`}
            onClick={() => navigate(key)}
          >
            <Icon size={21}/>
            {name}
            {page === key && <span className="nav-dot"/>}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider"/>
      <div className="sidebar-heading">
        <span>YOUR COLLECTION</span>
        <IconButton icon={Plus} label="Create playlist" onClick={() => setNewPlaylist(true)}/>
      </div>

      <button className={\`collection \${page === 'likes' ? 'selected' : ''}\`} onClick={() => navigate('likes')}>
        <span className="collection-icon pink"><Heart size={19}/></span>
        <span>Liked songs<small>{likes.length} songs</small></span>
      </button>

      <button className={\`collection \${page === 'local' ? 'selected' : ''}\`} onClick={() => navigate('local')}>
        <span className="collection-icon green"><Download size={19}/></span>
        <span>On this device<small>{library.filter(t => t.source === 'local').length} songs</small></span>
      </button>

      {playlists.map(p => (
        <button className="collection" key={p.id} onClick={() => openPlaylist(p.id)}>
          <span className="collection-icon"><ListMusic size={19}/></span>
          <span>{p.name}<small>{p.tracks.length} songs</small></span>
        </button>
      ))}

      <button className="create-playlist" onClick={() => setNewPlaylist(true)}>
        <Plus size={17}/> Create playlist
      </button>

      <div className="sidebar-bottom-actions">
        <button className={\`nav-item \${page === 'settings' ? 'selected' : ''}\`} onClick={() => navigate('settings')}>
          <Settings size={20}/>Settings<span className="version">WEB BETA</span>
        </button>
        <a className="am-open-in-music" href="https://music.apple.com" target="_blank" rel="noreferrer">
          Open in Music <ArrowUpRight size={14}/>
        </a>
        <button className="am-signin-btn" onClick={() => navigate('settings')}>
          Sign In
        </button>
      </div>
    </aside>`;

  code = code.slice(0, sidebarStartIndex) + newSidebar + code.slice(sidebarEndIndex + sidebarEnd.length);
  console.log('Replaced sidebar with Apple Music shell');
} else {
  console.warn('Could not locate sidebar block');
}

// 4. Add 'new' and 'radio' pages into <main>
const homePageTarget = "{page === 'home' ? <div className=\"page home-page\">";
const newPageCode = `{page === 'new' ? (
        <div className="page new-page-container">
          <div className="new-page-header">
            <h1>New</h1>
          </div>
          
          {/* 3-Column Hero Featured Carousel */}
          <div className="am-hero-carousel">
            {APPLE_HERO_CAROUSEL.map(item => (
              <div className="am-hero-card" key={item.id} onClick={() => search(item.query)} role="button" tabIndex={0}>
                <div className="am-hero-meta">
                  <span className="am-hero-eyebrow">{item.eyebrow}</span>
                  <strong className="am-hero-title">{item.title}</strong>
                  <span className="am-hero-subtitle">{item.subtitle}</span>
                </div>
                <div className="am-hero-banner">
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
                <div className="am-hero-footer">
                  <p>{item.tagline}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 5-Column 2026 Bento Grid */}
          <div className="am-section-header" onClick={() => search('Best of 2026')}>
            <h2 className="am-section-title">Best of 2026</h2>
            <ChevronRight size={18} color="rgba(255, 255, 255, 0.6)"/>
          </div>
          <div className="am-bento-grid">
            {APPLE_BENTO_2026.map(item => (
              <div key={item.id} onClick={() => search(item.query)} role="button" tabIndex={0}>
                <div className="am-bento-card" style={{ background: item.bg }}>
                  <div className="am-bento-art">
                    <img src={item.art} alt={item.title} loading="lazy" />
                    <span className="am-bento-badge">{item.badge}</span>
                    <span className="am-bento-year">{item.year}</span>
                  </div>
                </div>
                <div className="am-bento-meta">
                  <div className="am-bento-title">{item.title}</div>
                  <div className="am-bento-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Best New Songs Scannable Rows */}
          <div className="am-section-header" onClick={() => search('Best New Songs 2026')}>
            <h2 className="am-section-title">Best New Songs</h2>
            <ChevronRight size={18} color="rgba(255, 255, 255, 0.6)"/>
          </div>
          <div className="am-track-grid">
            {APPLE_NEW_SONGS.map(song => (
              <div
                key={song.id}
                className={\`am-track-row \${current?.title === song.title ? 'is-active' : ''}\`}
                onClick={() => search(song.query)}
                role="button"
                tabIndex={0}
              >
                <div className="am-track-left">
                  <div className="am-track-thumb">
                    <img src={\`https://images.unsplash.com/photo-\${song.id === 'new-1' ? '1511671782779-c97d3d27a1d4' : song.id === 'new-2' ? '1514525253161-7a46d19cd819' : '1470225620780-dba8ba36b745'}?w=120&auto=format&fit=crop&q=80\`} alt="" />
                  </div>
                  <div className="am-track-info">
                    <strong className="am-track-title">{song.title}</strong>
                    <div className="am-track-artist">{song.artist}</div>
                  </div>
                </div>
                <span className="am-track-duration">{time(song.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : page === 'radio' ? (
        <div className="page new-page-container">
          <div className="new-page-header">
            <h1>Radio</h1>
          </div>
          <div className="am-section-header">
            <h2 className="am-section-title">Live & Premier Stations</h2>
          </div>
          <div className="am-bento-grid">
            {[
              { name: 'Apple Music 1', sub: 'The new music that matters', bg: '#D43852', query: 'Apple Music 1 Hits' },
              { name: 'Apple Music Hits', sub: 'The songs you know and love', bg: '#2B50ED', query: 'Apple Music Hits' },
              { name: 'Apple Music Country', sub: 'Where country lives', bg: '#D97706', query: 'Apple Music Country' },
              { name: 'Chill Station', sub: 'Mellow beats and gentle vibes', bg: '#059669', query: 'Chill Lo-Fi Jazz' },
              { name: 'Acoustic Sunrise', sub: 'Pure acoustic warmth', bg: '#7C3AED', query: 'Acoustic Morning' },
            ].map(st => (
              <div key={st.name} onClick={() => search(st.query)} role="button" tabIndex={0}>
                <div className="am-bento-card" style={{ background: st.bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 18 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>LIVE RADIO</span>
                  <strong style={{ fontSize: 20, color: '#FFFFFF', marginTop: 4 }}>{st.name}</strong>
                </div>
                <div className="am-bento-meta">
                  <div className="am-bento-title">{st.name}</div>
                  <div className="am-bento-sub">{st.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : page === 'home' ? <div className="page home-page">`;

if (code.includes(homePageTarget)) {
  code = code.replace(homePageTarget, newPageCode);
  console.log('Inserted new and radio pages into <main>');
} else {
  console.warn('Could not find homePageTarget');
}

// 5. Update Fullscreen Synced Lyrics scrubber with negative remaining time
const scrubberTarget = '<div><span>{time(player.position)}</span><span>{time(player.duration)}</span></div></div><div className="transport af-transport">';
const scrubberReplacement = '<div><span>{time(player.position)}</span><span>-{time(Math.max(0, (player.duration || 0) - player.position))}</span></div></div><div className="transport af-transport">';

if (code.includes(scrubberTarget)) {
  code = code.replace(scrubberTarget, scrubberReplacement);
  console.log('Updated fullscreen scrubber remaining time');
}

// 6. Update Fullscreen Synced Lyrics with 3 animated vocal pause dots
const lyricScrollTarget = '{synced.map((line, i) => <LyricItem key={i} line={line} nextLine={synced[i + 1]} position={lyricPosition} distance={i - lyricIndex} isCurrent={i === lyricIndex} isPast={i < lyricIndex} activeRef={i === lyricIndex ? activeLyricRef : null} onSeek={seekLyric}/>)}';
const lyricScrollReplacement = `{isPauseNow && lyricIndex === -1 && (
                <div className="af-pause-indicator" aria-label="Instrumental intro">
                  <span className="af-pause-dot dot-1" />
                  <span className="af-pause-dot dot-2" />
                  <span className="af-pause-dot dot-3" />
                </div>
              )}
              {synced.map((line, i) => (
                <React.Fragment key={i}>
                  <LyricItem line={line} nextLine={synced[i + 1]} position={lyricPosition} distance={i - lyricIndex} isCurrent={i === lyricIndex} isPast={i < lyricIndex} activeRef={i === lyricIndex ? activeLyricRef : null} onSeek={seekLyric}/>
                  {isPauseNow && i === lyricIndex && (
                    <div className="af-pause-indicator" aria-label="Instrumental break">
                      <span className="af-pause-dot dot-1" />
                      <span className="af-pause-dot dot-2" />
                      <span className="af-pause-dot dot-3" />
                    </div>
                  )}
                </React.Fragment>
              ))}`;

if (code.includes(lyricScrollTarget)) {
  code = code.replace(lyricScrollTarget, lyricScrollReplacement);
  console.log('Added vocal pause dots into fullscreen lyrics');
}

// 7. Add Floating Player Capsule, Up Next Drawer, and Transition Modal
const endAppTarget = '<div className="youtube-audio-only"';
const bottomComponents = `
    {/* Centered Floating Liquid Glass Player Capsule (Desktop) */}
    {current && (
      <div className="floating-player-capsule">
        <div className="fpc-left">
          <IconButton icon={Shuffle} label="Shuffle" active={player.shuffle} onClick={() => player.setShuffle(!player.shuffle)}/>
          <IconButton icon={SkipBack} label="Previous song" onClick={() => player.position > 3 ? player.seek(0) : player.advance(-1)}/>
          <button className="fpc-play-btn" aria-label={player.playing ? 'Pause' : 'Play'} onClick={player.toggle}>
            {player.playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />}
          </button>
          <IconButton icon={SkipForward} label="Next song" onClick={() => player.advance(1)}/>
          <IconButton icon={player.repeat === 'one' ? Repeat1 : Repeat} label={\`Repeat: \${player.repeat}\`} active={player.repeat !== 'off'} onClick={() => player.setRepeat(({ off: 'all', all: 'one', one: 'off' })[player.repeat])}/>
        </div>
        <div className="fpc-center">
          <div className="fpc-thumb" onClick={() => setFullScreen(true)} role="button" tabIndex={0} title="Open Fullscreen Lyrics">
            <Cover track={displayCurrent}/>
          </div>
          <div className="fpc-meta">
            <div className="fpc-title">{current.title}</div>
            <div className="fpc-artist">{current.artist}</div>
          </div>
          <span className="fpc-badge">PREVIEW</span>
          <IconButton icon={MoreHorizontal} label="Song options" onClick={() => setMenu(current)}/>
        </div>
        <div className="fpc-right">
          <Volume2 size={16} style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
          <input type="range" className="fpc-vol-slider" aria-label="Volume" min="0" max="1" step="0.01" value={player.volume} onChange={e => player.setVolume(Number(e.target.value))}/>
          <IconButton icon={Mic2} label="Synced Lyrics (Full Screen)" active={fullScreen} onClick={() => setFullScreen(true)}/>
          <IconButton icon={ListMusic} label="Up Next Queue" active={upNextOpen} onClick={() => setUpNextOpen(!upNextOpen)}/>
        </div>
      </div>
    )}

    {/* Right Frosted "Up Next" Queue Drawer */}
    {upNextOpen && (
      <aside className="up-next-drawer" aria-label="Up Next Queue">
        <div className="und-header">
          <h2 className="und-title">Up Next</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="und-clear-btn" onClick={() => { if (current) player.setQueue([current]); }}>Clear</button>
            <IconButton icon={X} label="Close Up Next" onClick={() => setUpNextOpen(false)}/>
          </div>
        </div>
        <div className="und-list">
          {player.queue.map((track, i) => {
            const isCur = i === player.index;
            return (
              <div
                key={\`\${track.id}-\${i}\`}
                className={\`und-item \${isCur ? 'is-current' : ''}\`}
                onClick={() => player.start(track, player.queue, i)}
                role="button"
                tabIndex={0}
              >
                <div className="und-item-left">
                  <div className="und-item-thumb">
                    <Cover track={track}/>
                  </div>
                  <div className="und-item-info">
                    <div className="und-item-title">{track.title}</div>
                    <div className="und-item-artist">{track.artist}</div>
                  </div>
                </div>
                {isCur && player.playing ? (
                  <Volume2 size={14} color="#007AFF" style={{ marginRight: 6 }} />
                ) : null}
                <span className="und-item-duration">{time(track.duration)}</span>
              </div>
            );
          })}
        </div>
      </aside>
    )}

    {/* Apple Transition Modal (Verified from User Attachment) */}
    {transitionModal && (
      <div className="modal-backdrop" onClick={() => setTransitionModal(false)}>
        <section className="modal al-transition-modal" style={{ maxWidth: 440, width: '100%', background: '#1C1E22', borderRadius: 20, border: '1px solid rgba(255, 255, 255, 0.12)' }} role="dialog" aria-modal="true" aria-label="Transition" onClick={e => e.stopPropagation()}>
          <div className="modal-heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Transition</h2>
            <IconButton icon={X} label="Close transition settings" onClick={() => setTransitionModal(false)}/>
          </div>
          <div className="al-modes-stack" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRANSITION_PRESETS.map(preset => {
              const isSelected = audioLabSettings.transition === preset.id || (preset.id === 'auto' && (!audioLabSettings.transition || audioLabSettings.transition === 'auto'));
              return (
                <button
                  key={preset.id}
                  className={\`al-mode-card \${isSelected ? 'active' : ''}\`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: '#24272E',
                    border: isSelected ? '2px solid #30D158' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'border-color 0.15s ease',
                  }}
                  onClick={() => {
                    setAudioLabSettings(old => ({
                      ...old,
                      transition: preset.id,
                      transitionDuration: preset.duration,
                    }));
                    notify(\`Transition: \${preset.name}\`);
                  }}
                >
                  <div className="al-mode-body">
                    <strong className="al-mode-title" style={{ fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>{preset.name}</strong>
                    <p className="al-mode-desc" style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', margin: '4px 0 0' }}>{preset.description}</p>
                  </div>
                  <div className="al-mode-radio">
                    {isSelected ? (
                      <Check size={20} color="#30D158" strokeWidth={2.5} />
                    ) : (
                      <span style={{ width: 20, height: 20, display: 'inline-block' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    )}
  <div className="youtube-audio-only"`;

if (code.includes(endAppTarget)) {
  code = code.replace(endAppTarget, bottomComponents);
  console.log('Added floating player capsule, up-next drawer, and transition modal');
}

fs.writeFileSync(mainPath, code, 'utf8');
console.log('Successfully updated src/main.jsx');
