import * as THREE from 'three';

export default class ProceduralTexture {
  public texture: THREE.Texture;

  constructor() {
    this.texture = this.makeProceduralTexture(256, (u, v) => {
      const rb = ((Math.random() * 128) | 0) * ((((u * 2) & 1) ^ ((v * 2) & 1)) | 0 ? 1 : 2);
      return (rb * 256) | (rb * 256 * 256) | (rb * 256 * 256 * 256) | 0x000000ff;
    });
    this.texture.repeat.set(2, 2);
    this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
  }

  makeProceduralTexture(dim: number, fn: Function) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = dim;
    const context = canvas.getContext('2d');
    const ImageDataObject = context.getImageData(0, 0, dim, dim);
    const u32view = new DataView(ImageDataObject.data.buffer);
    let idx = -4;

    for (let j = 0; j < dim; j++) {
      for (let i = 0; i < dim; i++) {
        u32view.setUint32((idx += 4), fn(j / dim, i / dim) | 0);
      }
    }
    context.putImageData(ImageDataObject, 0, 0);
    const tempTexture = new THREE.Texture(canvas);
    tempTexture.needsUpdate = true;
    return tempTexture;
  }
}
