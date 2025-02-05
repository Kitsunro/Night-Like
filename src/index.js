import { Engine, Scene, FreeCamera, HemisphericLight, MeshBuilder, Color3, Vector3, PhysicsShapeType, PhysicsAggregate, HavokPlugin, StandardMaterial, Texture } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import ThirdPersonCamera from "./ThirdPersoneCamera";
import TextureChar from "./../assets/player/red.webp";
import TextureGround from "./../assets/ground/ground1.webp";
import TextureSkybox from "./../assets/skybox.jpeg";

let canvas;
let engine;




canvas = document.getElementById("renderCanvas");
engine = new Engine(canvas, true,{ preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
globalThis.HK = await HavokPhysics();


const createScene = async function () {
    const scene = new Scene(engine);
    
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;



    const ground = MeshBuilder.CreateGround("ground", {width: 30, height: 30}, scene);
    ground.material = new StandardMaterial("groundMaterial", scene);
    ground.material.diffuseTexture = new Texture(TextureGround, scene);

    // Initialize physics
    const havokInstance = await HavokPhysics();
    const physics = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), physics);

    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    // Define character position
    const characterPosition = new Vector3(0, 1, 0);

    let characterMesh = MeshBuilder.CreateSphere("character", { diameter : 2 }, scene);
    let characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.SPHERE, { mass: 1 }, scene);
    characterMesh.position = characterPosition;
    characterMesh.material = new StandardMaterial("characterMaterial", scene);
    
    characterMesh.material.diffuseTexture = new Texture(TextureChar, scene);



    const thirdPersonCamera = new ThirdPersonCamera(scene, characterMesh);
    const camera = thirdPersonCamera.getCamera();


    let inputMap = {};
    let isJumping = false;
    let verticalVelocity = 0;

    window.addEventListener("keydown", (event) => {
        inputMap[event.key] = true;
    });
    window.addEventListener("keyup", (event) => {
        inputMap[event.key] = false;
    });

    // Update character position based on input
    scene.onBeforeRenderObservable.add(() => {
        const dt = engine.getDeltaTime() / 1000; // Convert ms to seconds
        
        if (inputMap["ArrowUp"]) characterPhysics.body.applyImpulse(new Vector3(0, 0, 0.1), characterMesh.position);
        if (inputMap["ArrowDown"]) characterPhysics.body.applyImpulse(new Vector3(0, 0, -0.1), characterMesh.position);
        if (inputMap["ArrowLeft"]) characterPhysics.body.applyImpulse(new Vector3(-0.1, 0, 0), characterMesh.position);
        if (inputMap["ArrowRight"]) characterPhysics.body.applyImpulse(new Vector3(0.1, 0, 0), characterMesh.position);

        
        
        // Jump logic
        if (inputMap[" "] && !isJumping) {
            characterPhysics.body.applyImpulse(new Vector3(0, 5, 0), characterMesh.position);
            isJumping = true;
            setTimeout(() => {
                isJumping = false;
            }, 1000);
        }
    });

    return scene;
};

createScene().then((scene) => {
    engine.runRenderLoop(function () {
      if (scene) {
        scene.render();
      }
    });
});

window.addEventListener("resize", function () {
    engine.resize();
});