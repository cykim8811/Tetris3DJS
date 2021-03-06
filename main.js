window.addEventListener("resize", resizeCanvas, false);
function resizeCanvas() {
    var canvas = renderer.domElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();

    var width = renderer.domElement.width;
    var height = renderer.domElement.height;
    var l = Math.min(0.25 * (width - 0.3 * height), 0.2 * height);

    for (var i = 0; i < text_label.length; i++) {
        text_label[i].style.top = (height - height * 0.2 + 28 * i) + 'px';
        text_label[i].style.left = (width - 0.25 * (width - 0.3 * height) - 0.5 * l) + 'px';
        document.body.replaceChild(text_label[i], text_label[i]);
    }
}

function add_text(str = "None", x = 100, y = 100) {
    var txt = document.createElement('div');
    txt.style.color = "white";
    txt.style.position = 'absolute';
    txt.style.width = 200;
    txt.style.height = 100;
    txt.innerHTML = str;
    txt.style.font = "18px Arial";
    txt.style.top = x + 'px';
    txt.style.left = y + 'px';
    document.body.appendChild(txt);
    return txt;
}
// Three js Initialize
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

document.addEventListener('keydown', onKeyDown);

var text_label = new Array();
text_label.push(add_text("Move block: Arrows"));
text_label.push(add_text("Spin: W, E"));
text_label.push(add_text("Hold: Q"));
text_label.push(add_text("Rotate scene: A, D"));
text_label.push(add_text("Hard drop: Space"));

var text_score = add_text("Score: 0", 20, 20);

var width = renderer.domElement.width;
var height = renderer.domElement.height;
var l = Math.min(0.25 * (width - 0.3 * height), 0.2 * height);
for (var i = 0; i < text_label.length; i++) {
    text_label[i].style.top = (height - height * 0.2 + 28 * i) + 'px';
    text_label[i].style.left = (width - 0.25 * (width - 0.3 * height) - 0.5 * l) + 'px';
    document.body.replaceChild(text_label[i], text_label[i]);
}

renderer.setClearColor(0x000000, 1);

// Camera setting
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var cam_rot_around = 0;
var camrot_dir = 0;

var camera_next = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);

// Adding Light
var light = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(light);

var dirLight = new THREE.DirectionalLight(0x808080, 0.8);
dirLight.position.set(200, 50, 300);
scene.add(dirLight);

var sdwLight = new THREE.DirectionalLight(0x808080, 0.4);
sdwLight.position.set(0, 50, 0);
sdwLight.castShadow = true;
scene.add(sdwLight);

var running = true;

// Array shuffle function
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

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
    this.relative = function(dx, dy, dz){
        return new GridVector(this.x + dx, this.y + dy, this.z + dz);
    }
}


// Map Array
const map_side_length = 5;
const map_height = 12;

const margin = 2;

var block = new Array3D(map_side_length, map_height, map_side_length);
var map = new Array3D(map_side_length, map_height + margin, map_side_length);

// Display array
var block_next = new Array3D(5, 5, 5);

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

function rotate_block(target, axis) {
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
    return result;
}

function pop_from_bag() {
    if (bag_of_block.length == 0) {reset_bag();}
    return bag_of_block.pop();
}

function pop_next_block() {
    while (next_list.length<5) {
        next_list.push(pop_from_bag());
    }
    return next_list.shift();
}

function rotate_fallingblock_horizontal(dir) {
    var absdir = Math.floor(dir + camrot_dir);
    while (absdir < 0) {absdir += 4;}
    absdir = absdir % 4;


    var deltaPos = new Array();
    deltaPos.push([0, 0, 0]);
    deltaPos.push([0, 1, 0]);
    deltaPos.push([1, 1, 0]);
    deltaPos.push([-1, 1, 0]);
    deltaPos.push([0, 1, 1]);
    deltaPos.push([0, 1, -1]);
    deltaPos.push([1, 0, 0]);
    deltaPos.push([-1, 0, 0]);
    deltaPos.push([0, 0, 1]);
    deltaPos.push([0, 0, -1]);

    var res;
    switch (absdir){
        case 0:
            res = rotate_block(falling_block, 'X');
            break;
        case 1:
            res = rotate_block(falling_block, 'Z');
            res = rotate_block(res, 'Z');
            res = rotate_block(res, 'Z');
            break;
        case 2:
            res = rotate_block(falling_block, 'X');
            res = rotate_block(res, 'X');
            res = rotate_block(res, 'X');
            break;
        case 3:
            res = rotate_block(falling_block, 'Z');
            break;
    }
    for (var i=0; i<deltaPos.length; i++){
        if (fit(res, falling_pos.relative(deltaPos[i][0], deltaPos[i][1], deltaPos[i][2]))) {
            falling_block = res;
            falling_pos = falling_pos.relative(deltaPos[i][0], deltaPos[i][1], deltaPos[i][2]);
            break;
        }
    }
    update_screen();
}

