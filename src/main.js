import './style.scss'
import * as THREE from 'three';
import { OrbitControls } from '/src/utils/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from "gsap"

function isPhone() {
    return /iPhone|Android.*Mobile|Windows Phone/i.test(navigator.userAgent);
}

//check if it's phone or not.
if(isPhone()){
    document.body.classList.add("is-phone");
    console.log("phone detected")
}
const isMobile = isPhone(); // You can adjust the threshold

const canvas = document.querySelector("#experience-canvas");
const sizes = {
    height: window.innerHeight,
    width: window.innerWidth,
};

const modals = {
    profile: document.querySelector(".modal.profile"),
    resume: document.querySelector(".modal.resume"),
    project: document.querySelector(".modal.project"),
};

let touched = false;
document.querySelectorAll(".modal-exit-button").forEach(button => {
    button.addEventListener("touchend", (e) => {
        touched = true;
        e.preventDefault();
        const modal = e.target.closest(".modal");
        hideModal(modal);
    },{passive: false});

    button.addEventListener("click", (e) => {
        if(touched){
            return;
        }
        touched = true;
        e.preventDefault();
        const modal = e.target.closest(".modal");
        hideModal(modal);
    },{passive: false});
});

//SHOWING THE MODAL
let isModalOpen = false;
const showModal = (modal) => {
    modal.style.display = "block"
    isModalOpen = true;
    controls.enabled = false;
    if(currentHovered){
        playHoverAnimation(currentHovered, false);
        currentHovered = null;
    }
    document.body.style.cursor = "default";
    currentIntersects = [];

    gsap.set(modal, {opacity: 0});
    gsap.to(modal, {
        opacity: 1,
        duration: 0.5,
    });
};

const hideModal = (modal) => {
    isModalOpen = false;
    controls.enabled = true;
    gsap.to(modal, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            modal.style.display = "none";
        }
    });
};


const yAxisFan = [];

const raycasterObjects = [];
let currentIntersects = [];
let currentHovered = null;

const socialLinks = {
    "Github": "https://github.com/0GhOsTO",
    "LinkedIn": "https://www.linkedin.com/in/andrew-cho-6a0878215/",
};


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
//Loaders
const textureLoader = new THREE.TextureLoader();

// Instantiate a loader
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "./draco/" );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

const environmentMap = new THREE.CubeTextureLoader()
    .setPath( './textures/skybox/' )
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
        day: "/textures/room/day/DayBackground.webp",
        night:"./textures/room/night/NightBackground.webp",
    },
    First: {
        day: "/textures/room/day/DayRightWall.webp",
        night:"/textures/room/night/NightRightWall.webp",
    },
    Second: {
        day: "/textures/room/day/DayLeftWall.webp",
        night:"/textures/room/night/NightLeftWall.webp",
    },
    Third: {
        day: "/textures/room/day/DayFullBackground.webp",
        night:"/textures/room/night/NightFullBackground.webp",
    },
    Fourth: {
        day: "/textures/room/day/DayWood.webp",
        night:"/textures/room/night/NightWood.webp",
    },
    Fifth: {
        day: "/textures/room/day/DayAnimatable.webp",
        night:"/textures/room/night/NightAnimatable.webp",
    },
    Sixth: {
        day: "/textures/room/day/DayComputer.webp",
        night:"/textures/room/night/NightComputer.webp",
    },
    Absolution: {
        day: "/textures/room/day/pngDay/DayAbsolution.webp",
        night:"/textures/room/day/pngNight/NightAbsolution.webp",
    },
    AlanTuring: {
        day: "/textures/room/day/pngDay/DayAlanTuring.webp",
        night:"/textures/room/day/pngNight/NightDayAlanTuring.webp",
    },
    HotFuss: {
        day: "/textures/room/day/pngDay/DayHotFuss.webp",
        night:"/textures/room/day/pngNight/NightHotFuss.webp",
    },
    Note: {
        day: "/textures/room/day/pngDay/DayNotes.webp",
        night: "/textures/room/day/pngNight/NightNotes.webp",
    },
    OriginOfSymmetry: {
        day: "/textures/room/day/pngDay/DayOriginOfSymmetry.webp",
        night:"/textures/room/day/pngNight/NightOriginOfSymmetry.webp",
    },
    PepperTones: {
        day: "/textures/room/day/pngDay/DayPepperTones.webp",
        night:"/textures/room/day/pngNight/NightPepperTones.webp",
    },
    ShapeOfYou: {
        day: "/textures/room/day/pngDay/DayShapeOfYou.webp",
        night:"/textures/room/day/pngNight/NightShapeOfYou.webp",
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
    touched = false;
    pointer.x = (e.clientX/window.innerWidth) * 2 -1;
    pointer.y = -(e.clientY/window.innerHeight) * 2 +1;
});

