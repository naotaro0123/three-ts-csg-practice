import * as THREE from 'three';
import { CSG } from '@hi-level/three-csg';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// const MODEL_PATH = '../models/suzannnu.stl';
const MODEL_PATH = '../models/furniture.stl';
// const MODEL_PATH = '../models/benz.stl';

export default class CsgStl {
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private controller: TrackballControls;
  private scene: THREE.Scene;
  private modelMesh: THREE.Mesh;

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

    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(1000);
    this.scene.add(axesHelper);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);

    this.controller = new TrackballControls(this.camera, this.renderer.domElement);
    this.controller.noPan = true;
    this.controller.rotateSpeed = 5;
    this.controller.minDistance = 0;
    this.controller.maxDistance = 1000;

    this.modelLoad();
  }

  modelLoad() {
    const loader = new STLLoader();
    loader.load(MODEL_PATH, geometry => {
      const material = new THREE.MeshStandardMaterial({
        color: 0xff0000
      });
      this.modelMesh = new THREE.Mesh(geometry, material);
      this.modelMesh.position.add(new THREE.Vector3(0.0, 0.0, -2.0));
      // TODO: コメント
      // this.scene.add(this.modelMesh);

      this.createMesh();
      this.render();
    });
  }

  createMesh() {
    // const meshA = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
    const meshA = this.modelMesh;
    const meshB = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));

    meshB.position.add(new THREE.Vector3(0.0, 0.0, 0.2));

    meshB.updateMatrix();
    meshA.updateMatrix();

    // this.scene.add(meshA);
    // this.scene.add(meshB);

    const bspA = CSG.fromMesh(meshA);
    const bspB = CSG.fromMesh(meshB);

    const bspResult = bspA.subtract(bspB);
    // const bspResult = bspA.intersect(bspB);
    const meshResult = CSG.toMesh(bspResult, meshA.matrix);

    // const meshMaterial = new THREE.MeshStandardMaterial({
    //   color: 0xffffff,
    //   wireframe: true
    // });
    // meshResult.material = meshMaterial;
    meshResult.material = meshA.material;
    // TODO: コメントアウト
    this.scene.add(meshResult);
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.controller.update();
    this.renderer.render(this.scene, this.camera);
  }
}
