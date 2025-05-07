// Particle animation for blockchain visualization
document.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('particles-js')) return;

  // Configuration for particles.js
  const particlesConfig = {
    "particles": {
      "number": {
        "value": 80,
        "density": {
          "enable": true,
          "value_area": 800
        }
      },
      "color": {
        "value": "#3b82f6"
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
        "color": "#3b82f6",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 2,
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
  };

  // Initialize particles.js
  if (window.particlesJS) {
    window.particlesJS('particles-js', particlesConfig);
  } else {
    console.error('particles.js not loaded');
  }
});

// Create blockchain node connections animation
function createNodeConnections() {
  const container = document.querySelector('.node-connections');
  if (!container) return;

  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;
  const nodeCount = 15;
  const nodes = [];

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const node = document.createElement('div');
    node.className = 'node';
    
    const x = Math.random() * containerWidth;
    const y = Math.random() * containerHeight;
    
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    
    container.appendChild(node);
    nodes.push({ element: node, x, y, vx: Math.random() * 0.5 - 0.25, vy: Math.random() * 0.5 - 0.25 });
  }

  // Create connections
  function updateConnections() {
    // Remove existing connections
    container.querySelectorAll('.connection').forEach(conn => conn.remove());
    
    // Create new connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const connection = document.createElement('div');
          connection.className = 'connection';
          
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          connection.style.width = `${distance}px`;
          connection.style.left = `${nodeA.x + 3}px`;
          connection.style.top = `${nodeA.y + 3}px`;
          connection.style.transform = `rotate(${angle}deg)`;
          connection.style.opacity = (1 - distance / 150) * 0.5;
          
          container.appendChild(connection);
        }
      }
    }
  }

  // Animate nodes
  function animateNodes() {
    for (const node of nodes) {
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      
      // Bounce off walls
      if (node.x <= 0 || node.x >= containerWidth) node.vx *= -1;
      if (node.y <= 0 || node.y >= containerHeight) node.vy *= -1;
      
      // Apply position
      node.element.style.left = `${node.x}px`;
      node.element.style.top = `${node.y}px`;
    }
    
    updateConnections();
    requestAnimationFrame(animateNodes);
  }

  animateNodes();
}

// Initialize node connections when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  createNodeConnections();
});