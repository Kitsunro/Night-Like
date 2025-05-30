import { Matrix, Engine, Ray, Scene, SceneLoader, CubeTexture, ShadowGenerator, FreeCamera, HemisphericLight, MeshBuilder, Color3, Vector3, PhysicsShapeType, PhysicsAggregate, HavokPlugin, StandardMaterial, Texture, DirectionalLight } from "@babylonjs/core";
import { ObjectLoader } from "./Loaders/ObjectLoader";
import Inspector from "@babylonjs/inspector";
import ThirdPersonCamera from "./ThirdPersoneCamera";
import Keyboard from "./Keyboard";
import SkyboxMaker from "./Loaders/SkyboxMaker";
import HavokPhysics from "@babylonjs/havok";
import TextureChar from "./../assets/player/red.webp";

let canvas;
let engine;

canvas = document.getElementById("renderCanvas");
engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false });
globalThis.HK = await HavokPhysics();

function showCompletionMessage() {
    // Créer un élément HTML pour afficher le message
    const message = document.createElement("div");
    message.innerText = "🎉 Félicitations, vous avez terminé le niveau 1 ! 🎉";
    message.style.position = "absolute";
    message.style.top = "50%";
    message.style.left = "50%";
    message.style.transform = "translate(-50%, -50%)";
    message.style.color = "white";
    message.style.fontSize = "32px";
    message.style.fontWeight = "bold";
    message.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    message.style.padding = "20px";
    message.style.borderRadius = "10px";
    message.style.zIndex = "1000";
    message.style.textAlign = "center";
    document.body.appendChild(message);

    // Supprimer le message après 3 secondes
    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}


