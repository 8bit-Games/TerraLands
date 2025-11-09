# TerraLands (Widelands) Modernization & IP Strategy

## Executive Summary

**TerraLands** is a fork of Widelands, an open-source real-time strategy game inspired by Settlers II. This document outlines a comprehensive plan for modernizing the game for web and mobile platforms while establishing your own intellectual property.

### Current State
- **Technology**: C++17 desktop game (~136K LOC)
- **Platform**: Linux/Windows/macOS native
- **License**: GPL v2+ (code), Creative Commons (some assets)
- **Architecture**: SDL2 + OpenGL 1.2 rendering, custom game engine
- **Assets**: 17,327+ files (PNG sprites, OGG audio, Lua scripts)
- **Features**: Single-player campaigns, multiplayer, map editor, 5 factions

---

## 1. Repository Analysis

### What It Is
Widelands is a sophisticated real-time strategy game featuring:
- **Complex economy simulation**: 133+ ware types, intricate production chains
- **5 unique civilizations**: Amazons, Atlanteans, Barbarians, Empire, Frisians
- **Multiplayer**: 2-8 players via LAN/Internet with relay servers
- **Single-player**: Tutorial, campaigns, skirmish vs AI
- **Map editor**: Full-featured terrain and scenario editor
- **Scripting**: Lua-based campaign and scenario system

### Technical Architecture
```
Desktop Application
├── C++ Game Engine (136,000 LOC)
│   ├── Game Logic (map, economy, AI, pathfinding)
│   ├── Rendering (OpenGL 1.2, custom 2D isometric)
│   ├── UI Framework (custom, mouse-centric)
│   ├── Networking (TCP, lockstep multiplayer)
│   └── Scripting (Lua 5.1+, 2,314 scripts)
├── SDL2 Dependencies (window, input, audio, fonts)
├── Data Files (17,327 assets)
└── Build System (CMake, C++17)
```

### Key Dependencies (Web/Mobile Blockers)
- SDL2 suite (desktop-only window/input/audio)
- OpenGL 1.2+ (legacy pipeline, not WebGL-ready)
- Native filesystem I/O (synchronous file access)
- Desktop UI patterns (mouse-heavy, not touch-optimized)
- Large assets (104MB music, requires optimization)

---

## 2. Modernization Strategies

### Strategy A: WebAssembly Port (Moderate Effort)
**Approach**: Compile existing C++ codebase to WebAssembly using Emscripten

**Pros**:
- Reuse existing game logic (~80% code reuse)
- Faster initial deployment
- Proven approach (other SDL games have done this)

