import * as THREE from "three";
import { World } from "../world";
import { Block } from "../world/block";

export class WorldRenderer {
  private scene: THREE.Scene;
  private world: World;
  private meshes: THREE.InstancedMesh[];
  private blockMaterials: Map<Block, THREE.MeshLambertMaterial>;

  constructor(scene: THREE.Scene, world: World) {
    this.scene = scene;
    this.world = world;
    this.meshes = [];
    this.blockMaterials = new Map();

    this.initializeMaterials();
  }

  private initializeMaterials() {
    this.blockMaterials.set(
      Block.GRASS,
      new THREE.MeshLambertMaterial({ color: 0x55aa55 })
    );
    this.blockMaterials.set(
      Block.DIRT,
      new THREE.MeshLambertMaterial({ color: 0x825432 })
    );
  }

  public render() {
    // Clear previous meshes
    this.dispose();

    // Create block geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const matrix = new THREE.Matrix4();

    // Count instances per material
    const counts = new Map<Block, number>();
    for (let x = 0; x < this.world.width; x++) {
      for (let y = 0; y < this.world.height; y++) {
        for (let z = 0; z < this.world.width; z++) {
          const block = this.world.getBlock(x, y, z);
          if (block !== Block.AIR) {
            counts.set(block, (counts.get(block) || 0) + 1);
          }
        }
      }
    }

    // Create instanced meshes
    this.blockMaterials.forEach((material, block) => {
      const count = counts.get(block) || 0;
      if (count > 0) {
        const mesh = new THREE.InstancedMesh(geometry, material, count);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        let instanceIndex = 0;
        for (let x = 0; x < this.world.width; x++) {
          for (let y = 0; y < this.world.height; y++) {
            for (let z = 0; z < this.world.width; z++) {
              if (this.world.getBlock(x, y, z) === block) {
                matrix.setPosition(x, y, z);
                mesh.setMatrixAt(instanceIndex++, matrix);
              }
            }
          }
        }

        this.meshes.push(mesh);
        this.scene.add(mesh);
      }
    });
  }

  public dispose() {
    this.meshes.forEach((mesh) => {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
      this.scene.remove(mesh);
    });
    this.meshes = [];
  }
}
