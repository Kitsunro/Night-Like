import HavokPhysics from "https://cdn.babylonjs.com/havok/HavokPhysics_es.js";
import ThirdPersonCamera from "./ThirdPersonCamera.js";

let havokInstance;
(async () => {
    havokInstance = await HavokPhysics();
    globalThis.HK = havokInstance;
    console.log("Havok Physics initialized");
})();

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);
    
    // Ensure Havok is ready before initializing physics
    await new Promise(resolve => {
        const checkHavok = setInterval(() => {
            if (havokInstance) {
                clearInterval(checkHavok);
                resolve();
            }
        }, 100);
    });

    // Initialize Havok physics
    const hkPhysics = new BABYLON.HavokPlugin(true, havokInstance);
    scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), hkPhysics);
    
    // Add physics to the ground using PhysicsAggregate
    new BABYLON.PhysicsAggregate(ground, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

    // Create elevated platforms
    const platform1 = BABYLON.MeshBuilder.CreateBox("platform1", {width: 3, height: 0.5, depth: 3}, scene);
    platform1.position = new BABYLON.Vector3(-8, 10, 0);
    new BABYLON.PhysicsAggregate(platform1, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

    const platform2 = BABYLON.MeshBuilder.CreateBox("platform2", {width: 3, height: 0.5, depth: 3}, scene);
    platform2.position = new BABYLON.Vector3(8, 10, 0);
    new BABYLON.PhysicsAggregate(platform2, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

    // Create a ramp to allow the character to get back up
    const ramp = BABYLON.MeshBuilder.CreateBox("ramp", {width: 1, height: 0.5, depth: 20}, scene);
    ramp.position = new BABYLON.Vector3(0, 5, -2.5);
    ramp.rotation.x = Math.PI / 6; // Rotate the ramp to create an incline
    new BABYLON.PhysicsAggregate(ramp, BABYLON.PhysicsShapeType.BOX, { mass: 0 }, scene);

    // Define character position
    const characterPosition = new BABYLON.Vector3(0, 1, 0);

    // Create a cube as the character
    let characterMesh = BABYLON.MeshBuilder.CreateBox("character", { size: 1 }, scene);
    characterMesh.position = characterPosition;
    
    // Store the PhysicsAggregate reference
    let characterPhysics = new BABYLON.PhysicsAggregate(characterMesh, BABYLON.PhysicsShapeType.BOX, { mass: 1 }, scene);
    const waitForPhysicsBody = new Promise((resolve) => {
        const checkBody = setInterval(() => {
            if (characterPhysics.body) {
                clearInterval(checkBody);
                resolve();
            }
        }, 100);
    });

    waitForPhysicsBody.then(() => {
        characterPhysics.body.setAngularFactor(new BABYLON.Vector3(0, 0, 0)); // Disable rotation
        characterPhysics.body.setLinearFactor(new BABYLON.Vector3(1, 1, 1)); // Allow movement in all directions
    });

    // Create and attach the camera to the character
    const thirdPersonCamera = new ThirdPersonCamera(scene, characterMesh);
    const camera = thirdPersonCamera.getCamera();

    let inputMap = {};
    let isJumping = false;
    let verticalVelocity = 0;

    // Input event listeners
    window.addEventListener("keydown", (event) => {
        inputMap[event.key] = true;
    });
    window.addEventListener("keyup", (event) => {
        inputMap[event.key] = false;
    });

    // Update character movement
    scene.onBeforeRenderObservable.add(() => {
        const dt = engine.getDeltaTime() / 1000; // Convert ms to seconds
        let moveDirection = new BABYLON.Vector3(0, 0, 0);
        
        if (inputMap["ArrowUp"] || inputMap["z"]) moveDirection.z += 1;
        if (inputMap["ArrowDown"] || inputMap["s"]) moveDirection.z -= 1;
        if (inputMap["ArrowLeft"] || inputMap["q"]) moveDirection.x -= 1;
        if (inputMap["ArrowRight"] || inputMap["d"]) moveDirection.x += 1;
        
        // Convert moveDirection to be relative to the camera
        const cameraForward = new BABYLON.Vector3(
            Math.sin(camera.rotation.y),
            0,
            Math.cos(camera.rotation.y)
        );
        const cameraRight = new BABYLON.Vector3(
            Math.sin(camera.rotation.y + Math.PI / 2),
            0,
            Math.cos(camera.rotation.y + Math.PI / 2)
        );

        moveDirection = cameraForward.scale(moveDirection.z).add(cameraRight.scale(moveDirection.x));
        moveDirection = moveDirection.normalize().scale(10);

        // Jump logic
        if (inputMap[" "] && !isJumping) {
            verticalVelocity = 7;
            isJumping = true;
        }
        
        verticalVelocity -= 9.81 * dt;
        moveDirection.y = verticalVelocity;
        
        // Apply movement
        characterPhysics.body.setLinearVelocity(moveDirection);
        
        // Raycast to check if on ground
        const ray = new BABYLON.Ray(characterMesh.position, new BABYLON.Vector3(0, -1, 0), 1.1);
        const hit = scene.pickWithRay(ray, (mesh) => {
            return mesh.name === "ground" || mesh.name.startsWith("platform") || mesh.name === "ramp";
        });
        
        if (hit.hit) {
            verticalVelocity = 0;
            isJumping = false;
        }

        // Check for collision with ramp and apply upward force
        const rampRay = new BABYLON.Ray(characterMesh.position, new BABYLON.Vector3(0, -1, 0), 1.1);
        const rampHit = scene.pickWithRay(rampRay, (mesh) => {
            return mesh.name === "ramp";
        });

        if (rampHit.hit) {
            characterPhysics.body.applyImpulse(new BABYLON.Vector3(0, 5, 0), characterMesh.position);
        }
    });

    return scene;
};

createScene().then(scene => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});

window.addEventListener("resize", function () {
    engine.resize();
});