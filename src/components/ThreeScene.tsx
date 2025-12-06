'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// Constants
const SPEED_CAP = 30;
const SCROLL_FACTOR = 0.003;
const SCROLL_DAMPING_FACTOR = 0.9;
const SCROLL_INERTIA_THRESHOLD = 0.001;
const SCROLL_INERTIA_CAP = 0.1;
const TOUCH_INERTIA_DECAY = 0.97;
const TOUCH_INERTIA_FACTOR = 0.003;
const TOUCH_INERTIA_CAP = 0.01;
const KEY_INERTIA_FACTOR = 0.005;
const KEY_INERTIA_DECAY = 0.99;
const KEY_SPEED_DECAY = 0.1;
const KEY_SPEED = 6;
const KEY_INERTIA_CAP = 0.001;
const KEY_INTERVAL = 10;
const FOV = 45;
const MAX_SCALE = 90000;
const MIN_SCALE = 0.001;
const LOCK_SCALE = 1;
const LOCK_SCALE_END = 15;
const MODEL_SCALE = 100;
const MODEL_SCALE_RESTART = 0.7;

// Camera path constants
const CAMERA_PATH_AMPLITUDE_XZ = 15;
const CAMERA_PATH_BASE_Y = 1;
const CAMERA_PATH_AMPLITUDE_Y = 1;
const CAMERA_PATH_BASE_Z = -5;
const CAMERA_PATH_FREQUENCY_X = 0.2;
const CAMERA_PATH_FREQUENCY_Y = 0.3;
const CAMERA_PATH_FREQUENCY_Z = 0.1;

const modelNames = [
    'title.glb',
    'city.glb',
    'languages.glb',
    'uni.glb',
    'phd.glb',
    'home.glb',
    'experience.glb',
    'tc.glb',
    'devops.glb',
    'safari.glb',
    'candle.glb',
    'preply.glb'
];

interface ThreeSceneProps {
    onShowFooter: (show: boolean) => void;
    onError: (error: string) => void;
}