function rotate_fallingblock_vertical(dir) {
    var res = rotate_block(falling_block, 'Y');

    var deltaPos = new Array();
    deltaPos.push([0, 0, 0]);
    deltaPos.push([0, 1, 0]);
    deltaPos.push([1, 1, 0]);
    deltaPos.push([-1, 1, 0]);
    deltaPos.push([0, 1, 1]);
    deltaPos.push([0, 1, -1]);
    deltaPos.push([1, 0, 0]);
    deltaPos.push([-1, 0, 0]);
    deltaPos.push([0, 0, 1]);
    deltaPos.push([0, 0, -1]);

    for (var i=0; i<deltaPos.length; i++){
        if (fit(res, falling_pos.relative(deltaPos[i][0], deltaPos[i][1], deltaPos[i][2]))) {
            falling_block = res;
            falling_pos = falling_pos.relative(deltaPos[i][0], deltaPos[i][1], deltaPos[i][2]);
            break;
        }
    }
    update_screen();
}
function move_fallingblock(dir) {
    dir -= camrot_dir;
    while (dir < 0) {dir += 4;}
    switch (dir % 4) {
        case 0:
            if (fit(falling_block, falling_pos.relative(-1, 0, 0))) {
                falling_pos = falling_pos.relative(-1, 0, 0);
            }
            break;
        case 1:
            if (fit(falling_block, falling_pos.relative(0, 0, -1))) {
                falling_pos = falling_pos.relative(0, 0, -1);
            }
            break;
        case 2:
            if (fit(falling_block, falling_pos.relative(1, 0, 0))) {
                falling_pos = falling_pos.relative(1, 0, 0);
            }
            break;
        case 3:
            if (fit(falling_block, falling_pos.relative(0, 0, 1))) {
                falling_pos = falling_pos.relative(0, 0, 1);
            }
            break;
    }
    update_screen();
}

function rotate_camera(n) {
    if (n > 0){
        cam_rot_around += Math.PI / 2;
        camrot_dir += 1;
    }else{
        cam_rot_around -= Math.PI / 2;
        camrot_dir -= 1;
    }
}

// Display block at position x, y, z with data
function display(x, y, z, data) {
    if (data < 0) {
        block.get(x, y, z).visible = false;
    }else{
        block.get(x, y, z).material = material[data % 8];
        block.get(x, y, z).visible = true;
    }
}

// Display next block at position x, y, z with data
function display_next(x, y, z, data) {
    if (data < 0) {
        block_next.get(x, y, z).visible = false;
    }else{
        block_next.get(x, y, z).material = material[data % 8];
        block_next.get(x, y, z).visible = true;
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
            cbl.castShadow = true;
            cbl.receiveShadow = true;
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
        new_block.castShadow = true;
        new_block.receiveShadow = true;
        scene.add(new_block);
    }
}

// Initiating next display
for (var ix = 0; ix < 5; ix++) {
    for (var iy = 0; iy < 5; iy++) {
        for (var iz = 0; iz < 5; iz++) {
            var cbl = new THREE.Mesh(geometry);
            var amp = 1;
            var px = (ix - (map_side_length - 1) / 2) * amp,
                py = (iy - 10000) * amp,
                pz = (iz - (map_side_length - 1) / 2) * amp;
            cbl.position.set(px, py, pz);
            cbl.castShadow = true;
            cbl.receiveShadow = true;
            scene.add(cbl);
            block_next.set(ix, iy, iz, cbl);
            display_next(ix, iy, iz, 1);
        }
    }
}

// Check if a falling tile can exist in place
function fit(tile, pos){
    for (var ix = 0; ix < tile.sx; ix++) {
        for (var iy = 0; iy < tile.sy; iy++) {
            for (var iz = 0; iz < tile.sz; iz++) {
                if (tile.get(ix, iy, iz) <= 0) continue;
                var dx = pos.x + ix,
                    dy = pos.y + iy,
                    dz = pos.z + iz;
                if (!(dx >= 0 && dx < map_side_length &&
                    dy >= 0 && dy < map_height + margin &&
                    dz >= 0 && dz < map_side_length)) return false;
                if (map.get(pos.x + ix, pos.y + iy,pos.z + iz) >= 0)
                return false;
            }
        }
    }
    return true;
}

