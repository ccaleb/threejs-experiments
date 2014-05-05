/*
    Moon Buggy Demo
    Christopher Caleb
    http://www.yeahbutisitflash.com

    No user interaction in this demo. Just watch the buggy traverse from one side of the
    moon's surface to the other, while jumping over a few ramps and negotiating a few
    bumps.

    The code is in need of some serious refactoring. Yeah I know you should do that as you
    go along but hey.
*/
function Main()
{
    this.focusStep = 0;
    this.desiredVelocity = 25;
    this.wait = 175;
    this.acc = false;
    this.engineForce = 0;
    this.accForce = 10;
    this.decForce = -5;
    this.power = null;
    this.state = 0; // 0: start, 1: running

    this.setupRenderer();
    this.setupScene();
    this.setupLights();
    this.setupCamera();
    this.setupControls();

    this.setupPath();
    this.setupRamps();
    this.setupTerrain();
    this.setupMoonBuggy();
    this.loadTextures();
    this.createWheels();
    this.setupBackground();
    this.setupEarth();
    this.setupRainbow();
    this.setupCreatures();

    this.render();
}

Main.prototype.setupCamera = function() {
    this.camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1, 2000
    );
    this.cameraPos = {x: -50, y: 15, z:90};
    this.lookAtPos = {x: 0, y: 15, z:90};

    this.camera.position.set(-50, 15, 90);
    this.camera.lookAt(new THREE.Vector3(0, 15, 90));
};

Main.prototype.setupControls = function() {
    this.clock = new THREE.Clock();

    this.flyControls = new THREE.FlyControls(this.camera);
    this.flyControls.movementSpeed = 25;
    this.flyControls.domElement = document.querySelector("#WebGL-output");
    this.flyControls.rollSpeed = Math.PI / 12;
    this.flyControls.autoForward = false;
    this.flyControls.dragToLook = false;
};

Main.prototype.setupRenderer = function() {
    this.webGLRenderer = new THREE.WebGLRenderer();
    this.webGLRenderer.setClearColorHex(0x333333, 1.0);
    window.innerWidth = 1024;
    window.innerHeight = 768;
    this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    $("#WebGL-output").append(this.webGLRenderer.domElement);    
};

Main.prototype.setupRenderStats = function() {
    this.render_stats = new Stats();
    this.render_stats.domElement.style.position = 'absolute';
    this.render_stats.domElement.style.top = '1px';
    this.render_stats.domElement.style.left = '1px';
    this.render_stats.domElement.style.zIndex = 100;
    document.getElementById('WebGL-output').appendChild(this.render_stats.domElement);
};

Main.prototype.setupScene = function() {
    this.scene = new Physijs.Scene({reportSize: 10, fixedTimeStep: 1 / 60});
    this.scene.setGravity(new THREE.Vector3(0, -55, 0));
};

Main.prototype.setupLights = function() {
    light = new THREE.DirectionalLight(0xFFFFFF);
    light.position.set( -100, 60, 0 );
    light.castShadow = false;
    light.shadowCameraLeft = -150;
    light.shadowCameraTop = -150;
    light.shadowCameraRight = 150;
    light.shadowCameraBottom = 150;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 400;
    light.shadowBias = -.0001
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = .7;
    this.scene.add(light);
};

/**
 * Sets up a path that the buggy can traverse. The path will be a heightfield map that 
 * is utilised by the physics engine. The buggy itself will consist of geometric 
 * shapes that can interact and move along the heightfield map. While we're here, we'll 
 * work out where in the game world other bits and bobs will be positioned, such as bumps
 * in the terrain and space creatures (giraffes, penguins and lions).
 * By the way, this method isn't pretty. Sorry!
 */
