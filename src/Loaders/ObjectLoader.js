import { SceneLoader, Vector3, PhysicsAggregate, PhysicsShapeType, MeshBuilder } from "@babylonjs/core";
import map1 from "./../../assets/object/map2.glb";


export class ObjectLoader {
    constructor(scene,phys) {
        this.scene = scene;
        this.models = [];
        this.physic = phys;
    }

    async load(){
        this.loadModel(map1, new Vector3(3, 3, 3), new Vector3(0, -3, 0), new Vector3(0, 0, 0));
    }

    async loadModel(model,scale,position,rotation){
        try{
            await SceneLoader.ImportMeshAsync("",model,"",this.scene).then((result) => {
                const meshes = result.meshes.slice(1, result.meshes.length);
                console.log(meshes);
                meshes.forEach((mesh) => {
                    mesh.scaling = scale;
                    mesh.position = position;
                    mesh.rotation = rotation;
                    mesh.receiveShadows = true;
                    new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: 0 }, this.scene);
                    this.models.push(mesh);
                });
            });
        }catch(error){
            console.error("Error loading model:", error);
        }
    }
}