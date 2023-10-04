AFRAME.registerComponent("model-viewer", {
  schema: {
    gltfModel: { default: "" },
  },
  init: function () {
    var el = this.el;
    el.setAttribute("renderer", { colorManagement: true });
    el.setAttribute("raycaster", { objects: ".raycastable" });
    el.setAttribute("cursor", { rayOrigin: "mouse", fuse: false });
    el.setAttribute("webxr", {
      optionalFeatures: "hit-test, local-floor, light-estimation, anchors",
    });
    // el.setAttribute("background", "");
    // this.onModelLoaded = this.onModelLoaded.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.submitURLButtonClicked = this.submitURLButtonClicked.bind(this);
    this.onThumbstickMoved = this.onThumbstickMoved.bind(this);
    this.onEnterVR = this.onEnterVR.bind(this);
    this.onExitVR = this.onExitVR.bind(this);
    this.onMouseDownLaserHitPanel = this.onMouseDownLaserHitPanel.bind(this);
    this.onMouseUpLaserHitPanel = this.onMouseUpLaserHitPanel.bind(this);
    this.onOrientationChange = this.onOrientationChange.bind(this);
    this.modelPivotEl = document.getElementById('test');
    // this.initCameraRig();
    // this.initEntities();
    // this.initBackground();
    this.el.sceneEl.canvas.oncontextmenu = function (evt) {
      evt.preventDefault();
    };
    // window.addEventListener("orientationchange", this.onOrientationChange);
    // this.laserHitPanelEl.addEventListener(
    //   "mousedown",
    //   this.onMouseDownLaserHitPanel
    // );
    // this.laserHitPanelEl.addEventListener(
    //   "mouseup",
    //   this.onMouseUpLaserHitPanel
    // );
    // this.leftHandEl.addEventListener("thumbstickmoved", this.onThumbstickMoved);
    // this.rightHandEl.addEventListener(
    //   "thumbstickmoved",
    //   this.onThumbstickMoved
    // );
    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("wheel", this.onMouseWheel);
    document.addEventListener("touchend", this.onTouchEnd);
    document.addEventListener("touchmove", this.onTouchMove);
    // this.el.sceneEl.addEventListener("enter-vr", this.onEnterVR);
    // this.el.sceneEl.addEventListener("exit-vr", this.onExitVR);
    // this.modelEl.addEventListener("model-loaded", this.onModelLoaded);
  },
  update: function () {
    if (!this.data.gltfModel) {
      return;
    }
    this.el.setAttribute("ar-hit-test", { target: "#modelEl", type: "map" });
    // this.modelEl.setAttribute("gltf-model", this.data.gltfModel);
  },
  submitURLButtonClicked: function (evt) {
    var modelURL = this.inputEl.value;
    if (modelURL === this.inputDefaultValue) {
      return;
    }
    this.el.setAttribute("model-viewer", "gltfModel", modelURL);
  },
  initCameraRig: function () {
    var cameraRigEl = (this.cameraRigEl = document.createElement("a-entity"));
    var cameraEl = (this.cameraEl = document.createElement("a-entity"));
    var rightHandEl = (this.rightHandEl = document.createElement("a-entity"));
    var leftHandEl = (this.leftHandEl = document.createElement("a-entity"));
    cameraEl.setAttribute("camera", { fov: 60 });
    cameraEl.setAttribute("look-controls", {
      magicWindowTrackingEnabled: false,
      mouseEnabled: false,
      touchEnabled: false,
    });
    rightHandEl.setAttribute("rotation", "0 90 0");
    rightHandEl.setAttribute("laser-controls", { hand: "right" });
    rightHandEl.setAttribute("raycaster", { objects: ".raycastable" });
    rightHandEl.setAttribute("line", { color: "#118A7E" });
    leftHandEl.setAttribute("rotation", "0 90 0");
    leftHandEl.setAttribute("laser-controls", { hand: "right" });
    leftHandEl.setAttribute("raycaster", { objects: ".raycastable" });
    leftHandEl.setAttribute("line", { color: "#118A7E" });
    cameraRigEl.appendChild(cameraEl);
    cameraRigEl.appendChild(rightHandEl);
    cameraRigEl.appendChild(leftHandEl);
    this.el.appendChild(cameraRigEl);
  },
  initBackground: function () {
    var backgroundEl = (this.backgroundEl = document.querySelector("a-entity"));
    backgroundEl.setAttribute("geometry", { primitive: "sphere", radius: 65 });
    backgroundEl.setAttribute("material", {
      shader: "background-gradient",
      colorTop: "#37383c",
      colorBottom: "#757575",
      side: "back",
    });
    backgroundEl.setAttribute("hide-on-enter-ar", "");
  },
  initEntities: function () {
    this.modelEl = document.getElementById('test');
  },
  onThumbstickMoved: function (evt) {
    var modelPivotEl = this.modelPivotEl;
    var modelScale = this.modelScale || modelPivotEl.object3D.scale.x;
    modelScale -= evt.detail.y / 20;
    modelScale = Math.min(Math.max(0.8, modelScale), 2.0);
    modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);
    this.modelScale = modelScale;
  },
  onMouseWheel: function (evt) {
    var modelPivotEl = this.modelPivotEl;
    var modelScale = this.modelScale || modelPivotEl.object3D.scale.x;
    modelScale -= evt.deltaY / 100;
    modelScale = Math.min(Math.max(0.8, modelScale), 2.0);
    modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);
    this.modelScale = modelScale;
  },
  onMouseDownLaserHitPanel: function (evt) {
    var cursorEl = evt.detail.cursorEl;
    var intersection = cursorEl.components.raycaster.getIntersection(
      this.laserHitPanelEl
    );
    if (!intersection) {
      return;
    }
    cursorEl.setAttribute("raycaster", "lineColor", "white");
    this.activeHandEl = cursorEl;
    this.oldHandX = undefined;
    this.oldHandY = undefined;
  },
  onMouseUpLaserHitPanel: function (evt) {
    var cursorEl = evt.detail.cursorEl;
    if (cursorEl === this.leftHandEl) {
      this.leftHandPressed = false;
    }
    if (cursorEl === this.rightHandEl) {
      this.rightHandPressed = false;
    }
    cursorEl.setAttribute("raycaster", "lineColor", "white");
    if (this.activeHandEl === cursorEl) {
      this.activeHandEl = undefined;
    }
  },
  onOrientationChange: function () {
    if (AFRAME.utils.device.isLandscape()) {
      this.cameraRigEl.object3D.position.z -= 1;
    } else {
      this.cameraRigEl.object3D.position.z += 1;
    }
  },
  tick: function () {
    var modelPivotEl = this.modelPivotEl;
    var intersection;
    var intersectionPosition;
    var laserHitPanelEl = this.laserHitPanelEl;
    var activeHandEl = this.activeHandEl;
    if (!this.el.sceneEl.is("vr-mode")) {
      return;
    }
    if (!activeHandEl) {
      return;
    }
    intersection =
      activeHandEl.components.raycaster.getIntersection(laserHitPanelEl);
    if (!intersection) {
      activeHandEl.setAttribute("raycaster", "lineColor", "white");
      return;
    }
    activeHandEl.setAttribute("raycaster", "lineColor", "#007AFF");
    intersectionPosition = intersection.point;
    this.oldHandX = this.oldHandX || intersectionPosition.x;
    this.oldHandY = this.oldHandY || intersectionPosition.y;
    modelPivotEl.object3D.rotation.y -=
      (this.oldHandX - intersectionPosition.x) / 4;
    modelPivotEl.object3D.rotation.x +=
      (this.oldHandY - intersectionPosition.y) / 4;
    this.oldHandX = intersectionPosition.x;
    this.oldHandY = intersectionPosition.y;
  },
  onEnterVR: function () {
    var cameraRigEl = this.cameraRigEl;
    this.cameraRigPosition = cameraRigEl.object3D.position.clone();
    this.cameraRigRotation = cameraRigEl.object3D.rotation.clone();
    if (!this.el.sceneEl.is("ar-mode")) {
      cameraRigEl.object3D.position.set(0, 0, 2);
    } else {
      cameraRigEl.object3D.position.set(0, 0, 0);
    }
  },
  onExitVR: function () {
    var cameraRigEl = this.cameraRigEl;
    cameraRigEl.object3D.position.copy(this.cameraRigPosition);
    cameraRigEl.object3D.rotation.copy(this.cameraRigRotation);
    cameraRigEl.object3D.rotation.set(0, 0, 0);
  },
  onTouchMove: function (evt) {
    if (evt.touches.length === 1) {
      this.onSingleTouchMove(evt);
    }
    if (evt.touches.length === 2) {
      this.onPinchMove(evt);
    }
  },
  onSingleTouchMove: function (evt) {
    var dX;
    var dY;
    var modelPivotEl = this.modelPivotEl;
    this.oldClientX = this.oldClientX || evt.touches[0].clientX;
    this.oldClientY = this.oldClientY || evt.touches[0].clientY;
    dX = this.oldClientX - evt.touches[0].clientX;
    dY = this.oldClientY - evt.touches[0].clientY;
    modelPivotEl.object3D.rotation.y -= dX / 200;
    this.oldClientX = evt.touches[0].clientX;
    modelPivotEl.object3D.rotation.x -= dY / 100;
    modelPivotEl.object3D.rotation.x = Math.min(
      Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x),
      Math.PI / 2
    );
    this.oldClientY = evt.touches[0].clientY;
  },
  onPinchMove: function (evt) {
    var dX = evt.touches[0].clientX - evt.touches[1].clientX;
    var dY = evt.touches[0].clientY - evt.touches[1].clientY;
    var modelPivotEl = this.modelPivotEl;
    var distance = Math.sqrt(dX * dX + dY * dY);
    var oldDistance = this.oldDistance || distance;
    var distanceDifference = oldDistance - distance;
    var modelScale = this.modelScale || modelPivotEl.object3D.scale.x;
    modelScale -= distanceDifference / 500;
    modelScale = Math.min(Math.max(0.8, modelScale), 2.0);
    modelPivotEl.object3D.scale.set(modelScale, modelScale, modelScale);
    this.modelScale = modelScale;
    this.oldDistance = distance;
  },
  onTouchEnd: function (evt) {
    this.oldClientX = undefined;
    this.oldClientY = undefined;
    if (evt.touches.length < 2) {
      this.oldDistance = undefined;
    }
  },
  onMouseUp: function (evt) {
    this.leftRightButtonPressed = false;
    if (evt.buttons === undefined || evt.buttons !== 0) {
      return;
    }
    this.oldClientX = undefined;
    this.oldClientY = undefined;
  },
  onMouseMove: function (evt) {
    if (this.leftRightButtonPressed) {
      this.dragModel(evt);
    } else {
      this.rotateModel(evt);
    }
  },
  dragModel: function (evt) {
    var dX;
    var dY;
    var modelPivotEl = this.modelPivotEl;
    if (!this.oldClientX) {
      return;
    }
    dX = this.oldClientX - evt.clientX;
    dY = this.oldClientY - evt.clientY;
    modelPivotEl.object3D.position.y += dY / 200;
    modelPivotEl.object3D.position.x -= dX / 200;
    this.oldClientX = evt.clientX;
    this.oldClientY = evt.clientY;
  },
  rotateModel: function (evt) {
    var dX;
    var dY;
    var modelPivotEl = this.modelPivotEl;
    if (!this.oldClientX) {
      return;
    }
    dX = this.oldClientX - evt.clientX;
    dY = this.oldClientY - evt.clientY;
    modelPivotEl.object3D.rotation.y -= dX / 100;
    modelPivotEl.object3D.rotation.x -= dY / 200;
    modelPivotEl.object3D.rotation.x = Math.min(
      Math.max(-Math.PI / 2, modelPivotEl.object3D.rotation.x),
      Math.PI / 2
    );
    this.oldClientX = evt.clientX;
    this.oldClientY = evt.clientY;
  },
  onModelLoaded: function () {
    this.centerAndScaleModel();
  },
  centerAndScaleModel: function () {
    var box;
    var size;
    var center;
    var scale;
    var modelEl = this.modelEl;
    var shadowEl = this.shadowEl;
    var gltfObject = modelEl.getObject3D("mesh");
    modelEl.object3D.position.set(0, 0, 0);
    modelEl.object3D.scale.set(1.0, 1.0, 1.0);
    this.cameraRigEl.object3D.position.z = 3.0;
    modelEl.object3D.updateMatrixWorld();
    box = new THREE.Box3().setFromObject(gltfObject);
    size = box.getSize(new THREE.Vector3());
    scale = 1.6 / size.y;
    scale = 2.0 / size.x < scale ? 2.0 / size.x : scale;
    scale = 2.0 / size.z < scale ? 2.0 / size.z : scale;
    modelEl.object3D.scale.set(scale, scale, scale);
    modelEl.object3D.updateMatrixWorld();
    box = new THREE.Box3().setFromObject(gltfObject);
    center = box.getCenter(new THREE.Vector3());
    size = box.getSize(new THREE.Vector3());
    shadowEl.object3D.scale.y = size.x;
    shadowEl.object3D.scale.x = size.y;
    shadowEl.object3D.position.y = -size.y / 2;
    shadowEl.object3D.position.z = -center.z;
    shadowEl.object3D.position.x = -center.x;
    modelEl.object3D.position.x = -center.x;
    modelEl.object3D.position.y = -center.y;
    modelEl.object3D.position.z = -center.z;
    if (AFRAME.utils.device.isLandscape()) {
      this.cameraRigEl.object3D.position.z -= 1;
    }
  },
  onMouseDown: function (evt) {
    if (evt.buttons) {
      this.leftRightButtonPressed = evt.buttons === 3;
    }
    this.oldClientX = evt.clientX;
    this.oldClientY = evt.clientY;
  },
});