export default function ThreeScene({ onShowFooter, onError }: ThreeSceneProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Variables
        let models: THREE.Group[] = [];
        let scrollIntensity = 0;
        let isScrolling = false;
        let touchStartX = 0;
        let touchStartY = 0;
        let inertia = 0;
        let keyInertia = 0;
        let keyInterval: NodeJS.Timeout | null = null;
        let scrollDirection = 0;
        let needsRender = true;
        let animationFrameId: number | null = null;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            FOV,
            window.innerWidth / window.innerHeight,
            0.1,
            1000000000
        );
        const clock = new THREE.Clock();
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            logarithmicDepthBuffer: true
        });
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.181.0/examples/jsm/libs/draco/');
        dracoLoader.setDecoderConfig({ type: 'js' });
        loader.setDRACOLoader(dracoLoader);

        // Renderer settings
        renderer.setPixelRatio(1); // window.devicePixelRatio < 1.5 ? window.devicePixelRatio : 2);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        containerRef.current.appendChild(renderer.domElement);

        // Lighting setup
        const lights = [
            new THREE.AmbientLight('white', 0.75),
            new THREE.HemisphereLight('white', 'orange', 1),
            new THREE.DirectionalLight('white', 1),
            new THREE.DirectionalLight('white', 1),
            new THREE.DirectionalLight('white', 1),
            new THREE.DirectionalLight('white', 1),
            new THREE.DirectionalLight('white', 0.7),
            new THREE.DirectionalLight(0xffffff, 1.0)
        ];

        lights[2].position.set(10, 10, 10);
        lights[3].position.set(-10, 10, 10);
        lights[4].position.set(-10, 10, -10);
        lights[5].position.set(10, 10, -10);
        lights[6].position.set(-10, 10, -5);
        lights[7].position.set(0.1, 1.5, 0.1);

        // Configure shadow-casting light
        const shadowLight = lights[7] as THREE.DirectionalLight;
        shadowLight.castShadow = true;
        shadowLight.shadow.mapSize.width = 5000;
        shadowLight.shadow.mapSize.height = 5000;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 50;
        shadowLight.shadow.camera.top = 50;
        shadowLight.shadow.camera.bottom = -50;
        shadowLight.shadow.camera.left = -50;
        shadowLight.shadow.camera.right = 50;
        lights.forEach(light => scene.add(light));

        // Function to load models
        async function loadModel(modelName: string, scale: number): Promise<THREE.Group> {
            return new Promise((resolve, reject) => {
                loader.load(
                    modelName,
                    (gltf) => {
                        const model = gltf.scene;
                        model.scale.set(scale, scale, scale);
                        model.castShadow = true;
                        model.traverse(node => {
                            if (node instanceof THREE.Mesh) {
                                node.castShadow = true;
                                node.receiveShadow = true;
                                node.material = new THREE.MeshPhongMaterial({ 
                                    color: node.material.color 
                                });
                            }
                        });
                        scene.add(model);
                        if (gltf.animations.length) {
                            const mixer = new THREE.AnimationMixer(model);
                            gltf.animations.forEach(clip => mixer.clipAction(clip).play());
                            (model as any).mixer = mixer;
                        }
                        resolve(model);
                    },
                    undefined,
                    (error) => {
                        console.error(`Error loading model ${modelName}:`, error);
                        reject(error);
                    }
                );
            });
        }

        // Load all models
        async function loadModels() {
            try {
                const initialScale = 1;
                
                models.push(await loadModel('/models/' + modelNames[0], initialScale));
                updateCameraPath();

                for (let i = 1; i < modelNames.length; i++) {
                    models.push(
                        await loadModel(
                            '/models/' + modelNames[i],
                            models[0].scale.x / (MODEL_SCALE ** i)
                        )
                    );
                }
                // Re-scale all models after loading them
                let rescale;
                for (let i = 0; i < models.length; i++) {
                    rescale = models[0].scale.x / (MODEL_SCALE ** i);
                    models[i].scale.set(rescale, rescale, rescale);
                }
            } catch (error) {
                console.error('Error loading models:', error);
                onError(error instanceof Error ? error.message : 'Failed to load 3D models. Please check your connection and try again.');
            }
        }
        loadModels();

        // Function to update camera path
        function updateCameraPath() {
            const scaleLog = Math.log2(models[0].scale.x);
            camera.position.set(
                CAMERA_PATH_AMPLITUDE_XZ * Math.sin(CAMERA_PATH_FREQUENCY_X * scaleLog),
                CAMERA_PATH_BASE_Y + CAMERA_PATH_AMPLITUDE_Y * Math.sin(CAMERA_PATH_FREQUENCY_Y * scaleLog),
                CAMERA_PATH_BASE_Z + CAMERA_PATH_AMPLITUDE_XZ * Math.cos(CAMERA_PATH_FREQUENCY_Z * scaleLog)
            );
            camera.lookAt(0, 0, 0);
            needsRender = true;
        }

        // Function to scale models
        function scaleModels(scrollIntensity: number) {
            let newScale;

            for (let i = 0; i < models.length; i++) {
                // Hide models when not in sight
                if (models[i].scale.x >= MAX_SCALE || models[i].scale.x < MIN_SCALE) {
                    models[i].visible = false;
                } else {
                    models[i].visible = true;
                }

                // Scale models
                newScale = models[i].scale.x + scrollIntensity * models[i].scale.x;
                models[i].scale.set(newScale, newScale, newScale);
            }

            // Reset loop at the end
            if (models[models.length - 1].scale.x > LOCK_SCALE_END) {
                for (let i = 0; i < models.length; i++) {
                    newScale = MODEL_SCALE_RESTART / MODEL_SCALE ** i;
                    models[i].scale.set(newScale, newScale, newScale);
                }
                onShowFooter(true);
            }
            
            needsRender = true;
        }

        // Scroll controls
        function applyScrollInertia() {
            if (models.length === 0) {
                isScrolling = false;
                return;
            }
            
            scrollIntensity = Math.min(
                SCROLL_INERTIA_CAP,
                Math.max(-SCROLL_INERTIA_CAP, scrollIntensity)
            );
            if (Math.abs(scrollIntensity) > SCROLL_INERTIA_THRESHOLD) {
                const lockScaleCondition =
                    (models[0].scale.x > LOCK_SCALE && scrollIntensity < 0) ||
                    (models[models.length - 1].scale.x < LOCK_SCALE_END && scrollIntensity > 0);

                if (lockScaleCondition) {
                    scaleModels(scrollIntensity);
                    updateCameraPath();
                }
                scrollIntensity *= SCROLL_DAMPING_FACTOR;
                requestAnimationFrame(applyScrollInertia);
            } else {
                isScrolling = false;
            }
        }

        const handleWheel = (event: WheelEvent) => {
            if (scrollDirection === 0) scrollDirection = event.deltaY > 0 ? 1 : -1;
            const deltaYcapped = Math.min(
                SPEED_CAP,
                Math.max(-SPEED_CAP, event.deltaY * scrollDirection)
            );
            scrollIntensity += deltaYcapped * SCROLL_FACTOR;
            if (!isScrolling) {
                isScrolling = true;
                requestAnimationFrame(applyScrollInertia);
            }
        };

        // Touch controls
        const handleTouchStart = (event: TouchEvent) => {
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            inertia = 0;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (models.length === 0) return;
            
            const touchX = event.touches[0].clientX;
            const touchY = event.touches[0].clientY;
            const deltaYcapped = Math.min(
                SPEED_CAP,
                Math.max(-SPEED_CAP, touchY - touchStartY)
            );
            const scrollIntensity = -deltaYcapped * TOUCH_INERTIA_FACTOR;
            const lockScaleCondition =
                (models[0].scale.x > LOCK_SCALE && scrollIntensity < 0) ||
                (models[models.length - 1].scale.x < LOCK_SCALE_END && scrollIntensity > 0);

            if (lockScaleCondition) {
                scaleModels(scrollIntensity);
                updateCameraPath();
                inertia = deltaYcapped;
                touchStartX = touchX;
                touchStartY = touchY;
            }
        };

        const handleTouchEnd = () => {
            function inertiaLoop() {
                if (models.length === 0) return;
                
                if (Math.abs(inertia) > TOUCH_INERTIA_CAP) {
                    const scrollIntensity = -inertia * TOUCH_INERTIA_FACTOR;
                    const lockScaleCondition =
                        (models[0].scale.x > LOCK_SCALE && scrollIntensity < 0) ||
                        (models[models.length - 1].scale.x < LOCK_SCALE_END && scrollIntensity > 0);

                    if (lockScaleCondition) {
                        scaleModels(scrollIntensity);
                        updateCameraPath();
                        inertia *= TOUCH_INERTIA_DECAY;
                        requestAnimationFrame(inertiaLoop);
                    }
                }
            }
            inertiaLoop();
        };

        // Key controls
        function handleKeyInertia() {
            if (models.length === 0) {
                if (keyInterval) clearInterval(keyInterval);
                return;
            }
            
            if (Math.abs(keyInertia) > KEY_INERTIA_CAP) {
                const scrollIntensity = keyInertia * KEY_INERTIA_FACTOR;
                const lockScaleCondition =
                    (models[0].scale.x > LOCK_SCALE && scrollIntensity < 0) ||
                    (models[models.length - 1].scale.x < LOCK_SCALE_END && scrollIntensity > 0);

                if (lockScaleCondition) {
                    scaleModels(scrollIntensity);
                    updateCameraPath();
                    keyInertia *= KEY_INERTIA_DECAY;
                } else {
                    if (keyInterval) clearInterval(keyInterval);
                }
            } else {
                if (keyInterval) clearInterval(keyInterval);
            }
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                if (keyInterval) clearInterval(keyInterval);
                keyInertia = event.key === 'ArrowUp' ? -KEY_SPEED : KEY_SPEED;
                keyInterval = setInterval(handleKeyInertia, KEY_INTERVAL);
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                keyInertia *= KEY_SPEED_DECAY;
            }
        };

        // Animation loop
        function animate() {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            let hasAnimations = false;
            
            // Update animations
            for (let i = 0; i < models.length; i++) {
                if ((models[i] as any).mixer && models[i].visible) {
                    (models[i] as any).mixer.update(delta);
                    hasAnimations = true;
                }
            }
            
            // Only render if something changed or animations are playing
            if (needsRender || hasAnimations) {
                renderer.render(scene, camera);
                needsRender = false;
            }
        }
        animate();

        // Handle window resize with debouncing
        let resizeTimeout: NodeJS.Timeout | null = null;
        const handleResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                needsRender = true;
            }, 100);
        };

        // Add event listeners
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            // Remove event listeners
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);

            // Clear intervals and timeouts
            if (keyInterval) clearInterval(keyInterval);
            if (resizeTimeout) clearTimeout(resizeTimeout);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            // Clean up Three.js resources
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                }
            });

            // Dispose renderer
            renderer.dispose();
            
            // Remove DOM element
            if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, [onShowFooter, onError]);

    return <div ref={containerRef} className="w-full h-screen" />;
}