Main.prototype.setupPath = function() {
    var groundGeom = new THREE.PlaneGeometry(6000, 10, 6000, 1);
    var step = 0;
    var step2 = 0;
    this.heightsArr = [];
    var multiplier = 4;
    var multiplier2 = 2;
    this.bumpsAt = [];
    this.creaturesAt = [];
    var vertices = [];
    for (var i = 0; i < groundGeom.faces.length; i++) {
        var face = groundGeom.faces[i];
        var vertexIndex = face.a;
        var vertex = groundGeom.vertices[vertexIndex];
        var value = 1 + Math.sin(step);
        var value2 = 2 + (Math.sin(step2) * multiplier);
        vertex.z = (value * multiplier2) + value2;
        this.heightsArr.push(vertex.z);
        if (vertices[vertex.y] == null) vertices[vertex.y] = [];
        if (vertices[vertex.y].indexOf(vertex) == -1)
        {
            vertices[vertex.y].push(vertex);
        }

        if (Math.random() < 0.005 && i < groundGeom.faces.length - 500)
        {
            this.bumpsAt.push({z: i, y: vertex.z});
        }
        else if (Math.random() < 0.00125 )
        {
            this.creaturesAt.push({z: i, y: vertex.z});
        }

        step += 0.005 * 1;
        step2 += 0.0005 * 1;

        vertexIndex = face.b;
        vertex = groundGeom.vertices[vertexIndex];
        value = 1 + Math.sin(step);
        value2 = 2 + (Math.sin(step2) * multiplier);
        vertex.z = (value * multiplier2) + value2;
        this.heightsArr.push(vertex.z);
        if (vertices[vertex.y] == null) vertices[vertex.y] = [];
        if (vertices[vertex.y].indexOf(vertex) == -1)
        {
            vertices[vertex.y].push(vertex);
        }
        
        step += 0.005 * 1;
        step2 += 0.0005 * 1;

        vertexIndex = face.c;
        vertex = groundGeom.vertices[vertexIndex];
        value = 1 + Math.sin(step);
        value2 = 2 + (Math.sin(step2) * multiplier);
        vertex.z = (value * multiplier2) + value2;
        this.heightsArr.push(vertex.z);
        if (vertices[vertex.y] == null) vertices[vertex.y] = [];
        if (vertices[vertex.y].indexOf(vertex) == -1)
        {
            vertices[vertex.y].push(vertex);
        }

        step += 0.005 * 1;
        step2 += 0.0005 * 1;
    }
    groundGeom.computeFaceNormals();
    groundGeom.computeVertexNormals();
    
    this.pathVertices = vertices;
    var groundMat = Physijs.createMaterial(
        new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}),
        0.1,
        0
    );

    this.ground = new Physijs.HeightfieldMesh(
        groundGeom,
        groundMat,
        0,
        6000,
        1
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.rotation.z = Math.PI / 2;
    this.ground.position.z = 3000;
    this.ground.visible = false;
    this.scene.add(this.ground);
};

/**
 * The path that the buggy runs along sits perfectly within the terrain. The terrain
 * infact is built using the path's geometry but is much wider to give the impression 
 * that our buggy is sitting on the surface of the moon. We could have simply extended 
 * the width of the heightfield map but that would have had a performance impact on the
 * physics engine, and since the buggy only runs along a single axis, it would have been
 * a waste of CPU anyway. The terrain geometry is not integrated with the physics engine.
 * Another messy method. Good luck understanding this!
 */
