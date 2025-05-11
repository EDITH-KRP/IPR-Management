import os
import json
from datetime import datetime

# Simple file-based storage for demonstration
# In a production app, use a proper database like SQLite, PostgreSQL, etc.
PATENTS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data/patents.json')

# Ensure data directory exists
os.makedirs(os.path.dirname(PATENTS_FILE), exist_ok=True)

class Patent:
    """Patent model for local storage of patent metadata"""
    
    def __init__(self, id=None, title=None, description=None, category=None, 
                 owner_id=None, token_id=None, cid=None, tx_hash=None, duration=10,
                 for_sale=False, min_bid=0, sale_tx_hash=None):
        self.id = id or str(datetime.now().timestamp())
        self.title = title
        self.description = description
        self.category = category
        self.owner_id = owner_id
        self.token_id = token_id
        self.cid = cid
        self.tx_hash = tx_hash
        self.duration = duration
        self.created_at = datetime.now().isoformat()
        self.for_sale = for_sale
        self.min_bid = min_bid
        self.sale_tx_hash = sale_tx_hash
    
    def save(self):
        """Save patent to storage"""
        patents = Patent.get_all_patents()
        
        # Add or update patent
        patents[self.id] = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'owner_id': self.owner_id,
            'token_id': self.token_id,
            'cid': self.cid,
            'tx_hash': self.tx_hash,
            'duration': self.duration,
            'created_at': self.created_at,
            'for_sale': self.for_sale,
            'min_bid': self.min_bid,
            'sale_tx_hash': self.sale_tx_hash
        }
        
        # Write to file
        with open(PATENTS_FILE, 'w') as f:
            json.dump(patents, f, indent=2)
    
    def update_sale_status(self, for_sale, min_bid, sale_tx_hash):
        """Update sale status of patent"""
        self.for_sale = for_sale
        self.min_bid = min_bid
        self.sale_tx_hash = sale_tx_hash
        self.save()
    
    def update_owner(self, new_owner_id):
        """Update owner of patent"""
        self.owner_id = new_owner_id
        self.for_sale = False
        self.min_bid = 0
        self.sale_tx_hash = None
        self.save()
    
    @staticmethod
    def get_all_patents():
        """Get all patents from storage"""
        if not os.path.exists(PATENTS_FILE):
            return {}
        
        try:
            with open(PATENTS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    
    @staticmethod
    def find_by_id(patent_id):
        """Find patent by ID"""
        patents = Patent.get_all_patents()
        patent_data = patents.get(patent_id)
        
        if not patent_data:
            return None
        
        return Patent(**patent_data)
    
    @staticmethod
    def find_by_token_id(token_id):
        """Find patent by token ID"""
        patents = Patent.get_all_patents()
        
        for patent_id, patent_data in patents.items():
            if patent_data['token_id'] == int(token_id):
                return Patent(**patent_data)
        
        return None
    
    @staticmethod
    def find_by_owner(owner_id):
        """Find patents by owner ID"""
        patents = Patent.get_all_patents()
        owner_patents = []
        
        for patent_id, patent_data in patents.items():
            if patent_data['owner_id'] == owner_id:
                owner_patents.append(Patent(**patent_data))
        
        return owner_patents
    
    @staticmethod
    def search(query):
        """Search patents by title or description"""
        patents = Patent.get_all_patents()
        results = []
        
        query = query.lower()
        for patent_id, patent_data in patents.items():
            if (query in patent_data['title'].lower() or 
                query in patent_data['description'].lower() or
                query in patent_data['category'].lower()):
                results.append(Patent(**patent_data))
        
        return results