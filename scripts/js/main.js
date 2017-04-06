var renderer, scene, camera;
var isMobile = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))isMobile = true})(navigator.userAgent||navigator.vendor||window.opera);
var renderSize = new THREE.Vector2(0.0, 0.0);
var container = document.getElementById("container");
var PATH = './assets/';
var time = 0.0;
var mouse = new THREE.Vector2(0.0, 0.0);
var loader = new THREE.TextureLoader();
var cubeLoader = new THREE.CubeTextureLoader();
var uniforms;
var counter = 0;
var cameraCounter = 0;
var clock = new THREE.Clock();
var mesh, maskMesh;
var textures = [];
var count = 0;
var capturer = new CCapture( { framerate: 60, format: 'webm', workersPath: 'js/' } );
var gui;
init();
// loadTextures();

function loadTextures(){

}
function loadCounter(){
  count++;
  if(count >= images.length){
    // init();
  }
}

function init(){
	setRenderSize();

	renderer = new THREE.WebGLRenderer({
		preserveDrawingBuffer: true,
		antialias: true,
		alpha: true
	})
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize(renderSize.x, renderSize.y);
  renderer.setClearColor(0x000000,1.0);
 	container.appendChild(renderer.domElement);

  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 3;
  renderTarget = new THREE.WebGLRenderTarget(renderSize.x*2.0, renderSize.y*2.0);
  maskRenderTarget = new THREE.WebGLRenderTarget(renderSize.x, renderSize.y);

  scene = new THREE.Scene();
  maskScene = new THREE.Scene();
  // camera = new THREE.OrthographicCamera( renderSize.x / - 2, renderSize.x / 2, renderSize.y / 2, renderSize.y / - 2, -100000, 100000 );
	camera = new THREE.PerspectiveCamera( 45, renderSize.x/ renderSize.y, 0.01, 100000 );
	// camera.position.z = 1000;//85.86581279304166;
  camera.position.z = 3.3789458737136726;


  
	controls = new THREE.OrbitControls(camera);
  // gui = new dat.GUI();
	uniforms = {
	    "resolution": renderSize,
	    "mouse": new THREE.Vector2(0.0,0.0),
	    "time": 0.0,
	}

  var textureCube = new THREE.CubeTextureLoader()
    // .setPath( 'assets/textures/cube/pisa/' )
    .setPath( 'assets/textures/cube/yokohama/' )
    // .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
    .load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
  // scene.background = textureCube;

  scene.add( new THREE.HemisphereLight( 0x443333, 0x222233, 4 ) );
  var pointLight = new THREE.PointLight( 0xffffff, 1.0 );
  // scene.add( pointLight );
  pointLight.position.set(0.0,100.0,100.0);

  var path = 'assets/models/DiMoDa_Pediment/';

  var loader = new THREE.OBJLoader();
  var material = new THREE.MeshPhysicalMaterial();
  var maskMaterial = new THREE.MeshPhysicalMaterial();
  loader.load( path + 'DiMoDA_Pediment_3DPrinZt_new.obj', function ( group ) {

    // var material = new THREE.MeshBasicMaterial( { wireframe: true } );

    var loader = new THREE.TextureLoader();

    material.roughness = 1;
    material.metalness = 1;

    material.map = loader.load( path + 'texture/Material.002_Diffuse.png' );
    material.roughnessMap = loader.load( path + 'texture/Material.002_Glossiness.png' );
    // material.aoMap = loader.load( path + 'texture/Material.002_Mixed_AO.png' );
    // material.displacementMap = loader.load( path + 'texture/Material.002_Height.png' );
    material.bumpMap = loader.load( path + 'texture/Material.002_Height.png' );
    material.lightMap = loader.load( path + 'texture/Material.002_Specular.png' );
    material.lightMapIntesity = 2.0;
    material.emissiveMap = loader.load( path + 'texture/Material.002_Emissive.png' );
    material.emissive = new THREE.Color(0xffffff);
    // material.metalnessMap = loader.load( path + 'texture/Material.002_Glossiness.png' );
    // material.metalness = 1.0;
    material.normalMap = loader.load( path + 'texture/Material.002_Normal.png' );

    material.map.wrapS = THREE.RepeatWrapping;
    // material.roughnessMap.wrapS = THREE.RepeatWrapping;
    // material.metalnessMap.wrapS = THREE.RepeatWrapping;
    material.normalMap.wrapS = THREE.RepeatWrapping;

    maskMaterial.roughness = 1;
    maskMaterial.metalness = 1;
    maskMaterial.emissiveMap = loader.load( path + 'texture/Material.002_Emissive.png' );
    maskMaterial.emissive = new THREE.Color(0xffffff);


    group.traverse( function ( child ) {

      if ( child instanceof THREE.Mesh ) {
        var scl = 0.17;
        // child.material = material;
        mesh = new THREE.Mesh(child.geometry, material);
        scene.add(mesh);
        console.log(mesh);
        mesh.scale.set(scl,scl,scl);
        maskMesh = new THREE.Mesh(child.geometry, maskMaterial);
        maskScene.add(maskMesh);
        maskMesh.scale.set(scl,scl,scl);
        // console.log(child.geometry);
      }

    } );

    // group.position.x = - 0.45;
    // group.rotation.y = - Math.PI / 2;
    // scene.add( group );
    // group.scale.set(0.1,0.1,0.1)

  } );

  var genCubeUrls = function( prefix, postfix ) {
    return [
      prefix + 'px' + postfix, prefix + 'nx' + postfix,
      prefix + 'py' + postfix, prefix + 'ny' + postfix,
      prefix + 'pz' + postfix, prefix + 'nz' + postfix
    ];
  };

  var hdrUrls = genCubeUrls( './assets/textures/cube/pisaHDR/', '.hdr' );
  new THREE.HDRCubeTextureLoader().load( THREE.UnsignedByteType, hdrUrls, function ( hdrCubeMap ) {

    var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
    pmremGenerator.update( renderer );

    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
    pmremCubeUVPacker.update( renderer );

    hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

    material.envMap = hdrCubeRenderTarget.texture;
    material.needsUpdate = true;

  } );

  camera2 = new THREE.Camera();
  camera2.position.z = 1;
  postScene = new THREE.Scene();
  postprocessing = new Postprocessing(postScene, camera2, renderer);
  postprocessing.init();
  postprocessing.setUniforms(uniforms);
  
  tl = new TimelineMax({paused:false});

  debounceResize = debounce(onWindowResize, 250);
  window.addEventListener("resize", debounceResize);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mousedown", onMouseDown);
  document.addEventListener("touchstart", onTouchStart);
  document.addEventListener("touchdown", onTouchStart);
  document.addEventListener("touchmove", onTouchMove);
  document.addEventListener('keydown', function(){handleKey(renderer)}, false);

	animate();
}


