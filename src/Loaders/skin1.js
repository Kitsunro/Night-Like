import { SceneLoader, Vector3, PhysicsAggregate, PhysicsShapeType } from "@babylonjs/core";
import Ressources from "./../assets/player/DiscoBall.glb";

export class skin1 {
    constructor(scene) {
        this.scene = scene;
        this.model = null;
        this.modelphys = null;
    }

    async loadModel(scene) {
        try {
            const result = await SceneLoader.ImportMeshAsync("", Ressources, "", scene);
            this.model = result.meshes[0];
            this.model.scaling = new Vector3(1, 1, 1);
            this.model.position = new Vector3(0, 15, 0);

            // Apply physics to the model
            this.model.onMeshReadyObservable.add(() => {
                this.modelphys = new PhysicsAggregate(this.model, PhysicsShapeType.SPHERE, { mass: 1 }, this.scene);
            });

            console.log("Citron model loaded successfully");
        } catch (error) {
            console.error("Error loading citron model:", error);
        }
    }
}