Main.prototype.setupTerrain = function() {
    var geom = new THREE.PlaneGeometry(6000, 110, 6000, 11);
    var vertices = [];
    for (var i = 0; i < geom.faces.length; i++) {
        var face = geom.faces[i];
        var vertexIndex = face.a;
        var vertex = geom.vertices[vertexIndex];
        if (vertices[vertex.y] == null) vertices[vertex.y] = [];
        if (vertices[vertex.y].indexOf(vertex) == -1)
        {
            vertices[vertex.y].push(vertex);
        }

        var vertexIndex = face.b;
        var vertex = geom.vertices[vertexIndex];
        if (vertices[vertex.y] == null) vertices[vertex.y] = [];
        if (vertices[vertex.y].indexOf(vertex) == -1)
        {
            vertices[vertex.y].push(vertex);
        }

        var vertexIndex = face.c;
        var vertex = geom.vertices[vertexIndex];
        if (vertices[vertex.y] == null) vertices[vertex.y] = [];
        if (vertices[vertex.y].indexOf(vertex) == -1)
        {
            vertices[vertex.y].push(vertex);
        }
    }


    var ys = [];
    var curve = [-40, -20, -10, -5, -2.5, 0, 0, -2.5, -5, -10, -20, -40];
    for (var i = 0; i < vertices.length; i++)
    {
        if (vertices[i] != null)
        {
            ys.push(i);
            ys.unshift(-i);
        }
    }
    
    for (var k = 0; k < ys.length; k++)
    {
        var y = ys[k];
        arr = vertices[y];
        for (var i = 0; i < this.pathVertices[-5].length; i++)
        {
            arr[i].z = this.pathVertices[5][i].z;
            arr[i].z += curve[k];
        }
    }


    geom.computeFaceNormals();
    geom.computeVertexNormals();
    
    var material = Physijs.createMaterial(
        new THREE.MeshPhongMaterial({color: 0x888888, wireframe: false}),
        0.1,
        0
    );

    this.terrain = new THREE.Mesh(geom, material);
    this.terrain.rotation.x = -Math.PI / 2;
    this.terrain.rotation.z = Math.PI / 2;
    this.terrain.position.z = 3000;
    this.terrain.visible = true;
    this.scene.add(this.terrain);
};

Main.prototype.setupRamps = function() {
    this.addRamp(450, -44, 100, Math.PI / 24);
    this.addRamp(680, -30, 80, Math.PI / 16);
    this.addRamp(770, -33, 80, -Math.PI / 32);
    this.addRamp(1060, -43, 90, Math.PI / 48);
    this.addRamp(2000, -57, 150, Math.PI / 12);
    this.addRamp(2135, -65, 150, -Math.PI / 28);
    this.addRamp(2500, -125, 300, Math.PI / 20);
    this.addRamp(2780, -129, 300, -Math.PI / 20);

    for (var i = 0; i < this.bumpsAt.length; i++)
    {
        this.addBump(6000 - (this.bumpsAt[i].z / 2), this.bumpsAt[i].y, 2 + (Math.random() / 2));
    }
};

Main.prototype.addRamp = function(zPos, yPos, length, angle) {
    var geometry = new THREE.CubeGeometry(4, length, length, 1, 1, 1);

    var material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({color: 0x888888, wireframe: false}),
        0.1,
        0
    );

    this.ramp = new Physijs.BoxMesh(
        geometry,
        material,
        0,
        1,
        1
    );
    this.ramp.rotation.x = -Math.PI / 2 - angle;
    this.ramp.position.z = zPos;
    this.ramp.position.y = yPos;
    this.ramp.visible = true;
    this.scene.add(this.ramp);
};

Main.prototype.addBump = function(zPos, yPos, size) {
    var geometry = new THREE.CubeGeometry(3.9, size, size, 1, 1, 1);

    var material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({color: 0x888888, wireframe: false}),
        0.1,
        0
    );

    var bump = new Physijs.BoxMesh(
        geometry,
        material,
        0,
        1,
        1
    );
    bump.rotation.x = -Math.PI / 16;
    bump.position.z = zPos;
    bump.position.y = yPos;
    bump.visible = true;
    this.scene.add(bump);
};

