const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CLI_PATH = 'C:\\Users\\ipan\\AppData\\Local\\Programs\\ArtCraft\\FigCraft\\figcraft-cli.exe';
const PROTO_DIR = path.resolve(__dirname, '..', 'prototypes');

if (!fs.existsSync(PROTO_DIR)) {
  fs.mkdirSync(PROTO_DIR, { recursive: true });
}

// =============================================================================
// SCENE GRAPH 1: Apple Music Web "New" & Browse Shell
// =============================================================================
function createAppleNewScene() {
  const commands = [];
  let nextId = 2;

  // Root Frame
  commands.push({
    command: 'node.create',
    params: {
      type: 'frame',
      name: 'Apple Music Web - New & Browse Shell',
      x: 0,
      y: 0,
      width: 1440,
      height: 900,
      props: {
        fill: '#1A1A1A',
        clip: true
      }
    }
  });

  const ROOT_ID = 2;

  // ---------------------------------------------------------------------------
  // 1. LEFT SIDEBAR NAVIGATION (220px)
  // ---------------------------------------------------------------------------
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'SidebarPlatter',
      parent: ROOT_ID,
      x: 0,
      y: 0,
      width: 220,
      height: 900,
      props: {
        fill: '#141414',
        stroke: '#262626',
        strokeWeight: 1
      }
    }
  });

  // Apple Music Logo / Branding
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'BrandLogo',
      parent: ROOT_ID,
      x: 28,
      y: 30,
      text: ' Music',
      props: {
        fontSize: 22,
        fill: '#FFFFFF',
        fontFamily: 'Inter'
      }
    }
  });

  // Navigation Items
  const navItems = [
    { name: 'Search', icon: '🔍', y: 76, active: false },
    { name: 'Home', icon: '🏠', y: 118, active: false },
    { name: 'New', icon: '▦', y: 160, active: true },
    { name: 'Radio', icon: '📻', y: 202, active: false }
  ];

  for (const item of navItems) {
    if (item.active) {
      commands.push({
        command: 'node.create',
        params: {
          type: 'rectangle',
          name: `NavPill_${item.name}`,
          parent: ROOT_ID,
          x: 16,
          y: item.y,
          width: 188,
          height: 36,
          props: {
            fill: '#2B2B2B',
            cornerRadius: 8
          }
        }
      });
    }

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `NavText_${item.name}`,
        parent: ROOT_ID,
        x: 40,
        y: item.y + 9,
        text: item.name,
        props: {
          fontSize: 14,
          fill: item.active ? '#FFFFFF' : '#A0A0A0',
          fontFamily: 'Inter'
        }
      }
    });
  }

  // Bottom of sidebar: Open in Music & Sign In
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'OpenInMusic',
      parent: ROOT_ID,
      x: 28,
      y: 805,
      text: 'Open in Music ↗',
      props: {
        fontSize: 12,
        fill: '#808080',
        fontFamily: 'Inter'
      }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'SignInButton',
      parent: ROOT_ID,
      x: 20,
      y: 835,
      width: 180,
      height: 38,
      props: {
        fill: '#FFFFFF',
        cornerRadius: 19,
        effects: [
          { type: 'dropShadow', color: '#00000040', offset: [0, 4], radius: 12 }
        ]
      }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'SignInText',
      parent: ROOT_ID,
      x: 75,
      y: 845,
      text: 'Sign In',
      props: {
        fontSize: 13,
        fill: '#000000',
        fontFamily: 'Inter'
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 2. MAIN BROWSE CANVAS ("New")
  // ---------------------------------------------------------------------------
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'PageTitle',
      parent: ROOT_ID,
      x: 256,
      y: 32,
      text: 'New',
      props: {
        fontSize: 34,
        fill: '#FFFFFF',
        fontFamily: 'Inter'
      }
    }
  });

  // Hero Featured Carousel Cards (3 columns)
  const heroCards = [
    {
      eyebrow: 'NEW PLAYLIST',
      title: 'Best Songs of 2026',
      sub: 'Apple Music',
      color: '#283B4F',
      x: 256
    },
    {
      eyebrow: 'BEST OF 2026',
      title: 'Before we reveal Artist of the Year...',
      sub: 'Check out more of our 2026 picks',
      color: '#344033',
      x: 554
    },
    {
      eyebrow: 'NEW ALBUM',
      title: 'FRESH',
      sub: 'Lil Baby',
      color: '#4A3425',
      x: 852
    }
  ];

  for (const c of heroCards) {
    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `HeroEyebrow_${c.title}`,
        parent: ROOT_ID,
        x: c.x,
        y: 88,
        text: c.eyebrow,
        props: { fontSize: 10, fill: '#8E8E93', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `HeroTitle_${c.title}`,
        parent: ROOT_ID,
        x: c.x,
        y: 103,
        text: c.title,
        props: { fontSize: 15, fill: '#FFFFFF', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `HeroSub_${c.title}`,
        parent: ROOT_ID,
        x: c.x,
        y: 122,
        text: c.sub,
        props: { fontSize: 12, fill: '#8E8E93', fontFamily: 'Inter' }
      }
    });

    // Banner artwork card
    commands.push({
      command: 'node.create',
      params: {
        type: 'rectangle',
        name: `HeroArt_${c.title}`,
        parent: ROOT_ID,
        x: c.x,
        y: 142,
        width: 284,
        height: 154,
        props: {
          fill: c.color,
          cornerRadius: 10,
          stroke: '#FFFFFF14',
          strokeWeight: 1,
          effects: [
            { type: 'dropShadow', color: '#0000004D', offset: [0, 8], radius: 18 }
          ]
        }
      }
    });

    // Editorial headline inside banner
    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `HeroBannerText_${c.title}`,
        parent: ROOT_ID,
        x: c.x + 20,
        y: 172,
        text: c.title,
        props: { fontSize: 20, fill: '#FFFFFF', fontFamily: 'Inter' }
      }
    });
  }

  // Carousel Next Disc
  commands.push({
    command: 'node.create',
    params: {
      type: 'ellipse',
      name: 'CarouselNextDisc',
      parent: ROOT_ID,
      x: 1115,
      y: 200,
      width: 32,
      height: 32,
      props: {
        fill: '#333333',
        stroke: '#FFFFFF33',
        strokeWeight: 1,
        effects: [
          { type: 'dropShadow', color: '#00000066', offset: [0, 4], radius: 10 }
        ]
      }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'CarouselArrow',
      parent: ROOT_ID,
      x: 1126,
      y: 207,
      text: '>',
      props: { fontSize: 14, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  // Section 2: "Best of 2026 >"
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'SecTitle_BestOf2026',
      parent: ROOT_ID,
      x: 256,
      y: 324,
      text: 'Best of 2026 >',
      props: { fontSize: 20, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  const best2026 = [
    { title: 'Rap Life: Best of 2026', sub: 'Apple Music Hip-Hop', color: '#1E1E1E', x: 256 },
    { title: 'R&B Now: Best of 2026', sub: 'Apple Music R&B', color: '#731E2A', x: 432 },
    { title: 'A-List Pop: Best of 2026', sub: 'Apple Music Pop', color: '#12548E', x: 608 },
    { title: "Today's Country: Best of 2026", sub: 'Apple Music Country', color: '#8F1E5E', x: 784 },
    { title: '¡Dale Play!: Best of 2026', sub: 'Apple Music Latin', color: '#007A87', x: 960 }
  ];

  for (const b of best2026) {
    commands.push({
      command: 'node.create',
      params: {
        type: 'rectangle',
        name: `SquareCard_${b.title}`,
        parent: ROOT_ID,
        x: b.x,
        y: 356,
        width: 162,
        height: 162,
        props: {
          fill: b.color,
          cornerRadius: 10,
          stroke: '#FFFFFF1A',
          strokeWeight: 1,
          effects: [
            { type: 'dropShadow', color: '#00000055', offset: [0, 6], radius: 16 }
          ]
        }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `BigYear_${b.title}`,
        parent: ROOT_ID,
        x: b.x + 14,
        y: 472,
        text: '2026',
        props: { fontSize: 32, fill: '#FFFFFF', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `Label_${b.title}`,
        parent: ROOT_ID,
        x: b.x,
        y: 526,
        text: b.title.slice(0, 18),
        props: { fontSize: 12, fill: '#FFFFFF', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `Sub_${b.title}`,
        parent: ROOT_ID,
        x: b.x,
        y: 544,
        text: b.sub,
        props: { fontSize: 10, fill: '#8E8E93', fontFamily: 'Inter' }
      }
    });
  }

  // Section 3: "Best New Songs >"
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'SecTitle_BestNewSongs',
      parent: ROOT_ID,
      x: 256,
      y: 588,
      text: 'Best New Songs >',
      props: { fontSize: 20, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  const songs = [
    { title: 'Ya Hit (feat. Drake, Travis Scott & Loc Sh...)', artist: 'Future', duration: '3:45', y: 620 },
    { title: 'Blue Moon (Apple Music Sessions)', artist: 'Zara Larsson — Sessions', duration: '3:12', y: 668 },
    { title: "Saturn's Return", artist: 'Zara Larsson', duration: '3:48', y: 716 }
  ];

  for (const s of songs) {
    commands.push({
      command: 'node.create',
      params: {
        type: 'rectangle',
        name: `SongRow_${s.title}`,
        parent: ROOT_ID,
        x: 256,
        y: s.y,
        width: 866,
        height: 44,
        props: {
          fill: '#242424',
          cornerRadius: 8,
          stroke: '#FFFFFF0D',
          strokeWeight: 1
        }
      }
    });

    // Artwork squircle
    commands.push({
      command: 'node.create',
      params: {
        type: 'rectangle',
        name: `SongArt_${s.title}`,
        parent: ROOT_ID,
        x: 264,
        y: s.y + 6,
        width: 32,
        height: 32,
        props: { fill: '#3E4957', cornerRadius: 4 }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `SongTitle_${s.title}`,
        parent: ROOT_ID,
        x: 308,
        y: s.y + 14,
        text: s.title,
        props: { fontSize: 13, fill: '#FFFFFF', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `SongArtist_${s.title}`,
        parent: ROOT_ID,
        x: 650,
        y: s.y + 14,
        text: s.artist,
        props: { fontSize: 12, fill: '#8E8E93', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `SongDur_${s.title}`,
        parent: ROOT_ID,
        x: 1070,
        y: s.y + 14,
        text: s.duration,
        props: { fontSize: 12, fill: '#8E8E93', fontFamily: 'Inter' }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 3. RIGHT "UP NEXT" QUEUE DRAWER (Frosted Liquid Glass)
  // ---------------------------------------------------------------------------
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'UpNextDrawer',
      parent: ROOT_ID,
      x: 1148,
      y: 0,
      width: 292,
      height: 900,
      props: {
        fill: '#181C22D8',
        stroke: '#FFFFFF1A',
        strokeWeight: 1,
        effects: [
          { type: 'dropShadow', color: '#00000088', offset: [-8, 0], radius: 30 }
        ]
      }
    }
  });

  // Up Next Header
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'UpNextHeader',
      parent: ROOT_ID,
      x: 1168,
      y: 28,
      text: 'Up Next',
      props: { fontSize: 17, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'UpNextClear',
      parent: ROOT_ID,
      x: 1380,
      y: 30,
      text: 'Clear',
      props: { fontSize: 13, fill: '#FF3B30', fontFamily: 'Inter' }
    }
  });

  // Queue items (matching screenshot)
  const queueItems = [
    { title: "Girl's Girl (Apple Music...)", time: '3:04', y: 68 },
    { title: 'The Ambition (Apple M...)', time: '3:36', y: 114 },
    { title: "Saturn's Return (Apple ...)", time: '3:48', y: 160 },
    { title: 'Ruin My Life (Apple Mu...)', time: '3:05', y: 206 },
    { title: 'Uncover (Apple Music ...)', time: '3:52', y: 252 },
    { title: 'Never Forget You (Apple...)', time: '3:49', y: 298 },
    { title: 'Symphony (Apple Music...)', time: '4:10', y: 344 },
    { title: 'Puss Puss (Apple Music...)', time: '3:21', y: 390 },
    { title: 'Lush Life (Apple Music ...)', time: '5:05', y: 436 },
    { title: 'Midnight Sun (Apple Mu...)', time: '3:31', y: 482 }
  ];

  for (const q of queueItems) {
    // Thumbnail
    commands.push({
      command: 'node.create',
      params: {
        type: 'rectangle',
        name: `QueueThumb_${q.time}`,
        parent: ROOT_ID,
        x: 1168,
        y: q.y,
        width: 36,
        height: 36,
        props: {
          fill: '#4A2A38',
          cornerRadius: 6,
          stroke: '#FFFFFF14',
          strokeWeight: 1
        }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `QueueTitle_${q.time}`,
        parent: ROOT_ID,
        x: 1214,
        y: q.y + 2,
        text: q.title,
        props: { fontSize: 12, fill: '#FFFFFF', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `QueueArtist_${q.time}`,
        parent: ROOT_ID,
        x: 1214,
        y: q.y + 19,
        text: 'Zara Larsson',
        props: { fontSize: 10, fill: '#8E8E93', fontFamily: 'Inter' }
      }
    });

    commands.push({
      command: 'node.create',
      params: {
        type: 'text',
        name: `QueueTime_${q.time}`,
        parent: ROOT_ID,
        x: 1390,
        y: q.y + 10,
        text: q.time,
        props: { fontSize: 11, fill: '#8E8E93', fontFamily: 'Inter' }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. FLOATING LIQUID GLASS TRANSPORT CAPSULE (Bottom Center)
  // ---------------------------------------------------------------------------
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'FloatingPlayerPlatter',
      parent: ROOT_ID,
      x: 340,
      y: 832,
      width: 760,
      height: 52,
      props: {
        fill: '#20252DF0',
        cornerRadius: 26,
        stroke: '#FFFFFF29',
        strokeWeight: 1,
        effects: [
          { type: 'dropShadow', color: '#00000088', offset: [0, 16], radius: 36 },
          { type: 'innerShadow', color: '#FFFFFF4D', offset: [0, 1], radius: 1 }
        ]
      }
    }
  });

  // Transport Buttons
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'TransportPrev',
      parent: ROOT_ID,
      x: 365,
      y: 849,
      text: '◀◀',
      props: { fontSize: 13, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'ellipse',
      name: 'TransportPlayCircle',
      parent: ROOT_ID,
      x: 395,
      y: 841,
      width: 34,
      height: 34,
      props: { fill: '#FFFFFF' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'TransportPlayIcon',
      parent: ROOT_ID,
      x: 407,
      y: 849,
      text: '▶',
      props: { fontSize: 14, fill: '#000000', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'TransportNext',
      parent: ROOT_ID,
      x: 440,
      y: 849,
      text: '▶▶',
      props: { fontSize: 13, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  // Now Playing Info in Platter
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'PlatterCover',
      parent: ROOT_ID,
      x: 476,
      y: 840,
      width: 36,
      height: 36,
      props: {
        fill: '#3D4A5B',
        cornerRadius: 6,
        stroke: '#FFFFFF1F',
        strokeWeight: 1
      }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'PlatterTitle',
      parent: ROOT_ID,
      x: 522,
      y: 843,
      text: 'Blue Moon (Apple Music Sessions)',
      props: { fontSize: 12, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'PlatterArtist',
      parent: ROOT_ID,
      x: 522,
      y: 860,
      text: 'Zara Larsson — Sessions',
      props: { fontSize: 10, fill: '#8E8E93', fontFamily: 'Inter' }
    }
  });

  // PREVIEW badge
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'PreviewBadge',
      parent: ROOT_ID,
      x: 740,
      y: 850,
      width: 58,
      height: 18,
      props: { fill: '#333A44', cornerRadius: 4 }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'PreviewBadgeText',
      parent: ROOT_ID,
      x: 748,
      y: 854,
      text: 'PREVIEW',
      props: { fontSize: 9, fill: '#A0AAB6', fontFamily: 'Inter' }
    }
  });

  // Scrubber & volume
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'ScrubberBg',
      parent: ROOT_ID,
      x: 820,
      y: 856,
      width: 170,
      height: 4,
      props: { fill: '#3A424E', cornerRadius: 2 }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'ScrubberProgress',
      parent: ROOT_ID,
      x: 820,
      y: 856,
      width: 75,
      height: 4,
      props: { fill: '#FFFFFF', cornerRadius: 2 }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'VolumeIcon',
      parent: ROOT_ID,
      x: 1005,
      y: 849,
      text: '🔊',
      props: { fontSize: 12, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'VolumeBar',
      parent: ROOT_ID,
      x: 1025,
      y: 856,
      width: 55,
      height: 4,
      props: { fill: '#FFFFFF', cornerRadius: 2 }
    }
  });

  return commands;
}

// =============================================================================
// SCENE GRAPH 2: Apple Music Immersive Synced Lyrics & Living Aurora Mesh
// (Directly modeled from video reference media_1794180616666_31d7a1ee.mp4)
// =============================================================================
function createAppleLyricsScene() {
  const commands = [];
  const ROOT_ID = 2;

  // Root Frame - Deep Apple Music Burgundy / Dark Violet Canvas
  commands.push({
    command: 'node.create',
    params: {
      type: 'frame',
      name: 'Apple Music - Immersive Fullscreen Synced Lyrics',
      x: 0,
      y: 0,
      width: 1440,
      height: 900,
      props: {
        fill: '#15050E',
        clip: true
      }
    }
  });

  // Dynamic Living Aurora / Fluid Color Mesh Orbs (Album Art Dominant Tones)
  const auroraOrbs = [
    { name: 'AuroraBurgundy', x: -60, y: -40, w: 800, h: 750, stops: ['#5E0E2C66', '#00000000'], blur: 100 },
    { name: 'AuroraMagentaBloom', x: 650, y: 40, w: 900, h: 800, stops: ['#8C14455E', '#00000000'], blur: 110 },
    { name: 'AuroraVioletDeep', x: 260, y: 350, w: 950, h: 700, stops: ['#3A095255', '#00000000'], blur: 120 },
    { name: 'AuroraCrimsonCenter', x: 450, y: 150, w: 600, h: 550, stops: ['#7A103544', '#00000000'], blur: 90 }
  ];

  for (const o of auroraOrbs) {
    commands.push({
      command: 'node.create',
      params: {
        type: 'ellipse',
        name: o.name,
        parent: ROOT_ID,
        x: o.x,
        y: o.y,
        width: o.w,
        height: o.h,
        props: {
          fills: [{ type: 'radialGradient', stops: o.stops }],
          effects: [{ type: 'layerBlur', radius: o.blur }]
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // LEFT COLUMN: Artwork & Track Timeline Scrubber (~420px)
  // ---------------------------------------------------------------------------
  // Album Artwork Squircle with Specular Highlight Rim
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'AlbumCoverSquircle',
      parent: ROOT_ID,
      x: 88,
      y: 120,
      width: 420,
      height: 420,
      props: {
        fill: '#3D1022',
        cornerRadius: 24,
        stroke: '#FFFFFF2B',
        strokeWeight: 1,
        effects: [
          { type: 'dropShadow', color: '#000000A6', offset: [0, 24], radius: 60 },
          { type: 'innerShadow', color: '#FFFFFF3D', offset: [0, 1], radius: 2 }
        ]
      }
    }
  });

  // Editorial graphic inside album art (simulating the video cover)
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'AlbumCoverGraphic',
      parent: ROOT_ID,
      x: 130,
      y: 300,
      text: 'iLoveMakonnen\nTuesday (feat. Drake)',
      props: { fontSize: 26, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  // Timeline Progress Scrubber directly beneath cover (as seen in video)
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'ScrubberBg',
      parent: ROOT_ID,
      x: 88,
      y: 568,
      width: 420,
      height: 3,
      props: { fill: '#FFFFFF2B', cornerRadius: 2 }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'ScrubberFill',
      parent: ROOT_ID,
      x: 88,
      y: 568,
      width: 175,
      height: 3,
      props: { fill: '#FFFFFF', cornerRadius: 2 }
    }
  });

  // Track Meta & Remaining Duration (e.g. -3:26 as seen in video)
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'RemainingTime',
      parent: ROOT_ID,
      x: 466,
      y: 578,
      text: '-3:26',
      props: { fontSize: 11, fill: '#FFFFFF99', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'ElapsedTime',
      parent: ROOT_ID,
      x: 88,
      y: 578,
      text: '1:44',
      props: { fontSize: 11, fill: '#FFFFFF99', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'VideoTrackTitle',
      parent: ROOT_ID,
      x: 88,
      y: 604,
      text: 'Tuesday (feat. Drake)',
      props: { fontSize: 22, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'VideoTrackArtist',
      parent: ROOT_ID,
      x: 88,
      y: 636,
      text: 'iLoveMakonnen — Single',
      props: { fontSize: 15, fill: '#FFFFFF80', fontFamily: 'Inter' }
    }
  });

  // Floating Liquid Glass Transport Platter below Scrubber
  commands.push({
    command: 'node.create',
    params: {
      type: 'rectangle',
      name: 'MiniControlsPlatter',
      parent: ROOT_ID,
      x: 88,
      y: 680,
      width: 420,
      height: 72,
      props: {
        fill: '#FFFFFF12',
        cornerRadius: 20,
        stroke: '#FFFFFF26',
        strokeWeight: 1,
        effects: [
          { type: 'dropShadow', color: '#00000066', offset: [0, 12], radius: 28 },
          { type: 'innerShadow', color: '#FFFFFF33', offset: [0, 1], radius: 1 }
        ]
      }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'TransportPrevMini',
      parent: ROOT_ID,
      x: 180,
      y: 706,
      text: '◀◀',
      props: { fontSize: 16, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'ellipse',
      name: 'TransportPlayCircleMini',
      parent: ROOT_ID,
      x: 240,
      y: 694,
      width: 44,
      height: 44,
      props: { fill: '#FFFFFF' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'TransportPlayIconMini',
      parent: ROOT_ID,
      x: 257,
      y: 707,
      text: '▶',
      props: { fontSize: 16, fill: '#000000', fontFamily: 'Inter' }
    }
  });

  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'TransportNextMini',
      parent: ROOT_ID,
      x: 316,
      y: 706,
      text: '▶▶',
      props: { fontSize: 16, fill: '#FFFFFF', fontFamily: 'Inter' }
    }
  });

  // ---------------------------------------------------------------------------
  // RIGHT COLUMN: Expansive Unboxed Synced Lyrics (As seen in the Video!)
  // ---------------------------------------------------------------------------
  // Past Line 1 (Defocused, 35% opacity)
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'LyricPastLine1',
      parent: ROOT_ID,
      x: 600,
      y: 160,
      text: 'Got the club going up on a Tuesday',
      props: { fontSize: 28, fill: '#FFFFFF59', fontFamily: 'Inter' }
    }
  });

  // Past Line 2 (Defocused, 45% opacity)
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'LyricPastLine2',
      parent: ROOT_ID,
      x: 600,
      y: 220,
      text: "Got your girl in the cut and she ain't choosy",
      props: { fontSize: 28, fill: '#FFFFFF73', fontFamily: 'Inter' }
    }
  });

  // ACTIVE LINE: Bold, Large, Pure White #FFFFFF with Soft Glow (Exactly as in frame_06s and frame_18s)
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'ActiveLyricLine',
      parent: ROOT_ID,
      x: 600,
      y: 295,
      text: 'Club going up on a Tuesday',
      props: {
        fontSize: 40,
        fill: '#FFFFFF',
        fontFamily: 'Inter',
        effects: [
          { type: 'dropShadow', color: '#FFFFFF55', offset: [0, 0], radius: 18 }
        ]
      }
    }
  });

  // Instrumental / Vocal Pause Indicator (Three Glowing Dots as seen in frame_24s)
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'InstrumentalPauseDots',
      parent: ROOT_ID,
      x: 600,
      y: 375,
      text: '●    ●    ●',
      props: {
        fontSize: 22,
        fill: '#FFFFFF99',
        fontFamily: 'Inter',
        effects: [
          { type: 'dropShadow', color: '#FFFFFF66', offset: [0, 0], radius: 12 }
        ]
      }
    }
  });

  // Upcoming Line 1 (Softly dimmed)
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'UpcomingLine1',
      parent: ROOT_ID,
      x: 600,
      y: 440,
      text: "Got your girl in the cut and she ain't choosy",
      props: { fontSize: 32, fill: '#FFFFFF80', fontFamily: 'Inter' }
    }
  });

  // Upcoming Line 2
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'UpcomingLine2',
      parent: ROOT_ID,
      x: 600,
      y: 510,
      text: 'Club going up',
      props: { fontSize: 30, fill: '#FFFFFF59', fontFamily: 'Inter' }
    }
  });

  // Upcoming Line 3
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'UpcomingLine3',
      parent: ROOT_ID,
      x: 600,
      y: 575,
      text: 'Got the club going up',
      props: { fontSize: 28, fill: '#FFFFFF40', fontFamily: 'Inter' }
    }
  });

  // Upcoming Line 4
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'UpcomingLine4',
      parent: ROOT_ID,
      x: 600,
      y: 635,
      text: 'Got the club going up on a Tuesday',
      props: { fontSize: 26, fill: '#FFFFFF2B', fontFamily: 'Inter' }
    }
  });

  // Provider attribution at bottom
  commands.push({
    command: 'node.create',
    params: {
      type: 'text',
      name: 'LyricsProviderNote',
      parent: ROOT_ID,
      x: 600,
      y: 720,
      text: 'Apple Music Time-Synced Lyrics · LRCLIB & Musixmatch',
      props: { fontSize: 11, fill: '#8A5B6F', fontFamily: 'Inter' }
    }
  });

  return commands;
}

