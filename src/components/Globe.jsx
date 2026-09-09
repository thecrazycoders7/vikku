import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const EARTH_TEXTURE = '/globe/earth.jpg'
const R = 80 // globe radius

// lat/lng in degrees -> 3D position on a sphere of given radius
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

const MARKERS = [
  { lat: 40.7128, lng: -74.006, label: 'New York', avatar: '/globe/avatar-1.webp' },
  { lat: 51.5074, lng: -0.1278, label: 'London', avatar: '/globe/avatar-2.webp' },
  { lat: 35.6762, lng: 139.6503, label: 'Tokyo', avatar: '/globe/avatar-3.webp' },
  { lat: -33.8688, lng: 151.2093, label: 'Sydney', avatar: '/globe/avatar-4.webp' },
  { lat: 48.8566, lng: 2.3522, label: 'Paris', avatar: '/globe/avatar-5.webp' },
  { lat: 17.385, lng: 78.4867, label: 'Hyderabad', avatar: '/globe/avatar-6.webp' },
  { lat: 25.2048, lng: 55.2708, label: 'Dubai', avatar: '/globe/avatar-7.webp' },
  { lat: 1.3521, lng: 103.8198, label: 'Singapore', avatar: '/globe/avatar-8.webp' },
]

export default function Globe({ className = '' }) {
  const mountRef = useRef(null)
  const overlayRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let width = mount.clientWidth
    let height = mount.clientHeight

    // --- Scene setup ---
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000)
    camera.position.z = 360

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)
    renderer.domElement.style.cursor = 'grab'

    // --- Globe ---
    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    const geometry = new THREE.SphereGeometry(R, 64, 64)
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1,
      metalness: 0,
    })
    loader.load(EARTH_TEXTURE, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      material.map = tex
      material.needsUpdate = true
    })
    const earth = new THREE.Mesh(geometry, material)
    globeGroup.add(earth)

    // Subtle atmosphere glow
    const glowGeo = new THREE.SphereGeometry(R * 1.02, 64, 64)
    const glowMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {},
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
          gl_FragColor = vec4(0.55, 0.65, 0.9, 1.0) * intensity;
        }`,
    })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    scene.add(glow)

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    const dir = new THREE.DirectionalLight(0xffffff, 1.3)
    dir.position.set(-1, 0.5, 1)
    scene.add(dir)

    // --- Marker DOM elements ---
    const overlay = overlayRef.current
    const svg = svgRef.current
    const markerEls = MARKERS.map((m) => {
      const el = document.createElement('div')
      el.style.position = 'absolute'
      el.style.top = '0'
      el.style.left = '0'
      el.style.transform = 'translate(-50%, -50%)'
      el.style.transition = 'opacity 0.2s ease'
      el.style.willChange = 'transform, opacity'
      el.innerHTML = `
        <div style="width:30px;height:30px;border-radius:9999px;overflow:hidden;background:#171717;box-shadow:0 4px 14px rgba(0,0,0,0.5);border:2px solid rgba(255,255,255,0.85);">
          <img src="${m.avatar}" alt="${m.label}" draggable="false" style="width:100%;height:100%;object-fit:cover;" />
        </div>`
      overlay.appendChild(el)
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('stroke', 'rgba(255,255,255,0.45)')
      line.setAttribute('stroke-width', '1')
      svg.appendChild(line)
      const surfaceVec = latLngToVector3(m.lat, m.lng, R)
      const anchorVec = latLngToVector3(m.lat, m.lng, R * 1.28)
      return { el, line, surfaceVec, anchorVec }
    })

    // --- Drag to rotate ---
    let isDragging = false
    let prevX = 0, prevY = 0
    let rotVelX = 0, rotVelY = 0

    const onPointerDown = (e) => {
      isDragging = true
      prevX = e.clientX
      prevY = e.clientY
      renderer.domElement.style.cursor = 'grabbing'
    }
    const onPointerMove = (e) => {
      if (!isDragging) return
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      prevX = e.clientX
      prevY = e.clientY
      rotVelY = dx * 0.005
      rotVelX = dy * 0.005
      globeGroup.rotation.y += rotVelY
      globeGroup.rotation.x += rotVelX
      globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x))
    }
    const onPointerUp = () => {
      isDragging = false
      renderer.domElement.style.cursor = 'grab'
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    // --- Reduced motion: disable idle auto-rotation ---
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const idleSpin = reduceMotion ? 0 : 0.0015

    // --- Animation loop (pauses when off-screen or tab hidden) ---
    const tmp = new THREE.Vector3()
    let frameId = null
    let inView = true
    let pageVisible = !document.hidden

    const animate = () => {
      frameId = requestAnimationFrame(animate)

      if (!isDragging) {
        // inertia + idle auto-rotate
        rotVelY *= 0.95
        rotVelX *= 0.95
        globeGroup.rotation.y += rotVelY + idleSpin
        globeGroup.rotation.x += rotVelX
        globeGroup.rotation.x = Math.max(-0.6, Math.min(0.6, globeGroup.rotation.x))
      }

      renderer.render(scene, camera)

      // update markers
      const q = globeGroup.quaternion
      markerEls.forEach(({ el, line, surfaceVec, anchorVec }) => {
        const normal = surfaceVec.clone().applyQuaternion(q).normalize()
        const facing = normal.z // >0 faces camera

        // anchor (avatar) projected position
        tmp.copy(anchorVec).applyQuaternion(q).project(camera)
        const ax = (tmp.x * 0.5 + 0.5) * width
        const ay = (-tmp.y * 0.5 + 0.5) * height

        // surface projected position
        tmp.copy(surfaceVec).applyQuaternion(q).project(camera)
        const sx = (tmp.x * 0.5 + 0.5) * width
        const sy = (-tmp.y * 0.5 + 0.5) * height

        const opacity = facing > 0.05 ? Math.min(1, facing * 2.5) : 0
        el.style.opacity = opacity
        el.style.transform = `translate(${ax}px, ${ay}px) translate(-50%, -50%)`
        line.setAttribute('x1', sx)
        line.setAttribute('y1', sy)
        line.setAttribute('x2', ax)
        line.setAttribute('y2', ay)
        line.style.opacity = opacity
      })
    }
    // Start/stop the loop based on visibility to save CPU/GPU/battery
    const start = () => {
      if (frameId === null && inView && pageVisible) animate()
    }
    const stop = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId)
        frameId = null
      }
    }

    start()

    // Pause when scrolled off-screen
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        inView ? start() : stop()
      },
      { threshold: 0 }
    )
    io.observe(mount)

    // Pause when the browser tab is hidden
    const onVisibility = () => {
      pageVisible = !document.hidden
      pageVisible ? start() : stop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    // --- Resize ---
    const onResize = () => {
      width = mount.clientWidth
      height = mount.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    // --- Cleanup ---
    return () => {
      stop()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      markerEls.forEach(({ el, line }) => {
        el.remove()
        line.remove()
      })
      geometry.dispose()
      material.dispose()
      glowGeo.dispose()
      glowMat.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div className={`relative aspect-square w-full max-w-[600px] ${className}`}>
      <div ref={mountRef} className="absolute inset-0" />
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" />
    </div>
  )
}
