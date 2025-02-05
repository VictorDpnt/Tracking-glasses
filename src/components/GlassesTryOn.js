import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FaceMesh } from "@mediapipe/face_mesh";

export class GlassesTryOn {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.faceMesh = null;
    this.loader = new GLTFLoader();
    this.isTracking = false;
    this.smoothingFactor = 0.5;
    this.currentPosition = new THREE.Vector3();
    this.currentRotation = new THREE.Euler();
    this.onFaceShapeDetected = null;

    this.baseScale = 0.3;
    this.userScaleFactor = 1.0;
    this.userOffset = new THREE.Vector3(0, 0, 0);
  }

  async init() {
    try {
      await this.setupScene();
      await this.setupWebcam();
      await this.setupFaceMesh();
      this.animate();
    } catch (error) {
      console.error("Initialisation échouée:", error);
    }
  }

  async setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    this.camera.position.z = 5;

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  async setupWebcam() {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        })
        .then((stream) => {
          this.video.srcObject = stream;
          this.video.style.display = "block";
          this.video.style.transform = "scaleX(-1)";
          this.video.style.width = "100%";
          this.video.style.height = "100%";
          this.video.style.objectFit = "cover";
          this.video.style.position = "absolute";
          this.video.style.top = "0";
          this.video.style.left = "0";

          this.video.onloadedmetadata = () => {
            this.video.play();
            resolve();
          };
        })
        .catch((error) => {
          console.error("Error accessing webcam:", error);
          reject(error);
        });
    });
  }

  async setupFaceMesh() {
    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    await this.faceMesh.initialize();

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.faceMesh.onResults((results) => {
      this.onFaceDetected(results);
    });

    this.isTracking = true;
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  lerpVector3(current, target, factor) {
    current.x = this.smoothLerp(current.x, target.x, factor);
    current.y = this.smoothLerp(current.y, target.y, factor);
    current.z = this.smoothLerp(current.z, target.z, factor);
  }

  lerpEuler(current, target, factor) {
    current.x = this.smoothLerp(current.x, target.x, factor);
    current.y = this.smoothLerp(current.y, target.y, factor);
    current.z = this.smoothLerp(current.z, target.z, factor);
  }

  smoothLerp(start, end, factor) {
    const t = 1 - Math.pow(1 - factor, 3);
    return start + (end - start) * t;
  }

  async startTracking() {
    if (!this.isTracking) return;

    try {
      await this.faceMesh.send({ image: this.video });
    } catch (error) {
      console.error("Error in face detection:", error);
    }
  }

  animate = () => {
    if (this.isTracking) {
      requestAnimationFrame(this.animate);
      this.startTracking();
      this.renderer.render(this.scene, this.camera);
    }
  };

  onFaceDetected(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const face = results.multiFaceLandmarks[0];

      if (this.model) {
        // Points clés du visage
        const leftEye = face[33]; // Coin externe de l'œil gauche
        const rightEye = face[263]; // Coin externe de l'œil droit
        const nose = face[1]; // Pointe du nez
        const chin = face[152]; // Menton
        const leftTemple = face[234]; // Tempe gauche
        const rightTemple = face[454]; // Tempe droite
        const leftJaw = face[148]; // Mâchoire gauche
        const rightJaw = face[378]; // Mâchoire droite

        // Déterminer la forme du visage
        const faceShape = this.detectFaceShape({
          chin,
          forehead: face[10], // Front
          leftTemple,
          rightTemple,
          leftJaw,
          rightJaw,
        });

        console.log("Forme du visage :", faceShape);

        // 🔹 Transmettre la forme du visage à l'application React via le callback
        if (this.onFaceShapeDetected) {
          this.onFaceShapeDetected(faceShape);
        }

        // 🔹 Calcul de la distance entre les yeux pour ajuster l'échelle
        const eyeDistance = Math.hypot(
          rightEye.x - leftEye.x,
          rightEye.y - leftEye.y
        );

        const referenceDistance = 0.06; // Distance de référence
        const baseScale = 0.4;

        const scaleFactor = (eyeDistance / referenceDistance) * baseScale;
        const adjustedScale = Math.min(1.5, Math.max(0.3, scaleFactor));

        this.model.scale.set(adjustedScale, adjustedScale, adjustedScale);

        // 🔹 Ajustement de la position des lunettes
        const eyeCenterX = (leftEye.x + rightEye.x) / 2;
        const eyeCenterY = (leftEye.y + rightEye.y) / 2;
        const offsetY = (nose.y - eyeCenterY) * -8 + 0.35;
        const offsetZ = -0.05;

        const targetPosition = new THREE.Vector3(
          -((eyeCenterX - 0.5) * 15),
          -((eyeCenterY - 0.5) * 10) + offsetY,
          offsetZ
        );

        this.lerpVector3(this.model.position, targetPosition, 0.2);

        // 🔹 Ajustement de la rotation
        const faceNormal = new THREE.Vector3(
          rightEye.x - leftEye.x,
          rightEye.y - leftEye.y,
          rightEye.z - leftEye.z
        ).normalize();

        const upVector = new THREE.Vector3(
          nose.x - chin.x,
          nose.y - chin.y,
          nose.z - chin.z
        ).normalize();

        const forwardVector = new THREE.Vector3().crossVectors(
          faceNormal,
          upVector
        );

        const rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeBasis(faceNormal, upVector, forwardVector);

        const targetQuaternion = new THREE.Quaternion();
        targetQuaternion.setFromRotationMatrix(rotationMatrix);

        const correctionQuaternion = new THREE.Quaternion();
        correctionQuaternion.setFromEuler(new THREE.Euler(Math.PI - 0.2, 0, 0)); // 🔹 Incline légèrement les branches vers le bas
        targetQuaternion.multiply(correctionQuaternion);

        this.model.quaternion.slerp(targetQuaternion, 0.1);
      }
    }
  }

  // Nouvelle méthode pour déterminer la forme du visage
  detectFaceShape(landmarks) {
    const { chin, forehead, leftTemple, rightTemple, leftJaw, rightJaw } =
      landmarks;

    // Largeur du visage (entre les tempes)
    const faceWidth = Math.hypot(
      rightTemple.x - leftTemple.x,
      rightTemple.y - leftTemple.y
    );

    // Longueur du visage (entre le menton et le haut du front)
    const faceLength = Math.hypot(chin.x - forehead.x, chin.y - forehead.y);

    // Largeur de la mâchoire
    const jawWidth = Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y);

    // Analyse des proportions pour déterminer la forme
    if (faceLength / faceWidth > 1.5) {
      return "Rectangulaire";
    } else if (Math.abs(faceLength - faceWidth) < 0.1 * faceLength) {
      return "Rond";
    } else if (jawWidth > faceWidth * 0.9) {
      return "Carré";
    } else if (jawWidth < faceWidth * 0.8) {
      return "Triangulaire";
    } else {
      return "Ovale";
    }
  }

  async loadGlassesModel(modelPath) {
    try {
      if (this.model) {
        this.scene.remove(this.model);
        this.model = null;
      }

      const fullPath = window.location.origin + modelPath;
      const gltf = await this.loader.loadAsync(fullPath);
      this.model = gltf.scene;

      // Ajuster l'échelle initiale
      const scaleReductionFactor = 0.1; // Ajuste ce facteur pour réduire globalement l'échelle
      const initialScale =
        this.baseScale * this.userScaleFactor * scaleReductionFactor;
      this.model.scale.set(initialScale, initialScale, initialScale);

      // Positionner le modèle au centre
      this.model.position.set(0, 0, 0);

      // Désactiver le test de profondeur pour toujours afficher les lunettes devant
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.material.depthTest = false; // Toujours visible
        }
      });

      // Ajouter les lunettes à la scène
      this.scene.add(this.model);
    } catch (error) {
      console.error("Erreur lors du chargement des lunettes", error);
    }
  }
}
