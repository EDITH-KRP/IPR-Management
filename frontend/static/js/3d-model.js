// 3D Model Viewer for Patent Documents
document.addEventListener('DOMContentLoaded', function() {
  const modelContainer = document.getElementById('model-container');
  if (!modelContainer) return;

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js not loaded');
    return;
  }

  // Set up scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf9fafb);
  
  // Set up camera
  const camera = new THREE.PerspectiveCamera(75, modelContainer.offsetWidth / modelContainer.offsetHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Set up renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(modelContainer.offsetWidth, modelContainer.offsetHeight);
  modelContainer.appendChild(renderer.domElement);
  
  // Create document model
  const createDocumentModel = () => {
    const group = new THREE.Group();
    
    // Create paper
    const paperGeometry = new THREE.BoxGeometry(3, 4, 0.05);
    const paperMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1
    });
    const paper = new THREE.Mesh(paperGeometry, paperMaterial);
    group.add(paper);
    
    // Create text lines
    const textLineGeometry = new THREE.PlaneGeometry(2, 0.1);
    const textLineMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    
    for (let i = 0; i < 15; i++) {
      const textLine = new THREE.Mesh(textLineGeometry, textLineMaterial);
      textLine.position.y = 1.5 - i * 0.25;
      textLine.position.z = 0.03;
      
      // Vary the width of lines
      textLine.scale.x = 0.7 + Math.random() * 0.3;
      
      group.add(textLine);
    }
    
    // Create patent seal
    const sealGeometry = new THREE.CircleGeometry(0.5, 32);
    const sealMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      roughness: 0.3,
      metalness: 0.7
    });
    const seal = new THREE.Mesh(sealGeometry, sealMaterial);
    seal.position.set(0.8, -1.5, 0.03);
    group.add(seal);
    
    // Create blockchain elements
    const blockGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const blockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b5cf6,
      roughness: 0.2,
      metalness: 0.8
    });
    
    const blocks = [];
    for (let i = 0; i < 5; i++) {
      const block = new THREE.Mesh(blockGeometry, blockMaterial);
      block.position.set(-2 + i * 0.5, -2.5, 0.5);
      blocks.push(block);
      group.add(block);
    }
    
    // Create connections between blocks
    const connectionGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
    const connectionMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 });
    
    for (let i = 0; i < blocks.length - 1; i++) {
      const connection = new THREE.Mesh(connectionGeometry, connectionMaterial);
      connection.position.set(-1.75 + i * 0.5, -2.5, 0.5);
      connection.rotation.z = Math.PI / 2;
      group.add(connection);
    }
    
    return group;
  };
  
  const documentModel = createDocumentModel();
  scene.add(documentModel);
  
  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Animation
  const animate = () => {
    requestAnimationFrame(animate);
    
    documentModel.rotation.y += 0.005;
    
    renderer.render(scene, camera);
  };
  
  animate();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = modelContainer.offsetWidth / modelContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(modelContainer.offsetWidth, modelContainer.offsetHeight);
  });
  
  // Handle dark mode changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isDarkMode = document.body.classList.contains('dark-mode');
        scene.background = new THREE.Color(isDarkMode ? 0x111827 : 0xf9fafb);
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
});