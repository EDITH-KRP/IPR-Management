// Landing page animations
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    if (document.getElementById('particles-js')) {
        // Determine particle color based on theme
        const isDarkMode = document.body.classList.contains('dark-mode');
        const particleColor = isDarkMode ? "#93c5fd" : "#3b82f6";
        const lineColor = isDarkMode ? "#93c5fd" : "#3b82f6";
        
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": particleColor
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": false,
                    "anim": {
                        "enable": false,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": lineColor,
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 6,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 1
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }

    // Initialize 3D model animation
    if (document.getElementById('model-container')) {
        initThreeJsModel();
    }

    // Initialize staggered animations
    const staggerItems = document.querySelectorAll('.stagger-item');
    if (staggerItems.length > 0) {
        animateStaggerItems(staggerItems);
    }

    // Initialize node connections
    const nodeContainers = document.querySelectorAll('.node-connections');
    if (nodeContainers.length > 0) {
        nodeContainers.forEach(container => {
            initNodeConnections(container);
        });
    }
});

// 3D model animation
function initThreeJsModel() {
    const container = document.getElementById('model-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // Create a blockchain-like model
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const blocks = [];
    const blockCount = 7;
    
    for (let i = 0; i < blockCount; i++) {
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color(`hsl(${210 + i * 10}, 70%, 60%)`),
            transparent: true,
            opacity: 0.8,
            specular: 0x111111,
            shininess: 30
        });
        
        const block = new THREE.Mesh(geometry, material);
        block.position.x = i * 1.2 - (blockCount * 1.2) / 2 + 0.6;
        block.position.y = Math.sin(i * 0.5) * 0.3;
        block.position.z = 0;
        
        scene.add(block);
        blocks.push(block);
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x3b82f6, 1, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Position camera
    camera.position.z = 5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        blocks.forEach((block, index) => {
            block.rotation.x += 0.01;
            block.rotation.y += 0.01;
            block.position.y = Math.sin((Date.now() / 1000) + index) * 0.3;
        });
        
        renderer.render(scene, camera);
    }
    
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        
        renderer.setSize(newWidth, newHeight);
    });
}

// Staggered animations
function animateStaggerItems(items) {
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate-fade-in');
        }, 100 * index);
    });
}

// Node connections animation
function initNodeConnections(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Create nodes
    const nodeCount = 15;
    const nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 3 + 2,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
            color: `hsl(${210 + Math.random() * 40}, 70%, 60%)`
        });
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        ctx.clearRect(0, 0, width, height);
        
        // Update and draw nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            // Bounce off edges
            if (node.x < 0 || node.x > width) node.vx *= -1;
            if (node.y < 0 || node.y > height) node.vy *= -1;
            
            // Draw node
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();
        });
        
        // Draw connections
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
    });
}