// Defining falling block
var bag_of_block = new Array();

var next_list = new Array();

function reset_bag(){
    for (var i=0; i<8; i++) {bag_of_block.push(i);}
    shuffle(bag_of_block);
}

var falling_type = pop_next_block();

var hold_block = -1;
var hold_used = false;

var camera_vel = 0;
var camera_mov = 0;
var camera_hvel = 0;
var camera_hmov = 0;

var score = 0;

var falling_pos = new GridVector(
    Math.floor((map_side_length - block_data[falling_type].sx) / 2),
    map_height - block_data[falling_type].sy + margin,
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
var fall_maxdelay = 200;
var fall_delay = fall_maxdelay;

function check() {
    while (fit(falling_block, falling_pos.relative(0, -1, 0))) {
        falling_pos = falling_pos.relative(0, -1, 0);
    }
    
    for (var ix = 0; ix < falling_block.sx; ix++) {
        for (var iy = 0; iy < falling_block.sy; iy++) {
            for (var iz = 0; iz < falling_block.sz; iz++) {
                var dx = falling_pos.x + ix,
                    dy = falling_pos.y + iy,
                    dz = falling_pos.z + iz;
                if (falling_block.get(ix, iy, iz) == -1){
                    continue;
                }
                if (dx >= 0 && dx < map_side_length &&
                    dy >= 0 && dy < map_height &&
                    dz >= 0 && dz < map_side_length) {
                    map.set(dx, dy, dz, falling_type);
                }
            }
        }
    }

    for (var iy = 0; iy < map_height + margin; iy++) {
        var isFull = true;
        for (var ix = 0; ix < map_side_length; ix++) {
            for (var iz = 0; iz < map_side_length; iz++) {
                if (map.get(ix, iy, iz) < 0) {
                    isFull = false;
                    break;
                }
            }
        }
        if (isFull) {
            for (var iyy = iy; iyy < map_height + margin - 1; iyy++) {
                for (var ixx = 0; ixx < map_side_length; ixx++) {
                    for (var izz = 0; izz < map_side_length; izz++) {
                        map.set(ixx, iyy, izz, map.get(ixx, iyy + 1, izz));
                    }
                }
            }
            iy -= 1;
            camera_vel += 0.5;
            camera_hvel += 0.7;
            score += 1;
            text_score.innerHTML = "Score: " + score;
        }
    }
    falling_type = pop_next_block();
    falling_block.copy(block_data[falling_type]);
    falling_pos = new GridVector(
        Math.floor((map_side_length-falling_block.sx)/2),
        map_height + margin - falling_block.sy - 1,
        Math.floor((map_side_length-falling_block.sx)/2),
    );
    if (!fit(falling_block, falling_pos)) {
        game_end();
        falling_pos = new GridVector(0, -5, 0);
    }
    update_screen();
    hold_used = false;
}

// Event when game ends
function game_end() {
    running = false;
}

function onKeyDown(e) {
    const keyCode = e.keyCode;
    console.log(keyCode);
    if (running) {
        if (keyCode == 68) {rotate_camera(1);}
        if (keyCode == 65) {rotate_camera(-1);}
        if (keyCode == 32) {check(); camera_vel += 0.2;}
        if (keyCode == 69) {rotate_fallingblock_vertical(1);
            if (!fit(falling_block, falling_pos.relative(0, -1, 0))) fall_delay = fall_maxdelay;}
        if (keyCode == 87) {rotate_fallingblock_horizontal(1);
            if (!fit(falling_block, falling_pos.relative(0, -1, 0))) fall_delay = fall_maxdelay;}
        if (keyCode == 37) {move_fallingblock(0);
            if (!fit(falling_block, falling_pos.relative(0, -1, 0))) fall_delay = fall_maxdelay;}
        if (keyCode == 38) {move_fallingblock(1);
            if (!fit(falling_block, falling_pos.relative(0, -1, 0))) fall_delay = fall_maxdelay;}
        if (keyCode == 39) {move_fallingblock(2);
            if (!fit(falling_block, falling_pos.relative(0, -1, 0))) fall_delay = fall_maxdelay;}
        if (keyCode == 40) {move_fallingblock(3);
            if (!fit(falling_block, falling_pos.relative(0, -1, 0))) fall_delay = fall_maxdelay;}
        if (keyCode == 81 && !hold_used) {
            use_hold();
        }
    }
}

function use_hold() {
    hold_used = true;
    
    falling_pos = new GridVector(0, -5, 0);
    if (hold_block < 0) {
        hold_block = falling_type;
        falling_type = pop_next_block();
    }else{
        var temp = falling_type;
        falling_type = hold_block;
        hold_block = temp;
    }
    falling_block.copy(block_data[falling_type]);
    falling_pos = new GridVector(
        Math.floor((map_side_length-falling_block.sx)/2),
        map_height + margin - falling_block.sy,
        Math.floor((map_side_length-falling_block.sx)/2),
    );
    update_screen();
    set_next_map();
}

function manage_camera_rotation() {
    camera.rotation.order = "YXZ";
    camera.rotation.x = -0.3;
    var ratio = 0.07;
    camera.rotation.y += cam_rot_around * ratio;
    cam_rot_around = cam_rot_around * (1-ratio);

    if (Math.abs(cam_rot_around)<0.01) {
        cam_rot_around = 0;
        camera.rotation.y = Math.round((camera.rotation.y + (Math.PI/3)) / (Math.PI/2)) * (Math.PI/2) - (Math.PI/3);
    }

    camera.position.set(
        Math.sin(camera.rotation.y) * 13 + Math.cos(camera.rotation.y) * camera_hmov,
        10 + camera_mov,
        Math.cos(camera.rotation.y) * 13 + Math.sin(camera.rotation.y) * camera_hmov
    );
}

function manage_next_camera_rotation() {
    camera_next.rotation.order = "YXZ";
    camera_next.rotation.x = -0.3;
    camera_next.rotation.y += 0.005;

    camera_next.position.set(
        Math.sin(camera_next.rotation.y) * 8,
        -10000 + 4,
        Math.cos(camera_next.rotation.y) * 8
    );
}

function set_next_map(bn) {
    for (var ix = 0; ix < 5; ix++) {
        for (var iy = 0; iy < 5; iy++) {
            for (var iz = 0; iz < 5; iz++) {
                display_next(ix, iy, iz, -1);
            }
        }
    }
    var blk = block_data[bn];
    for (var ix = 0; ix < blk.sx; ix++) {
        for (var iy = 0; iy < blk.sy; iy++) {
            for (var iz = 0; iz < blk.sz; iz++) {
                if (blk.get(ix, iy, iz) < 0) continue;
                display_next(Math.floor((5-blk.sx)/2 + ix), Math.floor((5-blk.sy)/2 + iy), Math.floor((5-blk.sz)/2 + iz), bn);
            }
        }
    }
}


function onTick() {
    playtime++;
    manage_next_camera_rotation();
    if (running) {
        manage_camera_rotation();

        if (fall_delay < 0) {
            if (fit(falling_block, falling_pos.relative(0, -1, 0))) {
                falling_pos.y -= 1;
            }else{
                check();
                // falling_pos.y = map_height - block_data[falling_type].sy + 4;
            }
            update_screen();
            fall_delay = fall_maxdelay;
        }
        fall_delay -= 1;
    } else {
        camera.rotation.y += 0.005;
        camera.position.set(
            Math.sin(camera.rotation.y) * 13,
            10,
            Math.cos(camera.rotation.y) * 13
        );
    }
    camera_vel -= camera_mov * 0.1;
    camera_mov += camera_vel;
    camera_vel *= 0.6;
    camera_hvel -= camera_hmov * 0.8;
    camera_hmov += camera_hvel;
    camera_hvel *= 0.8;
    setTimeout(onTick, 0.02);
}

function render() {
    var width = renderer.domElement.width;
    var height = renderer.domElement.height;
    requestAnimationFrame(render);
    renderer.setViewport(0, 0, width, height);
    renderer.render(scene, camera);


    renderer.autoClear = false;

    var l = Math.min(0.25 * (width - 0.3 * height), 0.2 * height);

    if (hold_block >= 0) {
        set_next_map(hold_block);
        renderer.setViewport(0.25 * (width - 0.3 * height) - 0.5 * l, height - 1.5 * l , l, l);
        renderer.render(scene, camera_next);
    }

    for (var i=0; i<3; i++) {
        set_next_map(next_list[i]);
        renderer.setViewport(width - 0.25 * (width - 0.3 * height) - 0.5 * l, height - 1.5 * l - l * i , l, l);
        renderer.render(scene, camera_next);
    }

    renderer.autoClear = true;
}

render();
onTick();
