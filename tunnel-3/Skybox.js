/*
    Intergalactic Highway Demo

    Skybox
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

function Skybox(onLoaded)
{
	THREE.Object3D.call(this);

    this.onLoaded = onLoaded;

    var texture = this.createTexture();
    var shader = this.createShader(texture);
    var material = this.createMaterial(shader);
    var mesh = new THREE.Mesh(new THREE.CubeGeometry(1000, 1000, 1000), material);

    this.add(mesh);
}

Skybox.constructor = Skybox;
Skybox.prototype = Object.create(THREE.Object3D.prototype);

Skybox.prototype.createTexture = function()
{
    var path = "resources/cubemap/";
    var format = '.jpg';
    var urls = [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ];

    var texture = THREE.ImageUtils.loadTextureCube(urls, null, this.texturesLoaded.bind(this));

    return texture;
};

Skybox.prototype.createShader = function(texture)
{
    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = texture;

    return shader;
};

Skybox.prototype.createMaterial = function(shader)
{
    var material = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    return material;
};

Skybox.prototype.texturesLoaded = function(e)
{
    if (this.onLoaded != null)
    {
        this.onLoaded(e);
    }
};
