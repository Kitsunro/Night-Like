import { Engine, Scene, ShadowGenerator, FreeCamera, HemisphericLight, MeshBuilder, Color3, Vector3, PhysicsShapeType, PhysicsAggregate, HavokPlugin, StandardMaterial, Texture, DirectionalLight } from "@babylonjs/core";
import Inspector from "@babylonjs/inspector";
import ThirdPersonCamera from "./ThirdPersoneCamera";
import Keyboard from "./Keyboard";
import HavokPhysics from "@babylonjs/havok";
import TextureChar from "./../assets/player/red.webp";
import TextureGround from "./../assets/ground/ground1.webp";
import PerlinNoise from "./../assets/perlinNoise.png";

let canvas;
let engine;




canvas = document.getElementById("renderCanvas");
engine = new Engine(canvas, true,{ preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
globalThis.HK = await HavokPhysics();


const createScene = async function () {
    const scene = new Scene(engine);
    scene.debugLayer.show();

    
    const light = new DirectionalLight("light", new Vector3(0, -1, 0.45), scene);
    light.specular = Color3.Gray();
    

    // Initialize physics
    const havokInstance = await HavokPhysics();
    const physics = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -18, 0), physics);

    const ground = MeshBuilder.CreateGroundFromHeightMap("ground", PerlinNoise, { width: 250, height: 250, subdivisions: 256, minHeight: 0, maxHeight: 14 }, scene);
    ground.material = new StandardMaterial("groundMaterial", scene);
    ground.material.diffuseTexture = new Texture(TextureGround, scene);
    ground.position = new Vector3(0, -15, 0);
    ground.receiveShadows = true;
    let groundPhysics;
    ground.onMeshReadyObservable.add(() => {
        groundPhysics = new PhysicsAggregate(ground, PhysicsShapeType.MESH, { mass: 0 }, scene);
    });

    const ramp = MeshBuilder.CreateBox("ramp", { width: 10, height: 1, depth: 10 }, scene);
    ramp.position = new Vector3(5, 0.5, 0);
    ramp.rotation = new Vector3(0, 0, Math.PI / 6);
    ramp.material = new StandardMaterial("rampMaterial", scene);
    ramp.material.diffuseColor = new Color3(0.5, 0.5, 0.5);
    const rampPhysics = new PhysicsAggregate(ramp, PhysicsShapeType.BOX, { mass: 0 }, scene);



    // Define character position
    let characterMesh = MeshBuilder.CreateSphere("character", { diameter : 2 ,segments : 8}, scene);
    let characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.SPHERE, { mass: 0.5, restitution : 0.30,friction :1, mesh : characterMesh}, scene);
    characterMesh.position = new Vector3(0, 20, 0);
    characterMesh.material = new StandardMaterial("characterMaterial", scene);
    characterMesh.material.diffuseTexture = new Texture(TextureChar, scene);
    characterMesh.receiveShadows = true;
    characterPhysics.body.setLinearDamping(0.4);
    
    characterPhysics.body.setCollisionCallbackEnabled(true);

    // shadow generator
    const shadowGenerator = new ShadowGenerator(4096, light);
    shadowGenerator.addShadowCaster(characterMesh);
    shadowGenerator.addShadowCaster(ground);
    shadowGenerator.addShadowCaster(ramp);
    shadowGenerator.usePoissonSampling = true;

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
        //const dt = engine.getDeltaTime() / 1000; // Convert ms to seconds

        // Clamp character velocity
        const velocity = characterPhysics.body.getLinearVelocity();
        const maxVelocity = 25;

        if (velocity.length() > maxVelocity) {
            characterPhysics.body.setLinearVelocity(velocity.scale(maxVelocity / velocity.length()));
        }

        const keyboard = new Keyboard(scene, camera, window);
        
        keyboard.updateCharacterVelocity(characterPhysics, characterMesh, camera, inputMap);
        
        
        // Jump logic
        if (inputMap[" "] && !isJumping) {
            characterPhysics.body.applyImpulse(new Vector3(0, 5, 0), characterMesh.position);
            isJumping = true;
            // Add collision observable to reset jump state each time the character lands
            const observable = characterPhysics.body.getCollisionObservable();
            if (observable) {
                observable.add(() => {
                    isJumping = false;
                });
            }
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