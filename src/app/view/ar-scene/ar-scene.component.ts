import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import * as THREE from "three";
import {ArButtonComponent} from "../ar-button/ar-button.component";
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {Matrix4} from "three";

@Component({
  selector: 'app-ar-scene',
  templateUrl: './ar-scene.component.html',
  styleUrls: ['./ar-scene.component.css']
})
export class ArSceneComponent implements OnInit, AfterViewInit {

  @ViewChild(ArButtonComponent, {static: true})
  arButton!: ArButtonComponent;

  private camera: any;
  private scene: any;
  private controller: any;
  private renderer: any;

  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.init();
  }

  initObjectsInMap(arrow: THREE.Group) {
    let positions = [{x: 0.04034972786903381, y: -0.18314682021737097, z: -0.5702444970607757},
      {x: 0.08605100065469742, y: 0.0021906256675720236, z: -1.2070549786090852},
      {x: 0.07535369955003261, y: -0.049116116389632224, z: -1.8304659843444824}];

    for(let elt of positions) {
      let cloneArrow = arrow.clone();

      cloneArrow.children.forEach(child => {
        child.rotation.set(0,1.57,0);
      });

      cloneArrow.position.set(elt.x,elt.y, elt.z);

       this.scene.add(cloneArrow);
    }
  }

  loadObj() {
    return new Promise<THREE.Group>(resolve => {
      let objLoader = new OBJLoader;
      objLoader.load('assets/arrow.obj', (object) => {
        resolve(object);
      });

    });
  }

  async init() {
    let arrow: THREE.Group;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    this.camera.position.z = -30;

    arrow = await this.loadObj();

    this.initObjectsInMap(arrow);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.arButton.createButton(this.renderer);

    const onSelect = () => {
      let cloneArrow = arrow.clone();
      cloneArrow.children.forEach(child => {
        child.rotation.set(0,0.5*Math.PI,0.1*Math.PI);
      });

      cloneArrow.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);

      let matrix4 = this.controller.matrixWorld;
      cloneArrow.quaternion.setFromRotationMatrix(matrix4);

      // cloneArrow.quaternion.setFromRotationMatrix(matrix4);

      this.scene.add(cloneArrow);
    }

    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select', onSelect);
    this.scene.add(this.controller);
    let that = this;
    window.addEventListener('resize', () => {
      that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();

      that.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    await this.animate();
  }

  animate() {
    let that = this;
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(that.scene, that.camera);
    });
  }

}
