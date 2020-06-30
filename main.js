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
for (var i = 0; i < 8; i++) {
    texture_list[i] = new textureLoader.load("image/block_" + String(i) + ".png");
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
function Array3D(sx, sy, sz) {
    this.sx = sx;
    this.sy = sy;
    this.sz = sz;
    this.data = new Array(sx * sy * sz).fill(-1);
    this.set = function (x, y, z, data) {
        this.data[x * this.sy * this.sz + y * this.sz + z] = data;
    }
    this.get = function (x, y, z) {
        return this.data[x * this.sy * this.sz + y * this.sz + z];
    }
    this.copy = function (other) {
        this.sx = other.sx;
        this.sy = other.sy;
        this.sz = other.sz;
        this.data = new Array(other.sx * other.sy * other.sz);
        for (var i = 0; i < other.sx * other.sy * other.sz; i++) {
            this.data[i] = other.data[i];
        }
        return this;
    }
}

// 3D Integer vector
function GridVector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}


// Map Array
const map_side_length = 6;
const map_height = 15;

var block = new Array3D(map_side_length, map_height, map_side_length);
var map = new Array3D(map_side_length, map_height + 4, map_side_length);

// Block shape data
var block_data = new Array();
var temp_data;

if (true) {
    temp_data = new Array3D(5, 5, 5);
    temp_data.set(2, 3, 2, 1);
    temp_data.set(2, 2, 2, 1);
    temp_data.set(2, 1, 2, 1);
    temp_data.set(2, 0, 2, 1);
    block_data.push(temp_data);

    temp_data = new Array3D(3, 3, 3);
    temp_data.set(0, 1, 1, 1);
    temp_data.set(1, 1, 1, 1);
    temp_data.set(2, 1, 1, 1);
    temp_data.set(2, 0, 1, 1);
    block_data.push(temp_data);


    temp_data = new Array3D(3, 3, 3);
    temp_data.set(0, 0, 1, 1);
    temp_data.set(1, 0, 1, 1);
    temp_data.set(1, 1, 1, 1);
    temp_data.set(2, 1, 1, 1);
    block_data.push(temp_data);

    temp_data = new Array3D(2, 2, 2);
    temp_data.set(0, 1, 1, 1);
    temp_data.set(1, 1, 1, 1);
    temp_data.set(0, 0, 1, 1);
    temp_data.set(1, 0, 1, 1);
    block_data.push(temp_data);

    temp_data = new Array3D(2, 2, 2);
    temp_data.set(0, 0, 1, 1);
    temp_data.set(1, 0, 1, 1);
    temp_data.set(1, 1, 1, 1);
    temp_data.set(1, 1, 0, 1);
    block_data.push(temp_data);

    temp_data = new Array3D(2, 2, 2);
    temp_data.set(0, 0, 0, 1);
    temp_data.set(1, 0, 0, 1);
    temp_data.set(1, 1, 0, 1);
    temp_data.set(1, 1, 1, 1);
    block_data.push(temp_data);

    temp_data = new Array3D(3, 3, 3);
    temp_data.set(0, 1, 1, 1);
    temp_data.set(1, 1, 1, 1);
    temp_data.set(2, 1, 1, 1);
    temp_data.set(1, 0, 1, 1);
    block_data.push(temp_data);

    temp_data = new Array3D(2, 2, 2);
    temp_data.set(0, 0, 0, 1);
    temp_data.set(1, 0, 0, 1);
    temp_data.set(0, 1, 0, 1);
    temp_data.set(0, 0, 1, 1);
    block_data.push(temp_data);
}

function rotate(target, axis, n = 1) {
    var result = new Array3D(target.sx, target.sy, target.sz);
    var rotftn = function () { };
    if (axis == 'X') {
        rotftn = function (x, y, z) {
            result.set(x, z, target.sy - 1 - y, target.get(x, y, z));
        }
    } else if (axis == 'Y') {
        rotftn = function (x, y, z) {
            result.set(target.sz - 1 - z, y, x, target.get(x, y, z));
        }
    } else if (axis == 'Z') {
        rotftn = function (x, y, z) {
            result.set(y, target.sx - 1 - x, z, target.get(x, y, z));
        }
    }
    for (var ix = 0; ix < target.sx; ix++) {
        for (var iy = 0; iy < target.sy; iy++) {
            for (var iz = 0; iz < target.sz; iz++) {
                rotftn(ix, iy, iz);
            }
        }
    }
}

