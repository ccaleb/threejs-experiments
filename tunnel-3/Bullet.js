/*
    Intergalactic Highway Demo

    Bullet/Projectile
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Bullet(spline, onExpired)
{
	THREE.Object3D.call(this);

	this.spline = spline;
	this.onExpired = onExpired;
	this.travelledRatio = 0;
	this.rotationWhenFired = 0;
	this.velocity = 0;
	this.lifespan = 0;

	this.add(this.createBulletMesh());
}

Bullet.constructor = Bullet;
Bullet.prototype = Object.create(THREE.Object3D.prototype);

Bullet.INIT_LIFESPAN = 240;
Bullet.VELOCITY = 0.001;
Bullet.LOOK_AHEAD = 0.0001;

Bullet.prototype.createBulletMesh = function()
{
	var geometry = new THREE.SphereGeometry(0.25);
	var material = new THREE.MeshPhongMaterial({color:0xffffff});
	var mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(0, 6, 0);

	return mesh;
}

Bullet.prototype.fire = function(velocity, travelledRatio, rotation) {
	this.velocity = Bullet.VELOCITY + velocity;
	this.travelledRatio = travelledRatio;
	this.rotationWhenFired = rotation;
	this.lifespan = Bullet.INIT_LIFESPAN;

	var p1 = this.spline.getPointAt(travelledRatio);
	var p2 = this.spline.getPointAt(travelledRatio + Bullet.LOOK_AHEAD);
	this.position.set(p1.x, p1.y, p1.z);
	this.lookAt(p2);
	this.rotation.z = rotation;
}

Bullet.prototype.update = function() {
	this.travelledRatio += this.velocity;
	this.lifespan--;

	if (this.travelledRatio + Bullet.LOOK_AHEAD >= 1 || this.lifespan == 0)
	{
		if (this.onExpired != null)
		{
			this.onExpired(this);
		}
	}
	else
	{
		var p1 = this.spline.getPointAt(this.travelledRatio);
    	var p2 = this.spline.getPointAt(this.travelledRatio + Bullet.LOOK_AHEAD);
    	this.position.set(p1.x, p1.y, p1.z);
    	this.lookAt(p2);
    	this.rotation.z = this.rotationWhenFired;
	}
}
