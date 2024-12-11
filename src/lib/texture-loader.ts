import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

export async function loadTexture(path: string) {
  const texture = await textureLoader.loadAsync(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}
