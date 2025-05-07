import os
from web3 import Web3
import json
from dotenv import load_dotenv
from enum import Enum
import sys
import requests
import hashlib
from datetime import datetime

load_dotenv()

alchemy_url = os.getenv("ALCHEMY_URL")
private_key = os.getenv("PRIVATE_KEY")
public_address = os.getenv("PUBLIC_ADDRESS")
filebase_api_key = os.getenv("FILEBASE_API_KEY", "")
filebase_bucket = os.getenv("FILEBASE_BUCKET", "ipr-manager")

# Check if we're in test mode
TEST_MODE = "mock_api_key" in alchemy_url if alchemy_url else True

# Connect to Alchemy Sepolia
if TEST_MODE:
    print("Running in test mode with mock data")
    # Use a mock provider for testing
    from web3.providers.eth_tester import EthereumTesterProvider
    w3 = Web3(EthereumTesterProvider())
else:
    w3 = Web3(Web3.HTTPProvider(alchemy_url))

# Load contract ABI and address
contract_address = Web3.to_checksum_address(os.getenv("CONTRACT_ADDRESS"))
try:
    # Try to load the new ABI first
    with open(os.path.join(os.path.dirname(__file__), "abi/IPNFT_new.json")) as f:
        abi = json.load(f)
except FileNotFoundError:
    # Fall back to the old ABI if the new one doesn't exist
    with open(os.path.join(os.path.dirname(__file__), "abi/IPNFT.json")) as f:
        abi = json.load(f)

contract = w3.eth.contract(address=contract_address, abi=abi)

class RequestStatus(Enum):
    PENDING = 0
    APPROVED = 1
    REJECTED = 2

# Function to upload metadata to IPFS via Filebase
def upload_to_ipfs(metadata):
    """
    Upload metadata to IPFS via Filebase
    """
    if TEST_MODE or not filebase_api_key:
        # In test mode, just return a hash of the metadata
        metadata_str = json.dumps(metadata)
        return f"ipfs://{hashlib.sha256(metadata_str.encode()).hexdigest()}"
    
    try:
        # Convert metadata to JSON string
        metadata_str = json.dumps(metadata)
        
        # Upload to Filebase
        headers = {
            'Authorization': f'Bearer {filebase_api_key}',
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            f'https://api.filebase.io/v1/ipfs/{filebase_bucket}',
            headers=headers,
            data=metadata_str
        )
        
        if response.status_code == 200:
            result = response.json()
            return f"ipfs://{result['cid']}"
        else:
            raise Exception(f"Failed to upload to IPFS: {response.text}")
    except Exception as e:
        print(f"Error uploading to IPFS: {str(e)}")
        # Fallback to hash in case of error
        return f"ipfs://{hashlib.sha256(metadata_str.encode()).hexdigest()}"

