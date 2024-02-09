import * as THREE from "three";
import { REVISION } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js"; 

import GUI from "lil-gui";
import gsap from "gsap";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 1);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.01,
      1000
    );

    // let frustumSize = 10;
    // let aspect = this.width / this.height;
    // this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
    this.camera.position.set(0, 0, 4);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
    this.dracoLoader = new DRACOLoader(
      new THREE.LoadingManager()
    ).setDecoderPath(`${THREE_PATH}/examples/jsm/libs/draco/gltf/`);
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    this.isPlaying = true;
    this.setupEvents();
    this.setupFBO(); 
    this.resize();
    this.render();
    this.setupResize();
    // this.setUpSettings();
  }

  setupEvents() {
    this.dummy = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshBasicMaterial()
    );
    this.ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x555555 })
    );
    // this.scene.add(this.ball)
    
  }

  setUpSettings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, "progress", 0, 1, 0.01).onChange((val) => {});
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  getRenderTarget() {
    const renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
    });
    return renderTarget;
  }

  setupFBO() {
    this.size = 256;
    this.fbo = this.getRenderTarget();
    this.fbo1 = this.getRenderTarget();

    this.fboScene = new THREE.Scene();
    this.fboCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    this.fboCamera.position.set(0, 0, 0.5);
    this.fboCamera.lookAt(0, 0, 0);
    let geometry = new THREE.PlaneGeometry(2, 2);

    
    this.renderer.setRenderTarget(this.fbo);
    this.renderer.render(this.fboScene, this.fboCamera);
    this.renderer.setRenderTarget(this.fbo1);
    this.renderer.render(this.fboScene, this.fboCamera);
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
     
    requestAnimationFrame(this.render.bind(this));

      
    this.renderer.setRenderTarget(this.fbo);
    this.renderer.render(this.fboScene, this.fboCamera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
