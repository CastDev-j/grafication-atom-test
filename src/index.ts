import GUI from "lil-gui";
import * as THREE from "three";
import { Renderer } from "./lib/renderer";
import { Atom } from "./lib/atom";

const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;

if (!canvas) {
  throw new Error("Canvas element not found");
}

const gui = new GUI();
const renderer = new Renderer(canvas);

const config = {
  wireframe: false,
  speed: 1,
};

const atom = new Atom();
const ambientLight = new THREE.AmbientLight(0xffffff, 30);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);

directionalLight.position.set(5, 5, 5);
directionalLight2.position.set(-5, -5, -5);

renderer.scene.add(
  ambientLight,
  directionalLight,
  directionalLight2,
  atom.mesh,
);

const clock = new THREE.Clock();

// Animation loop
renderer.animate(() => {
  const deltaTime = clock.getDelta();

  atom.update(deltaTime);
});

gui.add(config, "wireframe").onChange((value: boolean) => {
  atom.mesh.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.material.wireframe = value;
    }
  });
});
