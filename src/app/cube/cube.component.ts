import {Component, OnInit, AfterViewInit, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from "three";
import {WebGLRenderer} from "three";
import type {XRSystem} from 'webxr';

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.css']
})
export class CubeComponent implements OnInit, AfterViewInit {


  @ViewChild('canvas')
  private canvasRef: ElementRef | undefined;

  // Cube properties
  @Input() public rotationSpeedX: number = 0.05;
  @Input() public rotationSpeedY: number = 0.01;
  @Input() public size: number = 200;
  @Input() public texture: string = "/assets/texture.jpg";

  // Stage properties
  @Input() public cameraZ: number = 400;
  @Input() public fieldOfView: number = 1;

  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;

  //Helper Properties (private)
  //private camera!: THREE.PerspectiveCamera;

  private camera: any;
  private scene: any;
  private controller: any;

  private renderer!: THREE.WebGLRenderer;

  //private scene!: THREE.Scene;

  constructor() {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.init();
    this.animate();
  }

  // ------------------ AR BUTTON ------------------

  public createButton(renderer: WebGLRenderer, sessionInit: any = {}) {
    const xr = (navigator as any)?.xr as XRSystem;
    const button = document.createElement('button');

    function showStartAR() {

      if (sessionInit.domOverlay === undefined) {

        let overlay = document.createElement('div');
        overlay.style.display = 'none';
        document.body.appendChild(overlay);

        let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '38');
        svg.setAttribute('height', '38');
        svg.style.position = 'absolute';
        svg.style.right = '20px';
        svg.style.top = '20px';
        svg.addEventListener('click', function () {

          currentSession.end();

        });
        overlay.appendChild(svg);

        let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M 12,12 L 28,28 M 28,12 12,28');
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '2');
        svg.appendChild(path);

        if (sessionInit.optionalFeatures === undefined) {

          sessionInit.optionalFeatures = [];

        }

        sessionInit.optionalFeatures.push('dom-overlay');
        sessionInit.domOverlay = {root: overlay};

      }

      let currentSession: any = null;

      async function onSessionStarted(session: any) {
        session.addEventListener('end', onSessionEnded);
        renderer.xr.setReferenceSpaceType('local');

        await renderer.xr.setSession(session);
        button.textContent = 'STOP AR';
        sessionInit.domOverlay.root.style.display = '';
        currentSession = session;
      }

      function onSessionEnded() {

        currentSession.removeEventListener('end', onSessionEnded);

        button.textContent = 'START AR';
        sessionInit.domOverlay.root.style.display = 'none';

        currentSession = null;

      }

      button.style.display = '';
      button.style.cursor = 'pointer';
      button.style.left = 'calc(50% - 50px)';
      button.style.width = '100px';
      button.textContent = 'START AR';

      button.onmouseenter = function () {
        button.style.opacity = '1.0';
      };

      button.onmouseleave = function () {
        button.style.opacity = '0.5';
      };

      button.onclick = function () {

        if (currentSession === null) {
          xr.requestSession('immersive-ar', sessionInit).then(onSessionStarted);
        } else {
          currentSession.end();
        }

      };

    }

    function disableButton() {

      button.style.display = '';

      button.style.cursor = 'auto';
      button.style.left = 'calc(50% - 75px)';
      button.style.width = '150px';

      button.onmouseenter = null;
      button.onmouseleave = null;

      button.onclick = null;

    }

    function showARNotSupported() {
      disableButton();
      button.textContent = 'AR NOT SUPPORTED';
    }

    function stylizeElement(element: any) {

      element.style.position = 'absolute';
      element.style.bottom = '20px';
      element.style.padding = '12px 6px';
      element.style.border = '1px solid #fff';
      element.style.borderRadius = '4px';
      element.style.background = 'rgba(0,0,0,0.1)';
      element.style.color = '#fff';
      element.style.font = 'normal 13px sans-serif';
      element.style.textAlign = 'center';
      element.style.opacity = '0.5';
      element.style.outline = 'none';
      element.style.zIndex = '999';

    }

    if ('xr' in navigator) {

      button.id = 'ARButton';
      button.style.display = 'none';

      stylizeElement(button);

      xr.isSessionSupported('immersive-ar').then(function (supported) {

        supported ? showStartAR() : showARNotSupported();

      }).catch(showARNotSupported);

      return button;

    } else {

      const message = document.createElement('a');

      if (!window.isSecureContext) {

        message.href = document.location.href.replace(/^http:/, 'https:');
        message.innerHTML = 'WEBXR NEEDS HTTPS';

      } else {

        message.href = 'https://immersiveweb.dev/';
        message.innerHTML = 'WEBXR NOT AVAILABLE';

      }

      message.style.left = 'calc(50% - 90px)';
      message.style.width = '180px';
      message.style.textDecoration = 'none';

      stylizeElement(message);

      return message;

    }


  }

  // ------------------ App ------------------

  private geometry = new THREE.CylinderGeometry(0, 0.05, 0.2, 32).rotateX(Math.PI / 2);

  init() {

    const container = document.createElement('div');
    document.body.appendChild(container);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    container.appendChild(this.renderer.domElement);

    document.body.appendChild(this.createButton(this.renderer));

    const onSelect = () => {
      const material = new THREE.MeshPhongMaterial({color: 0xffffff * Math.random()});
      const mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.set(0, 0, -0.3).applyMatrix4(this.controller.matrixWorld);
      mesh.quaternion.setFromRotationMatrix(this.controller.matrixWorld);
      this.scene.add(mesh);
    }

    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select', onSelect);
    this.scene.add(this.controller);

    window.addEventListener('resize', this.onWindowResize);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    let that = this;
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(that.scene, that.camera);
    });
  }


}
