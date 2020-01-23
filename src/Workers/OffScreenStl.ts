import * as THREE from 'three';
// import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import insideWorker from 'offscreen-canvas/inside-worker';

const MODEL_PATH = '../models/furniture.stl';

let workerMain: WorkerMain;
insideWorker(event => {
  if (event.data.canvas) {
    workerMain = new WorkerMain(event.data.canvas);
  } else if (event.data.type === 'resize') {
    workerMain.resize(event.data.width, event.data.height);
  }
});


class WorkerMain {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  // private controller: TrackballControls;
  private scene: THREE.Scene;
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

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    this.camera.position.set(0, 2, 5);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    // this.controller = new TrackballControls(this.camera, this.renderer.domElement);
    // this.controller.noPan = true;
    // this.controller.rotateSpeed = 5;
    // this.controller.minDistance = 0;
    // this.controller.maxDistance = 1000;

    this.modelLoad();
  }

  modelLoad() {
    const loader = new STLLoader();
    loader.load(MODEL_PATH, geometry => {
      const material = new THREE.MeshStandardMaterial({
        color: 0xff0000
      });
      this.modelMesh = new THREE.Mesh(geometry, material);
      this.modelMesh.rotation.x = -90;
      this.modelMesh.position.add(new THREE.Vector3(1.5, 0.0, 0.0));
      this.scene.add(this.modelMesh);
      this.render();
    });
  }

  render() {
    // this.controller.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.render());
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
