import * as THREE from './lib/three.module.js';

import { GLTFLoader } from './lib/GLTFLoader.js';
import { DRACOLoader } from './lib/DRACOLoader.js';

import { init } from './init.js'
import { get_scrollbar } from './scrollbar.js'
import { get_lights } from './lights.js'
import { update_controls } from './control.js'


// import Stats from 'https://cdnjs.cloudflare.com/ajax/libs/stats.js/r17/Stats.min.js'

// // Stats
// const stats = new Stats()
// stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild(stats.dom)

var MODEL_SCALE = 5;

var myscrollbar = get_scrollbar()

var clock = new THREE.Clock();

var model;
var mixer;
function main() {
    var { scene, renderer, camera } = init(THREE);
    var scene = get_lights(THREE, scene)

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('./js/lib/')
    loader.setDRACOLoader(dracoLoader);
    loader.load(
        // gltf-pipeline -i model.glb -o model.gltf -d
        './gltf/model.gltf',
        function (gltf) {
            model = gltf.scene;
            model.castShadow = true
            model.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE)
            model.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    node.flatShading = true;
                    node.blending = THREE.NoBlending;
                    const newMaterial = new THREE.MeshPhongMaterial({ color: node.material.color });
                    node.material = newMaterial;

                }
            });

            mixer = new THREE.AnimationMixer(gltf.scene);
            for (var i = 0; i < gltf.animations.length; i++) {
                var action = mixer.clipAction(gltf.animations[i]);
                action.play();
            }
            scene.add(model);
        })

    function render() {
        // stats.update()
        update_controls(model, myscrollbar);
        var delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}

main();

