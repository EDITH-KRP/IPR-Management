import json
import os
from web3 import Web3
from dotenv import load_dotenv
from compile import compile_contract

# Load environment variables
load_dotenv()

def deploy_contract():
    """Deploy the IPNFT contract"""
    print("Deploying IPNFT contract...")
    
    # Get Alchemy API key and private key from environment variables
    alchemy_api_key = os.getenv('ALCHEMY_API_KEY')
    private_key = os.getenv('PRIVATE_KEY')
    network = os.getenv('ALCHEMY_NETWORK', 'goerli')  # Default to Goerli testnet
    
    if not alchemy_api_key or not private_key:
        print("Error: ALCHEMY_API_KEY and PRIVATE_KEY must be set in .env file")
        return
    
    # Connect to Ethereum network
    w3 = Web3(Web3.HTTPProvider(f"https://eth-{network}.g.alchemy.com/v2/{alchemy_api_key}"))
    
    # Check connection
    if not w3.is_connected():
        print(f"Error: Could not connect to Ethereum {network} network")
        return
    
    # Get account from private key
    account = w3.eth.account.from_key(private_key)
    address = account.address
    
    print(f"Connected to {network} network")
    print(f"Deploying from address: {address}")
    print(f"Account balance: {w3.from_wei(w3.eth.get_balance(address), 'ether')} ETH")
    
    # Compile contract if not already compiled
    abi_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/IPNFT.json')
    bytecode_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/IPNFT_bytecode.json')
    
    if not os.path.exists(abi_path) or not os.path.exists(bytecode_path):
        print("Compiling contract...")
        contract_abi, contract_bin = compile_contract()
    else:
        # Load ABI and bytecode from files
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
        
        with open(bytecode_path, 'r') as f:
            contract_bin = json.load(f)["bytecode"]
    
    # Create contract instance
    IPNFT = w3.eth.contract(abi=contract_abi, bytecode=contract_bin)
    
    # Get nonce
    nonce = w3.eth.get_transaction_count(address)
    
    # Build transaction
    transaction = IPNFT.constructor().build_transaction({
        'from': address,
        'nonce': nonce,
        'gas': 5000000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Sign transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    print(f"Transaction sent: {tx_hash.hex()}")
    
    # Wait for transaction receipt
    print("Waiting for transaction to be mined...")
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Get contract address
    contract_address = tx_receipt.contractAddress
    
    print(f"Contract deployed successfully!")
    print(f"Contract address: {contract_address}")
    
    # Save contract address to file
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/contract_address.json'), 'w') as f:
        json.dump({"address": contract_address}, f, indent=2)
    
    print(f"Contract address saved to {os.path.join(os.path.dirname(os.path.abspath(__file__)), 'abi/contract_address.json')}")
    
    return contract_address

if __name__ == "__main__":
    deploy_contract()