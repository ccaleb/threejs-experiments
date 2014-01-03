/*
    Intergalactic Highway Demo

    Planet Earth
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Earth()
{
	THREE.Object3D.call(this);

    this.mesh = this.createMesh(new THREE.SphereGeometry(200, 80, 80));
    this.rotation.x += Math.PI / 2;

	this.add(this.mesh);
}

Earth.constructor = Earth;
Earth.prototype = Object.create(THREE.Object3D.prototype);

Earth.prototype.createMesh = function(geometry) {
    var planetTexture = THREE.ImageUtils.loadTexture("resources/earth/Earth.png");
    var specularTexture = THREE.ImageUtils.loadTexture("resources/earth/EarthSpec.png");
    var normalTexture = THREE.ImageUtils.loadTexture("resources/earth/EarthNormal.png");

    var material = new THREE.MeshPhongMaterial();
    material.specularMap = specularTexture;
    material.specular = new THREE.Color(0x4444aa);
    material.normalMap = normalTexture;
    material.map = planetTexture;

    var mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material]);
    return mesh;
};

Earth.prototype.update = function() {
	this.rotation.y += 0.001;
};
