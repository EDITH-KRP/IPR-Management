/**
 * Main JavaScript file for IP-NFT DApp
 */

// Connect to user's wallet (MetaMask)
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            
            // Update UI
            document.getElementById('wallet-address').textContent = account;
            document.getElementById('wallet-status').textContent = 'Connected';
            document.getElementById('wallet-status').classList.add('connected');
            
            // Store wallet address in session
            await fetch('/auth/connect-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ wallet_address: account }),
            });
            
            return account;
        } catch (error) {
            console.error('Error connecting to wallet:', error);
            alert('Failed to connect wallet: ' + error.message);
        }
    } else {
        alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
}

// Sign message with wallet to verify ownership
async function signMessage(message) {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            
            // Sign the message
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, account],
            });
            
            return {
                message,
                signature,
                address: account
            };
        } catch (error) {
            console.error('Error signing message:', error);
            alert('Failed to sign message: ' + error.message);
        }
    } else {
        alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
}

// Format wallet address for display
function formatAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Format date for display
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
}

// Format ETH value for display
function formatEth(wei) {
    if (!wei) return '0 ETH';
    return parseFloat(wei) / 1e18 + ' ETH';
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Connect wallet button
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }
    
    // Sign message button
    const signMessageBtn = document.getElementById('sign-message-btn');
    if (signMessageBtn) {
        signMessageBtn.addEventListener('click', async () => {
            const message = 'Verify wallet ownership for IP-NFT DApp';
            const result = await signMessage(message);
            
            if (result) {
                // Verify signature on backend
                const response = await fetch('/blockchain/verify-signature', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(result),
                });
                
                const data = await response.json();
                
                if (data.valid) {
                    alert('Wallet verified successfully!');
                } else {
                    alert('Wallet verification failed.');
                }
            }
        });
    }
});