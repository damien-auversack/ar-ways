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
      {x:0.8745045602321624,y:-0.2739082586020231,z:-0.3603585787117481},
      {x:3.1680578708648683,y:-0.3182558462023735,z:-1.182230930030346},
      {x:6.1870012283325195,y:-0.30929729044437404,z:-1.4953595466911793},
      {x:7.625592422485352,y:-0.3144038781523705,z:-2.1167453289031983},
      {x:8.514848798513412,y:-0.2619767814874649,z:-1.3775046467781067},
      {x:8.404457034170628,y:-0.29459246918559073,z:1.1127437949180603},
      {x:7.010167419910431,y:-0.32220600098371505,z:3.859734070301056},
      {x:5.677921628952026,y:-0.24405412673950194,z:5.742780983448029},
      {x:3.868152117729187,y:-0.26187904477119445,z:5.296583712100983},
      {x:1.3693578600883485,y:-0.28173938095569606,z:4.920000100135804},
      {x:-1.514274501800537,y:-0.2741994887590408,z:6.160470551252365},
      {x:-5.317743575572967,y:-0.2508163467049599,z:7.036215889453888},
      {x:-7.143696641921997,y:-0.2546103864908218,z:7.7545529216527935},
      {x:-8.73717622756958,y:-0.2734651371836662,z:8.046652971208095},
      {x:-8.86052625477314,y:-0.1677434455603361,z:9.874019193649293}
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
