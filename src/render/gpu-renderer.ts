import { Camera } from "../lib/camera";
import fragmentShaderCode from "../shaders/main.frag.wgsl?raw";
import vertexShaderCode from "../shaders/main.vert.wgsl?raw";
import { World } from "../world";
import { BlockManager } from "./block-manager";

interface BlockInstance {
  position: [number, number, number];
  type: number;
}

export class GPURenderer {
  private canvas: HTMLCanvasElement;
  private device!: GPUDevice;
  private context!: GPUCanvasContext;
  private format!: GPUTextureFormat;
  private pipeline!: GPURenderPipeline;
  private vertexBuffer!: GPUBuffer;
  private indexBuffer!: GPUBuffer;
  private uniformBuffer!: GPUBuffer;
  private bindGroup!: GPUBindGroup;
  private depthTexture!: GPUTexture;
  private camera: Camera;
  private instanceBuffer!: GPUBuffer;
  private maxInstances = 100000;
  private blockManager: BlockManager;
  private activeInstances = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.camera = new Camera();
    this.blockManager = new BlockManager();
  }

  async initialize(): Promise<boolean> {
    if (!navigator.gpu) {
      console.error("WebGPU not supported");
      return false;
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.error("No GPU adapter found");
      return false;
    }

    this.device = await adapter.requestDevice();
    this.context = this.canvas.getContext("webgpu")!;
    this.format = navigator.gpu.getPreferredCanvasFormat();

    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "premultiplied",
    });

    await this.createBuffers();
    await this.createPipeline();
    this.createDepthBuffer();

    this.camera.updateProjection(this.canvas.width / this.canvas.height);
    this.camera.updateView();

    return true;
  }

  private async createBuffers() {
    // Define cube vertices with colors for each face
    const vertices = new Float32Array([
      // Front face (red)
      -1, -1, 1, 1, 0, 0, 1, -1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, -1, 1, 1, 1, 0,
      0,

      // Back face (green)
      1, -1, -1, 0, 1, 0, -1, -1, -1, 0, 1, 0, -1, 1, -1, 0, 1, 0, 1, 1, -1, 0,
      1, 0,

      // Top face (blue)
      -1, 1, -1, 0, 0, 1, -1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, -1, 0, 0,
      1,

      // Bottom face (yellow)
      -1, -1, -1, 1, 1, 0, 1, -1, -1, 1, 1, 0, 1, -1, 1, 1, 1, 0, -1, -1, 1, 1,
      1, 0,

      // Right face (magenta)
      1, -1, -1, 1, 0, 1, 1, 1, -1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, -1, 1, 1, 0,
      1,

      // Left face (cyan)
      -1, -1, -1, 0, 1, 1, -1, -1, 1, 0, 1, 1, -1, 1, 1, 0, 1, 1, -1, 1, -1, 0,
      1, 1,
    ]);

    const indices = new Uint16Array([
      0,
      1,
      2,
      2,
      3,
      0, // Front
      4,
      5,
      6,
      6,
      7,
      4, // Back
      8,
      9,
      10,
      10,
      11,
      8, // Top
      12,
      13,
      14,
      14,
      15,
      12, // Bottom
      16,
      17,
      18,
      18,
      19,
      16, // Right
      20,
      21,
      22,
      22,
      23,
      20, // Left
    ]);

    this.vertexBuffer = this.device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
    this.vertexBuffer.unmap();

    this.indexBuffer = this.device.createBuffer({
      size: indices.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    new Uint16Array(this.indexBuffer.getMappedRange()).set(indices);
    this.indexBuffer.unmap();

    this.instanceBuffer = this.device.createBuffer({
      size: this.maxInstances * 16,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.uniformBuffer = this.device.createBuffer({
      size: 64 * 2,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  private async createPipeline() {
    const shaderModule = this.device.createShaderModule({
      code: vertexShaderCode,
    });

    const fragmentModule = this.device.createShaderModule({
      code: fragmentShaderCode,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    });

    this.pipeline = await this.device.createRenderPipelineAsync({
      layout: pipelineLayout,
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            // Vertex buffer
            arrayStride: 24,
            attributes: [
              {
                shaderLocation: 0,
                offset: 0,
                format: "float32x3",
              },
              {
                shaderLocation: 1,
                offset: 12,
                format: "float32x3",
              },
            ],
          },
          {
            // Instance buffer
            arrayStride: 16,
            stepMode: "instance",
            attributes: [
              {
                shaderLocation: 2,
                offset: 0,
                format: "float32x3",
              },
              {
                shaderLocation: 3,
                offset: 12,
                format: "float32",
              },
            ],
          },
        ],
      },
      fragment: {
        module: fragmentModule,
        entryPoint: "fragmentMain",
        targets: [{ format: this.format }],
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
        frontFace: "ccw",
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });

    this.bindGroup = this.device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.uniformBuffer },
        },
      ],
    });
  }

  private createDepthBuffer() {
    this.depthTexture = this.device.createTexture({
      size: {
        width: this.canvas.width,
        height: this.canvas.height,
      },
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  updateCamera() {
    // Update camera matrices
    this.camera.updateView();

    // Update uniform buffer with new matrices
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      this.camera.projectionMatrix as Float32Array
    );
    this.device.queue.writeBuffer(
      this.uniformBuffer,
      64, // Offset for modelView matrix
      this.camera.viewMatrix as Float32Array
    );
  }

  handleResize() {
    // Update canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Update camera projection
    this.camera.updateProjection(this.canvas.width / this.canvas.height);

    // Recreate depth buffer
    this.depthTexture.destroy();
    this.createDepthBuffer();

    // Update context configuration
    this.context.configure({
      device: this.device,
      format: this.format,
      alphaMode: "premultiplied",
    });
  }

  updateInstances(instances: BlockInstance[]) {
    const instanceData = new Float32Array(instances.length * 4); // 4 floats per instance

    for (let i = 0; i < instances.length; i++) {
      const baseIndex = i * 4;
      const instance = instances[i];

      instanceData[baseIndex] = instance.position[0];
      instanceData[baseIndex + 1] = instance.position[1];
      instanceData[baseIndex + 2] = instance.position[2];
      instanceData[baseIndex + 3] = instance.type;
    }

    this.device.queue.writeBuffer(this.instanceBuffer, 0, instanceData);
  }

  updateWorld(world: World) {
    this.blockManager.updateFromWorld(world);
    const instances = this.blockManager.getInstances();
    this.activeInstances = instances.length;
    this.updateInstances(instances);
  }

  render() {
    // Update camera and uniforms
    this.updateCamera();

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.5, g: 0.6, b: 0.9, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: this.depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    // Set pipeline and vertex/index buffers
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, this.bindGroup);
    renderPass.setVertexBuffer(0, this.vertexBuffer);
    renderPass.setVertexBuffer(1, this.instanceBuffer);
    renderPass.setIndexBuffer(this.indexBuffer, "uint16");

    // Draw instances
    renderPass.drawIndexed(36, this.activeInstances);

    renderPass.end();
    this.device.queue.submit([commandEncoder.finish()]);
  }

  get cameraController() {
    return this.camera;
  }
}