Main.prototype.setupMoonBuggy = function() {
    var boxGeom = new THREE.CubeGeometry(2, 11, 28, 1, 1);
    var mesh = new Physijs.BoxMesh(
        boxGeom,
        new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true})
    );
    mesh.position.y = 14;
    mesh.position.z = 90;

    this.vehicle = new Physijs.Vehicle(mesh, new Physijs.VehicleTuning(
        20,
        1.83,
        0.28,
        250,
        10.5,
        15000
    ));

    this.scene.add(this.vehicle);

    mesh.setAngularFactor(new THREE.Vector3( 1, 0, 0 )); // Only rotate on Z axis.
    mesh.setLinearFactor(new THREE.Vector3( 0, 1, 1 )); // Only move on X and Y axis.
    mesh.setCcdMotionThreshold(0.1);
    mesh.setCcdSweptSphereRadius(1);

    var wheel = this.createWheelGeom();
    var wheel_material = this.createWheelMat();

    var wheelDirection = new THREE.Vector3(0, -1, 0);
    var wheelAxle = new THREE.Vector3(-1, 0, 0);
    for (var i = 0; i < 4; i++)
    {
        this.vehicle.addWheel(
            wheel,
            wheel_material,
            new THREE.Vector3(
                    i % 2 === 0 ? -1.6 : 1.6,
                    -6,
                    i < 2 ? 9 : -9
            ),
            wheelDirection,
            wheelAxle,
            0.5,
            4, // wheel radius
            i < 2 ? true : false
        );
    }

    this.vehicle.addWheel(
        wheel, wheel_material, new THREE.Vector3(-1.6, -6, 0),
        wheelDirection, wheelAxle,
        0.5,
        4,
        false
    );

    this.vehicle.addWheel(
        wheel, wheel_material, new THREE.Vector3(1.6, -6, 0),
        wheelDirection, wheelAxle,
        0.5,
        4,
        false
    );

    // Make the mesh invisible because we'll be replacing it with some sprites.
    this.vehicle.mesh.visible = false;
    this.vehicle.wheels[0].visible = false;
    this.vehicle.wheels[1].visible = false;
    this.vehicle.wheels[2].visible = false;
    this.vehicle.wheels[3].visible = false;
    this.vehicle.wheels[4].visible = false;
    this.vehicle.wheels[5].visible = false;

    this.scene.simulate( undefined, 2 );
};

Main.prototype.createWheelGeom = function()
{
    var geom = new THREE.CylinderGeometry(4, 4, 2, 32);
    geom.applyMatrix(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, 0, Math.PI / 2), 'XYZ'));
    return geom;
};

Main.prototype.createWheelMat = function()
{
    return new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true});
};

Main.prototype.loadTextures = function() {
    this.textures = {};
    this.textures.wheel = new THREE.ImageUtils.loadTexture("resources/wheel.png");
    this.textures.body = new THREE.ImageUtils.loadTexture("resources/body.png");
    this.textures.background = new THREE.ImageUtils.loadTexture("resources/background.png");
    this.textures.rainbow = new THREE.ImageUtils.loadTexture("resources/rainbow.png");
    this.textures.earth = new THREE.ImageUtils.loadTexture("resources/earth.png");
    this.textures.giraffe = new THREE.ImageUtils.loadTexture("resources/giraffe.png");
    this.textures.lion = new THREE.ImageUtils.loadTexture("resources/lion.png");
    this.textures.penguin = new THREE.ImageUtils.loadTexture("resources/penguin.png");
    this.textures.weemee = new THREE.ImageUtils.loadTexture("resources/weemee.png");
};

Main.prototype.createWheels = function() {
    this.wheelSprites = [];
    this.wheelSprites.push(this.createWheelSprite());
    this.wheelSprites.push(this.createWheelSprite());
    this.wheelSprites.push(this.createWheelSprite());
    this.scene.add(this.wheelSprites[0]);
    this.scene.add(this.wheelSprites[1]);
    this.scene.add(this.wheelSprites[2]);

    this.bodySprite = this.createBodySprite();
    this.scene.add(this.bodySprite);
};

Main.prototype.createWheelSprite = function() {

    var material = new THREE.SpriteMaterial({
        opacity: 1,
        color: 0xffffff,
        transparent: false,
        useScreenCoordinates: false,
        map: this.textures.wheel}
    );

    material.uvOffset.set(0, 0);
    material.uvScale.set(1, 1);
    material.alignment = THREE.SpriteAlignment.center;
    material.scaleByViewport = true;

    var sprite = new THREE.Sprite(material);
    if (window.devicePixelRatio > 1)
    {
        sprite.scale.set(13000, 13000, 13000);
    }
    else
    {
        sprite.scale.set(13000/2, 13000/2, 13000/2);   
    }
    sprite.position.set(-2.0, 8, -12);

    return sprite;
};

