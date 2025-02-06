# 🕶️ LunAR - Essayage Virtuel de Lunettes en Réalité Augmentée  

## 📌 Introduction  
LunAR est une application web permettant d'essayer des lunettes en **réalité augmentée** directement depuis son navigateur.  

---

## 🚀 Fonctionnalités Clés  

###  1. Essayage Virtuel en Réalité Augmentée  
- **Utilisation de la webcam** pour superposer un modèle 3D de lunettes sur le visage.  
- **Suivi dynamique** des mouvements de la tête.  
- **Mise à l’échelle et rotation automatique** selon la distance des yeux et l’orientation du nez.  
- **Changement instantané de modèle** via un menu déroulant.  

###  2. Recommandation Intelligente avec Chatbot IA  
- **Analyse des préférences de l’utilisateur** (forme du visage, style, usage).  
- **Suggestions de montures adaptées** en fonction des réponses fournies.  
- **Assistance technique** en cas de problème d’activation de la webcam.  

###  3. Sélection Dynamique de Lunettes  
- **Menu interactif** pour changer de monture en un clic.  
- **Chargement optimisé des modèles** pour une expérience fluide.  


## 🛠️ Technologies Utilisées  
LunAR est développé avec les technologies suivantes :  

- **Frontend** :  
  - React.js  
  - Three.js (moteur de rendu 3D)  
  - Mediapipe FaceMesh (détection des points clés du visage)  
  - Sass (styling avancé)  

- **Backend & IA** :  
  - OpenAI API (Chatbot basé sur GPT)  
  - Axios (gestion des requêtes API)  

---

## ⚙️ Installation et Exécution  

### 🖥️ Prérequis  
- **Node.js** >= 14  
- **npm** ou **yarn**  

### 📦 Installation  
1. **Cloner le projet**  
   ```bash
   git clone https://github.com/username/lunar-app.git
   cd lunar-app
   
2. **Installer les dépendances**  
   ```bash
   npm install
   
2. **Exécution**  
   ```bash
   npm start
