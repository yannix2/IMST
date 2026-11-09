"use client";

// Circular Gallery 2 by ravikatiyar162 (21st.dev, "circular-gallery-2"), vendored 2026-11-06 and
// adapted to the site:
//  - it never listens to the page's wheel (the original turned on every scroll of the page): it
//    moves by dragging inside it or with the labelled previous / next buttons;
//  - it draws only while on screen (IntersectionObserver), and releases its WebGL context;
//  - reduced motion: no ripple, moves without easing;
//  - the photos' alt text is listed for screen readers (the canvas itself is decorative);
//  - captions take the theme's heading colour and follow the light / dark switch;
//  - the box is sized by the parent, so nothing moves when it starts.
// ogl (WebGL) is imported only by this file, which loads with the Cambridge section's chunk.

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform, type OGLRenderingContext } from "ogl";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export type GalleryItem = { image: string; text: string; alt: string };

type Props = {
  items: GalleryItem[];
  label: string;
  previousLabel: string;
  nextLabel: string;
  bend?: number;
  borderRadius?: number;
  className?: string;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function textTexture(gl: OGLRenderingContext, text: string, font: string, color: string) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width);
  const height = Math.ceil(parseInt(font.match(/(\d+)px/)?.[1] ?? "30", 10) * 1.3);
  canvas.width = width + 20;
  canvas.height = height + 20;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.direction = document.documentElement.dir === "rtl" ? "rtl" : "ltr";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

type Size = { width: number; height: number };

class Media {
  plane: Mesh;
  program: Program;
  extra = 0;
  width = 0;
  widthTotal = 0;
  x = 0;
  constructor(
    private gl: OGLRenderingContext,
    geometry: Plane,
    scene: Transform,
    image: string,
    text: string,
    private index: number,
    private length: number,
    private screen: Size,
    private viewport: Size,
    private bend: number,
    borderRadius: number,
    color: string,
    font: string,
    private still: boolean,
  ) {
    const texture = new Texture(gl, { generateMipmaps: true });
    this.program = new Program(gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(vUv.x * ratio.x + (1.0 - ratio.x) * 0.5, vUv.y * ratio.y + (1.0 - ratio.y) * 0.5);
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          gl_FragColor = vec4(color.rgb, alpha);
        }`,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: still ? 0 : 100 * Math.random() },
        uBorderRadius: { value: borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.src = image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes!.value = [img.naturalWidth, img.naturalHeight];
    };
    this.plane = new Mesh(gl, { geometry, program: this.program });
    this.plane.setParent(scene);
    this.resize(screen, viewport);
    this.title(text, color, font);
  }

  private title(text: string, color: string, font: string) {
    const { texture, width, height } = textTexture(this.gl, text, font, color);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() { vec4 c = texture2D(tMap, vUv); if (c.a < 0.1) discard; gl_FragColor = c; }`,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    const mesh = new Mesh(this.gl, { geometry: new Plane(this.gl), program });
    // The caption is a child of the photo, so it is sized in the photo's own units (the photo is
    // 1 × 1 before its scale); the x factor undoes the photo's aspect so letters are not stretched.
    const h = 0.13;
    mesh.scale.set(h * (width / height) * (this.plane.scale.y / this.plane.scale.x), h, 1);
    mesh.position.y = -0.5 - h * 0.5 - 0.04;
    mesh.setParent(this.plane);
  }

  update(scroll: { current: number; last: number }, direction: "left" | "right") {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    const B = Math.abs(this.bend);
    const R = (H * H + B * B) / (2 * B);
    const ex = Math.min(Math.abs(x), H);
    const arc = R - Math.sqrt(R * R - ex * ex);
    this.plane.position.y = -arc;
    this.plane.rotation.z = -Math.sign(x) * Math.asin(ex / R);
    const speed = scroll.current - scroll.last;
    if (!this.still) this.program.uniforms.uTime!.value += 0.04;
    this.program.uniforms.uSpeed!.value = this.still ? 0 : speed;
    const half = this.plane.scale.x / 2;
    const before = this.plane.position.x + half < -H;
    const after = this.plane.position.x - half > H;
    if (direction === "right" && before) this.extra -= this.widthTotal;
    if (direction === "left" && after) this.extra += this.widthTotal;
  }

