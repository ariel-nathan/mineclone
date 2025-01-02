import { mat4, vec3 } from "gl-matrix";

// Orbital camera controller with perspective projection
export class Camera {
  public position: vec3;
  public target: vec3;
  public up: vec3;
  public projectionMatrix: mat4;
  public viewMatrix: mat4;

  private distance: number;
  private rotationX: number; // Vertical rotation (pitch)
  private rotationY: number; // Horizontal rotation (yaw)

  constructor() {
    this.position = vec3.create();
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);
    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();

    this.distance = 5;
    this.rotationX = Math.PI / 6; // 30 degrees
    this.rotationY = Math.PI / 4; // 45 degrees
    this.updatePosition();
  }

  private updatePosition() {
    // Calculate position based on spherical coordinates
    const x = Math.cos(this.rotationY) * Math.cos(this.rotationX);
    const y = Math.sin(this.rotationX);
    const z = Math.sin(this.rotationY) * Math.cos(this.rotationX);

    vec3.set(
      this.position,
      this.target[0] + x * this.distance,
      this.target[1] + y * this.distance,
      this.target[2] + z * this.distance
    );
  }

  orbit(deltaX: number, deltaY: number) {
    this.rotationY += deltaX;
    this.rotationX = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.rotationX + deltaY)
    );
    this.updatePosition();
  }

  setTarget(x: number, y: number, z: number) {
    vec3.set(this.target, x, y, z);
    this.updatePosition();
  }

  zoom(factor: number) {
    this.distance = Math.max(1, this.distance * factor);
    this.updatePosition();
  }

  updateProjection(aspect: number) {
    mat4.perspective(
      this.projectionMatrix,
      (45 * Math.PI) / 180,
      aspect,
      0.1,
      1000.0
    );
  }

  updateView() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }
}
