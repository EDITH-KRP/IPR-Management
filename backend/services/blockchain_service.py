import os
import json
from web3 import Web3
from eth_account.messages import encode_defunct
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Alchemy configuration
ALCHEMY_API_KEY = os.getenv('ALCHEMY_API_KEY')
ALCHEMY_NETWORK = os.getenv('ALCHEMY_NETWORK', 'goerli')  # Default to Goerli testnet
ALCHEMY_URL = f"https://eth-{ALCHEMY_NETWORK}.g.alchemy.com/v2/{ALCHEMY_API_KEY}"

# Contract configuration
CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
CONTRACT_ABI_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                               '../contracts/abi/IPNFT.json')

# Initialize Web3
w3 = Web3(Web3.HTTPProvider(ALCHEMY_URL))

# Load contract ABI
try:
    with open(CONTRACT_ABI_PATH, 'r') as f:
        contract_abi = json.load(f)
except FileNotFoundError:
    contract_abi = []  # Will be populated after contract deployment

# Initialize contract
if CONTRACT_ADDRESS and contract_abi:
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=contract_abi)
else:
    contract = None

def register_patent(wallet_address, cid):
    """
    Register a new patent on the blockchain
    
    Args:
        wallet_address (str): Ethereum wallet address of the patent owner
        cid (str): IPFS CID of the patent metadata
        
    Returns:
        tuple: (transaction_hash, token_id)
    """
    if not contract:
        raise Exception("Contract not initialized")
    
    # Get nonce for the transaction
    nonce = w3.eth.get_transaction_count(wallet_address)
    
    # Build transaction
    tx = contract.functions.registerPatent(cid).build_transaction({
        'from': wallet_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Note: In a real application, this transaction would be signed by the user's wallet
    # Here we're assuming the transaction is signed and submitted by the user's wallet
    # and we're just returning the transaction hash and a placeholder token ID
    
    # For demonstration purposes, we'll return a placeholder
    tx_hash = "0x" + "0" * 64  # Placeholder transaction hash
    token_id = 1  # Placeholder token ID
    
    return tx_hash, token_id

def get_all_patents():
    """
    Get all patents from the blockchain
    
    Returns:
        list: List of patent metadata
    """
    if not contract:
        raise Exception("Contract not initialized")
    
    # Get total supply of tokens
    total_supply = contract.functions.totalSupply().call()
    
    patents = []
    for token_id in range(1, total_supply + 1):
        try:
            # Get patent details
            owner, cid, registration_time = contract.functions.getPatent(token_id).call()
            
            # Get metadata from IPFS (this would be handled by the frontend)
            # Here we just return the CID
            patents.append({
                'token_id': token_id,
                'owner': owner,
                'cid': cid,
                'registration_time': registration_time
            })
        except Exception as e:
            print(f"Error getting patent {token_id}: {e}")
    
    return patents

def get_patent_details(token_id):
    """
    Get details of a specific patent
    
    Args:
        token_id (int): Token ID of the patent
        
    Returns:
        dict: Patent details
    """
    if not contract:
        raise Exception("Contract not initialized")
    
    # Get patent details
    owner, cid, registration_time = contract.functions.getPatent(token_id).call()
    
    # Check if patent is for sale
    try:
        is_for_sale, min_bid, sale_end_time = contract.functions.getSaleDetails(token_id).call()
    except:
        is_for_sale, min_bid, sale_end_time = False, 0, 0
    
    return {
        'token_id': token_id,
        'owner': owner,
        'cid': cid,
        'registration_time': registration_time,
        'is_for_sale': is_for_sale,
        'min_bid': min_bid,
        'sale_end_time': sale_end_time
    }

def list_for_sale(wallet_address, token_id, min_bid, duration=30):
    """
    List a patent for sale
    
    Args:
        wallet_address (str): Ethereum wallet address of the patent owner
        token_id (int): Token ID of the patent
        min_bid (float): Minimum bid in ETH
        duration (int): Duration of the sale in days
        
    Returns:
        str: Transaction hash
    """
    if not contract:
        raise Exception("Contract not initialized")
    
    # Convert min_bid from ETH to Wei
    min_bid_wei = w3.to_wei(min_bid, 'ether')
    
    # Convert duration from days to seconds
    duration_seconds = duration * 24 * 60 * 60
    
    # Get nonce for the transaction
    nonce = w3.eth.get_transaction_count(wallet_address)
    
    # Build transaction
    tx = contract.functions.listForSale(token_id, min_bid_wei, duration_seconds).build_transaction({
        'from': wallet_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Placeholder transaction hash
    tx_hash = "0x" + "0" * 64
    
    return tx_hash

def place_bid(wallet_address, token_id, bid_amount):
    """
    Place a bid on a patent
    
    Args:
        wallet_address (str): Ethereum wallet address of the bidder
        token_id (int): Token ID of the patent
        bid_amount (float): Bid amount in ETH
        
    Returns:
        str: Transaction hash
    """
    if not contract:
        raise Exception("Contract not initialized")
    
    # Convert bid_amount from ETH to Wei
    bid_amount_wei = w3.to_wei(bid_amount, 'ether')
    
    # Get nonce for the transaction
    nonce = w3.eth.get_transaction_count(wallet_address)
    
    # Build transaction
    tx = contract.functions.placeBid(token_id).build_transaction({
        'from': wallet_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price,
        'value': bid_amount_wei
    })
    
    # Placeholder transaction hash
    tx_hash = "0x" + "0" * 64
    
    return tx_hash

def accept_bid(wallet_address, token_id, bidder_address):
    """
    Accept a bid on a patent
    
    Args:
        wallet_address (str): Ethereum wallet address of the patent owner
        token_id (int): Token ID of the patent
        bidder_address (str): Ethereum wallet address of the bidder
        
    Returns:
        str: Transaction hash
    """
    if not contract:
        raise Exception("Contract not initialized")
    
    # Get nonce for the transaction
    nonce = w3.eth.get_transaction_count(wallet_address)
    
    # Build transaction
    tx = contract.functions.acceptBid(token_id, bidder_address).build_transaction({
        'from': wallet_address,
        'nonce': nonce,
        'gas': 2000000,
        'gasPrice': w3.eth.gas_price
    })
    
    # Placeholder transaction hash
    tx_hash = "0x" + "0" * 64
    
    return tx_hash

def get_transaction_status(tx_hash):
    """
    Get the status of a transaction
    
    Args:
        tx_hash (str): Transaction hash
        
    Returns:
        dict: Transaction status
    """
    try:
        tx_receipt = w3.eth.get_transaction_receipt(tx_hash)
        return {
            'status': 'confirmed' if tx_receipt.status == 1 else 'failed',
            'block_number': tx_receipt.blockNumber,
            'gas_used': tx_receipt.gasUsed
        }
    except:
        return {
            'status': 'pending'
        }

def get_contract_balance():
    """
    Get the balance of the contract
    
    Returns:
        float: Contract balance in ETH
    """
    if not contract:
        raise Exception("Contract not initialized")
    
    balance_wei = w3.eth.get_balance(CONTRACT_ADDRESS)
    balance_eth = w3.from_wei(balance_wei, 'ether')
    
    return float(balance_eth)

def verify_signature(message, signature, address):
    """
    Verify a signature
    
    Args:
        message (str): Message that was signed
        signature (str): Signature
        address (str): Ethereum address of the signer
        
    Returns:
        bool: True if signature is valid, False otherwise
    """
    message_hash = encode_defunct(text=message)
    try:
        signer = w3.eth.account.recover_message(message_hash, signature=signature)
        return signer.lower() == address.lower()
    except:
        return False