  resize(screen: Size, viewport: Size) {
    this.screen = screen;
    this.viewport = viewport;
    const scale = screen.height / 1500;
    this.plane.scale.y = (viewport.height * (900 * scale)) / screen.height;
    this.plane.scale.x = (viewport.width * (700 * scale)) / screen.width;
    this.program.uniforms.uPlaneSizes!.value = [this.plane.scale.x, this.plane.scale.y];
    this.width = this.plane.scale.x + 2;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  renderer: Renderer;
  gl: OGLRenderingContext;
  camera: Camera;
  scene = new Transform();
  medias: Media[] = [];
  screen: Size = { width: 1, height: 1 };
  viewport: Size = { width: 1, height: 1 };
  scroll = { ease: 0.06, current: 0, target: 0, last: 0, start: 0 };
  down = false;
  startX = 0;
  raf = 0;
  running = false;

  constructor(
    private host: HTMLElement,
    items: GalleryItem[],
    bend: number,
    radius: number,
    color: string,
    font: string,
    private still: boolean,
  ) {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.canvas.setAttribute("aria-hidden", "true");
    host.appendChild(this.gl.canvas);
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
    if (still) this.scroll.ease = 1;
    this.measure();
    const geometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
    const doubled = [...items, ...items]; // two rounds, for a seamless loop
    this.medias = doubled.map((it, i) => new Media(this.gl, geometry, this.scene, it.image, it.text, i, doubled.length, this.screen, this.viewport, bend, radius, color, font, still));
    host.addEventListener("pointerdown", this.onDown);
    window.addEventListener("resize", this.onResize);
  }

  measure() {
    this.screen = { width: this.host.clientWidth, height: this.host.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };
  }

  onResize = () => {
    this.measure();
    this.medias.forEach((m) => m.resize(this.screen, this.viewport));
  };

  onDown = (e: PointerEvent) => {
    this.down = true;
    this.scroll.start = this.scroll.current;
    this.startX = e.clientX;
    window.addEventListener("pointermove", this.onMove);
    window.addEventListener("pointerup", this.onUp, { once: true });
  };

  onMove = (e: PointerEvent) => {
    if (!this.down) return;
    this.scroll.target = this.scroll.start + (this.startX - e.clientX) * 0.05;
  };

  onUp = () => {
    this.down = false;
    window.removeEventListener("pointermove", this.onMove);
    this.snap();
  };

  snap() {
    const width = this.medias[0]?.width ?? 1;
    this.scroll.target = Math.round(this.scroll.target / width) * width;
  }

  step(by: 1 | -1) {
    const width = this.medias[0]?.width ?? 1;
    this.scroll.target = Math.round(this.scroll.target / width) * width + by * width;
  }

  tick = () => {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    this.medias.forEach((m) => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = this.running ? requestAnimationFrame(this.tick) : 0;
  };

  play(on: boolean) {
    if (on === this.running) return;
    this.running = on;
    if (on) this.raf = requestAnimationFrame(this.tick);
    else cancelAnimationFrame(this.raf);
  }

  destroy() {
    this.play(false);
    this.host.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointermove", this.onMove);
    window.removeEventListener("pointerup", this.onUp);
    window.removeEventListener("resize", this.onResize);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.gl.canvas.remove();
  }
}

export function CircularGallery({ items, label, previousLabel, nextLabel, bend = 3, borderRadius = 0.05, className }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const app = useRef<App | null>(null);

  useEffect(() => {
    const host = stage.current;
    if (!host) return;
    const root = document.documentElement;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    const start = () => {
      app.current?.destroy();
      const style = getComputedStyle(host);
      const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      app.current = new App(host, items, bend, borderRadius, style.color, font, still);
      app.current.play(visible);
      if (!visible) app.current.tick();
    };
    start();
    const seen = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      app.current?.play(visible);
    });
    seen.observe(host);
    // Captions are drawn in the theme's colour: redraw when the theme changes.
    const theme = new MutationObserver(start);
    theme.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => {
      seen.disconnect();
      theme.disconnect();
      app.current?.destroy();
      app.current = null;
    };
  }, [items, bend, borderRadius]);

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={cn("relative flex flex-col", className)}>
      <div ref={stage} dir="ltr" className="min-h-0 flex-1 cursor-grab touch-pan-y overflow-hidden text-[26px] font-bold text-heading active:cursor-grabbing" />
      <ul className="sr-only">
        {items.map((it) => (
          <li key={it.image}>{it.alt}</li>
        ))}
      </ul>
      <div className="flex justify-center gap-3 pt-2">
        <button type="button" className="fan-arrow" aria-label={previousLabel} onClick={() => app.current?.step(-1)}>
          <ChevronLeftIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
        </button>
        <button type="button" className="fan-arrow" aria-label={nextLabel} onClick={() => app.current?.step(1)}>
          <ChevronRightIcon aria-hidden="true" className="size-5 rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}
