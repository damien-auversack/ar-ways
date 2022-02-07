import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import * as THREE from "three";
import {ArButtonComponent} from "../ar-button/ar-button.component";
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';

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
  // private geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);

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



    /*this.scene.add(this.arrow);*/
    /*
    this.arrow.position.set(0, 0, 0);*/
    /*this.arrow.quaternion.setFromRotationMatrix(this.controller.matrixWorld);*/

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.arButton.createButton(this.renderer);

    const onSelect = () => {
      /*const material = new THREE.MeshPhongMaterial({color: 0xffffff * Math.random()});
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);
      mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);*/
      let cloneArrow = arrow.clone();

      cloneArrow.children.forEach(child => {
        child.rotation.set(0.50,1.57,0);
      });

      cloneArrow.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);
      cloneArrow.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
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
