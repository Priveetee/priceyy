// src/components/ui/pixel-blast-simple.tsx - VERSION SIMPLIFIÉE QUI MARCHE
'use client'

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type PixelBlastProps = {
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  pixelSize?: number;
  speed?: number;
  density?: number;
};

const PixelBlastSimple: React.FC<PixelBlastProps> = ({
  color = '#B19EEF',
  className,
  style,
  pixelSize = 8,
  speed = 1,
  density = 0.7
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const container = containerRef.current;

    // Renderer simple WebGL1 (compatible)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'default'
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Shader simplifié compatible WebGL1
    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision mediump float;

      uniform vec2 uResolution;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uPixelSize;
      uniform float uDensity;
      uniform vec2 uMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        vec2 uv = fragCoord / uResolution;

        // Effet pixelisé
        vec2 pixelPos = floor(fragCoord / uPixelSize) * uPixelSize;
        vec2 pixelUv = pixelPos / uResolution;

        // Animation temporelle
        float time = uTime * 0.5;
        float n = noise(pixelUv * 8.0 + time * 0.3);

        // Distance de la souris pour interaction
        float mouseDistance = distance(uv, uMouse);
        float mouseEffect = exp(-mouseDistance * 5.0);

        // Pattern animé
        float pattern = n + mouseEffect * 0.5;
        float alpha = step(1.0 - uDensity, pattern);

        // Forme circulaire pour chaque pixel
        vec2 localUv = fract(fragCoord / uPixelSize);
        float circle = 1.0 - step(0.4, distance(localUv, vec2(0.5)));

        alpha *= circle;

        // Fade sur les bords
        vec2 center = uv - 0.5;
        float vignette = 1.0 - smoothstep(0.3, 0.7, length(center));
        alpha *= vignette;

        gl_FragColor = vec4(uColor, alpha);
      }
    `;

    const uniforms = {
      uResolution: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uPixelSize: { value: pixelSize },
      uDensity: { value: density },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;
      uniforms.uMouse.value.set(x, y);
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime() * speed;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mounted, color, pixelSize, speed, density]);

  if (!mounted) {
    return (
      <div
        className={`w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 ${className ?? ''}`}
        style={style}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className ?? ''}`}
      style={style}
    />
  );
};

export default PixelBlastSimple;
