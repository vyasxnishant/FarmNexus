import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { nodeData, connectionData } from '../../data/nodes'

interface NexusSceneProps {
  scrollProgress: number
  reducedMotion: boolean
}

function NodeMesh({ position, scrollProgress, index, totalNodes }: {
  position: [number, number, number]
  scrollProgress: number
  index: number
  totalNodes: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const activationPoint = index / totalNodes

  useFrame((state) => {
    if (!meshRef.current) return
    const material = meshRef.current.material as THREE.MeshStandardMaterial

    // Node activates based on scroll progress
    const activation = Math.max(0, Math.min(1, (scrollProgress - activationPoint * 0.7) / 0.3))
    
    material.emissiveIntensity = 0.1 + activation * 1.5
    material.opacity = 0.3 + activation * 0.7

    // Subtle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#5FD0C0"
        emissive="#5FD0C0"
        emissiveIntensity={0.1}
        transparent
        opacity={0.3}
        toneMapped={false}
      />
    </mesh>
  )
}

function ConnectionLine({ from, to, scrollProgress, wave }: {
  from: [number, number, number]
  to: [number, number, number]
  scrollProgress: number
  wave: number
}) {
  // Each wave activates at different scroll thresholds
  const waveStart = wave * 0.3
  const waveEnd = waveStart + 0.4

  // Pre-construct the Three.js Line object to avoid SVG <line> JSX conflict
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    geo.setFromPoints(points)
    const mat = new THREE.LineBasicMaterial({
      transparent: true,
      opacity: 0,
      toneMapped: false,
    })
    return new THREE.Line(geo, mat)
  }, [from, to])

  // Pre-allocate colors outside the render loop to avoid per-frame garbage
  const colors = useMemo(() => ({
    turmeric: new THREE.Color('#E4A335'),
    teal: new THREE.Color('#5FD0C0'),
  }), [])

  useFrame((state) => {
    const material = lineObj.material as THREE.LineBasicMaterial

    const activation = Math.max(0, Math.min(1, (scrollProgress - waveStart) / (waveEnd - waveStart)))
    material.opacity = activation * 0.6

    // Pulse effect using color interpolation
    const pulse = (Math.sin(state.clock.elapsedTime * 2 + wave) + 1) / 2
    material.color.copy(colors.turmeric).lerp(colors.teal, pulse)
  })

  return <primitive object={lineObj} />
}

function Scene({ scrollProgress, reducedMotion }: NexusSceneProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return
    // Subtle camera drift
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.03
    groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.08) * 0.02
  })

  return (
    <group ref={groupRef}>
      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#F3E9D2" />

      {/* Nodes */}
      {nodeData.map((node, index) => (
        <NodeMesh
          key={node.id}
          position={node.position}
          scrollProgress={scrollProgress}
          index={index}
          totalNodes={nodeData.length}
        />
      ))}

      {/* Connection lines */}
      {connectionData.map((conn, index) => {
        const fromNode = nodeData.find(n => n.id === conn.from)
        const toNode = nodeData.find(n => n.id === conn.to)
        if (!fromNode || !toNode) return null
        return (
          <ConnectionLine
            key={index}
            from={fromNode.position}
            to={toNode.position}
            scrollProgress={scrollProgress}
            wave={conn.wave}
          />
        )
      })}
    </group>
  )
}

export default function NexusSceneWrapper({ scrollProgress, reducedMotion }: NexusSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Scene scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