//For Android
window.addEventListener("touchstart", (e) => {
    if(isModalOpen)return;
    e.preventDefault();
    pointer.x = (e.touches[0].clientX/window.innerWidth) * 2 -1;
    pointer.y = -(e.touches[0].clientY/window.innerHeight) * 2 +1;
}, {passive: false});

window.addEventListener("touchend", (e) => {
    if(isModalOpen)return;
    e.preventDefault();
    handleRaycasterInteraction();
}, {passive: false});

function handleRaycasterInteraction() {
    if(currentIntersects.length >0 ){
        const object = currentIntersects[0].object;
        console.log("Clicked on:", object.name);

        Object.entries(socialLinks).forEach(([key, url])=>{
            console.log("key: ", key, "| url: ", url);
            if(object.name.includes(key)){
                const newWindow = window.open();
                newWindow.opener = null;
                newWindow.location = url;
                newWindow.target = "_blank";
                newWindow.rel = "noopener noreferrer";
            }
        });

        if(object.name.includes("ProfileButton")) {
            showModal(modals.profile);
        }else if(object.name.includes("ResumeButton")){
            showModal(modals.resume);
        }else if(object.name.includes("ProjectButton")){
            showModal(modals.project);
        }
    }
}

window.addEventListener("click", handleRaycasterInteraction);

