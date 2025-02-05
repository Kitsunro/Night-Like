import { Engine, Scene, FreeCamera, HemisphericLight, MeshBuilder, Color3, Vector3, PhysicsShapeType, PhysicsAggregate, HavokPlugin, StandardMaterial, Texture } from "@babylonjs/core";
import Inspector from "@babylonjs/inspector";
import ThirdPersonCamera from "./ThirdPersoneCamera";
import Keyboard from "./Keyboard";
import HavokPhysics from "@babylonjs/havok";
import TextureChar from "./../assets/player/red.webp";
import TextureGround from "./../assets/ground/ground1.webp";

let canvas;
let engine;




canvas = document.getElementById("renderCanvas");
engine = new Engine(canvas, true,{ preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
globalThis.HK = await HavokPhysics();


const createScene = async function () {
    const scene = new Scene(engine);
    scene.debugLayer.show();

    
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Initialize physics
    const havokInstance = await HavokPhysics();
    const physics = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), physics);


    
    // Define ground
    const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
    const groundPhysics = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    ground.material = new StandardMaterial("groundMaterial", scene);
    ground.material.diffuseTexture = new Texture(TextureGround, scene);

    const ramp = MeshBuilder.CreateBox("ramp", { width: 10, height: 1, depth: 10 }, scene);
    ramp.position = new Vector3(5, 0.5, 0);
    ramp.rotation = new Vector3(0, 0, Math.PI / 6);
    const rampPhysics = new PhysicsAggregate(ramp, PhysicsShapeType.BOX, { mass: 0 }, scene);
    ramp.material = new StandardMaterial("rampMaterial", scene);
    ramp.material.diffuseColor = new Color3(0.5, 0.5, 0.5);


    // Define character position
    let characterMesh = MeshBuilder.CreateSphere("character", { diameter : 2 ,segments : 8}, scene);
    let characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.SPHERE, { mass: 1.4,restitution : 0.60,friction :0.92, mesh : characterMesh}, scene);
    characterMesh.position = new Vector3(0, 5, 0);
    characterMesh.material = new StandardMaterial("characterMaterial", scene);
    characterMesh.material.diffuseTexture = new Texture(TextureChar, scene);
    

    const thirdPersonCamera = new ThirdPersonCamera(scene, characterMesh);
    const camera = thirdPersonCamera.getCamera();

    let inputMap = {};
    let isJumping = false;

    window.addEventListener("keydown", (event) => {
        inputMap[event.key] = true;
    });
    window.addEventListener("keyup", (event) => {
        inputMap[event.key] = false;
    });

    

    // Update character position based on input
    scene.onBeforeRenderObservable.add(() => {
        const dt = engine.getDeltaTime() / 1000; // Convert ms to seconds

        const keyboard = new Keyboard(scene, camera, window);
        
        keyboard.updateCharacterVelocity(characterPhysics, characterMesh, camera, inputMap);
        
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