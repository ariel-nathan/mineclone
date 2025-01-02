import { Stats } from "./lib/stats";
import { debugControls } from "./lib/ui";
import { GPURenderer } from "./render/gpu-renderer";
import "./style.css";
import { World } from "./world";

async function main() {
  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  // Stats setup
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  // Initialize renderer
  const renderer = new GPURenderer(canvas);
  const initialized = await renderer.initialize();

  if (!initialized) {
    document.body.innerHTML = "WebGPU not supported or failed to initialize";
    return;
  }

  // Create world
  const world = new World();
  world.generate();

  // Update renderer with world data
  renderer.updateWorld(world);

  // Set up camera position
  const camera = renderer.cameraController;
  camera.setTarget(world.width / 2, world.height / 2, world.width / 2);
  camera.zoom(world.width); // Initial zoom based on world size

  // Add UI controls
  debugControls(world, renderer);

  // Handle mouse controls
  let isMouseDown = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;

    const deltaX = e.clientX - lastX;
    const deltaY = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    const rotationSpeed = 0.01;
    camera.orbit(deltaX * rotationSpeed, deltaY * rotationSpeed);
  });

  // Handle zoom with mouse wheel
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    camera.zoom(1 + e.deltaY * 0.001);
  });

  // Animation loop
  function animate() {
    stats.begin();
    renderer.render();
    stats.end();
    requestAnimationFrame(animate);
  }
  animate();

  // Handle resize
  window.addEventListener("resize", () => {
    renderer.handleResize();
  });
}

main();
