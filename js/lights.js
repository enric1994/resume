function get_lights(THREE, scene) {
    const ambientLight = new THREE.AmbientLight(0xffffff, .75);

    // Hemi light
    const hemiLight = new THREE.HemisphereLight('white', 'orange', 1);

    // Directional light 1
    const dir1 = new THREE.DirectionalLight('white', 1);
    dir1.position.set(10, 10, 10);

    // Directional light 2 
    const dir2 = new THREE.DirectionalLight('white', 1);
    dir2.position.set(-10, 10, 10);

    // Directional light 3
    const dir3 = new THREE.DirectionalLight('white', 1);
    dir3.position.set(-10, 10, -10);

    // Directional light 4
    const dir4 = new THREE.DirectionalLight('white', 1);
    dir2.position.set(10, 10, -10);

    // Directional light 5
    const dir5 = new THREE.DirectionalLight('white', 0.7);
    dir2.position.set(-10, 10, -5);

    // Shadow light
    const shadow1 = new THREE.DirectionalLight('white', 1.5);
    shadow1.position.set(5, 25, 0);

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
    scene.add(shadow1);

    return scene
}

export {
    get_lights
}