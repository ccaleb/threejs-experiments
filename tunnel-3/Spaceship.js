/*
    Intergalactic Highway Demo

    Spaceship
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Spaceship(spaceshipObject, spline, camera)
{
	THREE.Object3D.call(this);

	this.spline = spline;
	this.camera = camera;
	this.spaceship = spaceshipObject;

	this.travelledRatio = 0;
	this.shipRotationStep = 0;
	this.shipRotation = 0;
	this.playerVel = Spaceship.PLAYER_STANDARD_VEL;
    this.boostLifespan = 10;
    this.boostAcc = 0.000025;
    this.boostDec = 0.000012;
    this.boostActivated = false;

    this.setupSpaceship(spaceshipObject);

	var pointLight1 = new THREE.PointLight(0xffffff);
    pointLight1.position.set(0, 40, -80);
    pointLight1.intensity = 1.0;
    this.add(pointLight1);

	var pointLight2 = new THREE.PointLight(0xffffff);
    pointLight2.position.set(0, 7, 0);
    pointLight2.intensity = 8;
    pointLight2.distance = 3.15;
    this.add(pointLight2);

    this.add(camera);

    camera.rotation.y = Math.PI;
    camera.position.set(0,9,-15);
}

Spaceship.constructor = Spaceship;
Spaceship.prototype = Object.create(THREE.Object3D.prototype);

Spaceship.LOOK_AHEAD = 0.0001;
Spaceship.PLAYER_STANDARD_VEL = 0.00035;
Spaceship.PLAYER_MAX_VELOCITY = 0.0018;

Spaceship.prototype.setupSpaceship = function(object3D)
{
	object3D.children[0].visible = false;
    object3D.children[1].children[0].visible = false;
    object3D.children[2].children[0].visible = false;
    object3D.children[3].children[0].visible = false;
    object3D.scale.set(0.5, 0.5, 0.5);
    object3D.position.set(0.15, 5, 0);

    this.add(object3D);
}

Spaceship.prototype.getVelocity = function()
{
	return this.playerVel;
}

Spaceship.prototype.getTravelledRatio = function()
{
	return this.travelledRatio;
}

Spaceship.prototype.getRotation = function()
{
	return this.shipRotation;
}

Spaceship.prototype.update = function()
{
	// Loop back round if we get to the end of the spline.
	if (this.travelledRatio > 1 - Spaceship.LOOK_AHEAD)
    {
        this.travelledRatio = 0;
    }

    // Position the player and the camera.
    var p1 = this.spline.getPointAt(this.travelledRatio);
    var p2 = this.spline.getPointAt(this.travelledRatio + Spaceship.LOOK_AHEAD);
    this.position.set(p1.x, p1.y, p1.z);
    this.shipRotation += this.shipRotationStep;
    this.lookAt(p2);
    this.rotation.z = this.shipRotation;

    // Update the player's position on the spline and their rotation.
    if (this.boostActivated && this.boostLifespan > 0)
    {
        this.boostLifespan--;
        this.playerVel += this.boostAcc;
        if (this.playerVel > Spaceship.PLAYER_MAX_VELOCITY)
        {
            this.playerVel = Spaceship.PLAYER_MAX_VELOCITY;
        }
        this.travelledRatio += this.playerVel;
    }
    else if (this.boostActivated && this.boostLifespan <= 0)
    {
        this.boostLifespan--;
        this.playerVel -= this.boostDec;
        if (this.playerVel <= Spaceship.PLAYER_STANDARD_VEL)
        {
            this.playerVel = Spaceship.PLAYER_STANDARD_VEL;
            this.travelledStep += this.playerVel;
            this.boostActivated = false;
        }
        this.travelledRatio += this.playerVel;
    }
    else if (!this.boostActivated)
    {
        this.travelledRatio += this.playerVel;
    }
}

Spaceship.prototype.startRotation = function(angle)
{
    this.shipRotationStep = angle;
    if (angle > 0)
    {
        this.spaceship.rotation.z = Math.PI / 45;
    }
    else if (angle < 0)
    {
        this.spaceship.rotation.z = -Math.PI / 45;
    }
}

Spaceship.prototype.stopRotation = function()
{
    this.shipRotationStep = 0;
    this.spaceship.rotation.z = 0;
}

Spaceship.prototype.boost = function()
{
    this.boostLifespan = 45;
    this.boostActivated = true;
}
