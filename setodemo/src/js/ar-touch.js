AFRAME.registerComponent('ar-touch', {
    init: function () {
        // 変数
        var a_scene = document.querySelector('a-scene');
        this.hitTestSource = null;
        this.viewerSpace = null;
        this.refSpace = null;
        
        // セッション開始
        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', () => {
            let xrSession = this.el.sceneEl.renderer.xr.getSession();
            let el = this.el;
            // 画面タッチ処理
            xrSession.addEventListener('select', function () {
                setPikachu(el.getAttribute('position'));
            });

            xrSession.requestReferenceSpace('viewer').then((refSpaceCreated) => {
                this.viewerSpace = refSpaceCreated;
                xrSession.requestHitTestSource({space: this.viewerSpace}).then((viewerHitTestSource) => {
                    this.hitTestSource = viewerHitTestSource;
                });
            });

            xrSession.requestReferenceSpace('local-floor').then((refSpaceCreated) => {
                this.refSpace = refSpaceCreated;
            });

            // ピカチュウ
            function setPikachu(pos) {
                var newObj = document.createElement("a-entity");
                newObj.setAttribute('position', pos);
                newObj.setAttribute('scale', '0.5 0.5 0.5');
                var newChildObj = document.createElement("a-obj-model");
                newChildObj.setAttribute('position', '0 -0.2 0');
                newChildObj.setAttribute('rotation', new THREE.Vector3( 0, getRandam(0, 360)));
                newChildObj.setAttribute('src', '#pikachu-obj');
                newChildObj.setAttribute('mtl', '#pikachu-mtl');
                newObj.appendChild(newChildObj);
                a_scene.appendChild(newObj);
            };

            function getRandam(n, m){
                for (let i = 0 ; i < 5 ; i++){
                  return Math.floor(Math.random() * (m + 1 - n)) + n;
                }
              };
        });

        // セッション終了
        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            this.viewerSpace = null;
            this.refSpace = null;
            this.hitTestSource = null;
        });
    },
    tick: function () {
        if (this.el.sceneEl.is('ar-mode')) {
            if (this.viewerSpace == null) return;

            var frame = this.el.sceneEl.frame;
            var xrViewerPose = frame.getViewerPose(this.refSpace);

            if (this.hitTestSource && xrViewerPose) {
                var hitTestResults = frame.getHitTestResults(this.hitTestSource);
                if (hitTestResults.length > 0) {
                    if(document.getElementById('nowLoading').object3D.visible == true) {document.getElementById('nowLoading').setAttribute('visible', false);}
                    var pose = hitTestResults[0].getPose(this.refSpace);
                    var inputMat = new THREE.Matrix4();
                    inputMat.fromArray(pose.transform.matrix);

                    var pos = new THREE.Vector3();
                    pos.setFromMatrixPosition(inputMat);
                    this.el.setAttribute('position', pos);
                }
            }
        }
    }
});