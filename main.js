
// Three js Initialize
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Camera setting
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.y = 0;

// Adding Light
var light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

var dirLight = new THREE.DirectionalLight(0x808080, 0.8);
dirLight.position.set(200, 200, 300);
dirLight.castShadow = true;
scene.add(dirLight);

// Three.js Material and Geometry
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);

// Map Array
const map_side_length = 8;
const map_height = 20;

var map = new Array(map_side_length * map_side_length * map_height);
for (var i=0; i<map_side_length * map_side_length * map_height; i++) {
    map[i] = new THREE.Mesh(geometry, material)
}



scene.add(cube);




function update() {
    camera.position.set(
        Math.sin(camera.rotation.y) * 10,
        5,
        Math.cos(camera.rotation.y) * 10
    );
    camera.rotation.y += 0.01;
    camera.rotation.z = 0;
    camera.rotation.x = 0;
    if (camera.rotation.y % 10 < 5){
        cube.visible = false;
    }else{
        cube.visible = true;
    }
    setTimeout(update, 0.02);
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();
update();