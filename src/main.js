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

//Loaders
const textureLoader = new THREE.TextureLoader();

// Instantiate a loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "/draco/" );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );


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

loader.load("/models/Room_Portfolio_UVupdate-v1.glb", (glb)=>{
    glb.scene.traverse((child) =>{
        if(child.isMesh){

            Object.keys(textureMap).forEach((key)=>{
                if(child.name.includes(key)){
                    const material = new THREE.MeshBasicMaterial({
                        map: loadedTextures.day[key]
                    });
                    child.material = material;

                    if(child.material.map){
                        child.material.map.minFilter = THREE.LinearFilter;
                    }
                }
                // if(child.name.includes("")){
                //     child.material = new THREE.MeshPhysicalMaterial({
                //         transparent: true,
                //     })
                // }
            });
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
camera.position.z = 5;

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

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );

    window.requestAnimationFrame( render );
};

render();