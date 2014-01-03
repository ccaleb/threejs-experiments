/*
    Intergalactic Highway Demo

    Obstacle
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Obstacle(spline, travelledRatio)
{
	THREE.Object3D.call(this);

	this.spline = spline;
	this.travelledRatio = travelledRatio;
	
	var p1 = this.spline.getPointAt(travelledRatio);
	var p2 = this.spline.getPointAt(travelledRatio + Obstacle.LOOK_AHEAD);
	this.position.set(p1.x, p1.y, p1.z);
	this.lookAt(p2);
	this.rotation.z = (Math.PI * 2) * Math.random();
	this.rotationInc = Math.random() / 75;
    if (Math.random() < 0.5) {
        this.rotationInc = -this.rotationInc;
    }

	this.add(this.createObstacleMesh());
}

Obstacle.constructor = Obstacle;
Obstacle.prototype = Object.create(THREE.Object3D.prototype);

Obstacle.LOOK_AHEAD = 0.0001;

Obstacle.prototype.createObstacleMesh = function()
{
	var geometry = new THREE.TorusGeometry(6, 1, 6, 13, (4.5 + Math.random()));
    var material = new THREE.MeshPhongMaterial({color: 0x0066cc, side:THREE.DoubleSide});
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, 0, 0);

	return mesh;
}

Obstacle.prototype.update = function()
{
	this.rotation.z += this.rotationInc;
}
