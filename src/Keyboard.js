import { Vector3, PhysicsBody, FreeCamera } from "@babylonjs/core";

class Keyboard {
    constructor(scene, camera) {
        this.camera = camera;
        this.scene = scene;
    }

    updateCharacterVelocity(characterPhysics, characterMesh, camera, inputMap) {
        //get camera vector to move in the direction of the camera
        const cVN = camera.getTarget().subtract(camera.position).normalize();
        // Update character position based on input
        if(inputMap["s"]) {
            characterPhysics.body.applyImpulse(new Vector3(-cVN.x*0.1, 0, -cVN.z*0.1), characterMesh.position);
        }
        if(inputMap["z"]) {
            characterPhysics.body.applyImpulse(new Vector3(cVN.x*0.1, 0, cVN.z*0.1), characterMesh.position);
        }
        if(inputMap["q"]) {
            characterPhysics.body.applyImpulse(new Vector3(-cVN.z*0.1, 0, cVN.x*0.1), characterMesh.position);
        }
        if(inputMap["d"]) {
            characterPhysics.body.applyImpulse(new Vector3(cVN.z*0.1, 0, -cVN.x*0.1), characterMesh.position);
        }
    }
}
export default Keyboard;