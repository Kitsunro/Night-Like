import nx from "./../../assets/skybox/nx.png";
import ny from "./../../assets/skybox/ny.png";
import nz from "./../../assets/skybox/nz.png";
import px from "./../../assets/skybox/px.png";
import py from "./../../assets/skybox/py.png";
import pz from "./../../assets/skybox/pz.png";

export class SkyboxMaker {
    static getImages() {
        return [
            nx,
            py,
            nz,
            px,
            ny,
            pz
        ];
    }
}

export default SkyboxMaker;