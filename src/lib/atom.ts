import * as THREE from "three";

export class Atom {
  private timer: number = 0;
  private group: THREE.Group;
  private nucleusGroup: THREE.Group;
  private orbitsGroup: THREE.Group;
  private protons: THREE.Mesh[] = [];
  private neutrons: THREE.Mesh[] = [];
  private electrons: THREE.Mesh[] = [];
  private orbits: THREE.Mesh[] = [];
  private electronSpeeds: number[] = [];
  private orbitRadii: number[] = [2.4, 3.0, 3.6];
  private electronAngles: number[] = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  private orbitAxisRotations: THREE.Vector3[] = [
    new THREE.Vector3(0.8, 0.6, 0.4),
    new THREE.Vector3(0.5, 0.9, 0.3),
    new THREE.Vector3(0.7, 0.4, 0.8),
  ];
  private orbitCurrentRotations: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
  ];
  private orbitRotationSpeeds: number[] = [1.2, 0.9, 0.7];

  constructor() {
    this.group = new THREE.Group();
    this.nucleusGroup = new THREE.Group();
    this.orbitsGroup = new THREE.Group();
    this.createNucleus();
    this.createElectronsAndOrbits();
    this.group.add(this.orbitsGroup);
  }

  private createNucleus(): void {
    const r = 0.32;
    const packedPositions: [number, number, number][] = [
      [0, 0, 0],
      [0.48, 0.32, 0.28],
      [-0.44, 0.36, -0.3],
      [0.36, -0.44, 0.34],
      [-0.4, -0.38, -0.32],
      [0.34, 0.3, -0.46],
      [-0.38, -0.32, 0.42],
      [0.3, -0.34, -0.44],
    ];

    const isProton = [true, true, false, true, false, true, false, true];

    const protonMat = new THREE.MeshStandardMaterial({
      color: 0xdd2200,
      emissive: 0x441100,
      roughness: 0.25,
      metalness: 0.98,
      emissiveIntensity: 0.3,
    });
    const neutronMat = new THREE.MeshStandardMaterial({
      color: 0x3388ff,
      emissive: 0x001133,
      roughness: 0.25,
      metalness: 0.98,
      emissiveIntensity: 0.2,
    });

    packedPositions.forEach((pos, i) => {
      const mat = isProton[i] ? protonMat : neutronMat;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 48), mat);
      sphere.userData = { basePos: new THREE.Vector3(...pos) };
      sphere.position.set(...pos);
      this.nucleusGroup.add(sphere);
      if (isProton[i]) this.protons.push(sphere);
      else this.neutrons.push(sphere);
    });

    this.group.add(this.nucleusGroup);
  }

  private createElectronsAndOrbits(): void {
    const electronMat = new THREE.MeshStandardMaterial({
      color: 0x2266cc,
      emissive: 0x0044aa,
      metalness: 0.96,
      roughness: 0.18,
      emissiveIntensity: 0.4,
    });

    const orbitMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0e0,
      emissive: 0x335588,
      metalness: 0.92,
      roughness: 0.22,
      emissiveIntensity: 0.15,
      transparent: false,
    });

    for (let i = 0; i < 3; i++) {
      const torusGeometry = new THREE.TorusGeometry(
        this.orbitRadii[i],
        0.07,
        128,
        360,
      );
      const torus = new THREE.Mesh(torusGeometry, orbitMat);
      torus.userData = {
        rotationSpeed: this.orbitRotationSpeeds[i],
        axis: this.orbitAxisRotations[i].clone().normalize(),
      };
      this.orbitsGroup.add(torus);
      this.orbits.push(torus);

      const electron = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 48, 48),
        electronMat,
      );
      electron.userData = { orbitIndex: i, angle: this.electronAngles[i] };
      this.orbitsGroup.add(electron);
      this.electrons.push(electron);
      this.electronSpeeds.push(2.2 + i * 0.8);
    }
  }

  update(deltaTime: number): void {
    this.timer += deltaTime;

    for (let i = 0; i < this.orbits.length; i++) {
      this.orbitCurrentRotations[i].x +=
        this.orbitAxisRotations[i].x * this.orbitRotationSpeeds[i] * deltaTime;
      this.orbitCurrentRotations[i].y +=
        this.orbitAxisRotations[i].y * this.orbitRotationSpeeds[i] * deltaTime;
      this.orbitCurrentRotations[i].z +=
        this.orbitAxisRotations[i].z * this.orbitRotationSpeeds[i] * deltaTime;

      const euler = new THREE.Euler(
        this.orbitCurrentRotations[i].x,
        this.orbitCurrentRotations[i].y,
        this.orbitCurrentRotations[i].z,
        "XYZ",
      );
      this.orbits[i].quaternion.setFromEuler(euler);
    }

    this.nucleusGroup.rotation.x += 1.5 * deltaTime;
    this.nucleusGroup.rotation.y += 1.8 * deltaTime;
    this.nucleusGroup.rotation.z += 1.2 * deltaTime;

    const vibX = Math.sin(this.timer * 12) * 0.025;
    const vibY = Math.cos(this.timer * 11.5) * 0.025;
    const vibZ = Math.sin(this.timer * 13) * 0.025;

    this.protons.forEach((p, idx) => {
      const base = p.userData.basePos as THREE.Vector3;
      p.position.set(
        base.x + Math.sin(this.timer * 18 + idx) * 0.03 + vibX * 0.25,
        base.y + Math.cos(this.timer * 17 + idx * 1.2) * 0.03 + vibY * 0.25,
        base.z + Math.sin(this.timer * 19 + idx * 0.9) * 0.03 + vibZ * 0.25,
      );
    });

    this.neutrons.forEach((n, idx) => {
      const base = n.userData.basePos as THREE.Vector3;
      n.position.set(
        base.x + Math.cos(this.timer * 16 + idx * 1.3) * 0.03 + vibX * 0.25,
        base.y + Math.sin(this.timer * 19 + idx * 0.8) * 0.03 + vibY * 0.25,
        base.z + Math.cos(this.timer * 15 + idx * 1.1) * 0.03 + vibZ * 0.25,
      );
    });

    for (let i = 0; i < this.electrons.length; i++) {
      this.electronAngles[i] += this.electronSpeeds[i] * deltaTime;

      const orbitQuat = this.orbits[i].quaternion;
      const radius = this.orbitRadii[i];
      const angle = this.electronAngles[i];

      const localPos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0,
      );

      this.electrons[i].position.copy(localPos).applyQuaternion(orbitQuat);
    }

    this.orbitsGroup.rotation.x += 0.3 * deltaTime;
    this.orbitsGroup.rotation.y += 0.5 * deltaTime;
    this.orbitsGroup.rotation.z += 0.4 * deltaTime;
  }

  get mesh(): THREE.Group {
    return this.group;
  }
}
