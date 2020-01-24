import * as THREE from 'three';
import { CSG } from '@hi-level/three-csg';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';

export default class CsgFirst {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private controller: TrackballControls;
  private scene: THREE.Scene;
  private meshA: THREE.Mesh;
  private meshB: THREE.Mesh;
  private meshResult: THREE.Mesh;

  constructor() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    this.camera.position.set(0, 2, 5);

    this.scene = new THREE.Scene();

    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(1000);
    this.scene.add(axesHelper);

    this.controller = new TrackballControls(this.camera, this.renderer.domElement);
    this.controller.noPan = true;
    this.controller.rotateSpeed = 5;
    this.controller.minDistance = 0;
    this.controller.maxDistance = 1000;

    this.createMesh();
    this.render();
  }

  createMesh() {
    this.meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    this.meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

    this.meshB.position.add(new THREE.Vector3(0.5, 0.5, 0.5));
    // TODO: コメント
    // this.scene.add(this.meshA);
    // this.scene.add(this.meshB);

    this.setLoop();
  }

  setLoop() {
    this.meshB.updateMatrix();
    this.meshA.updateMatrix();

    const bspA = CSG.fromMesh(this.meshA);
    const bspB = CSG.fromMesh(this.meshB);

    const bspResult = bspA.subtract(bspB);
    this.meshResult = CSG.toMesh(bspResult, this.meshA.matrix);
    this.meshResult.material = new THREE.MeshBasicMaterial({
      wireframe: true
    });
    // TODO: コメントアウト
    this.scene.add(this.meshResult);
  }

  render() {
    requestAnimationFrame(() => this.render());

    this.setLoop();

    this.controller.update();
    this.renderer.render(this.scene, this.camera);
  }
}
