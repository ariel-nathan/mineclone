// Utility function to load textures as ImageBitmap for WebGPU
export async function loadTexture(path: string): Promise<ImageBitmap> {
  const response = await fetch(path);
  const blob = await response.blob();
  return await createImageBitmap(blob, {
    premultiplyAlpha: "none",
    colorSpaceConversion: "none",
  });
}
