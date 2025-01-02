struct Uniforms {
  projectionMatrix: mat4x4f,
  modelViewMatrix: mat4x4f,
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
  @location(0) position: vec3f,
  @location(1) color: vec3f,
  @location(2) instancePosition: vec3f,
  @location(3) instanceType: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
}

@vertex
fn vertexMain(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  
  // Transform vertex position by instance position
  let worldPos = input.position + input.instancePosition;
  output.position = uniforms.projectionMatrix * uniforms.modelViewMatrix * vec4f(worldPos, 1.0);
  
  // Pass through the face color
  output.color = input.color;
  
  return output;
}