Main.prototype.createBodySprite = function() {

    var material = new THREE.SpriteMaterial({
        opacity: 1,
        color: 0xffffff,
        transparent: false,
        useScreenCoordinates: false,
        map: this.textures.body}
    );

    material.uvOffset.set(0, 0);
    material.uvScale.set(1, 1);
    material.alignment = THREE.SpriteAlignment.center;
    material.scaleByViewport = true;

    var sprite = new THREE.Sprite(material);
    if (window.devicePixelRatio > 1)
        sprite.scale.set(70000, 70000, 70000);
    else
        sprite.scale.set(70000/2, 70000/2, 70000/2);
    sprite.position.set(0, 22, -22);

    return sprite;
};

Main.prototype.setupBackground = function() {
    var geom = new THREE.PlaneGeometry(848 * 3.75, 460 * 3.75, 1, 1);
    var material = new THREE.MeshBasicMaterial({color:0xffffff, map:this.textures.background, wireframe: false});
    this.background = new THREE.Mesh(geom, material);
    this.background.rotation.y = -Math.PI / 2;
    this.background.position.z = 0;
    this.background.position.x = 1700;
    this.background.position.y = -130;
    this.scene.add(this.background);
};

Main.prototype.setupRainbow = function() {
    var geom = new THREE.PlaneGeometry(645/1.5, 335/1.5, 1, 1);
    var material = new THREE.MeshBasicMaterial({color:0xffffff, map:this.textures.rainbow, wireframe: false, transparent: true});
    this.rainbow = new THREE.Mesh(geom, material);
    this.rainbow.rotation.y = -Math.PI / 2;
    this.rainbow.position.z = 2200;
    this.rainbow.position.x = 450;
    this.rainbow.position.y = -40;
    this.scene.add(this.rainbow);
};

Main.prototype.setupEarth = function() {
    var geom = new THREE.PlaneGeometry(469, 470, 1, 1);
    var material = new THREE.MeshBasicMaterial({color:0xffffff, map:this.textures.earth, wireframe: false, transparent: true});
    this.earth = new THREE.Mesh(geom, material);
    this.earth.rotation.y = -Math.PI / 2;
    this.earth.position.z = 600;
    this.earth.position.x = 1500;
    this.earth.position.y = 270;
    this.scene.add(this.earth);
};

Main.prototype.setupCreatures = function() {
    this.addWeeMee(-50, 10, 80);

    for (var i = 0; i < this.creaturesAt.length; i++)
    {
        var rnd = Math.random();
        if (rnd > 0.66)
        {
            this.addGiraffe(-20 - (Math.random() * 60), this.creaturesAt[i].y, 6000 - (this.creaturesAt[i].z / 2));
        }
        else if (rnd > 0.33)
        {
            this.addLion(-20 - (Math.random() * 60), this.creaturesAt[i].y, 6000 - (this.creaturesAt[i].z / 2));
        }
        else
        {
            this.addPenguin(-20 - (Math.random() * 60), this.creaturesAt[i].y, 6000 - (this.creaturesAt[i].z / 2));
        }
    }
};

Main.prototype.addWeeMee = function(xPos, yPos, zPos) {

    var material = new THREE.SpriteMaterial({
        opacity: 1,
        color: 0xffffff,
        transparent: true,
        useScreenCoordinates: false,
        side: THREE.DoubleSide,
        map: this.textures.weemee}
    );

    material.uvOffset.set(0, 0);
    material.uvScale.set(1, 1);
    material.alignment = THREE.SpriteAlignment.bottomCenter;
    material.scaleByViewport = true;

    var weemee = new THREE.Sprite(material);
    if (window.devicePixelRatio > 1)
    {
        weemee.scale.set(60000, 60000, 60000);
    }
    else
    {
        weemee.scale.set(60000/2, 60000/2, 60000/2);
    }
    weemee.position.set(xPos, yPos, zPos);
    this.scene.add(weemee);

    return weemee;
};

