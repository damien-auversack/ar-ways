import {AfterViewInit, Component, OnInit} from '@angular/core';
import * as THREE from "three";
import {ARButton} from "three/examples/jsm/webxr/ARButton";
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader';
import {Material} from "three";

@Component({
  selector: 'app-ar-scene',
  templateUrl: './ar-scene.component.html',
  styleUrls: ['./ar-scene.component.css']
})
export class ArSceneComponent implements OnInit, AfterViewInit {

  // @ViewChild(ArButtonComponent, {static: true})
   arButton!:  HTMLElement;

  private camera: any;
  private scene: any;
  private controller: any;
  private renderer: any;
  private tabObject  : THREE.Group[] = [];

  constructor() { }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
    this.init();
  }

  initObjectsInMap(arrow: THREE.Group) {
    // let positions = [{x: 0.04034972786903381, y: -0.18314682021737097, z: -0.5702444970607757},
    //   {x: 0.08605100065469742, y: 0.0021906256675720236, z: -1.2070549786090852},
    //   {x: 0.07535369955003261, y: -0.049116116389632224, z: -1.8304659843444824}];

    let positionMurRouge = [
      {x:0.09322841465473175,y:-0.005425304174423218,z:-0.7347625017166137},
      {x:0.20034076720476152,y:-0.09324789047241211,z:-1.572834587097168},
      {x:0.29266699999570844,y:0.04388910830020906,z:-2.747046911716461},
      {x:0.3848316490650177,y:-0.01860302090644836,z:-3.846685492992401},
      {x:0.5440651148557663,y:0.09806131720542907,z:-5.052800667285919},
      {x:0.9403045296669006,y:0.10299928188323976,z:-6.280323624610901},
      {x:1.1395349889993667,y:0.11774035692214965,z:-7.409593105316162},
      {x:1.3196801573038102,y:0.18312819600105287,z:-8.565554308891297},
      {x:1.5548635303974152,y:0.1606364965438843,z:-9.555590641498565},
      {x:1.3769175291061402,y:0.09601531624794007,z:-10.622310471534728}
    ];

    let rotationMurRouge = [];

    for (let i = 0; i < positionMurRouge.length; i++) {

      let cloneArrow = arrow.clone();
      cloneArrow.scale.set(0.1,0.1,0.1);
      cloneArrow.position.set(positionMurRouge[i].x,positionMurRouge[i].y, positionMurRouge[i].z);
      // cloneArrow.rotation.set(rotationMurRouge[i]._x,rotationMurRouge[i]._y, rotationMurRouge[i]._z, rotationMurRouge[i]._order);

      this.scene.add(cloneArrow);
    }

    // for(let elt of positionMurRouge) {
    //   let cloneArrow = arrow.clone();
    //
    //   // cloneArrow.children.forEach(child => {
    //   //   child.rotation.set(0,1.57,0);
    //   // });
    //
    //   cloneArrow.position.set(elt.x,elt.y, elt.z);
    //
    //    this.scene.add(cloneArrow);
    // }
  }

  // objectMenu (objects : THREE.Group[]){
  //   for (let object of objects){
  //     let cloneObject = object.clone();
  //
  //     this.scene.add(cloneObject);
  //   }
  // }

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
    //let arrivalPoint : THREE.Group;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    this.camera.position.z = -30;

      mark = await this.loadObj("mark.obj");
    //arrivalPoint = await this.loadObj("arrival_point.obj");


    this.tabObject.push(mark);
    //this.tabObject.push(arrivalPoint);

    this.initObjectsInMap(mark);
    // this.objectMenu(this.tabObject);

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

      let matrix4 = this.controller.matrixWorld;
      cloneArrow.quaternion.setFromRotationMatrix(matrix4);
      // console.log(JSON.stringify(cloneArrow.position));
      // console.log(JSON.stringify(matrix4));

      // let newMatrix4 = new Matrix4();

      // cloneArrow.quaternion.setFromRotationMatrix(matrix4);
      // let vector1 = new THREE.Vector3();
      // console.log(cloneArrow.getWorldPosition(vector1));
      // let vector2 = new THREE.Vector3();
      // console.log(cloneArrow.getWorldDirection(vector2));

      this.scene.add(cloneArrow);
    }

    // let geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);
    // const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    // const circle = new THREE.Mesh( geometry, material );
    // circle.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);
    // this.scene.add( circle );

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
