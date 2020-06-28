// Three js Initialize
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Camera setting
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var cam_rot_around = 0;

// Adding Light
var light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

var dirLight = new THREE.DirectionalLight(0x808080, 0.8);
dirLight.position.set(200, 200, 300);
dirLight.castShadow = true;
scene.add(dirLight);

// Three.js Material and Geometry
var geometry = new THREE.BoxGeometry(1, 1, 1);
var textureLoader = new THREE.TextureLoader();
var texture_list = new Array(8);
var material = new Array(8);
for (var i=0; i<8; i++){
    texture_list[i] = new textureLoader.load("image/block_" + String(i) +".png");
    material[i] = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: texture_list[i]
    });
    
}
texture_white = new textureLoader.load("image/block_white.png");
material_white = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    map: texture_white
});

// 3D Array class
function Array3D(sx, sy, sz){
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
    this.data = new Array(sx * sy * sz);
    this.set = function(x, y, z, data) {
        this.data[x * sy * sz + y * sz + z] = data;
    }
    this.get = function(x, y, z){
        return this.data[x * sy * sz + y * sz + z];
    }
}


// Map Array
const map_side_length = 6;
const map_height = 15;

var block = new Array3D(map_side_length, map_height, map_side_length);
var map = new Array3D(map_side_length, map_height + 4, map_side_length);

// Block shape data
var block_data = new Array(6);
var temp_data;

// Data assigning
{
    {
        temp_data = new Array3D(5, 5, 5);
        temp_data.set(2, 3, 2, 1);
        temp_data.set(2, 2, 2, 1);
        temp_data.set(2, 1, 2, 1);
        temp_data.set(2, 0, 2, 1);
        block_data.push(temp_data);
    }
    {
        temp_data = new Array3D(3, 3, 3);
        temp_data.set(1, 1, 1, 1);
        temp_data.set(0, 1, 1, 1);
        temp_data.set(2, 1, 1, 1);
        temp_data.set(2, 1, 2, 1);
        block_data.push(temp_data);
    }
    {
        temp_data = new Array3D(3, 3, 3);
        temp_data.set(0, 1, 1, 1);
        temp_data.set(1, 1, 1, 1);
        temp_data.set(1, 2, 1, 1);
        temp_data.set(2, 1, 2, 1);
        block_data.push(temp_data);
    }
    {
        temp_data = new Array3D(2, 2, 2);
        temp_data.set(0, 1, 1, 1);
        temp_data.set(1, 1, 1, 1);
        temp_data.set(1, 0, 1, 1);
        temp_data.set(1, 0, 0, 1);
        block_data.push(temp_data);
    }
    {
        temp_data = new Array3D(2, 2, 2);
        temp_data.set(0, 1, 1, 1);
        temp_data.set(1, 1, 1, 1);
        temp_data.set(1, 0, 1, 1);
        temp_data.set(1, 0, 2, 1);
        block_data.push(temp_data);
    }
    {
        temp_data = new Array3D(2, 2, 2);
        temp_data.set(0, 1, 1, 1);
        temp_data.set(1, 1, 1, 1);
        temp_data.set(1, 0, 1, 1);
        temp_data.set(0, 0, 1, 1);
        block_data.push(temp_data);
    }
    {
        temp_data = new Array3D(2, 2, 2);
        temp_data.set(0, 1, 1, 1);
        temp_data.set(1, 1, 1, 1);
        temp_data.set(1, 0, 1, 1);
        temp_data.set(1, 1, 0, 1);
        block_data.push(temp_data);
    }
    {
        temp_data = new Array3D(2, 2, 2);
        temp_data.set(0, 1, 1, 1);
        temp_data.set(1, 1, 1, 1);
        temp_data.set(1, 0, 1, 1);
        temp_data.set(2, 1, 1, 1);
        block_data.push(temp_data);
    }
}

// Set block at position x, y, z with data
function display(x, y, z, data) {
    if (data < 0){
        block.get(x, y, z).visible = false;
        map.set(x, y, z, -1);
    }else{
        block.get(x, y, z).material = material[data % 8];
        block.get(x, y, z).visible = true;
    }
}

// Initiating map
for (var ix=0; ix<map_side_length ; ix++) {
    for (var iy=0; iy<map_height ; iy++) {
        for (var iz=0; iz<map_side_length ; iz++) {
            var index = (ix * map_side_length * map_height) + (iy * map_side_length) + iz;
            var cbl = new THREE.Mesh(geometry);
            var amp = 1;
            var px = (ix-(map_side_length-1)/2) * amp,
                py = iy * amp,
                pz = (iz-(map_side_length-1)/2) * amp;
            cbl.position.set(px, py, pz);
            scene.add(cbl);
            block.set(ix, iy, iz, cbl);
            display(ix, iy, iz, -1);
        }
    }
}
for (var ix=0; ix<map_side_length; ix++) {
    for (var iy=0; iy<map_height + 4; iy++) {
        for (var iz=0; iz<map_side_length; iz++) {
            map.set(ix, iy, iz, -1);
        }
    }
}

// Initiating white board below
for (var ix=0; ix<map_side_length; ix++) {
    for (var iz=0; iz<map_side_length; iz++) {
        var new_block = new THREE.Mesh(geometry, material_white);
        var px = (ix-(map_side_length-1)/2) * amp;
        var py = -1 * amp;
        var pz = (iz-(map_side_length-1)/2) * amp;
        new_block.position.set(px, py, pz);
        scene.add(new_block);
    }
}

// Game data


function update_screen() {

}

function onTick() {
    camera.position.set(
        Math.sin(camera.rotation.y) * 15,
        12,
        Math.cos(camera.rotation.y) * 15
    );
    camera.rotation.order = "YXZ";
    cam_rot_around += 0.005;
    camera.rotation.x = -0.3;
    camera.rotation.y = cam_rot_around;
    setTimeout(onTick, 0.02);
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();
onTick();