import { Engine, Scene, FreeCamera, HemisphericLight, MeshBuilder, Vector3, PhysicsShapeType, PhysicsAggregate, HavokPlugin } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";

let canvas;
let engine;




canvas = document.getElementById("renderCanvas");
engine = new Engine(canvas, true,{ preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
globalThis.HK = await HavokPhysics();


const createScene = async function () {
    const scene = new Scene(engine);

    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);

    // Initialize physics
    const havokInstance = await HavokPhysics();
    const physics = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -9.81, 0), physics);

    new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    // Define character position
    const characterPosition = new Vector3(0, 1, 0);
    const h = 2;
    const r = 0.5;

    let characterMesh = MeshBuilder.CreateCapsule("character", { height: h, radius: r }, scene);
    characterMesh.position = characterPosition;

    let characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.CAPSULE, { mass: 1 }, scene);

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
        let moveDirection = new Vector3(0, 0, 0);
        
        if (inputMap["ArrowUp"]) moveDirection.z += 1;
        if (inputMap["ArrowDown"]) moveDirection.z -= 1;
        if (inputMap["ArrowLeft"]) moveDirection.x -= 1;
        if (inputMap["ArrowRight"]) moveDirection.x += 1;
        
        moveDirection = moveDirection.normalize().scale(2);
        
        // Jump logic
        if (inputMap[" "] && !isJumping) {
            verticalVelocity = 7;
            isJumping = true;
        }
        
        verticalVelocity -= 9.81 * dt;
        moveDirection.y = verticalVelocity;
        
        // Apply movement
        characterPhysics.body.setLinearVelocity(moveDirection);
        
        // Check if on ground
        if (characterMesh.position.y <= 1) {
            verticalVelocity = 0;
            isJumping = false;
            characterMesh.position.y = 1;
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