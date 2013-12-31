/*
    Tunnel Demo Two
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Main()
{
	// The distance we've travelled through the tunnel. Between 0.0 and 1.0.
	this.travelledStep = 0.0;

	// We'll rotate the camera around its z-axis as it moves through the tunnel.
    this.rotationStep = 0.0;

    // Create the renderer.
	this.webGLRenderer = new THREE.WebGLRenderer();
	this.webGLRenderer.setClearColorHex(0x000033, 1.0);
	this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	$("#WebGL-output").append(this.webGLRenderer.domElement);

    // Create the scene and setup the camera.
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
    	45,
    	window.innerWidth / window.innerHeight,
    	0.1, 1000
	);

    // Create the tunnel and add it to the scene.
	this.geom = this.generateTunnelGeometry(22, 256, 2, 28);
    this.tunnel = this.createTunnelParticleSystem(this.geom);
    this.scene.add(this.tunnel);

    // Kick off the main loop.
    this.render();
}

// Constants
Main.TRAVEL_INCREMENT   = 0.00025;
Main.ROTATION_INCREMENT = 0.0025;

Main.prototype.generateTunnelGeometry = function(numPoints, segments, radius, radiusSegments)
{
	// Create an array of points that we will generate our spline from.
	var points = [];
    var prevPoint = new THREE.Vector3(0, 0, 0);
    for (var i = 0; i < numPoints; i++)
    {
        var randomX = prevPoint.x + 10 + Math.round(Math.random() * 50);
        var randomY = prevPoint.y + 10 + Math.round(Math.random() * 50);
        var randomZ = prevPoint.z + 10 + Math.round(Math.random() * 50);

        prevPoint.x = randomX;
        prevPoint.y = randomY;
        prevPoint.z = randomZ;

        points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }

    // Generate a spline from our points.
    spline = new THREE.SplineCurve3(points);
    
    // Generate geometry for a tube using our spline.
    return new THREE.TubeGeometry(spline, segments, radius, radiusSegments, false);
}

Main.prototype.createTunnelParticleSystem = function(geom)
{
	var material = new THREE.ParticleBasicMaterial({
        color: 0xffffff,
        size: 3,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: new THREE.ImageUtils.loadTexture("particle.png")
    });

    var system = new THREE.ParticleSystem(geom, material);
    system.sortParticles = true;

    return system;
}

Main.prototype.render = function()
{
	if (this.travelledStep > 1 - Main.TRAVEL_INCREMENT)
    {
        this.travelledStep = 0.0;
    }

    var p1 = spline.getPointAt(this.travelledStep);
    var p2 = spline.getPointAt(this.travelledStep + Main.TRAVEL_INCREMENT);
    this.camera.position.set(p1.x, p1.y, p1.z);
    this.camera.lookAt(p2);
    
    this.travelledStep += Main.TRAVEL_INCREMENT;
	this.rotationStep += Main.ROTATION_INCREMENT;

    requestAnimationFrame(this.render.bind(this));
    this.webGLRenderer.render(this.scene, this.camera);
}

Main.prototype.resize = function()
{
	this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
}
