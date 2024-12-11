import * as THREE from "three";
import { World } from "../world";
import { Block, BlockProperties } from "../world/block";

export class WorldRenderer {
  private scene: THREE.Scene;
  private world: World;
  private meshes: THREE.InstancedMesh[];

  constructor(scene: THREE.Scene, world: World) {
    this.scene = scene;
    this.world = world;
    this.meshes = [];
  }

  public render() {
    // Clear previous meshes
    this.dispose();

    // Create block geometry
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const matrix = new THREE.Matrix4();

    // Get visible blocks
    const { positions, ids, count } = this.world.getVisibleBlocks();

    // Count instances per material
    const counts = new Map<Block, number>();
    for (let i = 0; i < count; i++) {
      const id = ids[i];
      counts.set(id, (counts.get(id) || 0) + 1);
    }

    // Create instanced meshes
    Object.entries(BlockProperties).forEach(([blockId, props]) => {
      const blockType = parseInt(blockId);
      const blockCount = counts.get(blockType) || 0;

      if (blockCount > 0 && props.solid) {
        const mesh = new THREE.InstancedMesh(
          geometry,
          Array.isArray(props.material) ? props.material : props.material,
          blockCount
        );
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        let instanceIndex = 0;
        for (let i = 0; i < count; i++) {
          if (ids[i] === blockType) {
            const posIndex = i * 3;
            matrix.setPosition(
              positions[posIndex],
              positions[posIndex + 1],
              positions[posIndex + 2]
            );
            mesh.setMatrixAt(instanceIndex++, matrix);
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
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => material.dispose());
      } else if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
      this.scene.remove(mesh);
    });
    this.meshes = [];
  }
}
