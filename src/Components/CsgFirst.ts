import * as THREE from 'three';
import { CSG } from '@hi-level/three-csg';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

export default class CsgFirst {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private controller: TrackballControls;
  private scene: THREE.Scene;

  constructor() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    this.camera.position.set(0, 2, 5);

    this.scene = new THREE.Scene();

    this.controller = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );
    this.controller.noPan = true;
    this.controller.rotateSpeed = 5;
    this.controller.minDistance = 0;
    this.controller.maxDistance = 1000;

    this.createMesh();
    this.render();
  }

  createMesh() {
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xff0000,
    //   wireframe: true
    // });
    // const meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    // const meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    const meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    const meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

    meshB.position.add(new THREE.Vector3(0.5, 0.5, 0.5));

    meshB.updateMatrix();
    meshA.updateMatrix();

    this.scene.add(meshA);
    this.scene.add(meshB);

    const bspA = CSG.fromMesh(meshA);
    const bspB = CSG.fromMesh(meshB);

    const bspResult = bspA.subtract(bspB);
    const meshResult = CSG.toMesh(bspResult, meshA.matrix);

    meshResult.material = meshA.material;
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.controller.update();
    this.renderer.render(this.scene, this.camera);
  }
}
