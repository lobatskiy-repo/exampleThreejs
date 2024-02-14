import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import fragment from "../js/shader/fragment.glsl";
import vertex from "../js/shader/vertex.glsl";

import GUI from "lil-gui";
import gsap from "gsap";

// import obj1 from "../public/ob1.glb";
// import obj2 from "../public/ob2.glb";
// import obj3 from "../public/ob3.glb";
import matcap from "../public/matcap2.png";
import scan from "../public/scan.png";

import { REVISION } from "three";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.dummy = new THREE.Object3D();

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

    let frustumSize = 4;
    let aspect = window.innerWidth / window.innerHeight;

    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      -1000,
      1000
    );

    this.camera.position.set(8, 12, 16);
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
    let that = this;

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uMatcap: { value: new THREE.TextureLoader().load(matcap) },
        uScan: { value: new THREE.TextureLoader().load(scan) },
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

    let { scene: children1 } = await this.gltf.loadAsync("../public/ob1.glb");
    let geo1 = children1.children[0].geometry;

    let { scene: children2 } = await this.gltf.loadAsync("../public/ob2.glb");
    let geo2 = children2.children[0].geometry;
    let { scene: children3 } = await this.gltf.loadAsync("../public/ob3.glb");
    let geo3 = children3.children[0].geometry;

    let mat = new THREE.MeshMatcapMaterial({
      matcap: new THREE.TextureLoader().load(matcap),
    });

    console.log(this.material);
    const rows = 10;
    this.count = rows * rows;
    let random = new Float32Array(this.count);

    this.instanced = new THREE.InstancedMesh(geo1, this.material, this.count);

    let index = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < rows; j++) {
        random[index] = Math.random();
        this.dummy.position.set(i - rows / 2, -10, j - rows / 2);
        this.dummy.updateMatrix();
        this.instanced.setMatrixAt(index++, this.dummy.matrix);
      }
    }
   console.log(' this.instanced.geometry', this.instanced.geometry);
    
    this.instanced.instanceMatrix.needsUpdate = true;
    this.instanced.geometry.setAttribute("aRandom",new THREE.InstancedBufferAttribute(random,1))

    console.log("geo1", geo1, geo2, geo3);
    this.scene.add(this.instanced);
  }

  // addLigth() {
  //   let light1 = new THREE.AmbientLight(0x666666, 0.5);
  //   this.scene.add(light1);

  //   let light2 = new THREE.DirectionalLight(0x666666, 0.5);
  //   light2.position.set(0.5, 0.5, 0.866);
  //   this.scene.add(light2);
  // }
  stop() {
    this.isPlaying = false;
  }

  render() {
    if (!this.isPlaying) return;
    this.time += 0.01;
    this.material.uniforms.time.value = this.time;
    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch({
  dom: document.getElementById("container"),
});