Main.prototype.addGiraffe = function(xPos, yPos, zPos) {
    var material = new THREE.SpriteMaterial({
        opacity: 1,
        color: 0xffffff,
        transparent: true,
        useScreenCoordinates: false,
        side: THREE.DoubleSide,
        map: this.textures.giraffe}
    );

    material.uvOffset.set(0, 0);
    material.uvScale.set(1, 1);
    material.alignment = THREE.SpriteAlignment.bottomCenter;
    material.scaleByViewport = true;

    var giraffe = new THREE.Sprite(material);
    var flip = Math.random() < 0.5 ? -1 : 1;
    if (window.devicePixelRatio > 1)
    {
        giraffe.scale.set(50000 * flip, 50000, 50000);
    }
    else
    {
        giraffe.scale.set((50000/2) * flip, 50000/2, 50000/2);
    }
    giraffe.position.set(xPos, yPos, zPos);
    this.scene.add(giraffe);

    return giraffe;
};

Main.prototype.addLion = function(xPos, yPos, zPos) {
    var material = new THREE.SpriteMaterial({
        opacity: 1,
        color: 0xffffff,
        transparent: true,
        useScreenCoordinates: false,
        side: THREE.DoubleSide,
        map: this.textures.lion}
    );

    material.uvOffset.set(0, 0);
    material.uvScale.set(1, 1);
    material.alignment = THREE.SpriteAlignment.bottomCenter;
    material.scaleByViewport = true;

    var lion = new THREE.Sprite(material);
    var flip = Math.random() < 0.5 ? -1 : 1;
    if (window.devicePixelRatio > 1)
        lion.scale.set(25000 * flip, 25000, 25000);
    else
        lion.scale.set((25000/2) * flip, 25000/2, 25000/2);
    lion.position.set(xPos, yPos, zPos);
    this.scene.add(lion);

    return lion;
};

Main.prototype.addPenguin = function(xPos, yPos, zPos) {
    var material = new THREE.SpriteMaterial({
        opacity: 1,
        color: 0xffffff,
        transparent: true,
        useScreenCoordinates: false,
        side: THREE.DoubleSide,
        map: this.textures.penguin}
    );

    material.uvOffset.set(0, 0);
    material.uvScale.set(1, 1);
    material.alignment = THREE.SpriteAlignment.bottomCenter;
    material.scaleByViewport = true;

    var penguin = new THREE.Sprite(material);
    var flip = Math.random() < 0.5 ? -1 : 1;
    if (window.devicePixelRatio > 1)
    {
        penguin.scale.set(25000 * flip, 25000, 25000);
    }
    else
    {
        penguin.scale.set((25000/2) * flip, 25000/2, 25000/2);
    }
    penguin.position.set(xPos, yPos, zPos);
    this.scene.add(penguin);

    return penguin;
};

Main.prototype.norm = function(value, min, max) {
    return (value - min) / (max - min);
};

Main.prototype.lerp = function(norm, min, max) {
    return (max - min) * norm + min;
};

Main.prototype.map = function(value, sourceMin, sourceMax, destMin, destMax) {
    return this.lerp(this.norm(value, sourceMin, sourceMax), destMin, destMax);
};

Main.prototype.render = function() {
    if (this.state === 0)
    {
        this.renderStart();
    }
    else if (this.state === 1)
    {
        this.renderRunning();
    }
    else if (this.state === 2)
    {
        this.renderEnding();
    }
};

