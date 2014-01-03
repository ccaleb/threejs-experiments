/*
    Intergalactic Highway Demo

    Main Application Class
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Main()
{
	this.webGLRenderer = new THREE.WebGLRenderer();
	this.webGLRenderer.setClearColorHex(0x11171c, 1.0);
	this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    this.webGLRenderer.shadowMapEnabled = true;
	$("#WebGL-output").append(this.webGLRenderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
    	45,
    	window.innerWidth / window.innerHeight,
    	0.1, 1000
	);

    var ambi = new THREE.AmbientLight(0x181818);
    this.scene.add(ambi);

    this.contentToLoad = 2;

    this.createHighway();
    this.createEarth();
    this.createObstacles();
    this.createSkybox();
    this.createBullets();

    var loader = new THREE.OBJMTLLoader();
    loader.addEventListener('load', this.spaceshipLoaded.bind(this));
    loader.load('resources/spaceship/spaceship.obj', 'resources/spaceship/spaceship.mtl');
}

Main.prototype.createHighway = function()
{
    this.highway = new Highway();
    this.scene.add(this.highway);
};

Main.prototype.createEarth = function()
{
    this.earth = new Earth();
    this.earth.position = this.highway.getEarthPosition();
    this.scene.add(this.earth);
};

Main.prototype.createSkybox = function()
{
    this.skybox = new Skybox(this.skyboxLoaded.bind(this));
    this.scene.add(this.skybox);
};

Main.prototype.spaceshipLoaded = function(event)
{
    this.contentToLoad--;

    this.spaceship = new Spaceship(event.content, this.highway.getSpline(), this.camera);
    this.scene.add(this.spaceship);
    this.render();

    this.checkResourcesLoaded();
};

Main.prototype.skyboxLoaded = function(event)
{
    this.contentToLoad--;
    this.checkResourcesLoaded();
};

Main.prototype.checkResourcesLoaded = function()
{
    if (this.contentToLoad == 0)
    {
        removeSpinner();
    }
};

Main.prototype.createObstacles = function()
{    
    this.obstacles = [];
    for (var i = 1; i < 5; i++)
    {
        var obstacle = new Obstacle(this.highway.getSpline(), i * 0.2);
        this.obstacles.push(obstacle);
        this.scene.add(obstacle);
    }
}

Main.prototype.createBullets = function()
{
    this.bullets = [];
    this.bulletsInUse = [];
    for (var i = 0; i < 20; i++)
    {
        this.bullets.push(new Bullet(this.highway.getSpline(), this.bulletExpired.bind(this)));
    }
}

Main.prototype.bulletExpired = function(b) {
    var foundAt = -1;
    for (var i = 0; i < this.bulletsInUse.length; i++)
    {
        if (this.bulletsInUse[i] == b)
        {
            foundAt = i;
            break;
        }
    }

    if (foundAt != -1)
    {
        this.bulletsInUse.splice(foundAt, 1);
        this.bullets.push(b);
        this.scene.remove(b);
    }
}

Main.prototype.render = function()
{
    for (var i = 0; i < this.bulletsInUse.length; i++)
    {
        this.bulletsInUse[i].update();
    }

    for (var i = 0; i < this.obstacles.length; i++)
    {
        this.obstacles[i].update();
    }

    this.earth.update();
    this.spaceship.update();
    this.skybox.position = this.spaceship.position;

    requestAnimationFrame(this.render.bind(this));
    this.webGLRenderer.render(this.scene, this.camera);
}

Main.prototype.resize = function()
{
	this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
}

Main.prototype.startRotation = function(angle)
{
    this.spaceship.startRotation(angle);
}

Main.prototype.stopRotation = function()
{
    this.spaceship.stopRotation();
}

Main.prototype.fire = function()
{
    if (this.bullets.length > 0)
    {
        var bullet = this.bullets.shift();
        this.bulletsInUse.push(bullet);
        bullet.fire(
            this.spaceship.getVelocity(),
            this.spaceship.getTravelledRatio(),
            this.spaceship.getRotation()
        );
        this.scene.add(bullet);
    }
}

Main.prototype.boost = function()
{
    this.spaceship.boost();
}
