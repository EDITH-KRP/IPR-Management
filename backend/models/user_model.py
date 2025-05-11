import os
import json
from flask_login import UserMixin
from datetime import datetime

# Simple file-based storage for demonstration
# In a production app, use a proper database like SQLite, PostgreSQL, etc.
USERS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data/users.json')

# Ensure data directory exists
os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)

class User(UserMixin):
    """User model for authentication and profile management"""
    
    def __init__(self, id=None, name=None, email=None, wallet_address=None, password_hash=None):
        self.id = id or str(datetime.now().timestamp())
        self.name = name
        self.email = email
        self.wallet_address = wallet_address
        self.password_hash = password_hash
        self.created_at = datetime.now().isoformat()
    
    def save(self):
        """Save user to storage"""
        users = User.get_all_users()
        
        # Add or update user
        users[self.id] = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'wallet_address': self.wallet_address,
            'password_hash': self.password_hash,
            'created_at': self.created_at
        }
        
        # Write to file
        with open(USERS_FILE, 'w') as f:
            json.dump(users, f, indent=2)
    
    @staticmethod
    def get_all_users():
        """Get all users from storage"""
        if not os.path.exists(USERS_FILE):
            return {}
        
        try:
            with open(USERS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        users = User.get_all_users()
        user_data = users.get(user_id)
        
        if not user_data:
            return None
        
        return User(
            id=user_data['id'],
            name=user_data['name'],
            email=user_data['email'],
            wallet_address=user_data['wallet_address'],
            password_hash=user_data['password_hash']
        )
    
    @staticmethod
    def get_by_id(user_id):
        """Get user by ID - alias for find_by_id for Flask-Login"""
        return User.find_by_id(user_id)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        users = User.get_all_users()
        
        for user_id, user_data in users.items():
            if user_data['email'] == email:
                return User(
                    id=user_data['id'],
                    name=user_data['name'],
                    email=user_data['email'],
                    wallet_address=user_data['wallet_address'],
                    password_hash=user_data['password_hash']
                )
        
        return None
    
    @staticmethod
    def find_by_wallet(wallet_address):
        """Find user by wallet address"""
        users = User.get_all_users()
        
        for user_id, user_data in users.items():
            if user_data['wallet_address'] == wallet_address:
                return User(
                    id=user_data['id'],
                    name=user_data['name'],
                    email=user_data['email'],
                    wallet_address=user_data['wallet_address'],
                    password_hash=user_data['password_hash']
                )
        
        return None