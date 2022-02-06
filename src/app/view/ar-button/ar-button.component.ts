import { Component, OnInit } from '@angular/core';
import {WebGLRenderer} from "three";
import {XRSystem} from "webxr";

@Component({
  selector: 'app-ar-button',
  templateUrl: './ar-button.component.html',
  styleUrls: ['./ar-button.component.css']
})
export class ArButtonComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public createButton(renderer: WebGLRenderer, sessionInit: any = {}) {
    const xr = (navigator as any)?.xr as XRSystem;

    const button:HTMLButtonElement = document.querySelector('#btnAr')
      || document.createElement('button');

    function showStartAR() {

      let currentSession: any = null;

      async function onSessionStarted(session: any) {
        session.addEventListener('end', onSessionEnded);
        renderer.xr.setReferenceSpaceType('local');

        await renderer.xr.setSession(session);
        button.textContent = 'STOP AR';
        currentSession = session;
      }

      function onSessionEnded() {

        currentSession.removeEventListener('end', onSessionEnded);

        button.textContent = 'START AR';
        sessionInit.domOverlay.root.style.display = 'none';

        currentSession = null;
      }

      button.style.display = '';
      button.textContent = 'START AR';

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
      button.onclick = null;
    }

    function showARNotSupported() {
      disableButton();
      button.textContent = 'AR NOT SUPPORTED';
    }

    if ('xr' in navigator) {

      button.id = 'ARButton';
      button.style.display = 'none';

      xr.isSessionSupported('immersive-ar').then(function (supported) {
        supported ? showStartAR() : showARNotSupported();
      }).catch(showARNotSupported);

      return button;

    } else {

      button.textContent = (!window.isSecureContext)
        ? 'WEBXR NEEDS HTTPS' : 'WEBXR NOT AVAILABLE';

      return button;

    }

  }

}
