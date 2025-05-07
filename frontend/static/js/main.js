// Main JavaScript file for IPR Manager
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      
      // Save preference to localStorage
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDarkMode);
    });
    
    // Check for saved theme preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      document.body.classList.add('dark-mode');
    }
  }
  
  // Wallet connection
  const connectWalletBtn = document.getElementById('connect-wallet');
  const walletAddress = document.getElementById('wallet-address');
  const connectionStatus = document.getElementById('connection-status');
  
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', async function() {
      if (window.ethereum) {
        try {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          const account = accounts[0];
          
          // Update UI
          if (walletAddress) {
            walletAddress.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
          }
          
          if (connectionStatus) {
            connectionStatus.textContent = 'Connected';
            connectionStatus.classList.remove('disconnected');
            connectionStatus.classList.add('connected');
          }
          
          // Send to backend
          await fetch('/connect_wallet', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `wallet_address=${account}`
          });
          
          // Update button text
          connectWalletBtn.textContent = 'Disconnect Wallet';
          connectWalletBtn.dataset.connected = 'true';
          
        } catch (error) {
          console.error('Error connecting wallet:', error);
        }
      } else if (connectWalletBtn.dataset.connected === 'true') {
        // Disconnect wallet
        if (walletAddress) {
          walletAddress.textContent = '';
        }
        
        if (connectionStatus) {
          connectionStatus.textContent = 'Disconnected';
          connectionStatus.classList.remove('connected');
          connectionStatus.classList.add('disconnected');
        }
        
        // Send to backend
        await fetch('/disconnect_wallet', {
          method: 'POST'
        });
        
        // Update button text
        connectWalletBtn.textContent = 'Connect Wallet';
        connectWalletBtn.dataset.connected = 'false';
      } else {
        alert('Please install MetaMask or another Ethereum wallet extension');
      }
    });
  }
  
  // Email/password authentication
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        
        const data = await response.json();
        
        if (data.success) {
          window.location.href = '/dashboard';
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
      }
    });
  }
  
  // Signup form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      try {
        const response = await fetch('/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        
        const data = await response.json();
        
        if (data.success) {
          window.location.href = '/login';
        } else {
          alert(data.message || 'Signup failed');
        }
      } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
      }
    });
  }
  
  // Staggered animations for elements with .stagger-item class
  const staggerItems = document.querySelectorAll('.stagger-item');
  if (staggerItems.length > 0) {
    staggerItems.forEach(item => {
      item.classList.add('animate-fade-in');
    });
  }
  
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  if (window.bootstrap && tooltipTriggerList.length > 0) {
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
  }
  
  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
});