// Write files and run compilation
const appleNewScript = path.join(PROTO_DIR, 'proto_apple_new.json');
const appleNewFigcraft = path.join(PROTO_DIR, 'proto_apple_new.figcraft');
const appleNewPng = path.join(PROTO_DIR, 'proto_apple_new.png');

const appleLyricsScript = path.join(PROTO_DIR, 'proto_apple_lyrics.json');
const appleLyricsFigcraft = path.join(PROTO_DIR, 'proto_apple_lyrics.figcraft');
const appleLyricsPng = path.join(PROTO_DIR, 'proto_apple_lyrics.png');

console.log('Generating JSON scene graphs...');
fs.writeFileSync(appleNewScript, JSON.stringify(createAppleNewScene(), null, 2), 'utf8');
fs.writeFileSync(appleLyricsScript, JSON.stringify(createAppleLyricsScene(), null, 2), 'utf8');

console.log('Compiling View 1 (Apple New)...');
execSync(`"${CLI_PATH}" run "${appleNewScript}" --out "${appleNewFigcraft}"`, { stdio: 'inherit' });
console.log('Rendering View 1 to 2x retina PNG...');
execSync(`"${CLI_PATH}" render "${appleNewFigcraft}" -o "${appleNewPng}" --scale 2`, { stdio: 'inherit' });

console.log('Compiling View 2 (Apple Lyrics)...');
execSync(`"${CLI_PATH}" run "${appleLyricsScript}" --out "${appleLyricsFigcraft}"`, { stdio: 'inherit' });
console.log('Rendering View 2 to 2x retina PNG...');
execSync(`"${CLI_PATH}" render "${appleLyricsFigcraft}" -o "${appleLyricsPng}" --scale 2`, { stdio: 'inherit' });

console.log('All Apple Music prototypes successfully created and rendered at 2x scale!');