loader.load("/models/Room_Portfolio_Please_Last.glb", (glb)=>{
    glb.scene.traverse((child) =>{

        if(child.isMesh){
            if(child.name.includes("RayCaster")){
                raycasterObjects.push(child);
                child.userData.initialScale = new THREE.Vector3().copy(child.scale);
                child.userData.initialPosition = new THREE.Vector3().copy(child.position);
                child.userData.initialRotation = new THREE.Vector3().copy(child.rotation);
            }

            if(child.name.includes("ChairTop")){
                child.rotation.y = -Math.PI/30;
                gsap.to(child.rotation,{
                   y: Math.PI/30,
                   duration: 3,
                   repeat: -1,
                   yoyo: true,
                   ease: "sine.inOut",
                    id: "chair-rotation"
                });
            }

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
//mobile
if(isMobile){
    camera.position.set(13.302868985434001, 7.984620033890129, 13.283042054058505);
}else{
    camera.position.set( 9.341425508289262, 6.582700064329998, 9.4580936212497 );
}

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true} );
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );


const controls = new OrbitControls( camera, renderer.domElement );
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = Math.PI / 2;
controls.minDistance = 3;
controls.maxDistance = 35;

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();

//mobile
controls.target.set(-2.183442135866024, 2.5041508713161345, -1.66967449867141);

//Object { x: -2.183442135866024, y: 2.5041508713161345, z: -1.66967449867141 }
// main.js:502:13
// Object { x: 9.341425508289262, y: 6.582700064329998, z: 9.4580936212497 }


//Object { x: 3 }
// main.js:482:13
// Object {  }

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

function playHoverAnimation(object, isHovering){
    gsap.killTweensOf(object.scale);
    gsap.getTweensOf(object.rotation).forEach(tween => {
        if(tween.vars.id !== "chair-rotation"){
            tween.kill();
        }
    });
    gsap.killTweensOf(object.position);

    if(isHovering){
        console.log("name: ", object.name);
        //Bass
        if(object.name.includes("Bass")){
            gsap.to(object.scale,{
                x: object.userData.initialScale.x*1.3,
                y: object.userData.initialScale.y*1.3,
                z: object.userData.initialScale.z*1.3,
                duration: 0.3,
                ease: "bounce.out(1.8)",

            });

            gsap.to(object.position,{
                x: object.userData.initialPosition.x+0.13,
                duration:0.3,
            });
        }else if(object.name.includes("LinkedInButton") || object.name.includes("GithubButton")){
            gsap.to(object.scale,{
                x: object.userData.initialScale.x*1.3,
                y: object.userData.initialScale.y*1.3,
                z: object.userData.initialScale.z*1.3,
                duration:0.3,
                ease: "bounce.out(1.8)",
            });

            gsap.to(object.position,{
                z: object.userData.initialPosition.z+0.05,
                duration:0.5,
            });
        }else if(object.name.includes("Profile") || object.name.includes("Resume") || object.name.includes("Project")){
            gsap.to(object.scale,{
                x: object.userData.initialScale.x*1.2,
                y: object.userData.initialScale.y*1.2,
                z: object.userData.initialScale.z*1.2,
                duration: 0.3,
                ease: "bounce.out(1.8)",
            });

            gsap.to(object.rotation,{
                x: object.userData.initialRotation.x + Math.PI/10,
                duration:0.3,
                ease: "bounce.out(1.8)",
            });

            gsap.to(object.position,{
                x: object.userData.initialPosition.x+0.1,
                duration:0.3,
            });
        }else{
            gsap.to(object.scale,{
                x: object.userData.initialScale.x*1.2,
                y: object.userData.initialScale.y*1.2,
                z: object.userData.initialScale.z*1.2,
                duration: 0.3,
                ease: "bounce.out(1.3)",
            });
        }
    }else{
        if(object.name.includes("LinkedInButton") || object.name.includes("GithubButton")) {
            gsap.to(object.scale, {
                x: object.userData.initialScale.x,
                y: object.userData.initialScale.y,
                z: object.userData.initialScale.z,
                duration: 0.3,
            });

            gsap.to(object.position,{
                z: object.userData.initialPosition.z,
                duration:0.3,
            });
        }else if(object.name.includes("Bass")) {
            gsap.to(object.scale, {
                x: object.userData.initialScale.x,
                y: object.userData.initialScale.y,
                z: object.userData.initialScale.z,
                duration: 0.3,
            });

            gsap.to(object.position,{
                x: object.userData.initialPosition.x,
                duration:0.3,
            });
        }else if(object.name.includes("Profile") || object.name.includes("Resume") || object.name.includes("Project")) {
            gsap.to(object.scale, {
                x: object.userData.initialScale.x,
                y: object.userData.initialScale.y,
                z: object.userData.initialScale.z,
                duration: 0.3,
            });

            gsap.to(object.position,{
                x: object.userData.initialPosition.x,
                duration:0.3,
            });

            gsap.to(object.rotation, {
                x: object.userData.initialRotation.x,
                duration: 0.3,
            });
        }else{
            gsap.to(object.scale,{
                x: object.userData.initialScale.x,
                y: object.userData.initialScale.y,
                z: object.userData.initialScale.z,
                duration: 0.3,
            });
        }
    }
}

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



    //RayCaster
    if(!isModalOpen) {
        raycaster.setFromCamera(pointer, camera);

        currentIntersects = raycaster.intersectObjects(raycasterObjects);


        if (currentIntersects.length > 0) {
            const currentIntersectObject = currentIntersects[0].object;

            if (currentIntersectObject.name.includes("RayCaster")) {
                if (currentIntersectObject !== currentHovered) {
                    if (currentHovered) {
                        playHoverAnimation(currentHovered, false);
                    }

                    playHoverAnimation(currentIntersectObject, true);
                    currentHovered = currentIntersectObject;
                }
            }

            if (currentIntersectObject.name.includes("Pointer")) {
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "default";
            }
        } else {
            if (currentHovered) {
                playHoverAnimation(currentHovered, false);
                currentHovered = null;
            }
            document.body.style.cursor = "default";
        }
    }

    renderer.render( scene, camera );

    window.requestAnimationFrame( render );
};



render();
