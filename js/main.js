import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
// import { EffectComposer } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/postprocessing/RenderPass.js';
// import { BokehPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/BokehPass.js';
// import { GammaCorrectionShader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/shaders/GammaCorrectionShader.js';
// import { ShaderPass } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/postprocessing/ShaderPass.js';


let PAN_TOUCH_ROTATE;
let PAN_MOUSE_ROTATE
let UPPER_LIMIT;
let LOWER_LIMIT;
let FPS;
let PAN_SPEED;
let PAN_SPEED2;
let isTouchPad;

let container;
let camera;
let renderer;
let scene;
let controls;
let model;
let renderRequested = false;
// let composer;
let width;
let height;
let cam_y;

var modelName = "gltf/model.glb";
const mixers = [];
const clock = new THREE.Clock();


// Detect touchpad or mouse
var eventCount = 0;
var eventCountStart;
var isTouchPadDefined = false

var mouseHandle = function (evt) {
  isTouchPadDefined = isTouchPad || typeof isTouchPad !== "undefined";
  if (!isTouchPadDefined) {
    if (eventCount === 0) {
      eventCountStart = new Date().getTime();
    }

    eventCount++;

    if (new Date().getTime() - eventCountStart > 500) {
      if (eventCount > 10) {
        isTouchPad = true;
      } else {
        isTouchPad = false;
      }
      isTouchPadDefined = true;
    }
  }
}

document.addEventListener("mousewheel", mouseHandle, false);
document.addEventListener("DOMMouseScroll", mouseHandle, false);

function init() {


  container = document.querySelector("#scene-container");

  width = container.clientWidth;
  height = container.clientHeight;

  UPPER_LIMIT = 9;
  LOWER_LIMIT = -521;
  FPS = 0;

  PAN_SPEED = 50;
  PAN_SPEED2 = 12;

  PAN_TOUCH_ROTATE = 3 / height;
  PAN_MOUSE_ROTATE = 3 / height;

  scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0xfffffff ); 


  createCamera();
  loadModels(modelName);
  createLights();
  createControls();
  createRenderer();

  // renderer.setAnimationLoop(() => {
  //   // update();
  //   controls.update();
  //   requestRenderIfNotRequested();
  // });

  // composer = new EffectComposer(renderer);
  // var renderPass = new RenderPass(scene, camera);
  //   var gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);


  // const bokehPass = new BokehPass( scene, camera, {
  //   focus: 0.001,
  //   aperture: 0.00003,
  //   maxblur: 10,

  //   width: width,
  //   height: height
  // } );

  // composer.addPass(renderPass);
  // composer.addPass(gammaCorrectionPass);
  // composer.addPass( bokehPass );

}

function createCamera() {
  const fov = 20;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 1;
  const far = 400;
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 10, 160);
}

function createLights() {

  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, .7);

  // Hemi light
  const hemiLight = new THREE.HemisphereLight('white', 'orange', .5);

  // Directional light 1
  const dir1 = new THREE.DirectionalLight('white', 1);
  dir1.position.set(10, 10, 10);

  // Directional light 2 
  const dir2 = new THREE.DirectionalLight('white', 1);
  dir2.position.set(-10, 10, 5);

  // Directional light 3
  const dir3 = new THREE.DirectionalLight('white', 0.7);
  dir3.position.set(-10, -10, -5);

  // Directional light 4
  const dir4 = new THREE.DirectionalLight('white', 0.7);
  dir2.position.set(10, 10, -10);

  // Directional light 5
  const dir5 = new THREE.DirectionalLight('white', 0.7);
  dir2.position.set(-10, 10, -5);

  // Shadow light
  const shadow1 = new THREE.DirectionalLight('white', 1.5);
  shadow1.position.set(5, 9, 0);

  shadow1.shadow.mapSize.width = 2048;
  shadow1.shadow.mapSize.height = 2048;
  shadow1.shadow.camera.near = 3;
  shadow1.shadow.camera.far = 500;

  shadow1.shadow.camera.top = 250;
  shadow1.shadow.camera.bottom = -250;
  shadow1.shadow.camera.left = 250;
  shadow1.shadow.camera.right = -250;


  shadow1.castShadow = true;
  shadow1.shadow.bias = -0.01;

  scene.add(ambientLight);
  scene.add(hemiLight);
  scene.add(dir1);
  scene.add(dir2);
  scene.add(dir3);
  scene.add(dir4);
  scene.add(dir5);
  scene.add(shadow1);

}


