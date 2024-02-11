import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertexParticles.glsl";

import GUI from "lil-gui";
import gsap from "gsap";

// import obj1 from "../public/ob1.glb";
// import obj2 from "../public/ob2.glb";
// import obj3 from "../public/ob3.glb";

import { REVISION } from "three";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeeeee, 1);

    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      this.width / this.height,
      0.01,
      1000
    );

    this.camera.position.set(0, 0, 4);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.time = 0;

    console.log("REVISION", REVISION);
    const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
    this.dracoLoader = new DRACOLoader();

    this.dracoLoader.setDecoderPath(
      `${THREE_PATH}/examples/jsm/libs/draco/gltf/`
    );
    // this.dracoLoader.setDecoderPath(
    //   `${THREE_PATH}/examples/jsm/libs/draco/gltf/`
    // );

    this.gltf = new GLTFLoader();
    this.gltf.setDRACOLoader(this.dracoLoader);

    this.isPlaying = true;

    this.addObjects();
    this.resize();
    this.render();
    this.setupResize();
    // this.settings();
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  getRenderTarget() {
    // const renderTarget = new THREE.WebGLRenderTarget( this.width, this.height, {
    //   minFilter: THREE.NearestFilter,
    //   magFilter: THREE.NearestFilter,
    //   format: THREE.RGBAFormat,
    //   type: THREE.FloatType,
    // } );
    // return renderTarget;
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  async addObjects() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
      },

      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

    this.plane = new THREE.Points(this.geometry, this.material);

    // this.gltf.load("../public/ob1.glb", (gltf) => {
    //   this.scene.add(gltf.scene);
    // });

    let { scene: children } = await this.gltf.loadAsync("../public/ob1.glb");

    console.log('children',children);
    this.scene.add(this.plane);
  }

  addLigth() {
    let light1 = new THREE.AmbientLight(0x666666, 0.5);
    this.scene.add(light1);

    let light2 = new THREE.DirectionalLight(0x666666, 0.5);
    light2.position.set(0.5, 0.5, 0.866);
    this.scene.add(light2);
  }
  stop() {
    this.isPlaying = false;
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.05;
    // this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