Main.prototype.renderStart = function() {
    var delta = this.clock.getDelta();
    if (this.wait-- < 1)
    {
        this.state = 1;
        if (this.vehicle.mesh.getLinearVelocity().z < 65)
        {
            this.power = true;
        }
        else
        {
            this.power = false;
        }
    }
    else
    {
        this.vehicle.mesh.position.z = 90;
        this.vehicle.mesh.__dirtyPosition = true;
        this.power = false;
    }

    if (this.rotate == "left")
    {
        this.vehicle.mesh.applyImpulse(new THREE.Vector3(0,1500/90,0), new THREE.Vector3(0,100,100));
    }
    else if (this.rotate == "right")
    {
        this.vehicle.mesh.applyImpulse(new THREE.Vector3(0,1500/90,0), new THREE.Vector3(0,100,-100));
    }

    if (this.power === true)
    {
        this.vehicle.applyEngineForce(750);
    }
    else if (this.power === false)
    {
        this.vehicle.applyEngineForce(0);
    }
    else
    {
        this.vehicle.setBrake( 6000 );
    }

    this.bodySprite.position.z = this.vehicle.mesh.position.z;
    this.bodySprite.position.y = this.vehicle.mesh.position.y;
    this.bodySprite.rotation = -this.vehicle.mesh.rotation.x;

    this.wheelSprites[0].position.z = this.vehicle.wheels[0].position.z;
    this.wheelSprites[0].position.y = this.vehicle.wheels[0].position.y;

    this.wheelSprites[1].position.z = this.vehicle.wheels[2].position.z;
    this.wheelSprites[1].position.y = this.vehicle.wheels[2].position.y;

    this.wheelSprites[2].position.z = this.vehicle.wheels[4].position.z;
    this.wheelSprites[2].position.y = this.vehicle.wheels[4].position.y;

    this.scene.simulate(undefined, 1);

    this.background.position.z = this.camera.position.z;

    createjs.Tween.tick(delta * 1000);

    if (this.wait < 150)
    {
        this.webGLRenderer.render(this.scene, this.camera);
    }

    requestAnimationFrame(this.render.bind(this));
};

Main.prototype.renderRunning = function() {
    var delta = this.clock.getDelta();

    if (this.vehicle.mesh.position.z <= 3800)
    {
        if (this.vehicle.mesh.getLinearVelocity().z < 65)
        {
            this.power = true;
        }
        else
        {
            this.power = false;
        }
    }

    if (this.vehicle.mesh.position.z > 3800 && this.power != null)
    {
        this.cameraEndingYPos = {y: this.camera.position.y};
        this.cameraEndingLookAtYPos = {y: this.cameraPos.y - 15};
        this.power = null;
        this.state = 2;
    }

    if (this.rotate == "left")
    {
        this.vehicle.mesh.applyImpulse(new THREE.Vector3(0,1500/90,0), new THREE.Vector3(0,100,100));
    }
    else if (this.rotate == "right")
    {
        this.vehicle.mesh.applyImpulse(new THREE.Vector3(0,1500/90,0), new THREE.Vector3(0,100,-100));
    }

    if (this.power === true)
    {
        this.vehicle.applyEngineForce(1000);
    }
    else if (this.power === false)
    {
        this.vehicle.applyEngineForce(0);
    }
    else
    {
        if (this.vehicle.mesh.getLinearVelocity().z > 5)
        {
            this.vehicle.setBrake( 25 );
        }
        else
        {
            this.power = false;
            this.state = 2;
        }
    }

    this.bodySprite.position.z = this.vehicle.mesh.position.z;
    this.bodySprite.position.y = this.vehicle.mesh.position.y;
    this.bodySprite.rotation = -this.vehicle.mesh.rotation.x;

    this.wheelSprites[0].position.z = this.vehicle.wheels[0].position.z;
    this.wheelSprites[0].position.y = this.vehicle.wheels[0].position.y;
    this.wheelSprites[0].rotation = -this.vehicle.wheels[0].rotation.x;

    this.wheelSprites[1].position.z = this.vehicle.wheels[2].position.z;
    this.wheelSprites[1].position.y = this.vehicle.wheels[2].position.y;
    this.wheelSprites[1].rotation = -this.vehicle.wheels[2].rotation.x + Math.PI / 2;

    this.wheelSprites[2].position.z = this.vehicle.wheels[4].position.z;
    this.wheelSprites[2].position.y = this.vehicle.wheels[4].position.y;
    this.wheelSprites[2].rotation = -this.vehicle.wheels[4].rotation.x + Math.PI;

    this.scene.simulate(undefined, 2);

    var cameraX = this.map(this.vehicle.mesh.getLinearVelocity().z, 0, -80, -140, -50);
    var cameraOffsetX = this.map(this.vehicle.mesh.getLinearVelocity().z, 0, 80, 0, 80);
    var duration = 250;
    createjs.Tween.get(this.cameraPos)
        .to({x:cameraX, y:this.vehicle.mesh.position.y + 45, z:this.vehicle.mesh.position.z + cameraOffsetX},
            duration, createjs.Ease.quadInOut);

    this.camera.position.set(this.cameraPos.x, this.cameraPos.y, this.vehicle.mesh.position.z + cameraOffsetX);

    this.camera.lookAt(new THREE.Vector3(0, this.cameraPos.y - 15, this.vehicle.mesh.position.z + cameraOffsetX));
    this.endingStartSpeed = this.vehicle.mesh.position.z + cameraOffsetX;
    this.background.position.z = this.camera.position.z;

    createjs.Tween.tick(delta * 1000);

    this.webGLRenderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render.bind(this));
};

