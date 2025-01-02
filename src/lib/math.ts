import { mat4, vec3 } from "gl-matrix";

export class Camera {
  public position: vec3;
  public target: vec3;
  public up: vec3;
  public projectionMatrix: mat4;
  public viewMatrix: mat4;
  private spherical: {
    radius: number;
    phi: number; // vertical angle
    theta: number; // horizontal angle
  };

  constructor() {
    this.position = vec3.fromValues(0, 0, 5);
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);
    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.spherical = {
      radius: 5,
      phi: Math.PI / 2,
      theta: 0,
    };
    this.updatePositionFromSpherical();
  }

  private updatePositionFromSpherical() {
    const sinPhiRadius = Math.sin(this.spherical.phi) * this.spherical.radius;
    vec3.set(
      this.position,
      sinPhiRadius * Math.sin(this.spherical.theta),
      this.spherical.radius * Math.cos(this.spherical.phi),
      sinPhiRadius * Math.cos(this.spherical.theta)
    );
    vec3.add(this.position, this.position, this.target);
  }

  orbit(deltaTheta: number, deltaPhi: number) {
    this.spherical.theta += deltaTheta;
    this.spherical.phi = Math.max(
      0.1,
      Math.min(Math.PI - 0.1, this.spherical.phi + deltaPhi)
    );
    this.updatePositionFromSpherical();
  }

  setDistance(distance: number) {
    this.spherical.radius = Math.max(1, distance);
    this.updatePositionFromSpherical();
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
