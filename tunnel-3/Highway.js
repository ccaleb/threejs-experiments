/*
    Intergalactic Highway Demo

    Highway Spline
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Highway()
{
	THREE.Object3D.call(this);

    this.spline = null;
    this.earthPosition = new THREE.Vector3();

    var geometry = this.generateGeometry(22, 256, 4, 24);
    var particileSystem = this.createParticleSystem(geometry);
    
    this.add(particileSystem);
}

Highway.constructor = Highway;
Highway.prototype = Object.create(THREE.Object3D.prototype);

Highway.prototype.getSpline = function()
{
    return this.spline;
};

Highway.prototype.getEarthPosition = function()
{
    return this.earthPosition;
};

Highway.prototype.generateGeometry = function(numPoints, segments, radius, radiusSegments)
{
    // Create an array of points that we will generate our spline from.
    var points = [];
    var prevPoint = new THREE.Vector3(0, 0, 0);
    for (var i = 0; i < numPoints; i++)
    {
        var randomX = prevPoint.x + 10 + Math.round(Math.random() * 50);
        var randomY = prevPoint.y + 10 + Math.round(Math.random() * 50);
        var randomZ = prevPoint.z - 10 - Math.round(Math.random() * 50);

        prevPoint.x = randomX;
        prevPoint.y = randomY;
        prevPoint.z = randomZ;

        points.push(new THREE.Vector3(randomX, randomY, randomZ));
    }

    var dist = 4;
    var index = (numPoints - dist) + Math.floor(Math.random() * dist);
    this.earthPosition.set(points[index].x, points[index].y - 300, points[index].z)

    // Generate a spline from our points.
    this.spline = new THREE.SplineCurve3(points);
    
    // Generate geometry for a tube using our spline.
    return new THREE.TubeGeometry(this.spline, segments, radius, radiusSegments, false);
};

Highway.prototype.createParticleSystem = function(geometry)
{
    var material = new THREE.ParticleBasicMaterial({
        color: 0xffffff,
        size: 3,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: new THREE.ImageUtils.loadTexture("resources/particle.png")
    });

    var system = new THREE.ParticleSystem(geometry, material);
    system.sortParticles = true;

    return system;
};