function animate() {
    id = requestAnimationFrame(animate);
    draw();
}

function draw(){
	time+= 0.1;
	uniforms["time"] = time;
  uniforms["mouse"] = mouse;

  renderer.render(maskScene, camera, maskRenderTarget);
  renderer.render(scene, camera, renderTarget);
  renderer.render(postScene, camera2);

  postprocessing.update();
  postprocessing.setUniforms(uniforms);
  mesh.rotation.y += 0.005;
  maskMesh.rotation.y += 0.005;
  capturer.capture( renderer.domElement );
}
function onMouseEnter(){

}

function onMouseLeave(){
  
}
function onTouchStart(event){
  updateMouse(event);
}
function onTouchMove(event){
  updateMouse(event);
}
function setRenderSize(){
    renderSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
}
function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / renderSize.x) * 2 - 1;  
    mouse.y = -(event.clientY / renderSize.y) * 2 + 1;   
}
function updateMouse(event) {
    if (event.touches.length === 1) {
        mouse.x = (event.touches[0].pageX / renderSize.x) * 2 - 1;
        mouse.y = -(event.touches[0].pageY / renderSize.y) * 2 + 1;
    }
}

function onMouseDown(event) {

}
function onWindowResize(event) {
    setRenderSize();
    renderer.setSize(renderSize.x, renderSize.y);
    uniforms["resolution"] = new THREE.Vector2(renderSize.x, renderSize.y);
}
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
function handleKey(renderer) {
    if (event.keyCode == "32") {
        grabScreen(renderer);

        function grabScreen(renderer) {
            var blob = dataURItoBlob(renderer.domElement.toDataURL('image/png'));
            var file = window.URL.createObjectURL(blob);
            var img = new Image();
            img.src = file;
            img.onload = function(e) {
                window.open(this.src);

            }
        }
        function dataURItoBlob(dataURI) {
            var byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(dataURI.split(',')[1]);
            else
                byteString = unescape(dataURI.split(',')[1]);

            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            return new Blob([ia], {
                type: mimeString
            });
        }

        function insertAfter(newNode, referenceNode) {
            referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        }
    }
    if (event.keyCode == "82") {
        capturer.start();
    }
    if (event.keyCode == "84") {
        capturer.stop();
        capturer.save(function(blob) {
            window.open(blob);
        });
    }
    
}