import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const canvas = document.querySelector("#experience-canvas");
const sizes = {
    height: window.innerHeight,
    width: window.innerWidth,
};

const yAxisFan = [];

const raycasterObjects = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
//Loaders
const textureLoader = new THREE.TextureLoader();

// Instantiate a loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "/draco/" );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

const environmentMap = new THREE.CubeTextureLoader()
    .setPath( 'textures/skybox/' )
    .load( [
        'px.webp',
        'nx.webp',
        'py.webp',
        'ny.webp',
        'pz.webp',
        'nz.webp'
    ] );

const textureMap = {
    Zero: {
        day: "textures/room/day/DayBackground.webp",
        night:"textures/room/night/NightBackground.webp",
    },
    First: {
        day: "textures/room/day/DayRightWall.webp",
        night:"textures/room/night/NightRightWall.webp",
    },
    Second: {
        day: "textures/room/day/DayLeftWall.webp",
        night:"textures/room/night/NightLeftWall.webp",
    },
    Third: {
        day: "textures/room/day/DayFullBackground.webp",
        night:"textures/room/night/NightFullBackground.webp",
    },
    Fourth: {
        day: "textures/room/day/DayWood.webp",
        night:"textures/room/night/NightWood.webp",
    },
    Fifth: {
        day: "textures/room/day/DayAnimatable.webp",
        night:"textures/room/night/NightAnimatable.webp",
    },
    Sixth: {
        day: "textures/room/day/DayComputer.webp",
        night:"textures/room/night/NightComputer.webp",
    },
    Absolution: {
        day: "textures/room/day/pngDay/DayAbsolution.webp",
        night:"textures/room/day/pngNight/NightAbsolution.webp",
    },
    AlanTuring: {
        day: "textures/room/day/pngDay/DayAlanTuring.webp",
        night:"textures/room/day/pngNight/NightDayAlanTuring.webp",
    },
    HotFuss: {
        day: "textures/room/day/pngDay/DayHotFuss.webp",
        night:"textures/room/day/pngNight/NightHotFuss.webp",
    },
    Note: {
        day: "textures/room/day/pngDay/DayNotes.webp",
        night: "textures/room/day/pngNight/NightNotes.webp",
    },
    OriginOfSymmetry: {
        day: "textures/room/day/pngDay/DayOriginOfSymmetry.webp",
        night:"textures/room/day/pngNight/NightOriginOfSymmetry.webp",
    },
    PepperTones: {
        day: "textures/room/day/pngDay/DayPepperTones.webp",
        night:"textures/room/day/pngNight/NightPepperTones.webp",
    },
    ShapeOfYou: {
        day: "textures/room/day/pngDay/DayShapeOfYou.webp",
        night:"textures/room/day/pngNight/NightShapeOfYou.webp",
    },
};

const loadedTextures = {
    day: {},
    night: {},
};

Object.entries(textureMap).forEach(([key, paths]) => {
    const dayTexture = textureLoader.load(paths.day);
    dayTexture.flipY = false;
    dayTexture.colorSpace = THREE.SRGBColorSpace
    loadedTextures.day[key] = dayTexture;

    const nightTexture = textureLoader.load(paths.night);
    nightTexture.flipY = false;
    nightTexture.colorSpace = THREE.SRGBColorSpace
    loadedTextures.night[key] = nightTexture;
});

const videoElement = document.createElement("video");
videoElement.src = "/textures/video/screen.mp4";
videoElement.loop = true;
videoElement.muted = true;
videoElement.playsInline = true;
videoElement.autoplay = true;
videoElement.play();

const videoTexture = new THREE.VideoTexture(videoElement);
videoTexture.colorspace = THREE.SRGBColorSpace;
videoTexture.flipY = false;

window.addEventListener("mousemove", (e) => {
    pointer.x = (e.clientX/window.innerWidth) * 2 -1;
    pointer.y = -(e.clientY/window.innerHeight) * 2 +1;
});

loader.load("/models/Room_Portfolio_Ray.glb", (glb)=>{
    glb.scene.traverse((child) =>{
        if(child.isMesh){
            if(child.name.includes("Glass")){
                child.material = new THREE.MeshPhysicalMaterial({
                    transmission: 1,
                    opacity: 1,
                    metalness: 0,
                    roughness: 0,
                    ior: 1.5,
                    thickness: 0.01,
                    specularIntensity: 1,
                    envMap: environmentMap,
                    envMapIntensity: 1,
                    // lightIntensity: 1,
                    // exposure: 1,
                })
            }else if(child.name.includes("MachineLearningScreen")){
                    child.material = new THREE.MeshBasicMaterial({
                       map: videoTexture
                    });
            }else{
                Object.keys(textureMap).forEach((key)=>{
                    if(child.name.includes(key)){
                        const material = new THREE.MeshBasicMaterial({
                            map: loadedTextures.day[key]
                        });
                        child.material = material;

                        if(child.name.includes("Fan")){
                            yAxisFan.push(child);
                        }

                        if(child.material.map){
                            child.material.map.minFilter = THREE.LinearFilter;
                        }
                    }
                });
            }

            if(child.name.includes("Button")){
                raycasterObjects.push(child);
            }

        }
    });

    scene.add(glb.scene);
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    1000
);
camera.position.set(8.081110837193457,5.899286695601466,7.641176441114846);

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true} );
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );


const controls = new OrbitControls( camera, renderer.domElement );
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();
controls.target.set(-1.8610304303839955, 2.3808504327544835, -1.9583995416260147);


//Event listener
window.addEventListener( 'resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    //update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const render = () => {
    controls.update();

    // console.log(camera.position); // [x, y, z]
    // // console.log("0000");
    // console.log(controls.target);
    // @TODO: Finish underneath line and grab the rotation coordinate.
    // Change the name of the button through blender
    // Delete some of the useless sides of the walls.
    // Download the simple mp4 file and save it somewhere so that I have an access to it.
    yAxisFan.forEach(fan=>{
        fan.rotation.y += 0.01;
    });


    raycaster.setFromCamera(pointer,camera);
    const intersects = raycaster.intersectObjects(raycasterObjects);
    for(let i = 0; i<intersects.length;i++){
        intersects[i].object.material.color.set(0xff0000);
    }

    if(intersects.length>0){
        document.body.style.cursor = "pointer";
    }else{
        document.body.style.cursor = "default";
    }

    renderer.render( scene, camera );

    window.requestAnimationFrame( render );
};



render();