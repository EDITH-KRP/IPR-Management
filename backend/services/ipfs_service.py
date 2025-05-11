import os
import json
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Filebase configuration
FILEBASE_API_KEY = os.getenv('FILEBASE_API_KEY')
FILEBASE_API_SECRET = os.getenv('FILEBASE_API_SECRET')
FILEBASE_ENDPOINT = os.getenv('FILEBASE_ENDPOINT', 'https://api.filebase.io/v1/ipfs')

def upload_to_ipfs(file_path=None, json_data=None):
    """
    Upload a file or JSON data to IPFS via Filebase
    
    Args:
        file_path (str, optional): Path to file to upload
        json_data (dict, optional): JSON data to upload
        
    Returns:
        str: IPFS CID of the uploaded content
    """
    headers = {
        'Authorization': f'Bearer {FILEBASE_API_KEY}'
    }
    
    if file_path and os.path.exists(file_path):
        # Upload file
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                FILEBASE_ENDPOINT,
                headers=headers,
                files=files
            )
    elif json_data:
        # Upload JSON data
        json_str = json.dumps(json_data)
        files = {'file': ('metadata.json', json_str)}
        response = requests.post(
            FILEBASE_ENDPOINT,
            headers=headers,
            files=files
        )
    else:
        raise ValueError("Either file_path or json_data must be provided")
    
    if response.status_code != 200:
        raise Exception(f"IPFS upload failed: {response.text}")
    
    # Extract CID from response
    result = response.json()
    return result.get('cid')

def get_from_ipfs(cid):
    """
    Retrieve content from IPFS via Filebase gateway
    
    Args:
        cid (str): IPFS CID to retrieve
        
    Returns:
        dict or bytes: Content from IPFS (parsed as JSON if possible)
    """
    gateway_url = f"https://{cid}.ipfs.dweb.link"
    response = requests.get(gateway_url)
    
    if response.status_code != 200:
        raise Exception(f"Failed to retrieve from IPFS: {response.text}")
    
    # Try to parse as JSON, otherwise return raw content
    try:
        return response.json()
    except:
        return response.content