function loadModels(modelName) {
  var manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {

    if (total == 2) {
      document.getElementById("loader").style.display = "none";
      document.getElementById("scene-container").style.display = "block";
      render();

    } else {
      document.getElementById("scene-container").style.display = "none";
    }
  };

  const loader = new GLTFLoader(manager);

  const onLoad = (result) => {
    model = result.scene;
    model.position.set(0, 0, 0);
    model.scale.set(5, 5, 5);
    model.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.flatShading = true;
        node.blending = THREE.NoBlending;
        const newMaterial = new THREE.MeshPhongMaterial({ color: node.material.color });
        // 
        node.material = newMaterial;

      }
    });

    model.castShadow = true
    const mixer = new THREE.AnimationMixer(model);
    mixers.push(mixer);

    var i;
    for (i = 0; i < result.animations.length; i++) {

      const animation = result.animations[i];
      const action = mixer.clipAction(animation);
      action.play();
    }
    scene.add(model);

  };

  const onProgress = (progress) => { };

  loader.load(
    modelName,
    (gltf) => onLoad(gltf),
    onProgress
  );


}


function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
  renderer.stencil = true;
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(2); //(window.devicePixelRatio);
  renderer.shadowMapSoft = true;
  renderer.powerPreference = "high-performance";
  renderer.setClearColor(0x000000, 0); // the default
  renderer.shadowMap.enabled = true
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = true;

  container.appendChild(renderer.domElement);
}

