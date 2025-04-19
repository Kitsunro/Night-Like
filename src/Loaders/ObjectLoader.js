import { SceneLoader, Vector3, PhysicsAggregate, PhysicsShapeType, MeshBuilder } from "@babylonjs/core";
import Test from "./../../assets/object/Test.glb";


export class ObjectLoader {
    constructor(scene,phys) {
        this.scene = scene;
        this.models = [];
        this.physic = phys;
    }

    async load(){
        this.loadModel(Test, new Vector3(6, 4, 6), new Vector3(0, -3, 0), new Vector3(0, 0, 0));
    }

    async loadModel(model,scale,position,rotation){
        try{
            await SceneLoader.ImportMeshAsync("",model,"",this.scene).then((result) => {
                const mesh = result.meshes[1];
                mesh.scaling = scale;
                mesh.position = position;
                mesh.rotation = rotation;
                new PhysicsAggregate(mesh, PhysicsShapeType.MESH, { mass: 0 }, this.scene);
                this.models.push(mesh);
                mesh.receiveShadows = true;
            });
        }catch(error){
            console.error("Error loading model:", error);
        }
    }
}