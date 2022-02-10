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
      { x:-0.8035698115825654,y:-0.33110535219311715,z:0.6899660974740982},
      { x:-1.555581498146057,y:-0.31838369145989415,z:1.009233859181404},
      { x:-2.172429418563843,y:-0.29462039545178415,z:1.2348949790000916},
      { x:-2.886928606033325,y:-0.3350441589951515,z:1.6650019228458404},
      { x:-3.668521451950073,y:-0.34045746028423307,z:2.0547499656677246},
      { x:-4.874862325191498,y:-0.41727534532546995,z:2.4133168160915375},
      { x:-5.734512913227081,y:-0.3801468729972839,z:2.336302661895752},
      { x:-6.835182058811188,y:-0.3361766651272774,z:2.3854955464601515},
      { x:-8.048747944831849,y:-0.33001238107681274,z:2.5109259374439716},
      { x:-8.993964159488678,y:-0.3090409591794014,z:2.5252756491303443},
      { x:-9.860274136066437,y:-0.282186072319746,z:2.556546151638031},
      { x:-10.693307650089263,y:-0.19474367331713438,z:2.420495939254761},
      { x:-11.412199604511262,y:-0.18555554151535034,z:2.2418111205101012},
      { x:-12.16071845293045,y:-0.16968948170542716,z:2.397837755084038},
      { x:-12.342974030971527,y:-0.23127851784229275,z:3.08725346326828},
      { x:-12.25266174376011,y:-0.23428282961249353,z:3.743296754360199},
      { x:-12.25214260071516,y:-0.23738943785429,z:3.750444710254669},
      { x:-11.8226797580719,y:-0.4503222309052944,z:3.5125588059425352}
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
