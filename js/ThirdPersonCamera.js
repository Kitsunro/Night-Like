class ThirdPersonCamera {
    constructor(scene, target) {
        this.camera = new BABYLON.FreeCamera("FreeCam", new BABYLON.Vector3(0, 5, -10), scene);
        this.target = target;

        // Set camera properties
        this.radius = 10; // How far from the object to follow
        this.heightOffset = 5; // Fixed height above the object to place the camera
        this.rotationOffset = 0; // The viewing angle

        // Attach control to the canvas
        this.camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

        // Update camera position
        scene.onBeforeRenderObservable.add(() => {
            this.updateCameraPosition();
        });

        // Add mouse controls
        this.addMouseControls(scene);
    }

    updateCameraPosition() {
        const targetPosition = this.target.position;
        const cameraPosition = new BABYLON.Vector3(
            targetPosition.x - this.radius * Math.sin(this.rotationOffset * Math.PI / 180),
            targetPosition.y + this.heightOffset,
            targetPosition.z - this.radius * Math.cos(this.rotationOffset * Math.PI / 180)
        );
        this.camera.position = cameraPosition;
        this.camera.setTarget(targetPosition);
    }

    addMouseControls(scene) {
        const canvas = scene.getEngine().getRenderingCanvas();
        let isPointerLocked = false;

        // Mouse controls
        canvas.addEventListener("click", () => {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        });

        document.addEventListener("pointerlockchange", () => {
            isPointerLocked = !!document.pointerLockElement;
        });

        scene.onPointerObservable.add((pointerInfo) => {
            if (isPointerLocked) {
                switch (pointerInfo.type) {
                    case BABYLON.PointerEventTypes.POINTERMOVE:
                        const event = pointerInfo.event;
                        this.rotationOffset -= event.movementX * 0.05;
                        // Remove vertical adjustment
                        break;
                }
            }
        });
    }

    getCamera() {
        return this.camera;
    }
}

export default ThirdPersonCamera;