// Custom contorls
function createControls() {
  var OrbitControls = function (object, domElement) {

    if (domElement === undefined) console.warn('THREE.OrbitControls: The second parameter "domElement" is now mandatory.');
    if (domElement === document) console.error('THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.');

    this.object = object;
    this.domElement = domElement;

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the object orbits around
    this.target = new THREE.Vector3(0, 0, 0);

    // How far you can dolly in and out ( PerspectiveCamera only )
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    this.minZoom = 0;
    this.maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
    this.minAzimuthAngle = - Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to enable damping (inertia)
    // If damping is enabled, you must call controls.update() in your animation loop
    this.enableDamping = true;
    this.dampingFactor = 0.05;

    // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
    // Set to false to disable zooming
    this.enableZoom = false;
    this.zoomSpeed = 1.0;

    // Set to false to disable rotating
    this.enableRotate = false;
    this.rotateSpeed = 1.0;

    // Set to false to disable panning
    this.enablePan = true;
    this.panSpeed = 1.3;
    this.screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
    this.keyPanSpeed = PAN_SPEED;	// pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    // If auto-rotate is enabled, you must call controls.update() in your animation loop
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

    // Set to false to disable use of the keys
    this.enableKeys = false;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    this.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN };

    // Touch fingers
    this.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.PAN };

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;

    //
    // public methods
    //

    this.getPolarAngle = function () {

      return spherical.phi;

    };

    this.getAzimuthalAngle = function () {

      return spherical.theta;

    };

    this.saveState = function () {

      scope.target0.copy(scope.target);
      scope.position0.copy(scope.object.position);
      scope.zoom0 = scope.object.zoom;

    };

    this.reset = function () {

      scope.target.copy(scope.target0);
      scope.object.position.copy(scope.position0);
      scope.object.zoom = scope.zoom0;

      scope.object.updateProjectionMatrix();
      scope.dispatchEvent(changeEvent);

      scope.update();

      state = STATE.NONE;

    };

    this.stop = function () {

      panOffset.set(0, 0, 0);
      sphericalDelta.set(0, 0, 0);

    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = function () {

      var offset = new THREE.Vector3();

      // so camera.up is the orbit axis
      var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
      var quatInverse = quat.clone().inverse();

      var lastPosition = new THREE.Vector3();
      var lastQuaternion = new THREE.Quaternion();

      var twoPI = 2 * Math.PI;

      return function update() {

        var position = scope.object.position;

        offset.copy(position).sub(scope.target);

        // rotate offset to "y-axis-is-up" space
        offset.applyQuaternion(quat);

        // angle from z-axis around y-axis
        spherical.setFromVector3(offset);

        if (scope.autoRotate && state === STATE.NONE) {

          rotateLeft(getAutoRotationAngle());

        }

        if (scope.enableDamping) {

          spherical.theta += sphericalDelta.theta * scope.dampingFactor;
          // spherical.phi += sphericalDelta.phi * scope.dampingFactor;

        } else {

          spherical.theta += sphericalDelta.theta;
          // spherical.phi += sphericalDelta.phi;

        }

        // restrict theta to be between desired limits

        var min = scope.minAzimuthAngle;
        var max = scope.maxAzimuthAngle;

        if (isFinite(min) && isFinite(max)) {

          if (min < - Math.PI) min += twoPI; else if (min > Math.PI) min -= twoPI;

          if (max < - Math.PI) max += twoPI; else if (max > Math.PI) max -= twoPI;

          if (min < max) {

            spherical.theta = Math.max(min, Math.min(max, spherical.theta));

          } else {

            spherical.theta = (spherical.theta > (min + max) / 2) ?
              Math.max(min, spherical.theta) :
              Math.min(max, spherical.theta);

          }

        }

        // restrict phi to be between desired limits
        // spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));

        spherical.makeSafe();


        spherical.radius *= scale;

        // restrict radius to be between desired limits
        spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

        // move target to panned location

        if (scope.enableDamping === true) {

          scope.target.addScaledVector(panOffset, scope.dampingFactor);

        } else {

          scope.target.add(panOffset);

        }

        offset.setFromSpherical(spherical);

        // rotate offset back to "camera-up-vector-is-up" space
        offset.applyQuaternion(quatInverse);

        position.copy(scope.target).add(offset);

        scope.object.lookAt(scope.target);

        if (scope.enableDamping === true) {

          sphericalDelta.theta *= (1 - scope.dampingFactor);
          // sphericalDelta.phi *= (1 - scope.dampingFactor);

          panOffset.multiplyScalar(1 - scope.dampingFactor);

        } else {

          sphericalDelta.set(0, 0, 0);

          panOffset.set(0, 0, 0);

        }

        scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if (zoomChanged ||
          lastPosition.distanceToSquared(scope.object.position) > EPS ||
          8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {

          scope.dispatchEvent(changeEvent);

          lastPosition.copy(scope.object.position);
          lastQuaternion.copy(scope.object.quaternion);
          zoomChanged = false;

          return true;

        }

        return false;

      };

    }();

    this.dispose = function () {

      scope.domElement.removeEventListener('contextmenu', onContextMenu, false);
      scope.domElement.removeEventListener('mousedown', onMouseDown, false);
      scope.domElement.removeEventListener('wheel', onMouseWheel, false);

      scope.domElement.removeEventListener('touchstart', onTouchStart, false);
      scope.domElement.removeEventListener('touchend', onTouchEnd, false);
      scope.domElement.removeEventListener('touchmove', onTouchMove, false);

      scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove, false);
      scope.domElement.ownerDocument.removeEventListener('mouseup', onMouseUp, false);

      scope.domElement.removeEventListener('keydown', onKeyDown, false);

      //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

    };

    //
    // internals
    //

    var scope = this;

    var changeEvent = { type: 'change' };
    var startEvent = { type: 'start' };
    var endEvent = { type: 'end' };

    var STATE = {
      NONE: - 1,
      ROTATE: 0,
      DOLLY: 1,
      PAN: 2,
      TOUCH_ROTATE: 3,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
      TOUCH_DOLLY_ROTATE: 6
    };

    var state = STATE.NONE;

    var EPS = 0.000001;

    // current position in spherical coordinates
    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();

    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    function getAutoRotationAngle() {

      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

    }

    function getZoomScale() {

      return Math.pow(0.95, scope.zoomSpeed);

    }

    function rotateLeft(angle) {

      sphericalDelta.theta -= angle;

    }

    function rotateUp(angle) {

      sphericalDelta.phi -= angle;

    }

    var panLeft = function () {

      var v = new THREE.Vector3();

      return function panLeft(distance, objectMatrix) {

        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(- distance);

        panOffset.add(v);

      };

    }();

    var panUp = function () {

      var v = new THREE.Vector3();

      return function panUp(distance, objectMatrix) {

        if (scope.screenSpacePanning === true) {

          v.setFromMatrixColumn(objectMatrix, 1);

        } else {

          v.setFromMatrixColumn(objectMatrix, 0);
          v.crossVectors(scope.object.up, v);

        }

        v.multiplyScalar(distance);

        panOffset.add(v);

      };

    }();

    // deltaX and deltaY are in pixels; right and down are positive
    var pan = function () {

      var offset = new THREE.Vector3();

      return function pan(deltaX, deltaY) {

        var element = scope.domElement;

        if (scope.object.isPerspectiveCamera) {

          // perspective
          var position = scope.object.position;
          offset.copy(position).sub(scope.target);
          var targetDistance = offset.length();

          // half of the fov is center to top of screen
          targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);

          // we use only clientHeight here so aspect ratio does not distort speed
          // panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
          panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);

        } else if (scope.object.isOrthographicCamera) {

          // orthographic
          panLeft(deltaX * (scope.object.right - scope.object.left) / scope.object.zoom / element.clientWidth, scope.object.matrix);
          //panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

        } else {

          // camera neither orthographic nor perspective
          console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
          scope.enablePan = false;

        }

      };

    }();

    function dollyOut(dollyScale) {

      if (scope.object.isPerspectiveCamera) {

        scale /= dollyScale;

      } else if (scope.object.isOrthographicCamera) {

        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom * dollyScale));
        scope.object.updateProjectionMatrix();
        zoomChanged = true;

      } else {

        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;

      }

    }

    function dollyIn(dollyScale) {

      if (scope.object.isPerspectiveCamera) {

        scale *= dollyScale;

      } else if (scope.object.isOrthographicCamera) {

        scope.object.zoom = Math.max(scope.minZoom, Math.min(scope.maxZoom, scope.object.zoom / dollyScale));
        scope.object.updateProjectionMatrix();
        zoomChanged = true;

      } else {

        console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
        scope.enableZoom = false;

      }

    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownRotate(event) {

      rotateStart.set(event.clientX, event.clientY);

    }

    function handleMouseDownDolly(event) {

      dollyStart.set(event.clientX, event.clientY);

    }

    function handleMouseDownPan(event) {

      panStart.set(event.clientX, event.clientY);

    }

    function handleMouseMoveRotate(event) {

      rotateEnd.set(event.clientX, event.clientY);

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

      var element = scope.domElement;

      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

      rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

      rotateStart.copy(rotateEnd);

      scope.update();

    }

    function handleMouseMoveDolly(event) {

      dollyEnd.set(event.clientX, event.clientY);

      dollyDelta.subVectors(dollyEnd, dollyStart);

      if (dollyDelta.y > 0) {

        dollyOut(getZoomScale());

      } else if (dollyDelta.y < 0) {

        dollyIn(getZoomScale());

      }

      dollyStart.copy(dollyEnd);

      scope.update();

    }

    function handleMouseMovePan(event) {
      // Disable pan with mouse

      // panEnd.set( event.clientX, event.clientY );

      // panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );

      // pan( panDelta.x, panDelta.y );

      // panStart.copy( panEnd );

      // scope.update();

    }

    function handleMouseUp( /*event*/) {

      // no-op

    }

    function handleMouseWheel(event) {

      if (event.deltaY < 0) {

        dollyIn(getZoomScale());

      } else if (event.deltaY > 0) {

        dollyOut(getZoomScale());

      }

      scope.update();

    }

    function handleKeyDown(event) {

      var needsUpdate = false;

      switch (event.keyCode) {

        case scope.keys.UP:
          pan(0, scope.keyPanSpeed);
          needsUpdate = true;
          break;

        case scope.keys.BOTTOM:
          pan(0, - scope.keyPanSpeed);
          needsUpdate = true;
          break;

        case scope.keys.LEFT:
          pan(scope.keyPanSpeed, 0);
          needsUpdate = true;
          break;

        case scope.keys.RIGHT:
          pan(- scope.keyPanSpeed, 0);
          needsUpdate = true;
          break;

      }

      if (needsUpdate) {

        // prevent the browser from scrolling on cursor keys
        event.preventDefault();

        scope.update();

      }


    }

    function handleTouchStartRotate(event) {

      if (event.touches.length == 1) {

        rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);

      } else {

        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        rotateStart.set(x, y);

      }

    }

    function handleTouchStartPan(event) {

      if (event.touches.length == 1) {

        panStart.set(event.touches[0].pageX, event.touches[0].pageY);

      } else {

        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        panStart.set(x, y);

      }

    }

    function handleTouchStartDolly(event) {

      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);

    }

    function handleTouchStartDollyPan(event) {

      if (scope.enableZoom) handleTouchStartDolly(event);

      if (scope.enablePan) handleTouchStartPan(event);

    }

    function handleTouchStartDollyRotate(event) {

      if (scope.enableZoom) handleTouchStartDolly(event);

      if (scope.enableRotate) handleTouchStartRotate(event);

    }

    function handleTouchMoveRotate(event) {

      if (event.touches.length == 1) {

        rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);

      } else {

        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        rotateEnd.set(x, y);

      }

      rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

      var element = scope.domElement;

      rotateLeft(2 * Math.PI * rotateDelta.x / element.clientHeight); // yes, height

      rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight);

      rotateStart.copy(rotateEnd);

    }

    function handleTouchMovePan(event) {

      if (event.touches.length == 1) {

        panEnd.set(event.touches[0].pageX, event.touches[0].pageY);

      } else {

        var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        panEnd.set(x, y);

      }

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);

      // Avoid scroll above scene
      if (scope.object.position.y > UPPER_LIMIT & panDelta.y > 0) {
        return
      }
      if (scope.object.position.y < LOWER_LIMIT & panDelta.y < 0) {
        return
      }

      pan(panDelta.x, panDelta.y);
      rotateLeft(panDelta.y * PAN_TOUCH_ROTATE);

      panStart.copy(panEnd);

    }

    function handleTouchMoveDolly(event) {

      var dx = event.touches[0].pageX - event.touches[1].pageX;
      var dy = event.touches[0].pageY - event.touches[1].pageY;

      var distance = Math.sqrt(dx * dx + dy * dy);

      dollyEnd.set(0, distance);

      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));

      dollyOut(dollyDelta.y);

      dollyStart.copy(dollyEnd);

    }

    function handleTouchMoveDollyPan(event) {

      if (scope.enableZoom) handleTouchMoveDolly(event);

      if (scope.enablePan) handleTouchMovePan(event);

    }

    function handleTouchMoveDollyRotate(event) {

      if (scope.enableZoom) handleTouchMoveDolly(event);

      if (scope.enableRotate) handleTouchMoveRotate(event);

    }

    function handleTouchEnd( /*event*/) {

      // no-op

    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onMouseDown(event) {

      if (scope.enabled === false) return;

      // Prevent the browser from scrolling.
      event.preventDefault();

      // Manually set the focus since calling preventDefault above
      // prevents the browser from setting it automatically.

      scope.domElement.focus ? scope.domElement.focus() : window.focus();

      var mouseAction;

      switch (event.button) {

        case 0:

          mouseAction = scope.mouseButtons.LEFT;
          break;

        case 1:

          mouseAction = scope.mouseButtons.MIDDLE;
          break;

        case 2:

          mouseAction = scope.mouseButtons.RIGHT;
          break;

        default:

          mouseAction = - 1;

      }

      switch (mouseAction) {

        case THREE.MOUSE.DOLLY:

          if (scope.enableZoom === false) return;

          handleMouseDownDolly(event);

          state = STATE.DOLLY;

          break;

        case THREE.MOUSE.ROTATE:

          if (event.ctrlKey || event.metaKey || event.shiftKey) {

            if (scope.enablePan === false) return;

            handleMouseDownPan(event);

            state = STATE.PAN;

          } else {

            if (scope.enableRotate === false) return;

            handleMouseDownRotate(event);

            state = STATE.ROTATE;

          }

          break;

        case THREE.MOUSE.PAN:

          if (event.ctrlKey || event.metaKey || event.shiftKey) {

            if (scope.enableRotate === false) return;

            handleMouseDownRotate(event);

            state = STATE.ROTATE;

          } else {

            if (scope.enablePan === false) return;

            handleMouseDownPan(event);

            state = STATE.PAN;

          }

          break;

        default:

          state = STATE.NONE;

      }

      if (state !== STATE.NONE) {

        scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove, false);
        scope.domElement.ownerDocument.addEventListener('mouseup', onMouseUp, false);

        scope.dispatchEvent(startEvent);

      }

    }

    function onMouseMove(event) {

      if (scope.enabled === false) return;

      event.preventDefault();

      switch (state) {

        case STATE.ROTATE:

          if (scope.enableRotate === false) return;

          handleMouseMoveRotate(event);

          break;

        case STATE.DOLLY:

          if (scope.enableZoom === false) return;

          handleMouseMoveDolly(event);

          break;

        case STATE.PAN:

          if (scope.enablePan === false) return;

          handleMouseMovePan(event);

          break;

      }

    }

    function onMouseUp(event) {

      if (scope.enabled === false) return;

      handleMouseUp(event);

      scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove, false);
      scope.domElement.ownerDocument.removeEventListener('mouseup', onMouseUp, false);

      scope.dispatchEvent(endEvent);

      state = STATE.NONE;

    }

    function onMouseWheel(event) {


      // Check if touchpad is being used
      if (isTouchPad) {
        scope.keyPanSpeed = PAN_SPEED2;
        scope.enableDamping = false;
        scope.update();
      } else {
        scope.keyPanSpeed = PAN_SPEED;
        scope.update();
      }

      if (event.deltaY > 0) {

        if (scope.object.position.y < LOWER_LIMIT) {
          return
        }

        pan(0, - scope.keyPanSpeed);
        rotateLeft(-scope.keyPanSpeed * PAN_MOUSE_ROTATE);

      } else {

        // Avoid scroll above scene
        if (scope.object.position.y > UPPER_LIMIT) {
          return
        }

        pan(0, scope.keyPanSpeed);
        rotateLeft(scope.keyPanSpeed * PAN_MOUSE_ROTATE);
      }
      scope.update();

      if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) return;

      event.preventDefault();
      event.stopPropagation();

      scope.dispatchEvent(startEvent);

      handleMouseWheel(event);

      scope.dispatchEvent(endEvent);

    }

    function onKeyDown(event) {

      if (scope.enabled === false || scope.enableKeys === false || scope.enablePan === false) return;

      handleKeyDown(event);

    }

    function onTouchStart(event) {

      if (scope.enabled === false) return;

      event.preventDefault(); // prevent scrolling

      switch (event.touches.length) {

        case 1:

          switch (scope.touches.ONE) {

            case THREE.TOUCH.ROTATE:

              if (scope.enableRotate === false) return;

              handleTouchStartRotate(event);

              state = STATE.TOUCH_ROTATE;

              break;

            case THREE.TOUCH.PAN:

              if (scope.enablePan === false) return;

              handleTouchStartPan(event);

              state = STATE.TOUCH_PAN;

              break;

            default:

              state = STATE.NONE;

          }

          break;

        case 2:

          switch (scope.touches.TWO) {

            case THREE.TOUCH.DOLLY_PAN:

              if (scope.enableZoom === false && scope.enablePan === false) return;

              handleTouchStartDollyPan(event);

              state = STATE.TOUCH_DOLLY_PAN;

              break;

            case THREE.TOUCH.DOLLY_ROTATE:

              if (scope.enableZoom === false && scope.enableRotate === false) return;

              handleTouchStartDollyRotate(event);

              state = STATE.TOUCH_DOLLY_ROTATE;

              break;

            default:

              state = STATE.NONE;

          }

          break;

        default:

          state = STATE.NONE;

      }

      if (state !== STATE.NONE) {

        scope.dispatchEvent(startEvent);

      }

    }

    function onTouchMove(event) {

      if (scope.enabled === false) return;

      event.preventDefault(); // prevent scrolling
      event.stopPropagation();

      switch (state) {

        case STATE.TOUCH_ROTATE:

          if (scope.enableRotate === false) return;

          handleTouchMoveRotate(event);

          scope.update();

          break;

        case STATE.TOUCH_PAN:

          if (scope.enablePan === false) return;

          handleTouchMovePan(event);

          scope.update();

          break;

        case STATE.TOUCH_DOLLY_PAN:

          if (scope.enableZoom === false && scope.enablePan === false) return;

          handleTouchMoveDollyPan(event);

          scope.update();

          break;

        case STATE.TOUCH_DOLLY_ROTATE:

          if (scope.enableZoom === false && scope.enableRotate === false) return;

          handleTouchMoveDollyRotate(event);

          scope.update();

          break;

        default:

          state = STATE.NONE;

      }

    }

    function onTouchEnd(event) {

      if (scope.enabled === false) return;

      handleTouchEnd(event);

      scope.dispatchEvent(endEvent);

      state = STATE.NONE;

    }

    function onContextMenu(event) {

      if (scope.enabled === false) return;

      event.preventDefault();

    }

    //

    scope.domElement.addEventListener('contextmenu', onContextMenu, false);

    scope.domElement.addEventListener('mousedown', onMouseDown, false);
    scope.domElement.addEventListener('wheel', onMouseWheel, false);

    scope.domElement.addEventListener('touchstart', onTouchStart, false);
    scope.domElement.addEventListener('touchend', onTouchEnd, false);
    scope.domElement.addEventListener('touchmove', onTouchMove, false);

    scope.domElement.addEventListener('keydown', onKeyDown, false);

    // make sure element can receive keys.

    if (scope.domElement.tabIndex === - 1) {

      scope.domElement.tabIndex = 0;

    }

    // force an update at start

    this.update();

  };

  OrbitControls.prototype = Object.create(THREE.EventDispatcher.prototype);
  OrbitControls.prototype.constructor = OrbitControls;


  controls = new OrbitControls(camera, container);
}

