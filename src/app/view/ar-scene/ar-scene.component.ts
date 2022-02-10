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
      {x:0.5347351789474487,y:-0.2566104717552662,z:1.0276633739471435},
      {x:1.66877338886261,y:-0.29129698202013965,z:1.4227853655815124},
      {x:2.8616808652877808,y:-0.34207494407892225,z:1.8685537278652191},
      {x:4.433653104305267,y:-0.3458532705903053,z:2.3712439000606538},
      {x:6.02781925201416,y:-0.32350502312183377,z:3.534878098964691},
      {x:6.726489186286926,y:-0.283497316390276,z:6.133649396896362},
      {x:7.807040762901306,y:-0.2541145086288452,z:8.298044729232789},
      {x:7.805148038268089,y:-0.24115050584077835,z:11.329696011543273},
      {x:7.331139922142029,y:-0.30226688012480735,z:14.073085498809814},
      {x:6.88460932970047,y:-0.31250290423631666,z:17.947869491577148},
      {x:6.567093142867089,y:-0.29762469232082367,z:22.692348098754884},
      {x:6.425270860642195,y:-0.3105777189135551,z:25.493347764015198},
      {x:6.293514582514763,y:-0.3619734674692154,z:27.39582860469818},
      {x:7.2246346235275265,y:-0.37516073584556575,z:28.97331386208534}
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
