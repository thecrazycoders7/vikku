// Photoreal 3D studio behind the homepage story: the camera walks from the street through
// lobby, AI lab, industries wall, process wall and client lounge to the founder's office as
// story.target goes 0 → 1. Furniture, textures and backdrops are Poly Haven (CC0) assets in
// /public/home3d. Returns a cleanup function.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BASE = '/home3d/';

export async function createStudio({ canvas, loadingEl, story }) {

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = innerWidth < 720;
  const hq = !narrow; // ponytail: ambient occlusion and 2k shadows on wide screens only; phones get 1k shadows, no AO

  // Wait for web fonts so the signage drawn on canvases uses them (max 2.5s).
  await Promise.race([
    Promise.all(['700 40px Unbounded', '500 40px Unbounded', 'italic 40px "Instrument Serif"', '500 20px Manrope', '500 20px "JetBrains Mono"'].map(f => document.fonts.load(f))),
    new Promise(r => setTimeout(r, 2500))
  ]).catch(() => {});
  const logo = new Image();
  logo.src = '/logo.png';
  await logo.decode().catch(() => {});
  const drawLogo = (x, ...box) => { if (logo.naturalWidth) x.drawImage(logo, ...box); };

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { loadingEl.hidden = true; return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, hq ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xdfe2e4);
  const camera = new THREE.PerspectiveCamera(60, 1, .05, 600);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  let streetEnv = null;
  scene.environment = roomEnv;

  const manager = new THREE.LoadingManager();
  manager.onProgress = (url, done, total) => { loadingEl.textContent = `Furnishing the studio… ${Math.round(done / total * 100)}%`; };
  manager.onLoad = () => { loadingEl.hidden = true; };
  const texLoader = new THREE.TextureLoader(manager);
  const gltfLoader = new GLTFLoader(manager);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  // ---------- materials ----------
  function T(file, srgb) {
    const t = texLoader.load(BASE + 'tex/' + file);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  // A Poly Haven texture set as a PBR material; `tint` replaces the photo colour (plaster is painted white).
  function pbr(name, o = {}, tint) {
    const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: 1 }, o));
    if (!tint) m.map = T(name + '_Diffuse.jpg', true); else m.color.set(tint);
    m.normalMap = T(name + '_nor_gl.jpg');
    m.roughnessMap = T(name + '_Rough.jpg');
    return m;
  }
  const mat = {
    oakFloor: pbr('laminate_floor_02'),
    marble: pbr('marble_01', { color: 0xf4f1ec }),
    oak: pbr('white_oak_veneer'),
    concrete: pbr('concrete_floor_01'),
    plaster: pbr('white_plaster_02', { normalScale: new THREE.Vector2(.35, .35) }, 0xebe7e1),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xf0eeea, roughness: .95 }),
    skirting: new THREE.MeshStandardMaterial({ color: 0xe6e1da, roughness: .6 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: .38, metalness: .85 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xff6a13, roughness: .32, clearcoat: .6, clearcoatRoughness: .2 }),
    solid: new THREE.MeshPhysicalMaterial({ color: 0xf7f6f3, roughness: .28, clearcoat: .4 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: .32, metalness: .9 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xfbfbfa, roughness: .18, clearcoat: 1 }),
    keys: new THREE.MeshStandardMaterial({ color: 0xe9e9eb, roughness: .55 }),
    rug: new THREE.MeshStandardMaterial({ color: 0xe8ddd2, roughness: 1 }),
    tinted: new THREE.MeshPhysicalMaterial({ color: 0x6d7a82, metalness: .7, roughness: .06, clearcoat: 1 }),
    led: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    mat: new THREE.MeshStandardMaterial({ color: 0x2b2725, roughness: 1 })
  };
  // Ambient (environment) light is kept below the key lights so shadows and occlusion read clearly.
  const ENV = .38;
  Object.values(mat).forEach(m => { if ('envMapIntensity' in m) m.envMapIntensity = ENV; });
  const glassMeshes = [];
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xf2f6f7, transparent: true, opacity: .12, roughness: .03, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, depthWrite: false, side: THREE.DoubleSide });

  // ---------- geometry helpers ----------
  // Box whose UVs are scaled to world metres, so tiled textures keep their real size on any wall.
  function tiledBox(w, h, d, tile) {
    const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
    const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * dims[f][0] / tile, uv.getY(k) * dims[f][1] / tile);
    }
    return g;
  }
  function box(w, h, d, m, x, y, z, o = {}) {
    const geo = o.round ? new RoundedBoxGeometry(w, h, d, 3, o.round) : o.tile ? tiledBox(w, h, d, o.tile) : new THREE.BoxGeometry(w, h, d);
    const b = new THREE.Mesh(geo, m);
    b.position.set(x, y, z);
    if (o.ry) b.rotation.y = o.ry;
    b.castShadow = o.cast !== false && m !== glass;
    b.receiveShadow = true;
    (o.parent || scene).add(b);
    if (m === glass) glassMeshes.push(b);
    return b;
  }
  const C = { ink: '#1a1612', muted: '#6e645b', line: '#efe8e2', orange: '#ff6a13', soft: '#ffb38a' };
  const F = { d: 'Unbounded, "Arial Black", sans-serif', s: '"Instrument Serif", Georgia, serif', b: 'Manrope, Arial, sans-serif', m: '"JetBrains Mono", Menlo, monospace' };
  function tex(w, h, draw) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.textBaseline = 'middle';
    draw(x, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  }
  function font(x, weight, size, fam, text, maxW) {
    do x.font = `${weight} ${size}px ${fam}`; while (text && maxW && x.measureText(text).width > maxW && (size -= 2) > 10);
  }
  function wrap(x, text, X, Y, maxW, lh) {
    let line = '';
    for (const w of text.split(' ')) {
      const test = line ? line + ' ' + w : w;
      if (x.measureText(test).width > maxW && line) { x.fillText(line, X, Y); line = w; Y += lh; } else line = test;
    }
    x.fillText(line, X, Y);
  }
  // Printed graphic on a plane; ry turns it to face into the room (left wall +PI/2, right wall -PI/2).
  function print(w, h, map, x, y, z, ry = 0, o = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      o.screen ? new THREE.MeshBasicMaterial({ map, toneMapped: false })
               : new THREE.MeshStandardMaterial({ map, roughness: .85, transparent: !!o.clear, alphaTest: o.clear ? .02 : 0 }));
    m.position.set(x, y, z); m.rotation.y = ry;
    m.receiveShadow = !o.screen;
    scene.add(m);
    return m;
  }
  let seed = 7;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;

  // ---------- printed textures ----------
  const signTex = tex(2048, 320, (x, w, h) => {
    font(x, 700, 150, F.d);
    const L = 290, gap = 50, a = 'VIKKU', b = '', wa = x.measureText(a).width, wb = x.measureText(b).width;
    const sx = (w - L - gap - wa - wb) / 2;
    drawLogo(x, sx, (h - L) / 2, L, L);
    x.fillStyle = C.ink; x.fillText(a, sx + L + gap, h / 2);
    x.fillStyle = C.ink; x.fillText(b, sx + L + gap + wa, h / 2);
  });
  const lobbyTex = tex(2048, 760, (x, w, h) => {
    drawLogo(x, 60, 40, 230, 230);
    x.fillStyle = C.ink; font(x, 700, 110, F.d); x.fillText('VIKKU', 320, 155);
    const wv = x.measureText('VIKKU').width;
    x.fillStyle = C.orange; font(x, 500, 40, F.m); x.fillText('AI AGENCY', 370 + wv, 162);
    x.fillStyle = C.orange; font(x, 'italic 400', 96, F.s);
    x.fillText('We turn complex business problems', 90, 330); x.fillText('into practical AI solutions.', 90, 420);
    [['9', 'Projects delivered'], ['8+', 'Clients'], ['IN · US', 'Clients across India and the USA']].forEach(([n, l], i) => {
      const X = 90 + i * 560;
      x.fillStyle = C.ink; font(x, 700, 90, F.d); x.fillText(n, X, 560);
      x.fillStyle = C.muted; font(x, 500, 36, F.b); wrap(x, l, X, 660, 480, 46);
    });
  });
  const deskTex = tex(1024, 280, (x, w, h) => {
    drawLogo(x, 120, (h - 170) / 2, 170, 170);
    x.fillStyle = C.ink; font(x, 700, 84, F.d); x.fillText('VIKKU', 315, h / 2 + 4);
  });
  const studioTex = tex(1024, 200, (x, w, h) => {
    x.fillStyle = C.ink; font(x, 500, 64, F.m); x.textAlign = 'center'; x.fillText('AI LAB →', w / 2, h / 2);
  });
  const screens = [0, 1, 2, 3].map(kind => tex(640, 384, (x, w, h) => {
    x.fillStyle = '#16130f'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#26211d'; x.fillRect(0, 0, w, 30);
    x.fillStyle = C.orange; x.beginPath(); x.arc(18, 15, 5, 0, 7); x.fill();
    if (kind === 0) {
      for (let i = 0; i < 3; i++) {
        x.fillStyle = '#231e1a'; x.fillRect(20 + i * 205, 48, 188, 76);
        x.fillStyle = i ? '#8a7f75' : C.orange; x.fillRect(36 + i * 205, 66, 70, 10);
        x.fillStyle = '#f4f1ed'; x.fillRect(36 + i * 205, 90, 110, 16);
      }
      for (let i = 0; i < 14; i++) { const bh = 40 + rnd() * 170; x.fillStyle = i === 9 ? C.orange : '#4a413a'; x.fillRect(28 + i * 43, 368 - bh, 28, bh); }
    } else if (kind === 1) {
      let y = 54;
      for (let i = 0; i < 16; i++) {
        let X = 24 + (i % 4) * 18;
        for (let j = 0, n = 2 + Math.floor(rnd() * 4); j < n; j++) {
          const ww = 24 + rnd() * 90;
          x.fillStyle = [C.orange, '#f4f1ed', '#8a7f75', C.soft][Math.floor(rnd() * 4)];
          x.fillRect(X, y, ww, 9); X += ww + 12;
        }
        y += 20;
      }
    } else if (kind === 2) {
      let y = 52;
      [[0, 340], [1, 230], [0, 400], [1, 180], [0, 290]].forEach(([me, ww]) => {
        x.fillStyle = me ? C.orange : '#2f2925'; x.fillRect(me ? w - 20 - ww : 20, y, ww, 42); y += 62;
      });
    } else {
      for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
        const X = 20 + c * 152, Y = 48 + r * 166;
        x.fillStyle = '#231e1a'; x.fillRect(X, Y, 138, 152);
        x.fillStyle = (r + c) % 3 ? '#4a413a' : C.orange; x.fillRect(X + 12, Y + 12, 114, 86);
        x.fillStyle = '#f4f1ed'; x.fillRect(X + 12, Y + 110, 76, 9);
        x.fillStyle = C.orange; x.fillRect(X + 12, Y + 128, 42, 9);
      }
    }
  }));
  const boards = [
    ['01', 'Discover', 'Workflows, systems and the outcome you need.'],
    ['02', 'Design', 'Architecture, integrations, data and permissions.'],
    ['03', 'Build', 'Development, AI integration, testing, approvals.'],
    ['04', 'Deploy', 'Launch, monitoring, documentation, training.'],
    ['05', 'Improve', 'Evaluate quality, fix failures, optimise cost.']
  ].map(([n, t, d]) => tex(780, 520, (x, w, h) => {
    x.fillStyle = '#fbfaf8'; x.fillRect(0, 0, w, h);
    x.fillStyle = C.orange; font(x, 700, 120, F.d); x.fillText(n, 56, 120);
    x.fillStyle = C.ink; font(x, 500, 70, F.d); x.fillText(t, 56, 270);
    x.fillStyle = C.muted; font(x, 500, 34, F.b); wrap(x, d, 56, 370, w - 112, 46);
  }));
  const plaques = [['TapByWisein', 'NFC networking'], ['Unisys Infotech', 'IT solutions'], ['Jobly Solutions', 'Recruitment & staffing'],
    ['Media Manager 4U', 'Media management'], ['Rolex Ads', 'Advertising & marketing'], ['Nivi Collections', 'Fashion']]
    .map(([n, d]) => tex(640, 352, (x, w, h) => {
      x.fillStyle = '#fbfaf8'; x.fillRect(0, 0, w, h);
      x.textAlign = 'center';
      x.fillStyle = C.ink; font(x, 500, 46, F.d, n, w - 70); x.fillText(n, w / 2, h / 2 - 18);
      x.fillStyle = C.orange; font(x, 500, 26, F.m); x.fillText(d.toUpperCase(), w / 2, h / 2 + 48);
    }));
  const loungeTex = tex(1600, 220, (x, w, h) => {
    x.textAlign = 'center'; x.fillStyle = C.orange; font(x, 'italic 400', 150, F.s);
    x.fillText('Trusted by founders', w / 2, h / 2);
  });
  const laptopTex = tex(640, 400, (x, w, h) => {
    x.fillStyle = '#fbfaf8'; x.fillRect(0, 0, w, h);
    drawLogo(x, w - 130, 28, 90, 90);
    x.fillStyle = C.ink; font(x, 500, 46, F.d); x.fillText("Let's build", 40, 100);
    x.fillStyle = C.orange; font(x, 'italic 400', 64, F.s); x.fillText('your AI.', 40, 170);
    x.fillStyle = C.orange; x.fillRect(40, 240, 230, 60);
    x.fillStyle = '#fff'; font(x, 700, 26, F.b); x.fillText('Book a call', 76, 271);
    x.fillStyle = C.muted; font(x, 500, 24, F.m); x.fillText('connect@vikku.in', 40, 350);
  });
  const rugTex = tex(512, 512, (x, w, h) => {
    x.fillStyle = '#e9ded3'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) { x.fillStyle = `rgba(${120 + rnd() * 80},${100 + rnd() * 60},${80 + rnd() * 50},.07)`; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2); }
    x.strokeStyle = 'rgba(255,106,19,.55)'; x.lineWidth = 10; x.strokeRect(34, 34, w - 68, h - 68);
  });
  mat.rug.map = rugTex;

  // ---------- the street ----------
  texLoader.load(BASE + 'tex/modern_buildings.jpg', t => {
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace;
    scene.background = t;
    streetEnv = pmrem.fromEquirectangular(t).texture;
  });
  box(300, .1, 300, mat.concrete, 0, -.07, 120, { tile: 3, cast: false });
  box(4, .02, 14, mat.marble, 0, .005, 7.4, { tile: 1.5, cast: false });
  box(2.2, .02, 1.2, mat.mat, 0, .02, 1.1, { cast: false });

  // Facade: glass storefront in front of the hall, plaster wings, an upper band with the sign and a window strip.
  const H = 4.2;
  box(5.2, H, .4, mat.plaster, -9.6, H / 2, .2, { tile: 3, cast: false });
  box(5.2, H, .4, mat.plaster, 9.6, H / 2, .2, { tile: 3, cast: false });
  box(24.4, 4.2, .4, mat.plaster, 0, H + 2.1, .2, { tile: 3, cast: false });
  [[-4.15, 5.7], [4.15, 5.7]].forEach(([x, w]) => box(w, H, .03, glass, x, H / 2, .3));
  box(2.6, 1.4, .03, glass, 0, 3.5, .3);
  [-7, -5.2, -3.4, -1.3, 1.3, 3.4, 5.2, 7].forEach(x => box(.07, H, .12, mat.steel, x, H / 2, .32));
  box(14, .07, .12, mat.steel, 0, 2.82, .32);
  box(14, .09, .14, mat.steel, 0, H - .05, .32);
  box(14, .06, .14, mat.steel, 0, .03, .32);
  box(14, 1.7, .05, mat.tinted, 0, 6.6, .42, { cast: false });
  for (let x = -7; x <= 7; x += 1.75) box(.06, 1.76, .1, mat.steel, x, 6.6, .45, { cast: false });
  box(24.4, .12, .5, mat.steel, 0, 8.36, .2, { cast: false });
  box(4.4, .1, 1.9, mat.steel, 0, 3.05, 1.15);
  const signMesh = print(6.6, 1.03, signTex, 0, 4.85, .41, 0, { clear: true });
  signMesh.castShadow = false;

  function slidingDoor(z) {
    return [-1, 1].map(side => {
      const g = new THREE.Group();
      box(1.3, 2.78, .025, glass, 0, 1.39, 0, { parent: g });
      box(.05, 2.78, .06, mat.steel, -side * .63, 1.39, 0, { parent: g });
      box(.05, 2.78, .06, mat.steel, side * .63, 1.39, 0, { parent: g });
      box(1.3, .05, .06, mat.steel, 0, 2.76, 0, { parent: g });
      box(.03, 1.1, .05, mat.orange, -side * .5, 1.15, .06, { parent: g });
      g.position.set(side * .65, 0, z);
      scene.add(g);
      return g;
    });
  }
  const frontDoors = slidingDoor(.36);

  // ---------- hall shell (z 0 → -60) ----------
  box(14, .1, 13, mat.marble, 0, -.05, -6.5, { tile: 1.6, cast: false });
  box(14, .1, 47, mat.oakFloor, 0, -.05, -36.5, { tile: 1.8, cast: false });
  box(14, .1, 60.4, mat.ceiling, 0, H + .05, -30, { cast: false });
  box(.3, H, 60.4, mat.plaster, -7.15, H / 2, -30, { tile: 3, cast: false });
  box(.3, H, 60.4, mat.plaster, 7.15, H / 2, -30, { tile: 3, cast: false });
  box(.03, .1, 60, mat.skirting, -6.985, .05, -30, { cast: false });
  box(.03, .1, 60, mat.skirting, 6.985, .05, -30, { cast: false });
  for (let z = -3; z > -58; z -= 3.5) [-2.4, 2.4].forEach(x => box(.1, .02, 2.2, mat.led, x, H - .01, z, { cast: false }));

  // ---------- lobby ----------
  print(7.4, 2.75, lobbyTex, -6.99, 2.6, -6.5, Math.PI / 2, { clear: true });
  box(1.1, 1.02, 3.6, mat.solid, 4.2, .51, -6.5, { round: .05 });
  box(1.3, .05, 3.8, mat.oak, 4.2, 1.045, -6.5, { round: .02 });
  box(.02, .05, 3.6, mat.orange, 3.645, .93, -6.5);
  print(2.6, .71, deskTex, 3.635, .5, -6.5, -Math.PI / 2, { clear: true });
  box(.02, .06, 3.2, mat.led, 3.66, .08, -6.5, { cast: false });

  // ---------- glass partition into the studio ----------
  box(5.7, H, .03, glass, -4.15, H / 2, -13);
  box(5.7, H, .03, glass, 4.15, H / 2, -13);
  box(2.6, 1.4, .03, glass, 0, 3.5, -13);
  box(14, .08, .1, mat.steel, 0, H - .04, -13, { cast: false });
  box(14, .05, .1, mat.steel, 0, .03, -13, { cast: false });
  box(2.6, .07, .1, mat.steel, 0, 2.82, -13, { cast: false });
  [-4, -1.3, 1.3, 4].forEach(x => box(.07, H, .1, mat.steel, x, H / 2, -13, { cast: false }));
  print(2.2, .43, studioTex, 0, 3.4, -12.97, 0, { clear: true });
  const innerDoors = slidingDoor(-13.06);

  // ---------- studio ----------
  let si = 0;
  const studioDesks = [];
  // Desks only on the right: the left wall is the industries gallery.
  [-17, -22, -27].forEach(z => [1].forEach(s => {
    const x = s * 4.6;
    box(1.2, .04, 2.6, mat.oak, x, .74, z, { round: .015 });
    [-1.2, 1.2].forEach(dz => {
      box(1.05, .04, .05, mat.steel, x, .7, z + dz);
      box(.05, .7, .05, mat.steel, x - .5, .35, z + dz);
      box(.05, .7, .05, mat.steel, x + .5, .35, z + dz);
    });
    [-.62, .62].forEach(dz => {
      const g = new THREE.Group();
      box(1.02, .6, .03, mat.steel, 0, .5, 0, { parent: g, round: .012 });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(.98, .565), new THREE.MeshBasicMaterial({ map: screens[si++ % 4], toneMapped: false }));
      scr.position.set(0, .5, .017); g.add(scr);
      box(.05, .25, .03, mat.alu, 0, .12, -.04, { parent: g });
      box(.26, .012, .2, mat.alu, 0, .006, -.02, { parent: g, round: .005 });
      g.position.set(s * 4.3, .76, z + dz);
      g.rotation.y = -s * Math.PI / 2;
      scene.add(g);
      box(.14, .018, .44, mat.keys, s * 4.75, .77, z + dz, { round: .006 });
    });
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(.042, .037, .1, 24), mat.ceramic);
    mug.position.set(s * 4.85, .81, z + 1.05); mug.castShadow = true; scene.add(mug);
    studioDesks.push([x, z, s]);
  }));

  // Oak slat feature wall behind the right-hand desks.
  const slats = new THREE.InstancedMesh(new THREE.BoxGeometry(.05, H - .02, .045), mat.oak, 168);
  for (let i = 0; i < 168; i++) slats.setMatrixAt(i, new THREE.Matrix4().makeTranslation(6.97, H / 2, -13.4 - i * .1));
  slats.receiveShadow = true;
  scene.add(slats);
  // Industries wall on the left of the AI lab: six framed solution areas under a heading.
  const industries = [
    ['Healthcare', ['Appointment coordination', 'Patient inquiry assistants', 'Admin workflow automation']],
    ['Recruitment & staffing', ['Resume and document processing', 'Candidate workflows', 'Client reporting']],
    ['Retail & e-commerce', ['Support automation', 'Order inquiries', 'Catalog enrichment']],
    ['Professional services', ['Lead qualification', 'Proposal assistance', 'Customer follow-ups']],
    ['Sales & marketing', ['Lead routing', 'CRM automation', 'Campaign reporting']],
    ['Agriculture', ['Crop information assistants', 'Farmer support workflows', 'Agricultural data apps']]
  ].map(([t, uses]) => tex(780, 420, (x, w, h) => {
    x.fillStyle = '#fbfaf8'; x.fillRect(0, 0, w, h);
    x.fillStyle = C.orange; x.fillRect(48, 46, 46, 6);
    x.fillStyle = C.ink; font(x, 500, 50, F.d, t, w - 96); x.fillText(t, 48, 112);
    x.fillStyle = C.muted; font(x, 500, 32, F.b);
    uses.forEach((u, i) => { x.fillStyle = C.orange; x.fillRect(50, 200 + i * 62, 10, 10); x.fillStyle = C.muted; x.fillText(u, 76, 206 + i * 62); });
  }));
  const industryHead = tex(1600, 200, (x, w, h) => {
    x.textAlign = 'center'; x.fillStyle = C.orange; font(x, 'italic 400', 140, F.s);
    x.fillText('Where AI earns its place', w / 2, h / 2);
  });
  print(6.4, .8, industryHead, -6.97, 3.62, -21.5, Math.PI / 2, { clear: true });
  industries.forEach((m, i) => {
    const z = -18.6 - (i % 3) * 2.9, y = i < 3 ? 2.55 : 1.05;
    box(.04, 1.48, 2.7, mat.steel, -6.98, y, z, { cast: false });
    print(2.6, 1.4, m, -6.955, y, z, Math.PI / 2);
  });

  // ---------- partition between studio and process wall ----------
  box(4.9, H, .18, mat.plaster, -4.55, H / 2, -30.5, { tile: 3, cast: false });
  box(4.9, H, .18, mat.plaster, 4.55, H / 2, -30.5, { tile: 3, cast: false });
  box(4.2, .9, .18, mat.plaster, 0, H - .45, -30.5, { tile: 3, cast: false });

  // ---------- process wall (left wall, so 01 → 05 reads left to right) ----------
  [-31.9, -34.3, -36.7, -39.1, -41.5].forEach((z, i) => {
    box(.04, 1.56, 2.3, mat.steel, -6.98, 1.95, z, { cast: false });
    print(2.2, 1.47, boards[i], -6.955, 1.95, z, Math.PI / 2);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.07, 20, 16), mat.orange);
    dot.position.set(-6.94, 3.12, z); scene.add(dot);
  });
  box(.02, .02, 9.6, mat.orange, -6.955, 3.12, -36.7, { cast: false });
  box(.46, .05, 2.6, mat.oak, -5.4, .44, -36.8, { round: .015 });
  [-1.1, 1.1].forEach(dz => box(.4, .42, .04, mat.steel, -5.4, .21, -36.8 + dz));

  // ---------- client lounge ----------
  print(6.2, .85, loungeTex, 6.97, 3.45, -46.4, -Math.PI / 2, { clear: true });
  plaques.forEach((p, i) => {
    const z = -44.2 - (i % 3) * 2.2, y = i < 3 ? 2.45 : 1.25;
    box(.04, 1.16, 2.06, mat.steel, 6.98, y, z, { cast: false });
    print(1.98, 1.09, p, 6.955, y, z, -Math.PI / 2);
  });
  box(3.2, .015, 4.2, mat.rug, -3.8, .008, -47.6, { cast: false });

  // ---------- founder's office: glass partition, desk, sunset window ----------
  box(5.6, H, .03, glass, -4.2, H / 2, -52);
  box(5.6, H, .03, glass, 4.2, H / 2, -52);
  box(2.8, 1.2, .03, glass, 0, 3.6, -52);
  [-7, -4.2, -1.4, 1.4, 4.2, 7].forEach(x => box(.06, H, .08, mat.steel, x, H / 2, -52, { cast: false }));
  box(14, .07, .08, mat.steel, 0, H - .035, -52, { cast: false });
  box(2.8, .06, .08, mat.steel, 0, 3, -52, { cast: false });

  box(2, H, .3, mat.plaster, -6, H / 2, -60.15, { tile: 3, cast: false });
  box(2, H, .3, mat.plaster, 6, H / 2, -60.15, { tile: 3, cast: false });
  box(10, .45, .3, mat.plaster, 0, .225, -60.15, { tile: 3, cast: false });
  box(10, .3, .3, mat.plaster, 0, H - .15, -60.15, { tile: 3, cast: false });
  [-5, -1.67, 1.67, 5].forEach(x => box(.06, 3.45, .08, mat.steel, x, 2.17, -60.02, { cast: false }));
  box(10, .06, .08, mat.steel, 0, .47, -60.02, { cast: false });
  box(10, .06, .08, mat.steel, 0, 3.88, -60.02, { cast: false });
  const view = T('the_sky_is_on_fire.jpg', true);
  view.wrapS = view.wrapT = THREE.ClampToEdgeWrapping;
  // Crop of the panorama around the sun; v = .5 (the horizon) lands at eye height.
  view.repeat.set(.28, .26); view.offset.set(.52, .44);
  const viewMesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 11.3), new THREE.MeshBasicMaterial({ map: view, toneMapped: false }));
  viewMesh.position.set(0, 4.21, -68); scene.add(viewMesh);

  box(2.6, .045, 1.2, mat.oak, 0, .74, -56.5, { round: .015 });
  [-1.2, 1.2].forEach(dx => {
    box(.05, .72, 1.05, mat.steel, dx, .36, -56.5);
  });
  box(.32, .012, .22, mat.alu, 0, .77, -56.3, { round: .004 });
  const lid = new THREE.Group();
  box(.32, .21, .008, mat.alu, 0, .105, 0, { parent: lid, round: .003 });
  const lscr = new THREE.Mesh(new THREE.PlaneGeometry(.3, .19), new THREE.MeshBasicMaterial({ map: laptopTex, toneMapped: false }));
  lscr.position.set(0, .105, .005); lid.add(lscr);
  lid.position.set(0, .776, -56.41); lid.rotation.x = -.2;
  scene.add(lid);
  const fmug = new THREE.Mesh(new THREE.CylinderGeometry(.042, .037, .1, 24), mat.ceramic);
  fmug.position.set(.55, .81, -56.3); fmug.castShadow = true; scene.add(fmug);

  // ---------- lights ----------
  // A soft overhead key light that follows the visitor, so shadow detail stays sharp everywhere along the walk.
  const key = new THREE.DirectionalLight(0xfff6ec, 2.4);
  key.castShadow = true;
  key.shadow.mapSize.set(hq ? 2048 : 1024, hq ? 2048 : 1024);
  Object.assign(key.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: .5, far: 40 });
  key.shadow.bias = -.0003; key.shadow.normalBias = .03; key.shadow.radius = 4;
  scene.add(key, key.target);
  // Low sun through the founder's window.
  const dusk = new THREE.SpotLight(0xff8a3c, 2500, 26, .62, .7, 2);
  dusk.position.set(.6, 3.3, -62.5); dusk.target.position.set(-.4, 0, -53.5);
  dusk.castShadow = true; dusk.shadow.mapSize.set(1024, 1024); dusk.shadow.bias = -.0004;
  scene.add(dusk, dusk.target);
  // Ceiling track spots washing the feature walls (logo, industries, process, client walls).
  [[-3.6, -6.5, -7, 2.5], [-3.8, -21.5, -7, 2.1], [-3.8, -36.7, -7, 1.9], [3.8, -46.4, 7, 2.2]].forEach(([x, z, tx, ty]) => {
    const s = new THREE.SpotLight(0xfff0dc, 260, 13, 1, .9, 2);
    s.position.set(x, H - .15, z); s.target.position.set(tx, ty, z);
    scene.add(s, s.target);
    [-1.6, 0, 1.6].forEach(dz => {
      const can = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .18, 16), mat.steel);
      can.position.set(x, H - .14, z + dz); can.rotation.z = Math.sign(tx) * .7; scene.add(can);
    });
    box(.04, .04, 4, mat.steel, x, H - .03, z, { cast: false });
  });

  // ---------- furniture (Poly Haven, CC0) ----------
  const models = {};
  const pending = [];
  function place(name, x, z, ry = 0, o = {}) { pending.push([name, x, z, ry, o]); flush(); }
  function flush() {
    for (let i = pending.length - 1; i >= 0; i--) {
      const [name, x, z, ry, o] = pending[i];
      const src = models[name];
      if (!src) continue;
      pending.splice(i, 1);
      const m = src.clone();
      m.scale.setScalar(o.s || 1);
      m.rotation.y = ry;
      m.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(m);
      m.position.set(x - (b.min.x + b.max.x) / 2, o.top != null ? o.top - b.max.y : (o.y || 0) - b.min.y, z - (b.min.z + b.max.z) / 2);
      scene.add(m);
    }
  }
  ['modern_arm_chair_01', 'mid_century_lounge_chair', 'modern_coffee_table_01', 'potted_plant_02', 'potted_plant_04', 'modern_ceiling_lamp_01', 'modern_wooden_cabinet']
    .forEach(n => gltfLoader.load(BASE + 'models/' + n + '.gltf', g => {
      g.scene.traverse(o => {
        if (!o.isMesh) return;
        o.castShadow = o.receiveShadow = true;
        o.material.envMapIntensity = ENV;
        // The lamp's glass globe glows like a lit bulb.
        if (n === 'modern_ceiling_lamp_01' && /glass|shade|bulb|globe/i.test(o.material.name)) {
          o.material = o.material.clone();
          o.material.emissive = new THREE.Color(0xfff1df); o.material.emissiveIntensity = 1.6;
          o.castShadow = false;
        }
      });
      models[n] = g.scene;
      flush();
    }));

  const PI = Math.PI;
  // Front of every model faces +Z; ry turns it (+PI/2 faces +X, -PI/2 faces -X, PI faces -Z).
  place('potted_plant_02', -2.4, 1.4, 0, { s: 1.5 });
  place('potted_plant_02', 2.4, 1.4, 1.3, { s: 1.5 });
  place('modern_wooden_cabinet', -6.6, -6.5, PI / 2);
  place('potted_plant_04', -6.6, -5.2, 0, { y: .62 });
  [-5.4, -6.5, -7.6].forEach(z => place('modern_ceiling_lamp_01', 4.2, z, 0, { top: H }));
  place('potted_plant_04', 4.25, -7.7, 0, { y: 1.07, s: .8 });
  place('potted_plant_02', -6.1, -1.3, .4, { s: 1.7 });
  place('potted_plant_02', 6.1, -11.8, 2, { s: 1.7 });
  studioDesks.forEach(([x, z, s]) => {
    place('modern_arm_chair_01', s * 5.55, z, s > 0 ? -PI / 2 : PI / 2);
    place('modern_ceiling_lamp_01', x, z, 0, { top: H });
  });
  place('potted_plant_02', -6.2, -14.3, 1, { s: 1.6 });
  place('potted_plant_02', 6.2, -29.6, 2.5, { s: 1.6 });
  place('potted_plant_02', 6.2, -31.6, .8, { s: 1.6 });
  place('modern_coffee_table_01', -3.8, -47.6, PI / 2);
  place('mid_century_lounge_chair', -3.8, -45.6, PI);
  place('mid_century_lounge_chair', -3.8, -49.6, 0);
  place('potted_plant_02', -6.2, -44, .3, { s: 1.7 });
  place('potted_plant_02', -6.2, -51.2, 1.6, { s: 1.7 });
  place('mid_century_lounge_chair', 0, -57.6, 0);
  place('modern_wooden_cabinet', 6.6, -56, -PI / 2);
  place('potted_plant_04', 6.6, -54.9, 0, { y: .62 });
  place('potted_plant_02', -5.4, -58.8, 2.2, { s: 1.8 });
  place('modern_ceiling_lamp_01', 0, -56.5, 0, { top: H });

  // ---------- post-processing: ambient occlusion grounds every object ----------
  let composer = null;
  if (hq) {
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const ao = new GTAOPass(scene, camera, innerWidth, innerHeight, undefined, { radius: .45, distanceExponent: 1.4, thickness: 1.5, scale: 1.1, samples: 16 }, { lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
      // Glass should not darken what is behind it: hide it while the AO pass reads depth and normals.
      const aoRender = ao.render.bind(ao);
      ao.render = (...a) => { glassMeshes.forEach(m => m.visible = false); aoRender(...a); glassMeshes.forEach(m => m.visible = true); };
      composer.addPass(ao);
      composer.addPass(new OutputPass());
    } catch (e) { composer = null; }
  }

  // ---------- the walk: keyframes at t = i/12, the seven sections sit on even keys ----------
  // Stops: entrance, lobby, AI lab desks, industries wall, process wall, client lounge, founder's office.
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const walk = new THREE.CatmullRomCurve3([
    narrow ? V(0, 1.65, 13) : V(-3, 1.65, 11.5), V(0, 1.65, 4.5), V(.6, 1.65, -3.5), V(0, 1.65, -10.5), V(-.8, 1.65, -18), V(.6, 1.65, -20.5),
    V(2.2, 1.65, -21.5), V(0, 1.65, -28), V(1.6, 1.65, -36), V(0, 1.65, -42), V(-1.4, 1.65, -44.4), V(.2, 1.62, -50.5), V(.4, 1.6, -53.2)
  ]);
  const look = new THREE.CatmullRomCurve3([
    narrow ? V(0, 2.6, 0) : V(-3, 2.5, 0), V(0, 1.6, -6), V(-7, 2.2, -7.5), V(0, 1.6, -20), V(6, 1.1, -22.5), V(-2, 1.6, -23),
    V(-7, 1.95, -21.5), V(0, 1.6, -36), V(-7, 1.9, -36.7), V(-4, 1.1, -48), V(7, 1.9, -46.6), V(0, 1.8, -60), V(-1.6, 1.9, -60)
  ]);

  let t = story.target, mx = 0, my = 0, sx = 0, sy = 0, phase = 0, bob = 0;
  const prev = new THREE.Vector3(), aim = new THREE.Vector3(), fwd = new THREE.Vector3();
  const onPointer = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
  addEventListener('pointermove', onPointer, { passive: true });
  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    composer?.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = camera.aspect < 1 ? 70 : 58;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  const clamp01 = v => Math.min(1, Math.max(0, v));
  const ease = v => v * v * (3 - 2 * v);
  const timer = new THREE.Timer();
  renderer.setAnimationLoop(() => {
    timer.update();
    const dt = Math.min(timer.getDelta(), .05);
    t += (story.target - t) * (reduce ? 1 : Math.min(1, dt * 3));
    sx += (mx - sx) * .05; sy += (my - sy) * .05;

    walk.getPoint(t, camera.position);
    look.getPoint(t, aim);
    if (!reduce) {
      // Footsteps: a slight head bob that only appears while actually walking.
      const moved = camera.position.distanceTo(prev);
      prev.copy(camera.position);
      phase += moved * 4.2;
      bob += (Math.min(moved * 25, 1) - bob) * .08;
      camera.position.y += Math.sin(phase) * .022 * bob;
      aim.x += sx * 1.4; aim.y -= sy * 1;
    }
    camera.lookAt(aim);

    const z = camera.position.z;
    const outside = z > .4;
    scene.environment = outside && streetEnv ? streetEnv : roomEnv;
    key.intensity = outside ? 3.4 : 5.5;
    camera.getWorldDirection(fwd);
    key.target.position.copy(camera.position).addScaledVector(fwd, 7).setY(0);
    key.position.copy(key.target.position).add(outside ? V(-6, 14, 9) : V(-2.5, 12, 3));

    // Doors slide open as the visitor approaches them.
    const o1 = ease(clamp01((9 - z) / 4)) * 1.25, o2 = ease(clamp01((-5 - z) / 4)) * 1.25;
    frontDoors[0].position.x = -.65 - o1; frontDoors[1].position.x = .65 + o1;
    innerDoors[0].position.x = -.65 - o2; innerDoors[1].position.x = .65 + o2;

    if (composer) composer.render(); else renderer.render(scene, camera);
  });

  // Called when the homepage unmounts (e.g. navigating to /login): stop rendering and free GPU memory.
  return () => {
    renderer.setAnimationLoop(null);
    removeEventListener('pointermove', onPointer);
    removeEventListener('resize', resize);
    scene.traverse(o => {
      o.geometry?.dispose();
      [].concat(o.material || []).forEach(m => { Object.values(m).forEach(v => v?.isTexture && v.dispose()); m.dispose(); });
    });
    composer?.dispose();
    pmrem.dispose();
    renderer.dispose();
  };
}