function update() {
  const delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));

}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

var media = document.getElementsByClassName("media");

function render() {

  renderRequested = undefined;

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  controls.update();
  renderer.render(scene, camera);
  // composer.render();

  cam_y = controls.object.position.y;
  if(cam_y <= -520.8){
    console.log(cam_y);
    media[0].style.visibility='visible';
  }else{
    media[0].style.visibility='hidden';
  }

  if ((cam_y > 10) ||
    (cam_y < -49.4 && cam_y > -50.0) ||
    (cam_y < -107.7 && cam_y > -108.3) ||
    (cam_y < -167.2 && cam_y > -167.8) ||
    (cam_y < -226.2 && cam_y > -226.8) ||
    (cam_y < -285.6 && cam_y > -286.2) ||
    (cam_y < -344.6 && cam_y > -345.2) ||
    (cam_y < -403.5 && cam_y > -404.1) ||
    (cam_y < -461.5 && cam_y > -462.1) ||
    (cam_y < -521)
  ) {
    controls.stop();
  }

  if (cam_y < 10 && cam_y > -35) {
    granimInstance.changeState('default-state');
  }else if (cam_y < -36 && cam_y > -93) {
    granimInstance.changeState('state2');
  } else if (cam_y < -94 && cam_y > -155) {
    granimInstance.changeState('state3');
  } else if (cam_y < -156 && cam_y > -217) {
    granimInstance.changeState('state4');
  } else if (cam_y < -218 && cam_y > -260) {
    granimInstance.changeState('state5');
  } else if (cam_y < -261 && cam_y > -299) {
    granimInstance.changeState('state6');
  } else if (cam_y < -300 && cam_y > -379) {
    granimInstance.changeState('state7');
  } else if (cam_y < -380 && cam_y > -451) {
    granimInstance.changeState('state8');
  } else if (cam_y < -452 && cam_y > -507) {
    granimInstance.changeState('state9');
  } else if (cam_y < -508) {
    granimInstance.changeState('state10');
  }
}


