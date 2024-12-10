import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import "./style.css";

// Stats setup
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
camera.position.set(5, 5, 5);

// OrbitControls setup
new OrbitControls(camera, renderer.domElement);

// Scene setup
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Light setup
function setupLights() {
  const sun = new THREE.DirectionalLight();
  sun.position.set(-50, 50, -50);
  sun.castShadow = true;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  sun.shadow.camera.near = 0.1;
  sun.shadow.camera.far = 100;
  sun.shadow.bias = -0.0005;
  sun.shadow.mapSize = new THREE.Vector2(512, 512);
  scene.add(sun);

  // scene.add(new THREE.CameraHelper(sun.shadow.camera));

  const ambient = new THREE.AmbientLight();
  ambient.intensity = 0.1;
  scene.add(ambient);
}
setupLights();

function animate() {
  renderer.render(scene, camera);
  stats.update();
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
