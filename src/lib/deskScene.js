// Photoreal founder's desk behind the AI Tools dashboard: the camera glides from object to object
// (planner, laptop, calculator and coins, calendar and stack blocks, toolbox) as story.target goes
// 0 → 1, then pulls back to the sunset window. Textures and furniture are the Poly Haven (CC0) assets
// already used by the homepage studio in /public/home3d. Same contract as createStudio: returns a cleanup function.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BASE = '/home3d/';
const C = { ink: '#1a1612', muted: '#6e645b', line: '#efe8e2', orange: '#ff6a13', soft: '#ffb38a', paper: '#fbfaf8' };
const F = { d: 'Unbounded, "Arial Black", sans-serif', s: '"Instrument Serif", Georgia, serif', b: 'Manrope, Arial, sans-serif', m: '"JetBrains Mono", Menlo, monospace' };

export async function createDesk({ canvas, loadingEl, story, onReady }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hq = innerWidth >= 720; // ponytail: ambient occlusion on wide screens only, same rule as the studio

  await Promise.race([
    Promise.all(['700 40px Unbounded', '500 40px Unbounded', 'italic 40px "Instrument Serif"', '500 20px Manrope', '700 20px Manrope', '500 20px "JetBrains Mono"'].map(f => document.fonts.load(f))),
    new Promise(r => setTimeout(r, 2500))
  ]).catch(() => {});
  const logo = new Image();
  logo.src = '/logo-sm.png';
  await logo.decode().catch(() => {});

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { loadingEl.hidden = true; return () => {}; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, hq ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .72;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeee9e3);
  const camera = new THREE.PerspectiveCamera(45, 1, .02, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;

  const manager = new THREE.LoadingManager();
  manager.onProgress = (url, done, total) => { loadingEl.textContent = `Setting up the desk… ${Math.round(done / total * 100)}%`; };
  manager.onLoad = () => { loadingEl.hidden = true; onReady?.(); };
  const texLoader = new THREE.TextureLoader(manager);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  // ---------- materials ----------
  // ponytail: T/pbr/box/tex mirror the helpers in studioScene.js; share them if a third scene appears
  function T(file, srgb, rep = 1) {
    const t = texLoader.load(BASE + 'tex/' + file);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rep, rep);
    t.anisotropy = aniso;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function pbr(name, rep, o = {}, tint) {
    const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: 1 }, o));
    if (!tint) m.map = T(name + '_Diffuse.webp', true, rep); else m.color.set(tint);
    m.normalMap = T(name + '_nor_gl.webp', false, rep);
    m.roughnessMap = T(name + '_Rough.webp', false, rep);
    return m;
  }
  const mat = {
    floor: pbr('laminate_floor_02', 3),
    oak: pbr('white_oak_veneer', 1),
    plaster: pbr('white_plaster_02', 2, { normalScale: new THREE.Vector2(.35, .35) }, 0xece8e2),
    steel: new THREE.MeshStandardMaterial({ color: 0x1b1b1d, roughness: .38, metalness: .85 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: .3, metalness: .9 }),
    orange: new THREE.MeshPhysicalMaterial({ color: 0xff6a13, roughness: .32, clearcoat: .6, clearcoatRoughness: .2 }),
    white: new THREE.MeshPhysicalMaterial({ color: 0xf7f6f3, roughness: .35, clearcoat: .3 }),
    ink: new THREE.MeshStandardMaterial({ color: 0x24201c, roughness: .55 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xfbfbfa, roughness: .18, clearcoat: 1 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd8b26a, roughness: .28, metalness: 1 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: .9 }),
    cover: new THREE.MeshStandardMaterial({ color: 0x2b2622, roughness: .7 }),
  };
  Object.values(mat).forEach(m => { if ('envMapIntensity' in m) m.envMapIntensity = .35; });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xf2f6f7, transparent: true, opacity: .1, roughness: .03, clearcoat: 1, depthWrite: false });

  function box(w, h, d, m, x, y, z, o = {}) {
    const b = new THREE.Mesh(o.round ? new RoundedBoxGeometry(w, h, d, 3, o.round) : new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    if (o.ry) b.rotation.y = o.ry;
    if (o.rx) b.rotation.x = o.rx;
    b.castShadow = o.cast !== false && m !== glass;
    b.receiveShadow = true;
    (o.parent || scene).add(b);
    return b;
  }
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
  const font = (x, weight, size, fam) => { x.font = `${weight} ${size}px ${fam}`; };
  // A printed or glowing flat surface (screens ignore lighting, paper takes shadows).
  function sheet(w, h, map, parent, o = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.screen
      ? new THREE.MeshBasicMaterial({ map, toneMapped: false })
      : new THREE.MeshStandardMaterial({ map, roughness: .85, transparent: !!o.clear, alphaTest: o.clear ? .02 : 0 }));
    m.receiveShadow = !o.screen;
    (parent || scene).add(m);
    return m;
  }
  let seed = 11;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;

  // ---------- room: oak floor, plaster walls, a wide window onto a sunset ----------
  const TOP = .75; // desk height
  box(10, .1, 10, mat.floor, 0, -.05, 0, { cast: false });
  const WZ = -1.05;
  box(2.2, 3, .2, mat.plaster, -2.6, 1.5, WZ, { cast: false });
  box(2.2, 3, .2, mat.plaster, 2.6, 1.5, WZ, { cast: false });
  box(3, .95, .2, mat.plaster, 0, .475, WZ, { cast: false });
  box(3, .45, .2, mat.plaster, 0, 2.775, WZ, { cast: false });
  box(.2, 3, 6, mat.plaster, -3.7, 1.5, 1.9, { cast: false });
  [-1.5, -.5, .5, 1.5].forEach(x => box(.05, 1.6, .07, mat.steel, x, 1.75, WZ + .06, { cast: false }));
  [.95, 2.55].forEach(y => box(3, .05, .07, mat.steel, 0, y, WZ + .06, { cast: false }));
  box(3, 1.6, .02, glass, 0, 1.75, WZ + .03, { cast: false });
  const view = T('the_sky_is_on_fire.webp', true);
  view.wrapS = view.wrapT = THREE.ClampToEdgeWrapping;
  const viewMesh = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.9), new THREE.MeshBasicMaterial({ map: view, toneMapped: false }));
  viewMesh.position.set(0, 1.7, -4.2); scene.add(viewMesh);
  box(2.4, .02, 1.4, new THREE.MeshStandardMaterial({ color: 0xe8ddd2, roughness: 1 }), .2, .01, .5, { cast: false });

  // ---------- the desk ----------
  box(2.8, .05, 1.15, mat.oak, 0, TOP - .025, -.15, { round: .012 });
  [-1.3, 1.3].forEach(x => {
    box(.06, TOP - .05, 1, mat.steel, x, (TOP - .05) / 2, -.15);
    box(.06, .03, 1.05, mat.steel, x, .015, -.15);
  });
  box(2.5, .12, .03, mat.steel, 0, TOP - .11, -.66, { cast: false });

  const group = (x, z, ry = 0) => { const g = new THREE.Group(); g.position.set(x, TOP, z); g.rotation.y = ry; scene.add(g); return g; };
  // Folded paper tent card naming the step that each object stands for.
  function tent(x, z, ry, n, label) {
    const g = group(x, z, ry);
    const card = tex(512, 300, (c, w, h) => {
      c.fillStyle = C.paper; c.fillRect(0, 0, w, h);
      c.fillStyle = C.orange; font(c, 700, 96, F.d); c.fillText(n, 40, 110);
      c.fillStyle = C.ink; font(c, 500, 62, F.d); c.fillText(label, 40, 220);
    });
    [-1, 1].forEach(s => {
      const p = sheet(.14, .082, card, g);
      p.position.set(0, .038, s * .018); p.rotation.set(s * -.42, s > 0 ? 0 : Math.PI, 0);
      p.castShadow = true;
      p.material.side = THREE.DoubleSide;
    });
    return g;
  }

  // Name plate at the front edge.
  const plate = group(0, .3);
  box(.46, .07, .03, mat.ink, 0, .035, 0, { parent: plate, rx: -.25, round: .006 });
  sheet(.44, .06, tex(1024, 140, (c, w, h) => {
    c.fillStyle = '#24201c'; c.fillRect(0, 0, w, h);
    if (logo.naturalWidth) c.drawImage(logo, 40, 15, 110, 110);
    c.fillStyle = '#f4f1ed'; font(c, 700, 64, F.d); c.fillText('VIKKU', 175, h / 2 + 3);
    c.fillStyle = C.orange; font(c, 500, 40, F.m); c.fillText('AI TOOLS', 450, h / 2 + 4);
  }), plate).position.set(0, .037, .017);
  plate.children[1].rotation.x = -.25;

  // 1 · Vikku PM: an open planner with a hand-drawn kanban board.
  const pm = group(-1.0, .02, .18);
  box(.46, .018, .32, mat.cover, 0, .009, 0, { parent: pm, round: .004 });
  box(.44, .012, .3, mat.paper, 0, .022, 0, { parent: pm, round: .003 });
  const kanban = tex(1100, 750, (c, w, h) => {
    c.fillStyle = C.paper; c.fillRect(0, 0, w, h);
    c.fillStyle = '#e8e2da'; c.fillRect(w / 2 - 3, 0, 6, h);
    [['To do', 40], ['Doing', 300], ['Done', 590], ['Shipped', 840]].forEach(([t, X], i) => {
      c.fillStyle = C.ink; font(c, 700, 34, F.b); c.fillText(t, X, 60);
      for (let k = 0; k < 4 - (i % 2); k++) {
        c.fillStyle = i === 1 ? '#ffd2b5' : i === 3 ? C.orange : '#fff3c4';
        c.save(); c.translate(X + 10, 120 + k * 150); c.rotate((rnd() - .5) * .08);
        c.fillRect(0, 0, 200, 120);
        c.fillStyle = 'rgba(26,22,18,.55)';
        for (let l = 0; l < 3; l++) c.fillRect(18, 28 + l * 30, 60 + rnd() * 110, 9);
        c.restore();
      }
    });
  });
  const pages = sheet(.42, .28, kanban, pm);
  pages.rotation.x = -Math.PI / 2; pages.position.y = .029;
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(.005, .005, .15, 12), mat.orange);
  pen.rotation.set(Math.PI / 2, 0, .5); pen.position.set(.27, .008, .02); pen.castShadow = true; pm.add(pen);

  // 00 · AI Visibility Score on the laptop.
  const laptop = group(-.4, -.25, -.08);
  box(.36, .014, .25, mat.alu, 0, .007, 0, { parent: laptop, round: .005 });
  box(.3, .002, .12, mat.ink, 0, .015, -.03, { parent: laptop, cast: false });
  const lid = new THREE.Group();
  box(.36, .235, .008, mat.alu, 0, .1175, 0, { parent: lid, round: .004 });
  const scr = sheet(.33, .205, tex(1024, 640, (c, w, h) => {
    c.fillStyle = '#fbfaf8'; c.fillRect(0, 0, w, h);
    c.fillStyle = C.ink; font(c, 500, 38, F.d); c.fillText('AI Visibility Score', 60, 80);
    c.fillStyle = C.muted; font(c, 500, 26, F.m); c.fillText('yourbusiness.com', 60, 130);
    const cx = 280, cy = 380, r = 150;
    c.lineWidth = 34; c.lineCap = 'round';
    c.strokeStyle = '#f1e9e1'; c.beginPath(); c.arc(cx, cy, r, .75 * Math.PI, 2.25 * Math.PI); c.stroke();
    c.strokeStyle = C.orange; c.beginPath(); c.arc(cx, cy, r, .75 * Math.PI, (.75 + 1.5 * .72) * Math.PI); c.stroke();
    c.textAlign = 'center'; c.fillStyle = C.ink; font(c, 700, 110, F.d); c.fillText('72', cx, cy);
    c.fillStyle = C.muted; font(c, 500, 26, F.b); c.fillText('out of 100', cx, cy + 80);
    c.textAlign = 'left';
    [['Structured data', .9], ['Clear service pages', .65], ['Reviews & citations', .4], ['AI crawler access', .8]].forEach(([t, v], i) => {
      const Y = 250 + i * 88;
      c.fillStyle = C.ink; font(c, 500, 28, F.b); c.fillText(t, 520, Y);
      c.fillStyle = '#f1e9e1'; c.fillRect(520, Y + 26, 420, 14);
      c.fillStyle = v < .5 ? C.soft : C.orange; c.fillRect(520, Y + 26, 420 * v, 14);
    });
  }), lid, { screen: true });
  scr.position.set(0, .1175, .0045);
  lid.position.set(0, .014, -.122); lid.rotation.x = -.22;
  laptop.add(lid);

  // 01 · Decide: calculator, a stack of coins and a printed ROI report.
  const calc = group(.12, .12, -.25);
  box(.11, .016, .17, mat.ink, 0, .008, 0, { parent: calc, round: .006 });
  const keys = sheet(.1, .16, tex(400, 640, (c, w, h) => {
    c.fillStyle = '#24201c'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c9d2c4'; c.fillRect(24, 28, w - 48, 120);
    c.fillStyle = C.ink; font(c, 700, 54, F.m); c.textAlign = 'right'; c.fillText('4,80,000', w - 40, 90);
    c.textAlign = 'center';
    ['C', '÷', '×', '−', '7', '8', '9', '+', '4', '5', '6', '%', '1', '2', '3', '='].forEach((k, i) => {
      const X = 30 + (i % 4) * 88, Y = 190 + Math.floor(i / 4) * 110;
      c.fillStyle = k === '=' ? C.orange : '#3a342f'; c.fillRect(X, Y, 72, 88);
      c.fillStyle = '#f4f1ed'; font(c, 500, 36, F.b); c.fillText(k, X + 36, Y + 46);
    });
  }), calc);
  keys.rotation.x = -Math.PI / 2; keys.position.y = .0165;
  const coinGeo = new THREE.CylinderGeometry(.024, .024, .0045, 40);
  [[.3, .14, 9], [.36, .2, 5], [.27, .22, 3]].forEach(([x, z, n]) => {
    for (let i = 0; i < n; i++) {
      const coin = new THREE.Mesh(coinGeo, mat.brass);
      coin.position.set(x + (rnd() - .5) * .004, TOP + .00225 + i * .0046, z + (rnd() - .5) * .004);
      coin.castShadow = coin.receiveShadow = true;
      scene.add(coin);
    }
  });
  const report = group(.24, -.2, .12);
  const rep = sheet(.21, .297, tex(630, 891, (c, w, h) => {
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    c.fillStyle = C.ink; font(c, 500, 36, F.d); c.fillText('Business case', 50, 80);
    c.fillStyle = C.muted; font(c, 500, 22, F.m); c.fillText('3-YEAR ROI · NPV · PAYBACK', 50, 125);
    [90, 150, 230, 320].forEach((bh, i) => { c.fillStyle = i === 3 ? C.orange : '#e9ded3'; c.fillRect(70 + i * 120, 520 - bh, 80, bh); });
    c.strokeStyle = C.ink; c.lineWidth = 5; c.beginPath(); c.moveTo(110, 410); c.lineTo(230, 360); c.lineTo(350, 280); c.lineTo(470, 180); c.stroke();
    [['ROI', '212%'], ['Payback', '9 months']].forEach(([k, v], i) => {
      c.fillStyle = C.muted; font(c, 500, 26, F.b); c.fillText(k, 50 + i * 280, 640);
      c.fillStyle = C.ink; font(c, 700, 48, F.d); c.fillText(v, 50 + i * 280, 700);
    });
  }), report);
  rep.rotation.x = -Math.PI / 2; rep.position.y = .001;

  // 02 · Plan: a desk calendar with milestones and three stacked blocks for the tech stack.
  const cal = group(.72, -.35, -.3);
  const calTex = tex(700, 520, (c, w, h) => {
    c.fillStyle = C.paper; c.fillRect(0, 0, w, h);
    c.fillStyle = C.orange; c.fillRect(0, 0, w, 90);
    c.fillStyle = '#fff'; font(c, 700, 44, F.d); c.fillText('NOVEMBER', 36, 48);
    c.textAlign = 'center';
    for (let d = 0; d < 30; d++) {
      const X = 60 + (d % 7) * 96, Y = 140 + Math.floor(d / 7) * 76;
      c.fillStyle = C.ink; font(c, 500, 30, F.b); c.fillText(String(d + 1), X, Y);
      if ([3, 11, 20, 27].includes(d)) { c.strokeStyle = C.orange; c.lineWidth = 5; c.beginPath(); c.arc(X, Y, 28, 0, 7); c.stroke(); }
    }
  });
  [-1, 1].forEach(s => {
    const p = sheet(.22, .16, s > 0 ? calTex : tex(8, 8, (c) => { c.fillStyle = '#d8d1c8'; c.fillRect(0, 0, 8, 8); }), cal);
    p.position.set(0, .072, s * .03); p.rotation.set(s * -.36, s > 0 ? 0 : Math.PI, 0);
    p.castShadow = true;
  });
  box(.23, .012, .1, mat.ink, 0, .006, 0, { parent: cal, round: .004 });
  const stack = group(.78, .14, .2);
  [['Frontend', mat.white, C.ink], ['API', mat.orange, '#fff'], ['Data', mat.ink, '#f4f1ed']].reverse().forEach(([t, m, col], i) => {
    box(.16, .04, .1, m, 0, .02 + i * .041, 0, { parent: stack, round: .006 });
    const lbl = sheet(.14, .03, tex(480, 100, (c, w, h) => {
      c.clearRect(0, 0, w, h); c.fillStyle = col; font(c, 700, 50, F.b); c.textAlign = 'center'; c.fillText(t, w / 2, h / 2 + 2);
    }), stack, { clear: true });
    lbl.position.set(0, .02 + i * .041, .0505);
  });

  // 03 · Run & maintain: an orange toolbox.
  const tb = group(1.12, -.2, -.35);
  box(.32, .13, .17, mat.orange, 0, .065, 0, { parent: tb, round: .012 });
  box(.33, .012, .175, mat.steel, 0, .1, 0, { parent: tb, cast: false });
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.06, .009, 12, 32, Math.PI), mat.steel);
  handle.position.set(0, .132, 0); handle.castShadow = true; tb.add(handle);
  sheet(.2, .04, tex(600, 120, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.fillStyle = '#fff'; font(c, 700, 54, F.m); c.textAlign = 'center'; c.fillText('MAINTENANCE', w / 2, h / 2 + 3);
  }), tb, { clear: true }).position.set(0, .05, .0855);
  const wrench = new THREE.Group();
  box(.17, .008, .02, mat.alu, 0, 0, 0, { parent: wrench, round: .003 });
  const jaw = new THREE.Mesh(new THREE.TorusGeometry(.018, .007, 10, 24, Math.PI * 1.4), mat.alu);
  jaw.rotation.x = Math.PI / 2; jaw.position.x = .095; jaw.castShadow = true; wrench.add(jaw);
  wrench.position.set(1.05, TOP + .004, .1); wrench.rotation.y = .6; scene.add(wrench);

  // Step cards beside each object.
  tent(-.72, .2, .2, 'PM', 'Plan work');
  tent(-.1, -.02, 0, '00', 'Check');
  tent(.42, .3, -.15, '01', 'Decide');
  tent(.95, .25, -.25, '02', 'Plan');
  tent(1.24, .1, -.4, '03', 'Run');

  // A mug of coffee, steam-free.
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(.042, .037, .1, 32), mat.ceramic);
  mug.position.set(-.05, TOP + .05, .32); mug.castShadow = true; scene.add(mug);
  const mh = new THREE.Mesh(new THREE.TorusGeometry(.026, .007, 10, 24), mat.ceramic);
  mh.position.set(-.005, TOP + .055, .32); mh.castShadow = true; scene.add(mh);

  // ---------- furniture (Poly Haven, CC0) ----------
  const gltfLoader = new GLTFLoader(manager);
  function place(name, x, z, ry, o = {}) {
    gltfLoader.load(BASE + 'models/' + name + '.gltf', g => {
      const m = g.scene;
      m.traverse(n => {
        if (!n.isMesh) return;
        n.castShadow = n.receiveShadow = true;
        n.material.envMapIntensity = .45;
        if (name === 'modern_ceiling_lamp_01' && /glass|shade|bulb|globe/i.test(n.material.name)) {
          n.material = n.material.clone();
          n.material.emissive = new THREE.Color(0xfff1df); n.material.emissiveIntensity = 1.6;
          n.castShadow = false;
        }
      });
      m.scale.setScalar(o.s || 1);
      m.rotation.y = ry;
      m.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(m);
      m.position.set(x - (b.min.x + b.max.x) / 2, o.top != null ? o.top - b.max.y : (o.y || 0) - b.min.y, z - (b.min.z + b.max.z) / 2);
      scene.add(m);
    });
  }
  place('potted_plant_04', -1.17, -.5, .4, { y: TOP, s: .9 });
  place('modern_ceiling_lamp_01', .1, -.15, 0, { top: 3.2 });
  place('modern_arm_chair_01', 2.3, .7, -2.2);

  // ---------- lights: low sun through the window, soft fill from the room, the pendant lamp ----------
  const sun = new THREE.DirectionalLight(0xffb27a, 3.2);
  sun.position.set(-2.2, 3.4, -4); sun.target.position.set(.2, TOP, 0);
  sun.castShadow = true;
  sun.shadow.mapSize.set(hq ? 2048 : 1024, hq ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: .5, far: 12 });
  sun.shadow.bias = -.0002; sun.shadow.normalBias = .02; sun.shadow.radius = 5;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xfff4ea, 1.1);
  fill.position.set(1.5, 3, 3.5); fill.target.position.set(0, TOP, -.2);
  scene.add(fill, fill.target);
  const lamp = new THREE.PointLight(0xffd6a0, 3, 3.2, 2);
  lamp.position.set(.1, 2.05, -.15);
  scene.add(lamp);

  let composer = null;
  if (hq) {
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new GTAOPass(scene, camera, innerWidth, innerHeight, undefined, { radius: .12, distanceExponent: 1.4, thickness: .4, scale: 1, samples: 16 }));
      composer.addPass(new OutputPass());
    } catch (e) { composer = null; }
  }

  // ---------- the glide: one key per dashboard section ----------
  // Sections: welcome, Vikku PM, 00 check, 01 decide, 02 plan, 03 run, your usage. `side` puts the
  // object beside the text panel (+1 → object on the right, panel on the left).
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const narrow = innerWidth < 720;
  const keysAt = [
    [narrow ? V(.2, 2.0, 2.9) : V(.45, 1.45, 2.0), V(.2, .82, -.3), 1],
    [V(-.93, 1.36, .83), V(-1.0, TOP, .02), -1],
    [V(-.43, 1.07, .68), V(-.4, .84, -.33), 1],
    [V(.33, 1.25, .84), V(.22, TOP, -.02), -1],
    [V(.84, 1.14, .85), V(.76, .82, -.12), -1],
    [V(1.36, 1.13, .8), V(1.12, .82, -.15), 1],
    [narrow ? V(.1, 1.6, 2.6) : V(.6, 1.45, 2.0), V(0, 1.6, -1.6), 1],
  ];
  const walk = new THREE.CatmullRomCurve3(keysAt.map(k => k[0]));
  const look = new THREE.CatmullRomCurve3(keysAt.map(k => k[1]));
  const sides = keysAt.map(k => k[2]);

  let t = story.target, mx = 0, my = 0, sx = 0, sy = 0, W = 1, H = 1;
  const aim = new THREE.Vector3();
  const onPointer = e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; };
  addEventListener('pointermove', onPointer, { passive: true });
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    composer?.setSize(W, H);
    camera.aspect = W / H;
    camera.fov = camera.aspect < 1 ? 62 : 42;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  const timer = new THREE.Timer();
  renderer.setAnimationLoop(() => {
    timer.update();
    const dt = Math.min(timer.getDelta(), .05);
    t += (story.target - t) * (reduce ? 1 : Math.min(1, dt * 3));
    sx += (mx - sx) * .05; sy += (my - sy) * .05;
    walk.getPoint(t, camera.position);
    look.getPoint(t, aim);
    if (!reduce) { aim.x += sx * .25; aim.y -= sy * .15; }
    camera.lookAt(aim);
    // Slide the framing sideways (wide screens) or up (phones) so the object clears the text panel.
    const f = t * (sides.length - 1), i = Math.min(Math.floor(f), sides.length - 2);
    const side = sides[i] + (sides[i + 1] - sides[i]) * (f - i);
    if (camera.aspect >= 1) camera.setViewOffset(W, H, -side * W * .2, 0, W, H);
    else camera.setViewOffset(W, H, 0, H * .2, W, H);
    if (composer) composer.render(); else renderer.render(scene, camera);
  });

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