// Display block at position x, y, z with data
function display(x, y, z, data) {
    if (data < 0) {
        block.get(x, y, z).visible = false;
        map.set(x, y, z, -1);
    } else {
        block.get(x, y, z).material = material[data % 8];
        block.get(x, y, z).visible = true;
    }
}

// Initiating map
for (var ix = 0; ix < map_side_length; ix++) {
    for (var iy = 0; iy < map_height; iy++) {
        for (var iz = 0; iz < map_side_length; iz++) {
            var index = (ix * map_side_length * map_height) + (iy * map_side_length) + iz;
            var cbl = new THREE.Mesh(geometry);
            var amp = 1;
            var px = (ix - (map_side_length - 1) / 2) * amp,
                py = iy * amp,
                pz = (iz - (map_side_length - 1) / 2) * amp;
            cbl.position.set(px, py, pz);
            scene.add(cbl);
            block.set(ix, iy, iz, cbl);
            display(ix, iy, iz, -1);
        }
    }
}
for (var ix = 0; ix < map_side_length; ix++) {
    for (var iy = 0; iy < map_height + 4; iy++) {
        for (var iz = 0; iz < map_side_length; iz++) {
            map.set(ix, iy, iz, -1);
        }
    }
}

// Initiating white board below
for (var ix = 0; ix < map_side_length; ix++) {
    for (var iz = 0; iz < map_side_length; iz++) {
        var new_block = new THREE.Mesh(geometry, material_white);
        var px = (ix - (map_side_length - 1) / 2) * amp;
        var py = -1 * amp;
        var pz = (iz - (map_side_length - 1) / 2) * amp;
        new_block.position.set(px, py, pz);
        scene.add(new_block);
    }
}

// Check if a falling tile can exist in place
function fit(tile, pos){
    for (var ix = 0; ix < tile.sx; ix++) {
        for (var iy = 0; iy < tile.sy; iy++) {
            for (var iz = 0; iz < tile.sz; iz++) {
                if (tile.get(ix, iy, iz) <= 0) continue;
                
                if (dx >= 0 && dx < map_side_length &&
                    dy >= 0 && dy < map_height &&
                    dz >= 0 && dz < map_side_length)
                        return false;
                if (map.get(pos.x + ix, pos.y + iy,pos.z + iz) >= 0)
                return false;
            }
        }
    }
    return true;
}

// Defining falling block
var falling_type = 0;
var falling_pos = new GridVector(
    Math.floor((map_side_length - block_data[falling_type].sx) / 2),
    map_height - block_data[falling_type].sy + 4,
    Math.floor((map_side_length - block_data[falling_type].sx) / 2));

var falling_block = new Array3D(1, 1, 1).copy(block_data[falling_type]);


function update_screen() {
    for (var ix = 0; ix < map_side_length; ix++) {
        for (var iy = 0; iy < map_height; iy++) {
            for (var iz = 0; iz < map_side_length; iz++) {
                display(ix, iy, iz, map.get(ix, iy, iz));
            }
        }
    }
    for (var ix = 0; ix < falling_block.sx; ix++) {
        for (var iy = 0; iy < falling_block.sy; iy++) {
            for (var iz = 0; iz < falling_block.sz; iz++) {
                var dx = falling_pos.x + ix,
                    dy = falling_pos.y + iy,
                    dz = falling_pos.z + iz;
                console.log(falling_block.get(2, 2, 2));
                if (falling_block.get(ix, iy, iz) == -1){
                    continue;
                }
                if (dx >= 0 && dx < map_side_length &&
                    dy >= 0 && dy < map_height &&
                    dz >= 0 && dz < map_side_length) {
                    display(dx, dy, dz, falling_type);
                }
            }
        }
    }
}

var playtime = 0;

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

    playtime++;
    if (playtime % 50 == 0) {
        falling_pos.y -= 1;
        if (falling_pos.y < 0) {
            falling_pos.y = map_height - block_data[falling_type].sy + 4;
        }
        update_screen();
    }
    setTimeout(onTick, 0.02);
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

render();
onTick();