Main.prototype.renderEnding = function() {
    var delta = this.clock.getDelta();

    if (this.power === true)
    {
        this.vehicle.applyEngineForce(1000);
    }
    else if (this.power === false)
    {
        this.vehicle.applyEngineForce(0);
    }
    else
    {
        if (this.vehicle.mesh.getLinearVelocity().z > 5)
        {
            this.vehicle.setBrake( 25 );
        }
        else
        {
            this.power = false;
        }
    }

    if (this.vehicle.mesh.getLinearVelocity().z < 0.3)
    {
        this.power = false;
    }

    this.bodySprite.position.z = this.vehicle.mesh.position.z;
    this.bodySprite.position.y = this.vehicle.mesh.position.y;
    this.bodySprite.rotation = -this.vehicle.mesh.rotation.x;

    this.wheelSprites[0].position.z = this.vehicle.wheels[0].position.z;
    this.wheelSprites[0].position.y = this.vehicle.wheels[0].position.y;
    this.wheelSprites[0].rotation = -this.vehicle.wheels[0].rotation.x;

    this.wheelSprites[1].position.z = this.vehicle.wheels[2].position.z;
    this.wheelSprites[1].position.y = this.vehicle.wheels[2].position.y;
    this.wheelSprites[1].rotation = -this.vehicle.wheels[2].rotation.x + Math.PI / 2;

    this.wheelSprites[2].position.z = this.vehicle.wheels[4].position.z;
    this.wheelSprites[2].position.y = this.vehicle.wheels[4].position.y;
    this.wheelSprites[2].rotation = -this.vehicle.wheels[4].rotation.x + Math.PI;

    this.scene.simulate(undefined, 2);

    var cameraX = this.map(this.vehicle.mesh.getLinearVelocity().z, 0, -80, -140, -50);
    var cameraOffsetX = this.map(this.vehicle.mesh.getLinearVelocity().z, 0, 80, 0, 80);
    var duration = 250;
    createjs.Tween.get(this.cameraPos)
        .to({x:cameraX, y:this.vehicle.mesh.position.y + 45, z:this.vehicle.mesh.position.z + cameraOffsetX},
            duration, createjs.Ease.quadInOut);

    this.camera.position.set(this.cameraPos.x, this.cameraPos.y, this.vehicle.mesh.position.z + cameraOffsetX);
    
    this.camera.lookAt(new THREE.Vector3(0, this.cameraPos.y - 15, this.vehicle.mesh.position.z + cameraOffsetX));

    this.background.position.z = this.camera.position.z;

    createjs.Tween.tick(delta * 1000);

    this.webGLRenderer.render(this.scene, this.camera);

    if (Math.abs(this.vehicle.mesh.getLinearVelocity().z) > 0.5)
    {
        requestAnimationFrame(this.render.bind(this));
    }
};

Main.prototype.resize = function()
{
	this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
};