function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;

    requestAnimationFrame(render);

  }
}

init();

controls.addEventListener('change', requestRenderIfNotRequested);
window.addEventListener('resize', requestRenderIfNotRequested);



// 


var granimInstance = new Granim({
  element: '#canvas-interactive',
  name: 'interactive-gradient',
  elToSetClassOn: '.canvas-interactive-wrapper',
  direction: 'diagonal',
  isPausedWhenNotInView: false,
  stateTransitionSpeed: 1000,
  states: {
    "default-state": {
      gradients: [
        ['#0b9ed9', '#07c7f2'],
      ],
      transitionSpeed: 1000
    },
    "state2": {
      gradients: [['#fff680', '#ec5c47']],
      transitionSpeed: 1000
    },
    "state3": {
      gradients: [['#70aeed', '#000000']],
      transitionSpeed: 1000
    },
    "state4": {
      gradients: [['#27b8ff', '#ff9709']],
      transitionSpeed: 1000
    },
    "state5": {
      gradients: [['#3FCA4D', '#2FA7FF']],
      transitionSpeed: 1000
    },
    "state6": {
      gradients: [['#D98E04', '#ffffff']],
      transitionSpeed: 1000
    },
    "state7": {
      gradients: [['#94c9ff', '#10b0e6']],
      transitionSpeed: 1000
    },
    "state8": {
      gradients: [['#fff680', '#ec5c47']],
      transitionSpeed: 1000
    },
    "state9": {
      gradients: [['#ffffff', '#868686']],
      transitionSpeed: 1000
    },
    "state10": {
      gradients: [['#1fe8fe', '#336fff']],
      transitionSpeed: 1000
    },
  }
});
