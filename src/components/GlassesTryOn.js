
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FaceMesh } from '@mediapipe/face_mesh';

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
        this.smoothingFactor = 0.7;
        this.currentPosition = new THREE.Vector3();
        this.currentRotation = new THREE.Euler();

        //Updated V1
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
            console.log('Initialisation complétée');
        } catch (error) {
            console.error('Initialisation échouée:', error);
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
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);

        this.camera.position.z = 5;

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    async setupWebcam() {
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: "user"
                }
            })
            .then(stream => {
                this.video.srcObject = stream;
                this.video.style.display = 'block';
                this.video.style.transform = 'scaleX(-1)';
                this.video.style.width = '100%';
                this.video.style.height = '100%';
                this.video.style.objectFit = 'cover';
                this.video.style.position = 'absolute';
                this.video.style.top = '0';
                this.video.style.left = '0';
                
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            })
            .catch(error => {
                console.error('Error accessing webcam:', error);
                reject(error);
            });
        });
    }

    async setupFaceMesh() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        await this.faceMesh.initialize();

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
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
            console.error('Error in face detection:', error);
        }
    }

    animate = () => {
        this.startTracking();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }


    onFaceDetected(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const face = results.multiFaceLandmarks[0];
    
            if (this.model) {
    
                const leftEye = face[133];  // Coin externe de l'œil gauche
                const rightEye = face[362]; // Coin externe de l'œil droit
                const nose = face[6];       // Pointe du nez
                const foreHead = face[10];  // Front
                const chin = face[152];     // Menton
    
                const eyeDistance = Math.hypot(
                    rightEye.x - leftEye.x,
                    rightEye.y - leftEye.y
                );
    
                const referenceDistance = 0.06;
                const scaleFactor = eyeDistance / referenceDistance;
                const minScale = 0.2;
                const maxScale = 1.5;
                let finalScale = Math.min(maxScale, Math.max(minScale, scaleFactor));
    
                const scaleAdjustment = 1.1;
                finalScale *= scaleAdjustment;
                this.model.scale.set(finalScale, finalScale, finalScale);
    
                const eyeCenterY = (leftEye.y + rightEye.y) / 2;
                const eyeToNoseOffset = nose.y - eyeCenterY;
                const adjustedVerticalOffset = (eyeToNoseOffset * -8) - 0.3;
    
                const targetPosition = new THREE.Vector3(
                    -(((leftEye.x + rightEye.x) / 2) - 0.5) * 20,
                    -(((leftEye.y + rightEye.y) / 2) - 0.5) * 5 + adjustedVerticalOffset,
                    -((leftEye.z + rightEye.z) / 2) * 5
                );
    
                const faceNormal = new THREE.Vector3(
                    rightEye.x - leftEye.x,
                    rightEye.y - leftEye.y,
                    rightEye.z - leftEye.z
                ).normalize();
    
                const upVector = new THREE.Vector3(
                    foreHead.x - chin.x,
                    foreHead.y - chin.y,
                    foreHead.z - chin.z
                ).normalize();
    
                const forwardVector = new THREE.Vector3().crossVectors(faceNormal, upVector);
    
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeBasis(faceNormal, upVector, forwardVector);
    
                const targetQuaternion = new THREE.Quaternion();
                targetQuaternion.setFromRotationMatrix(rotationMatrix);
    
                const correctionQuaternion = new THREE.Quaternion();
                correctionQuaternion.setFromEuler(new THREE.Euler(Math.PI, 0, 0)); // Rotation de 180° sur X
                targetQuaternion.multiply(correctionQuaternion);
    
                this.lerpVector3(this.model.position, targetPosition, 0.2);
                this.model.quaternion.slerp(targetQuaternion, 0.1);
            }
        }
    }
    



    async loadGlassesModel(modelPath) {
      try {
          if (this.model) {
              this.scene.remove(this.model); // Supprime l'ancien modèle
              this.model.traverse((child) => {
                  if (child.isMesh) {
                      child.geometry.dispose();
                      child.material.dispose();
                  }
              });
          }
  
          const gltf = await this.loader.loadAsync(modelPath);
          this.model = gltf.scene;
  
          const initialScale = this.baseScale * this.userScaleFactor;
          this.model.scale.set(initialScale, initialScale, initialScale);
  
          this.model.position.set(0, 0, 0);
  
          this.scene.add(this.model);
          console.log('Lunettes chargées correctement');
  
      } catch (error) {
          console.error('Erreur lors du chargement des lunettes', error);
          throw error;
      }
  }
  

}