# Function to request IP ownership
def request_ip_ownership(requester_address, metadata_json, deposit_amount):
    """
    Submit a request for IP ownership with a deposit
    """
    nonce = w3.eth.get_transaction_count(requester_address)
    
    # Convert deposit amount to Wei
    deposit_wei = w3.to_wei(deposit_amount, 'ether')
    
    txn = contract.functions.requestIPOwnership(metadata_json).build_transaction({
        'from': requester_address,
        'value': deposit_wei,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Get the request ID from the event
    logs = contract.events.IPRequestSubmitted().process_receipt(tx_receipt)
    return logs[0]['args']['requestId']

# Function for admin to verify IP requests
def verify_ip_request(request_id, approved):
    """
    Admin function to verify an IP request
    """
    nonce = w3.eth.get_transaction_count(public_address)
    
    txn = contract.functions.verifyIPRequest(request_id, approved).build_transaction({
        'from': public_address,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if approved:
        logs = contract.events.IPRequestVerified().process_receipt(tx_receipt)
        return logs[0]['args']['tokenId']
    return None

# Function to register a patent with transaction hash
def register_patent(token_id, owner_address):
    """
    Register a patent with transaction hash
    """
    nonce = w3.eth.get_transaction_count(owner_address)
    
    txn = contract.functions.registerPatent(token_id, "").build_transaction({
        'from': owner_address,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    # Update the transaction hash
    update_txn = contract.functions.registerPatent(token_id, tx_hash.hex()).build_transaction({
        'from': owner_address,
        'nonce': nonce + 1,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_update_txn = w3.eth.account.sign_transaction(update_txn, private_key=private_key)
    update_tx_hash = w3.eth.send_raw_transaction(signed_update_txn.rawTransaction)
    update_tx_receipt = w3.eth.wait_for_transaction_receipt(update_tx_hash)
    
    return {
        'status': update_tx_receipt.status,
        'transaction_hash': tx_hash.hex()
    }

# Function to list IP for sale
def list_ip_for_sale(token_id, price, owner_address):
    """
    List an IP NFT for sale
    """
    nonce = w3.eth.get_transaction_count(owner_address)
    
    # Convert price to Wei
    price_wei = w3.to_wei(price, 'ether')
    
    txn = contract.functions.listIPForSale(token_id, price_wei).build_transaction({
        'from': owner_address,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return tx_receipt.status

# Function to place a bid on an IP
def place_bid(token_id, bid_amount, bidder_address):
    """
    Place a bid on an IP NFT
    """
    nonce = w3.eth.get_transaction_count(bidder_address)
    
    # Convert bid amount to Wei
    bid_wei = w3.to_wei(bid_amount, 'ether')
    
    txn = contract.functions.placeBid(token_id).build_transaction({
        'from': bidder_address,
        'value': bid_wei,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return tx_receipt.status

# Function to accept a bid
def accept_bid(token_id, bid_index, owner_address):
    """
    Accept a bid on an IP NFT
    """
    nonce = w3.eth.get_transaction_count(owner_address)
    
    txn = contract.functions.acceptBid(token_id, bid_index).build_transaction({
        'from': owner_address,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return tx_receipt.status

# Function to get all bids for an IP
def get_bids_for_ip(token_id):
    """
    Get all bids for an IP NFT
    """
    bids = contract.functions.getBidsForIP(token_id).call()
    
    bidders = bids[0]
    amounts = bids[1]
    active = bids[2]
    
    result = []
    for i in range(len(bidders)):
        if active[i]:  # Only include active bids
            result.append({
                'bidder': bidders[i],
                'amount': w3.from_wei(amounts[i], 'ether'),
                'index': i
            })
    
    return result

# Function to get IP details
def get_ip_details(token_id):
    """
    Get details of an IP NFT
    """
    details = contract.functions.ipDetails(token_id).call()
    
    return {
        'expiryTime': details[0],
        'forSale': details[1],
        'salePrice': w3.from_wei(details[2], 'ether'),
        'originalCreator': details[3],
        'transactionHash': details[4]
    }

# Function to get IP request details
def get_ip_request(request_id):
    """
    Get details of an IP request
    """
    request = contract.functions.ipRequests(request_id).call()
    
    return {
        'requester': request[0],
        'metadataURI': request[1],
        'depositAmount': w3.from_wei(request[2], 'ether'),
        'status': RequestStatus(request[3]).name,
        'requestTime': request[4]
    }

# Function to get all pending IP requests
def get_pending_requests():
    """
    Get all pending IP requests
    """
    request_count = contract.functions.requestCounter().call()
    pending_requests = []
    
    for i in range(request_count):
        request = get_ip_request(i)
        if request['status'] == RequestStatus.PENDING.name:
            request['id'] = i
            pending_requests.append(request)
    
    return pending_requests

# Function to get all NFTs owned by an address
def get_owned_nfts(owner_address):
    """
    Get all NFTs owned by an address
    """
    token_count = contract.functions.tokenCounter().call()
    owned_tokens = []
    
    for i in range(token_count):
        try:
            owner = contract.functions.ownerOf(i).call()
            if owner.lower() == owner_address.lower():
                token_uri = contract.functions.tokenURI(i).call()
                details = get_ip_details(i)
                
                # Try to parse metadata
                try:
                    metadata = json.loads(token_uri)
                except:
                    metadata = {
                        'title': f'Patent #{i}',
                        'description': 'No description available'
                    }
                
                owned_tokens.append({
                    'tokenId': i,
                    'tokenURI': token_uri,
                    'metadata': metadata,
                    'details': details
                })
        except:
            # Token might not exist or have been burned
            continue
    
    return owned_tokens

# Function to extend IP duration
def extend_ip_duration(token_id, additional_time_days, payment_amount, owner_address):
    """
    Extend the duration of an IP NFT
    """
    nonce = w3.eth.get_transaction_count(owner_address)
    
    # Convert days to seconds
    additional_time = additional_time_days * 24 * 60 * 60
    
    # Convert payment amount to Wei
    payment_wei = w3.to_wei(payment_amount, 'ether')
    
    txn = contract.functions.extendIPDuration(token_id, additional_time).build_transaction({
        'from': owner_address,
        'value': payment_wei,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return tx_receipt.status

# Function to check if an IP has expired
def check_ip_expiry(token_id):
    """
    Check if an IP NFT has expired
    """
    nonce = w3.eth.get_transaction_count(public_address)
    
    txn = contract.functions.checkIPExpiry(token_id).build_transaction({
        'from': public_address,
        'nonce': nonce,
        'gas': 500000,
        'gasPrice': w3.to_wei('20', 'gwei')
    })
    
    signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return tx_receipt.status

# Function to search patents
def search_patents(query):
    """
    Search for patents based on a query
    """
    token_count = contract.functions.tokenCounter().call()
    results = []
    
    for i in range(token_count):
        try:
            # Get token URI (metadata)
            token_uri = contract.functions.tokenURI(i).call()
            
            # Try to parse metadata
            try:
                metadata = json.loads(token_uri)
                title = metadata.get('title', f'Patent #{i}')
                description = metadata.get('description', '')
                
                # Simple search in title and description
                if (query.lower() in title.lower() or 
                    query.lower() in description.lower()):
                    
                    # Get owner
                    owner = contract.functions.ownerOf(i).call()
                    
                    # Get details
                    details = get_ip_details(i)
                    
                    results.append({
                        'tokenId': i,
                        'title': title,
                        'description': description,
                        'owner': owner,
                        'details': details
                    })
            except:
                # Skip if metadata can't be parsed
                continue
        except:
            # Skip if token doesn't exist
            continue
    
    return results