**Cons**:
- UI still needs complete redesign for touch
- Asset optimization required (100MB+ won't load fast)
- WebGL compatibility issues with legacy OpenGL
- Limited mobile performance
- Still tied to GPL v2+ license

**Technology Stack**:
- Emscripten (C++ → WebAssembly)
- WebGL 2.0 (OpenGL translation)
- SDL2 Emscripten port
- IndexedDB (save files)
- WebRTC/WebSockets (multiplayer)

**Timeline**: 6-9 months
**Cost**: 2-3 developers

---

### Strategy B: Modern Web Rewrite (High Effort, Recommended)
**Approach**: Rebuild game from scratch using modern web technologies

**Pros**:
- Modern, maintainable codebase
- Native web/mobile experience
- Superior performance on mobile
- Full design control (touch-first)
- Opportunity to create proprietary features
- Better asset pipeline and optimization

**Cons**:
- Longer development time
- Complete rewrite required
- Must reimplement game logic

**Technology Stack**:
```
Frontend (Client)
├── TypeScript 5.x
├── React 18+ or Svelte 4
├── Three.js or PixiJS (2D rendering)
├── TailwindCSS (responsive UI)
├── Zustand/Redux (state management)
├── React Native or Capacitor (mobile apps)
└── PWA (Progressive Web App)

Backend (Server)
├── Node.js 20+ or Bun
├── NestJS or Fastify (API framework)
├── PostgreSQL (user accounts, game state)
├── Redis (real-time multiplayer sessions)
├── Socket.io or WebRTC (multiplayer)
├── S3-compatible storage (maps, replays)
└── Docker + Kubernetes (deployment)

Game Engine
├── Custom TypeScript engine (port logic)
├── ECS architecture (Entity-Component-System)
├── Web Workers (game simulation)
├── WebGL 2.0 shaders
├── Lua.js (keep Lua scripts compatible)
└── Howler.js (audio)
```

**Timeline**: 12-18 months
**Cost**: 4-6 developers

---

### Strategy C: Native Mobile Apps (High Effort)
**Approach**: Build native iOS/Android apps alongside web

**Technology Options**:
1. **React Native** (recommended)
   - Single codebase for iOS/Android/Web
   - Strong ecosystem
   - Good performance

2. **Flutter**
   - Excellent UI framework
   - Growing game development support
   - Dart language (team needs to learn)

3. **Unity** (game engine approach)
   - Port to Unity engine
   - Best mobile game performance
   - Asset store ecosystem
   - Different language (C#)

**Timeline**: 10-15 months
**Cost**: 4-5 developers

---

## 3. Intellectual Property Strategy

### Legal Considerations

**Current License: GPL v2+**
- You CANNOT make the Widelands code proprietary
- Any derivative work MUST be GPL v2+ (copyleft)
- You CAN fork, rebrand, and modify freely
- You MUST share source code with users
- You CAN charge for the game/services

**Asset Licensing**:
- Current assets: Mix of GPL and Creative Commons
- You CANNOT claim original assets as proprietary
- You CAN replace all assets with original work

### Recommended IP Strategy

#### Phase 1: Fork & Rebrand
1. **Create distinct brand identity**
   - New name: "TerraLands" (already chosen)
   - New logo and visual identity
   - New website and marketing materials
   - Distinguish from Widelands project

2. **Maintain GPL compliance**
   - Keep source code open (GPL v2+)
   - Provide clear attribution to Widelands
   - Maintain COPYING and CREDITS files
   - Add your copyright notices

#### Phase 2: Original Content Creation
Create 100% original assets that can be dual-licensed:

**Art Assets** (can be proprietary):
- Commission new sprite artwork (character, buildings, terrain)
- Original 3D models (if going 3D route)
- New UI design (distinct visual style)
- Custom animations and effects
- Original sound effects and music

**Game Content** (can be proprietary):
- New civilizations/factions (not the existing 5)
- Original campaign stories and scenarios
- New maps and biomes
- Unique game mechanics and features
- Proprietary multiplayer modes

**Budget for Original Assets**:
- Art: $50,000 - $150,000 (sprites, UI, animations)
- Audio: $10,000 - $30,000 (SFX, music)
- Writers: $5,000 - $15,000 (campaigns, lore)

#### Phase 3: Proprietary Value-Add Services
Build monetizable services around the GPL core:

1. **Cloud Gaming Platform** (proprietary)
   - Hosted multiplayer servers (premium)
   - Cross-platform save sync
   - Matchmaking service
   - Leaderboards and achievements
   - Social features

2. **Premium Content** (proprietary if original)
   - Exclusive campaigns (original content)
   - Custom faction packs (original)
   - Map packs and scenarios (original)
   - Cosmetic items (skins, effects)

3. **Mobile Apps** (can package GPL code)
   - iOS App Store presence
   - Android Play Store presence
   - In-app purchases for premium content
   - Ad-supported free tier

4. **SaaS Platform** (proprietary)
   - Game hosting service
   - Tournament platform
   - Creator tools and marketplace
   - Analytics dashboard

### Business Model Options

**Option 1: Free Open Source + Premium Services**
- Core game: Free and open source (GPL)
- Premium: Hosted multiplayer, cloud saves, premium campaigns
- Revenue: Subscriptions ($5-10/month), one-time purchases

**Option 2: Freemium Mobile**
- Base game: Free with ads
- Premium: Ad-free, exclusive content, boosters
- Revenue: IAPs, ad revenue
- Note: Must still provide source code (GPL)

**Option 3: Commercial with Open Core**
- Maintain GPL compliance
- Sell on Steam/Epic/Mobile stores
- Include proprietary premium content
- Revenue: Game sales + DLC

**Option 4: B2B Licensing**
- License technology/assets to other developers
- Custom game development services
- White-label solutions
- Educational licensing

---

## 4. Phased Implementation Plan

### Phase 1: Foundation (Months 1-3)
**Goal**: Establish project infrastructure and legal foundation

**Tasks**:
- [ ] Legal review of GPL compliance strategy
- [ ] Register business entity and trademarks
- [ ] Set up development infrastructure (repo, CI/CD)
- [ ] Create brand identity (logo, colors, website)
- [ ] Assemble development team
- [ ] Choose modernization strategy (A, B, or C)
- [ ] Create detailed technical specifications
- [ ] Set up project management tools

**Deliverables**:
- Legal documentation
- Brand assets
- Development environment
- Technical architecture document
- Project roadmap

**Budget**: $20,000 - $40,000

---

### Phase 2: Core Engine Development (Months 4-9)
**Goal**: Build foundational game engine for web/mobile

**Strategy B (Web Rewrite) Tasks**:
- [ ] Set up TypeScript + React/Svelte project
- [ ] Implement rendering engine (PixiJS/Three.js)
- [ ] Port core game logic (map, objects, economy)
- [ ] Build ECS architecture for game entities
- [ ] Implement pathfinding algorithms (A*)
- [ ] Create basic UI framework (touch-ready)
- [ ] Build asset loading pipeline
- [ ] Implement save/load system (IndexedDB)
- [ ] Set up automated testing

**Deliverables**:
- Working game engine prototype
- Basic rendering and UI
- Core game mechanics functional
- Unit tests and documentation

**Team**: 4-6 developers
**Budget**: $200,000 - $360,000

---

### Phase 3: Content Creation (Months 7-12)
**Goal**: Create original game content and assets

**Parallel workstream to Phase 2**:

**Art & Design**:
- [ ] Commission sprite artwork for 2 original factions
- [ ] Design and create UI assets (touch-optimized)
- [ ] Create terrain and building sprites
- [ ] Design unit animations
- [ ] Develop visual effects

**Audio**:
- [ ] Compose original music (5-10 tracks)
- [ ] Record sound effects (200+ SFX)
- [ ] Voice acting for campaigns (optional)

**Game Design**:
- [ ] Design 2 unique original factions
- [ ] Write tutorial campaign
- [ ] Create 10+ skirmish maps
- [ ] Design multiplayer modes
- [ ] Balance gameplay mechanics

**Deliverables**:
- Complete asset library
- Original game content
- Style guide and design docs

**Team**: 3-4 artists, 2-3 designers, 1-2 audio
**Budget**: $80,000 - $200,000

---

### Phase 4: Multiplayer & Backend (Months 10-14)
**Goal**: Implement multiplayer and cloud services

**Tasks**:
- [ ] Build game server infrastructure
- [ ] Implement WebSocket/WebRTC multiplayer
- [ ] Create matchmaking system
- [ ] Build user authentication (OAuth, JWT)
- [ ] Implement cloud save sync
- [ ] Create lobby and chat system
- [ ] Build leaderboards and stats
- [ ] Set up game hosting service
- [ ] Implement anti-cheat measures
- [ ] Load testing and optimization

**Deliverables**:
- Multiplayer game servers
- User account system
- Cloud infrastructure
- Admin dashboard

**Team**: 3-4 backend developers, 1 DevOps
**Budget**: $120,000 - $200,000

---

### Phase 5: Mobile Development (Months 13-17)
**Goal**: Launch native mobile apps

**React Native Approach**:
- [ ] Set up React Native project (iOS/Android)
- [ ] Optimize UI for mobile screens
- [ ] Implement touch controls
- [ ] Optimize performance for mobile devices
- [ ] Integrate mobile-specific features (push notifications)
- [ ] Implement IAP system
- [ ] Set up app store accounts
- [ ] Beta testing (TestFlight, Play Console)
- [ ] App store optimization (ASO)
- [ ] Prepare marketing materials

**Deliverables**:
- iOS app (App Store)
- Android app (Play Store)
- Mobile-optimized experience

**Team**: 2-3 mobile developers
**Budget**: $80,000 - $150,000

---

### Phase 6: Polish & Launch (Months 16-18)
**Goal**: Prepare for public launch

**Tasks**:
- [ ] Comprehensive QA testing
- [ ] Performance optimization
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Localization (5+ languages)
- [ ] Create marketing website
- [ ] Produce trailer and screenshots
- [ ] Set up community forums/Discord
- [ ] Prepare press kit
- [ ] Influencer outreach
- [ ] Launch marketing campaign
- [ ] Monitor and fix launch issues
- [ ] Gather user feedback

**Deliverables**:
- Polished game ready for public
- Marketing materials
- Community infrastructure
- Launch event

**Team**: 2 QA, 1 marketing, 1 community manager
**Budget**: $60,000 - $100,000

---

## 5. Technology Recommendations

### Recommended Stack (Strategy B - Web Rewrite)

```typescript
// Frontend Architecture
{
  "framework": "React 18 + TypeScript 5",
  "rendering": "PixiJS 7 (2D) or Three.js (3D)",
  "ui": "TailwindCSS + Radix UI",
  "state": "Zustand + React Query",
  "routing": "React Router 6",
  "mobile": "Capacitor 5 (iOS/Android)",
  "pwa": "Workbox (offline support)",
  "build": "Vite 5"
}

// Backend Architecture
{
  "runtime": "Node.js 20 LTS",
  "framework": "NestJS 10",
  "database": "PostgreSQL 16",
  "cache": "Redis 7",
  "realtime": "Socket.io 4",
  "auth": "Passport.js + JWT",
  "orm": "Prisma 5",
  "storage": "MinIO (S3-compatible)",
  "queue": "BullMQ"
}

// Infrastructure
{
  "hosting": "AWS/GCP/DigitalOcean",
  "containers": "Docker + Kubernetes",
  "cdn": "CloudFlare",
  "monitoring": "Grafana + Prometheus",
  "logging": "ELK Stack",
  "ci_cd": "GitHub Actions",
  "analytics": "PostHog (privacy-friendly)"
}

// Game Engine
{
  "architecture": "ECS (Entity-Component-System)",
  "scripting": "Lua.js (keep compatibility)",
  "audio": "Howler.js",
  "physics": "Matter.js (if needed)",
  "compression": "pako (zlib for web)",
  "serialization": "MessagePack"
}
```

### Performance Targets
- **Load time**: < 5 seconds (initial)
- **FPS**: 60fps on mid-range devices
- **Mobile**: Smooth on iPhone 11+, Pixel 5+
- **Network**: Playable on 4G (< 100ms latency)
- **Bundle size**: < 5MB (initial), lazy-load content

---

## 6. Cost Estimates & Timeline

### Total Budget Range: $560,000 - $1,050,000

| Phase | Duration | Team Size | Cost |
|-------|----------|-----------|------|
| Phase 1: Foundation | 3 months | 2-3 people | $20K - $40K |
| Phase 2: Core Engine | 6 months | 4-6 devs | $200K - $360K |
| Phase 3: Content | 6 months | 6-9 creators | $80K - $200K |
| Phase 4: Multiplayer | 5 months | 4-5 devs | $120K - $200K |
| Phase 5: Mobile | 5 months | 2-3 devs | $80K - $150K |
| Phase 6: Launch | 3 months | 4-5 people | $60K - $100K |

**Timeline**: 18 months (with parallel workstreams)

### Ongoing Costs (Annual)
- **Infrastructure**: $12,000 - $30,000/year
- **Support & Maintenance**: $80,000 - $150,000/year
- **Content Updates**: $50,000 - $100,000/year
- **Marketing**: $30,000 - $100,000/year

**Total**: ~$172,000 - $380,000/year

---

## 7. Risk Assessment

### Technical Risks

**High Risk**:
- Performance on low-end mobile devices
- Multiplayer synchronization complexity
- Large asset optimization for web

**Mitigation**:
- Early performance testing
- Prototype multiplayer architecture first
- Invest in asset pipeline tooling

### Legal Risks

**High Risk**:
- GPL compliance violations
- Accidental proprietary licensing of GPL code
- Trademark conflicts with "Widelands"

**Mitigation**:
- Legal review before launch
- Clear separation of GPL and proprietary code
- Distinct branding and attribution

### Business Risks

**Medium Risk**:
- Market saturation (many RTS games)
- User acquisition costs
- Retention in free-to-play market

**Mitigation**:
- Unique positioning (authentic web RTS)
- Community-driven growth
- Focus on quality and depth

---

## 8. Success Metrics

### Year 1 Goals
- 100,000+ registered users
- 10,000+ monthly active users
- 1,000+ paying customers
- 4.0+ star rating on app stores
- $50,000+ monthly recurring revenue

### Year 2 Goals
- 500,000+ registered users
- 50,000+ monthly active users
- $200,000+ monthly recurring revenue
- Break-even on development costs
- 90% multiplayer match success rate

### Technical Metrics
- 99.9% uptime
- < 100ms average API latency
- < 5% crash rate on mobile
- 60 FPS on 80%+ devices

---

## 9. Competitive Analysis

### Market Position

**Direct Competitors**:
- Age of Empires (Mobile)
- Northgard (Mobile)
- Rusted Warfare (Mobile RTS)
- They Are Billions

**Competitive Advantages**:
- True web-based (no download needed)
- Open-source heritage (community trust)
- Deep economic simulation
- Cross-platform (web + mobile)
- Free to play with ethical monetization

**Differentiation Strategy**:
1. Emphasize web accessibility
2. Community modding support
3. Educational use cases (schools)
4. Ethical open-source model
5. Superior economic simulation depth

---

## 10. Recommended Next Steps

### Immediate Actions (Next 30 Days)

1. **Legal Setup**
   - Consult with open-source lawyer
   - Register business entity
   - File trademark for "TerraLands"

2. **Strategic Decision**
   - Choose modernization strategy (A, B, or C)
   - Decide on business model
   - Set fundraising goals (if needed)

3. **Team Building**
   - Hire technical lead
   - Recruit core development team
   - Find game design consultant

4. **Technical Prototype**
   - Build proof-of-concept (2 weeks)
   - Test rendering engine choice
   - Validate mobile performance

5. **Market Research**
   - Survey potential users
   - Analyze competitors
   - Validate pricing model

### Decision Points

**You must decide**:
1. **Strategy**: WebAssembly port vs. Full rewrite vs. Native mobile?
2. **Business Model**: Free+Premium vs. Freemium vs. Paid+DLC?
3. **Funding**: Bootstrap vs. Raise capital vs. Crowdfunding?
4. **Timeline**: Fast launch (9mo) vs. Polished (18mo)?
5. **Scope**: Web-only first vs. Web+Mobile simultaneous?

---

## 11. Conclusion & Recommendation

### Recommended Approach: **Strategy B (Web Rewrite)**

**Why**:
- Best long-term maintainability
- Superior mobile experience
- Full control over IP (for new content)
- Modern developer experience
- Competitive performance

**Path Forward**:

1. **Months 1-3**: Build foundation, legal setup, team assembly
2. **Months 4-9**: Core engine development (web-first)
3. **Months 10-15**: Content creation + multiplayer
4. **Months 16-18**: Mobile apps + polish + launch

**Initial Investment**: $560K - $1.05M
**Time to MVP**: 12 months
**Time to Full Launch**: 18 months

### Creating Your Own IP

**You can own**:
- Brand and trademarks (TerraLands)
- Original artwork and assets
- New game content (factions, campaigns)
- Proprietary cloud services
- Mobile app packaging

**You must keep open (GPL)**:
- Core game engine code
- Ported logic from Widelands
- Modified game mechanics

**Monetization Strategy**:
- Free web version (with ads)
- Premium subscription ($5-10/mo)
- Mobile apps with IAP
- DLC content packs ($5-15 each)
- Enterprise/education licensing

**Revenue Projection Year 1**: $100K - $300K
**Revenue Projection Year 2**: $400K - $1M

---

## Appendix A: GPL Compliance Checklist

- [ ] Provide source code download on website
- [ ] Include COPYING file with GPL v2+ text
- [ ] Add copyright notices to new files
- [ ] Maintain attribution to Widelands project
- [ ] Provide build instructions
- [ ] Clearly separate proprietary content
- [ ] Do not use GPL code in proprietary services
- [ ] Offer source code to all users
- [ ] Document all modifications

## Appendix B: Technology Alternatives

### Rendering Engines
- **PixiJS**: Best for 2D sprites (recommended)
- **Three.js**: If going 3D route
- **Babylon.js**: Alternative 3D engine
- **Phaser**: Full game framework option

### Mobile Frameworks
- **React Native**: Best for web+mobile shared code
- **Flutter**: If team knows Dart
- **Capacitor**: Wrap web app for mobile
- **Native**: Best performance, most effort

### Backend Alternatives
- **Supabase**: Firebase alternative (open source)
- **Appwrite**: Backend-as-a-Service
- **PocketBase**: Lightweight Go backend
- **Custom Go/Rust**: For maximum performance

---

**Document Version**: 1.0
**Last Updated**: November 9, 2025
**Author**: Claude (AI Assistant)
**Status**: Draft for Review