const createScene = async function () {
    const scene = new Scene(engine);
    scene.debugLayer.show();

    const light1 = new DirectionalLight("light1", new Vector3(0, -1, 0.45), scene);
    light1.specular = Color3.Gray();
    const light2 = new DirectionalLight("light2", new Vector3(0, 1, 0.45), scene);
    light2.specular = Color3.Gray();

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

    // Définir la position de départ
    let currentLevel = 1;
    const startPositionLevel1 = new Vector3(-50, -15, 5);
    const startPositionLevel2 = new Vector3(-1000, 10, 0); // Choisis une position lointaine pour le niveau 2
    let startPosition = startPositionLevel1.clone();

    // Define character position
    let characterMesh = MeshBuilder.CreateSphere("character", { diameter: 2, segments: 8 }, scene);
    let characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.SPHERE, { mass: 0.5, restitution: 0.30, friction: 1 }, scene);
    characterMesh.position = startPosition.clone();
    characterMesh.material = new StandardMaterial("characterMaterial", scene);
    characterMesh.material.diffuseTexture = new Texture(TextureChar, scene);
    characterMesh.receiveShadows = true;
    characterPhysics.body.setLinearDamping(0.4);
    characterPhysics.body.setCollisionCallbackEnabled(true);

    let isJumping = false;

    // Ajouter des plateformes manuellement
    const platforms = [];

    // Exemple de 12 plateformes
        const platform = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
        platform.position = new Vector3(82.5, 75, 320); // Position initiale (ajustez à l'œil)
        platform.material = new StandardMaterial(`platformMaterial${1}`, scene);
        platform.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
        new PhysicsAggregate(platform, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
        platforms.push(platform);

        const platform2 = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
        platform2.position = new Vector3(82.5, 85, 330); // Position initiale (ajustez à l'œil)
        platform2.material = new StandardMaterial(`platformMaterial${2}`, scene);
        platform2.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
        new PhysicsAggregate(platform2, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
        platforms.push(platform2);

        const platform3 = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
        platform3.position = new Vector3(82.5, 90, 335); // Position initiale (ajustez à l'œil)
        platform3.material = new StandardMaterial(`platformMaterial${2}`, scene);
        platform3.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
        new PhysicsAggregate(platform3, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
        platforms.push(platform3);

        const platform4 = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
        platform4.position = new Vector3(67, 122.5, 440); // Position initiale (ajustez à l'œil)
        platform4.material = new StandardMaterial(`platformMaterial${2}`, scene);
        platform4.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
        new PhysicsAggregate(platform4, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
        platforms.push(platform4);

        const platform5 = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
        platform5.position = new Vector3(60, 132.5, 433); // Position initiale (ajustez à l'œil)
        platform5.material = new StandardMaterial(`platformMaterial${2}`, scene);
        platform5.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
        new PhysicsAggregate(platform5, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
        platforms.push(platform5);

        const platform6 = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
        platform6.position = new Vector3(53, 142.5, 426); // Position initiale (ajustez à l'œil)
        platform6.material = new StandardMaterial(`platformMaterial${2}`, scene);
        platform6.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
        new PhysicsAggregate(platform6, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
        platforms.push(platform6);

        const platform7 = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
        platform7.position = new Vector3(46, 152.5, 419); // Position initiale (ajustez à l'œil)
        platform7.material = new StandardMaterial(`platformMaterial${2}`, scene);
        platform7.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
        new PhysicsAggregate(platform7, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
        platforms.push(platform7);

        let lastPosition = new Vector3(46, 152.5, 419);

        for (let i = 8; i <= 13; i++) {
            const platform = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
            lastPosition = new Vector3(
                lastPosition.x - 7, // Réduction de 7 en X
                lastPosition.y + 10, // Augmentation de 10 en Y
                lastPosition.z - 7  // Réduction de 7 en Z
            );
            platform.position = lastPosition; // Appliquer la nouvelle position
            platform.material = new StandardMaterial(`platformMaterial${2}`, scene);
            platform.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
            new PhysicsAggregate(platform, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
            platforms.push(platform);
        }

        for (let i = 0; i <= 10; i++) {
            const platform = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
            lastPosition = new Vector3(
                lastPosition.x,
                lastPosition.y + 10, // Augmentation de 10 en Y
                lastPosition.z - 10  // Reduction de 10 en Z
            );
            platform.position = lastPosition; // Appliquer la nouvelle position
            platform.material = new StandardMaterial(`platformMaterial${2}`, scene);
            platform.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
            new PhysicsAggregate(platform, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
            platforms.push(platform);
        }
        lastPosition = new Vector3(
            lastPosition.x - 90,
            lastPosition.y -110, // Augmentation de 10 en Y
            lastPosition.z - 50  // Reduction de 10 en Z
        );
        for (let i = 0; i <= 6; i++) {
            const platform = MeshBuilder.CreateBox(`platform${1}`, { width: 5, height: 0.5, depth: 5 }, scene);
            lastPosition = new Vector3(
                lastPosition.x - 10,
                lastPosition.y + 10, // Augmentation de 10 en Y
                lastPosition.z  // Reduction de 10 en Z
            );
            platform.position = lastPosition; // Appliquer la nouvelle position
            platform.material = new StandardMaterial(`platformMaterial${2}`, scene);
            platform.material.diffuseColor = new Color3(0.5, 0.5, 0.5); // Couleur grise
            new PhysicsAggregate(platform, PhysicsShapeType.BOX, { mass: 0 }, scene); // Ajouter la physique
            platforms.push(platform);
        }

    

    // Détection de collision avec le sol
    scene.onBeforeRenderObservable.add(() => {
        if (currentLevel === 1 && characterMesh.position.x < -225 && characterMesh.position.y >= 285) { // Coordonnées de fin de niveau
            showCompletionMessage(); // Afficher un message
            setTimeout(() => {
            // TP vers le niveau 2
            characterPhysics.body.setLinearVelocity(Vector3.Zero());
            characterPhysics.body.setAngularVelocity(Vector3.Zero());
            characterPhysics.dispose();
            characterMesh.position = startPositionLevel2.clone();
            characterPhysics = new PhysicsAggregate(characterMesh, PhysicsShapeType.SPHERE, { mass: 0.5, restitution: 0.3, friction: 1 }, scene);
            currentLevel = 2;
            startPosition = startPositionLevel2.clone(); // Pour le respawn "R"

        }, 3000);
            
        }
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

        platforms.forEach((platform) => {
            if (characterMesh.intersectsMesh(platform, false)) {
                console.log(`Collision détectée avec la plateforme : ${platform.name}`);
                const jumpImpulse = new Vector3(0, 10, 0); // Impulsion pour propulser le joueur
                if (characterPhysics && characterPhysics.body) {
                    console.log("Application de l'impulsion :", jumpImpulse);
                    characterPhysics.body.applyImpulse(jumpImpulse, characterMesh.position);
                }
            }
        });
    });

    // Shadow generator
    const shadowGenerator = new ShadowGenerator(4096, light1);
    shadowGenerator.addShadowCaster(characterMesh);
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
