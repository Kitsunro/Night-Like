import { Engine, Ray, Scene, SceneLoader, CubeTexture, ShadowGenerator, FreeCamera, HemisphericLight, MeshBuilder, Color3, Vector3, PhysicsShapeType, PhysicsAggregate, HavokPlugin, StandardMaterial, Texture, DirectionalLight } from "@babylonjs/core";
import { ObjectLoader } from "./Loaders/ObjectLoader";
import Inspector from "@babylonjs/inspector";
import ThirdPersonCamera from "./ThirdPersoneCamera";
import Keyboard from "./Keyboard";
import SkyboxMaker from "./Loaders/SkyboxMaker";
import HavokPhysics from "@babylonjs/havok";
import TextureChar from "./../assets/player/red.webp";
import TextureGround from "./../assets/ground/ground1.webp";
import PerlinNoise from "./../assets/perlinNoise.png";

let canvas;
let engine;

canvas = document.getElementById("renderCanvas");
engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
globalThis.HK = await HavokPhysics();

const createScene = async function () {
    const scene = new Scene(engine);
    scene.debugLayer.show();

    const light = new DirectionalLight("light", new Vector3(0, -1, 0.45), scene);
    light.specular = Color3.Gray();

    // Skybox hdr
    const skyboxIMGs = SkyboxMaker.getImages();
    const skybox = MeshBuilder.CreateBox("skybox", { size: 1000 }, scene);
    const skyboxMaterial = new StandardMaterial("skyboxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.reflectionTexture = CubeTexture.CreateFromImages(skyboxIMGs, scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;


    // Initialize physics
    const havokInstance = await HavokPhysics();
    const physics = new HavokPlugin(true, havokInstance);
    scene.enablePhysics(new Vector3(0, -18, 0), physics);

    //loading the object
    new ObjectLoader(scene,physics).load();

    //const ground = MeshBuilder.CreateGroundFromHeightMap("ground", PerlinNoise, { width: 250, height: 250, subdivisions: 256, minHeight: 0, maxHeight: 14 }, scene);
    //ground.material = new StandardMaterial("groundMaterial", scene);
    //ground.material.diffuseTexture = new Texture(TextureGround, scene);
    //ground.position = new Vector3(0, -15, 0);
    //ground.receiveShadows = true;
    //let groundPhysics;
    //ground.onMeshReadyObservable.add(() => {
    //    groundPhysics = new PhysicsAggregate(ground, PhysicsShapeType.MESH, { mass: 0 }, scene);
    //});

    // Define character position
    let characterMesh = MeshBuilder.CreateSphere("character", { diameter: 2, segments: 8 }, scene);
    let characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.SPHERE, { mass: 0.5, restitution: 0.30, friction: 1 }, scene);
    characterMesh.position = new Vector3(0, 25, 0);
    characterMesh.material = new StandardMaterial("characterMaterial", scene);
    characterMesh.material.diffuseTexture = new Texture(TextureChar, scene);
    characterMesh.receiveShadows = true;
    characterPhysics.body.setLinearDamping(0.4);
    characterPhysics.body.setCollisionCallbackEnabled(true);

    let isJumping = false;

    // Détection de collision avec le sol
    scene.onBeforeRenderObservable.add(() => {
        // Initialiser une variable pour savoir si le personnage est en contact avec le sol
        let isOnGround = false;

        // Raycasts autour du personnage pour détecter le sol (en plusieurs points)
        const raycastLength = 1.2; // Longueur du raycast pour vérifier la hauteur du personnage
        const offsetY = 0.1; // Décalage vertical pour ne pas se heurter au personnage directement
        const raycastOrigins = [
            new Vector3(characterMesh.position.x - 0.5, characterMesh.position.y + offsetY, characterMesh.position.z), // Gauche
            new Vector3(characterMesh.position.x + 0.5, characterMesh.position.y + offsetY, characterMesh.position.z), // Droite
            new Vector3(characterMesh.position.x, characterMesh.position.y + offsetY, characterMesh.position.z) // Centre
        ];

        // Raycasts pour chaque origine
        for (let i = 0; i < raycastOrigins.length; i++) {
            const ray = new Ray(raycastOrigins[i], new Vector3(0, -1, 0), raycastLength); // Ray vers le bas
            const hit = scene.pickWithRay(ray, (mesh) => mesh !== characterMesh && mesh.isVisible);

            if (hit.hit) {
                isOnGround = true; // Le personnage touche le sol
                break; // Si un raycast touche un sol, on arrête la boucle
            }
        }

        // Si le personnage est en contact avec le sol, il peut sauter
        if (isOnGround) {
            isJumping = false; // Le personnage touche le sol, il peut sauter à nouveau.
        }
    });

    // Shadow generator
    const shadowGenerator = new ShadowGenerator(1024, light);
    shadowGenerator.addShadowCaster(characterMesh);
    //shadowGenerator.addShadowCaster(ground);
    shadowGenerator.usePoissonSampling = true;

    const thirdPersonCamera = new ThirdPersonCamera(scene, characterMesh);
    const camera = thirdPersonCamera.getCamera();

    let inputMap = {};

    window.addEventListener("keydown", (event) => {
        inputMap[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        inputMap[event.key] = false;
    });

    const startPosition = new Vector3(0, 2, 0); // Position de départ
characterMesh.position = startPosition.clone(); // Initialiser le joueur à la position de départ

// Ajouter un gestionnaire pour la touche de respawn
window.addEventListener("keydown", (event) => {
    if (event.key === "r" || event.key === "R") { // Vérifier si la touche "R" est pressée
        console.log("Respawn au point de départ !");
        
        // Réinitialiser la vitesse et la rotation
        characterPhysics.body.setLinearVelocity(Vector3.Zero()); // Réinitialiser la vitesse
        characterPhysics.body.setAngularVelocity(Vector3.Zero()); // Réinitialiser la rotation

        // Désactiver temporairement la physique
        characterPhysics.dispose(); // Supprimer temporairement la physique

        // Repositionner le joueur
        characterMesh.position = startPosition.clone(); // Repositionner le mesh

        // Réactiver la physique
        characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.SPHERE, { mass: 0.5, restitution: 0.3, friction: 1 }, scene);
    }
});

    // Update character position based on input
    scene.onBeforeRenderObservable.add(() => {
        // Clamp character velocity
        const velocity = characterPhysics.body.getLinearVelocity();
        const maxVelocity = 25;

        if (velocity.length() > maxVelocity) {
            characterPhysics.body.setLinearVelocity(velocity.scale(maxVelocity / velocity.length()));
        }

        const keyboard = new Keyboard(scene, camera, window);
        keyboard.updateCharacterVelocity(characterPhysics, characterMesh, camera, inputMap);

        // Gestion du saut
        if (inputMap[" "] && !isJumping) {
            const jumpImpulse = new Vector3(0, 5, 0); // Impulsion constante pour le saut
            characterPhysics.body.applyImpulse(jumpImpulse, characterMesh.position);
            isJumping = true;
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
