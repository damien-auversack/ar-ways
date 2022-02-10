import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as THREE from "three";
import {ARButton} from "three/examples/jsm/webxr/ARButton";
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-ar-scene',
  templateUrl: './ar-scene.component.html',
  styleUrls: ['./ar-scene.component.css']
})
export class ArSceneComponent implements OnInit, AfterViewInit {

  arButton!:  HTMLElement;

  private camera: any;
  private scene: any;
  private controller: any;
  private renderer: any;
  private tabObject  : THREE.Group[] = [];

  private role:string | null="user";

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.role = this.route.snapshot.paramMap.get("role");
  }

  ngAfterViewInit(): void {
    this.init();
  }

  initObjectsInMap(arrow: THREE.Group) {

    let positionMurRouge = [
      {x:0.9244642913341522,y:-0.1844748028088361,z:-0.38383633345365525},
      {x:2.8128344297409056,y:-0.22932210192084312,z:-1.1925869025290012},
      {x:4.984603631496429,y:-0.21732091829180716,z:-1.5279250301420688},
      {x:7.921717059612274,y:-0.24390449598431588,z:-2.6567683696746824},
      {x:8.842432618141174,y:-0.29459571838378906,z:-1.4168914079666137},
      {x:8.502590316534043,y:-0.23058578446507452,z:0.9152313709259033},
      {x:7.499926126003265,y:-0.24415931552648543,z:2.704297125339508},
      {x:5.861606526374817,y:-0.21606023684144018,z:4.030923330783844},
      {x:3.2977304458618164,y:-0.24117435067892073,z:5.4702409386634825},
      {x:0.9186986923217774,y:-0.22439116537570952,z:6.75521103143692},
      {x:-1.6144107341766358,y:-0.26287401616573336,z:7.7809570416808125},
      {x:-4.931646668910981,y:-0.2310568779706955,z:9.257667940855026},
      {x:-7.142885386943817,y:-0.1951093778014183,z:9.85431264936924},
      {x:-6.8382243633270265,y:-0.1449031740427017,z:11.290864074230194}
    ];

    let rotationMurRouge = [];

    for (let i = 0; i < positionMurRouge.length; i++) {
      let cloneArrow = arrow.clone();
      cloneArrow.scale.set(0.1,0.1,0.1);
      cloneArrow.position.set(positionMurRouge[i].x,positionMurRouge[i].y, positionMurRouge[i].z);

      this.scene.add(cloneArrow);
    }
  }

  loadObj(objString : string) {
    return new Promise<THREE.Group>(resolve => {
      let objLoader = new OBJLoader;
      objLoader.setPath("assets/");
      objLoader.load(objString, (object) => {
        object.traverse((obj) => {
          if(obj instanceof THREE.Mesh){
            obj.material.color.setHex(0x8f0000);
          }
        })
        resolve(object);
      });
    });
  }

  async init() {
    let mark: THREE.Group;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    this.camera.position.z = -30;

    mark = await this.loadObj("mark.obj");

    this.tabObject.push(mark);

    if(this.role != "admin") {
      this.initObjectsInMap(mark);
    }

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);

    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.arButton = ARButton.createButton(this.renderer);


    this.arButton.classList.add(
    "btn-padding", "font-weight", "button-no-border", "btn-width", "btn-height", "btn-radius", "textAlign", "btn-bottom", "btn-bg-color", "btn-color", "cursor-pointer"
    );

    document.body.appendChild(this.arButton);

    const onSelect = () => {
      let cloneArrow = mark.clone();
      cloneArrow.children.forEach(child => {
        child.rotation.set(0,0,0);
      });

      cloneArrow.scale.set(0.1,0.1,0.1);

      cloneArrow.position.set(0, 0, -0.6).applyMatrix4(this.controller.matrixWorld);

      console.log(JSON.stringify(cloneArrow.position));

      let matrix4 = this.controller.matrixWorld;
      cloneArrow.quaternion.setFromRotationMatrix(matrix4);

      this.scene.add(cloneArrow);
    }

    this.controller = this.renderer.xr.getController(0);
    if(this.role == "admin") {
      this.controller.addEventListener('select', onSelect);
    }

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
