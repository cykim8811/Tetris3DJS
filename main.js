var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Adding Light
var light = new THREE.AmbientLight(0xffffff, 0.0);
scene.add(light);

var dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(200, 200, 300);
dirLight.castShadow = true;

scene.add(dirLight);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function update() {
    cube.rotation.x += 0.005;
    cube.rotation.z += 0.005;
    setTimeout(update, 0.02);
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();
update();