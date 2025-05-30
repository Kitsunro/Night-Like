import { SceneLoader, Vector3, PhysicsAggregate, PhysicsShapeType, MeshBuilder } from "@babylonjs/core";
import map1 from "./../../assets/level_mohamed/Base_platform_backup.glb";
import map2 from "./../../assets/level_mohamed/map2.glb";

export class ObjectLoader {
    constructor(scene,phys) {
        this.scene = scene;
        this.models = [];
        this.physic = phys;
    }

    async load(){
        this.loadModel(map1, new Vector3(16, 16, 16), new Vector3(0, -3, 0), new Vector3(0, 0, 0));
        this.loadModel(map2, new Vector3(3, 3, 3), new Vector3(1000, -3, 0), new Vector3(0, 0, 0));
    }

    async loadModel(model,scale,position,rotation){
        try{
            await SceneLoader.ImportMeshAsync("",model,"",this.scene).then((result) => {
                const meshes = result.meshes.slice(1, result.meshes.length);
                console.log(meshes);
                meshes.forEach((mesh) => {
                    if(model === map2) {
                        console.log("Mesh name:", mesh.name, "position:", mesh.position, "scaling:", scale);
                    }
                    mesh.scaling = scale;
                    mesh.position = position;
                    mesh.rotation = rotation;
                    new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: 0 }, this.scene);
                    this.models.push(mesh);
                });
            });
        }catch(error){
            console.error("Error loading model:", error);
        }
    }
}