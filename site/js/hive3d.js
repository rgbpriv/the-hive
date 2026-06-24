// Arcane Hive - 3D honeycomb field (hero background)
// Instanced hexagonal prisms in brand colors, gentle wave + pointer ripple.

const canvas = document.getElementById('hive-canvas');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

init().catch(() => { if (canvas) canvas.style.display = 'none'; });

async function init() {
  const THREE = await import('three');

  const isMobile = innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 16, 20);
  camera.lookAt(2, 0, 0);

  // brand palettes per theme
  const PALETTES = {
    light: {
      base:   new THREE.Color('#ffffff'),
      pale:   new THREE.Color('#e9ecef'),
      navy:   new THREE.Color('#072239'),
      orange: new THREE.Color('#f97316'),
      slate:  new THREE.Color('#2b2d42')
    },
    dark: {
      base:   new THREE.Color('#1c1c2e'),
      pale:   new THREE.Color('#2b2d42'),
      navy:   new THREE.Color('#0e3a5c'),
      orange: new THREE.Color('#f97316'),
      slate:  new THREE.Color('#3a3d5c')
    }
  };

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(6, 14, 8);
  scene.add(key);
  const warm = new THREE.DirectionalLight(0xf97316, 0.5);
  warm.position.set(-10, 6, -6);
  scene.add(warm);

  // hex grid (pointy spacing on XZ plane)
  const R = 0.92;                       // hex radius
  const W = Math.sqrt(3) * R;           // horizontal step
  const COLS = isMobile ? 18 : 30, ROWS = isMobile ? 11 : 16;
  const COUNT = COLS * ROWS;

  const geo = new THREE.CylinderGeometry(R * 0.94, R * 0.94, 1, 6);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.1, flatShading: true });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const cells = [];
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = (c - COLS / 2) * W + (r % 2 ? W / 2 : 0);
      const z = (r - ROWS / 2) * R * 1.5;
      // color role: mostly base, sprinkles of navy / orange / slate
      const roll = Math.random();
      let role = 'base';
      if (roll > 0.96) role = 'orange';
      else if (roll > 0.90) role = 'navy';
      else if (roll > 0.84) role = 'slate';
      else if (roll > 0.55) role = 'pale';
      cells.push({ x, z, phase: Math.random() * Math.PI * 2, role });
      i++;
    }
  }

  function paint(dark) {
    const pal = PALETTES[dark ? 'dark' : 'light'];
    for (let k = 0; k < COUNT; k++) mesh.setColorAt(k, pal[cells[k].role]);
    mesh.instanceColor.needsUpdate = true;
  }
  const isDark = () => document.documentElement.classList.contains('dark');
  paint(isDark());
  addEventListener('ah-theme', (e) => {
    paint(e.detail.dark);
    if (reduceMotion) renderer.render(scene, camera);
  });

  // pointer ripple state (world coords on the grid plane)
  const pointer = { x: 0, z: 0, strength: 0 };
  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();

  addEventListener('pointermove', (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      pointer.x = hit.x; pointer.z = hit.z; pointer.strength = 1;
    }
    // camera parallax
    targetCamX = ndc.x * 1.4;
    targetCamY = 16 + ndc.y * 1.2;
  }, { passive: true });

  let targetCamX = 0, targetCamY = 16;

  function layout(t) {
    for (let k = 0; k < COUNT; k++) {
      const cell = cells[k];
      const dWave = Math.sin(t * 0.7 + cell.phase + (cell.x + cell.z) * 0.22) * 0.45;
      let h = 1.6 + dWave;
      if (pointer.strength > 0.01) {
        const dx = cell.x - pointer.x, dz = cell.z - pointer.z;
        const d2 = dx * dx + dz * dz;
        h += Math.exp(-d2 / 7) * 2.1 * pointer.strength;
      }
      dummy.position.set(cell.x, h / 2 - 1.4, cell.z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }

  function resize() {
    const w = canvas.clientWidth, hgt = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== hgt) {
      renderer.setSize(w, hgt, false);
      camera.aspect = w / hgt;
      camera.updateProjectionMatrix();
    }
  }

  let frozen = false;
  // pause rendering when hero is off screen
  new IntersectionObserver(([entry]) => { frozen = !entry.isIntersecting; }, { threshold: 0 })
    .observe(canvas);

  const clock = new THREE.Clock();
  let elapsed = 0;
  // Render every animation frame (vsync) for smooth pointer motion. Time-based
  // smoothing keeps the feel identical across 60/120/144Hz displays.
  function tick() {
    requestAnimationFrame(tick);
    if (frozen) return;
    const dt = Math.min(clock.getDelta(), 0.05);   // clamp big jumps (e.g. tab switch)
    elapsed += dt;
    resize();
    const f = dt * 60;                               // frames-equivalent at 60fps
    pointer.strength *= Math.pow(0.97, f);
    const camK = 1 - Math.pow(0.96, f);              // ~0.04 per 60fps frame
    camera.position.x += (targetCamX - camera.position.x) * camK;
    camera.position.y += (targetCamY - camera.position.y) * camK;
    camera.lookAt(2, 0, 0);
    layout(elapsed);
    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    resize();
    layout(0);
    renderer.render(scene, camera);
  } else {
    tick();
  }
}
