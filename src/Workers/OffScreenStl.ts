import * as THREE from 'three';
import { CSG } from '@hi-level/three-csg';
// import ProceduralTexture from '../Components/ProceduralTexture';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import insideWorker from 'offscreen-canvas/inside-worker';

let timer = 0;
// const MODEL_PATH = '../models/benz.stl';
const MODEL_PATH = '../models/box.stl';

let workerMain: WorkerMain;
insideWorker(event => {
  if (event.data.canvas) {
    workerMain = new WorkerMain(event.data.canvas);
  } else if (event.data.type === 'resize') {
    workerMain.resize(event.data.width, event.data.height);
  }
});

// 'union' => 結合：青
// 'intersect' => 交差：緑
// 'subtract' => 減産：赤
class WorkerMain {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private results: THREE.Mesh[] = [];
  private box: THREE.Mesh;
  private sphere: THREE.Mesh;
  // private proceduralTexture: ProceduralTexture;
  private subMaterial: THREE.MeshStandardMaterial;
  private intersectMaterial: THREE.MeshStandardMaterial;
  private unionMaterial: THREE.MeshStandardMaterial;
  private modelMesh: THREE.Mesh;

  constructor(offscreenCanvas) {
    const width = offscreenCanvas.width;
    const height = offscreenCanvas.height;

    offscreenCanvas.style = { width: 0, height: 0 };
    this.renderer = new THREE.WebGLRenderer({
      canvas: offscreenCanvas
    });
    this.renderer.setSize(width, height);
    // this.renderer.setPixelRatio(window.devicePixelRatio);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
    this.scene = new THREE.Scene();


    // this.proceduralTexture = new ProceduralTexture();

    this.sphere = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), this.makeMaterial('grey'));
    this.scene.add(this.sphere);

    this.subMaterial = this.makeMaterial('red');
    this.intersectMaterial = this.makeMaterial('green');
    this.unionMaterial = this.makeMaterial('blue');

    for (let i = 0; i < 8; i++) {
      this.createLight();
    }

    this.modelLoad();
  }

  modelLoad() {
    const loader = new STLLoader();
    loader.load(MODEL_PATH, geometry => {
      const material = new THREE.MeshStandardMaterial({
        color: 0xff0000
      });
      this.modelMesh = new THREE.Mesh(geometry, material);
      const scaleSize = 1.0;
      this.modelMesh.scale.x = this.modelMesh.scale.y = this.modelMesh.scale.z = scaleSize;
      this.scene.add(this.modelMesh);

      // this.box = this.modelMesh;
      this.box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), this.makeMaterial('grey'));
      // this.modelMesh.copy(this.box);
      this.scene.add(this.box);
      // this.renderer.setAnimationLoop(() => this.render());
      this.render();
    });
  }

  makeMaterial(color: string) {
    // const loader = new THREE.TextureLoader();
    // const texture = loader.load('../images/Ee9uPcKx.jpeg');
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 1,
      metalness: 0.8,
      // map: texture
      // map: this.proceduralTexture.texture
      wireframe: true
    });
  }

  doCSG(meshA: THREE.Mesh, meshB: THREE.Mesh, operation: 'subtract' | 'intersect' | 'union', material: THREE.Material) {
    const bspA = CSG.fromMesh(meshA);
    const bspB = CSG.fromMesh(meshB);
    const bspC = bspA[operation](bspB);
    const result = CSG.toMesh(bspC, meshA.matrix);
    result.material = material;
    result.castShadow = result.receiveShadow = true;
    return result;
  }

  reCompute() {
    for (let i = 0; i < this.results.length; i++) {
      let m = this.results[i];
      m.parent.remove(m);
      m.geometry.dispose();
    }
    this.results = [];

    this.box.updateMatrix();
    this.sphere.updateMatrix();

    this.results.push(this.doCSG(this.box, this.sphere, 'subtract', this.subMaterial));
    this.results.push(this.doCSG(this.box, this.sphere, 'intersect', this.intersectMaterial));
    this.results.push(this.doCSG(this.box, this.sphere, 'union', this.unionMaterial));

    this.results.push(this.doCSG(this.sphere, this.box, 'subtract', this.subMaterial));
    this.results.push(this.doCSG(this.sphere, this.box, 'intersect', this.intersectMaterial));
    this.results.push(this.doCSG(this.sphere, this.box, 'union', this.unionMaterial));

    for (let i = 0; i < this.results.length; i++) {
      this.scene.add(this.results[i]);
      this.results[i].position.z += -5 + (i % 3) * 5;
      this.results[i].position.x += -5 + ((i / 3) | 0) * 10;
    }
  }

  createLight() {
    const rnd = rng => (Math.random() * 2 - 1) * (rng || 1);
    let light = new THREE.PointLight();
    light.position.set(rnd(20), rnd(3) + 5, rnd(20));
    this.scene.add(light);
  }

  render() {
    timer += 20;
    this.reCompute();
    this.sphere.position.x = Math.sin(timer * 0.001) * 2;
    this.sphere.position.z = Math.cos(timer * 0.0011) * 0.5;
    this.sphere.position.y = Math.sin(timer * -0.0012) * 0.5;

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
