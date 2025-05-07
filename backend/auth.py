import os
from flask import session, flash, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import json
from datetime import datetime

# Create a database for user authentication
def init_db():
    """Initialize the SQLite database for user authentication"""
    conn = sqlite3.connect('../users.db')
    cursor = conn.cursor()
    
    # Create users table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        wallet_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def register_user(email, password, first_name, last_name, wallet_address=None):
    """Register a new user"""
    try:
        conn = sqlite3.connect('../users.db')
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return False, "Email already registered"
        
        # Hash the password
        password_hash = generate_password_hash(password)
        
        # Insert new user
        cursor.execute(
            "INSERT INTO users (email, password_hash, first_name, last_name, wallet_address) VALUES (?, ?, ?, ?, ?)",
            (email, password_hash, first_name, last_name, wallet_address)
        )
        
        conn.commit()
        conn.close()
        return True, "User registered successfully"
    except Exception as e:
        return False, f"Registration error: {str(e)}"

def login_user(email, password):
    """Login a user with email and password"""
    try:
        conn = sqlite3.connect('../users.db')
        cursor = conn.cursor()
        
        # Find user by email
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        if not user:
            conn.close()
            return False, "Invalid email or password"
        
        # Check password
        if not check_password_hash(user[2], password):
            conn.close()
            return False, "Invalid email or password"
        
        # Set session data
        session['user_id'] = user[0]
        session['email'] = user[1]
        session['first_name'] = user[3]
        session['last_name'] = user[4]
        
        # If user has a wallet address, set it in session
        if user[5]:
            session['wallet_address'] = user[5]
        
        conn.close()
        return True, "Login successful"
    except Exception as e:
        return False, f"Login error: {str(e)}"

def login_with_wallet(wallet_address):
    """Login a user with wallet address"""
    try:
        conn = sqlite3.connect('../users.db')
        cursor = conn.cursor()
        
        # Find user by wallet address
        cursor.execute("SELECT * FROM users WHERE wallet_address = ?", (wallet_address,))
        user = cursor.fetchone()
        
        if not user:
            # Create a new user with just the wallet address
            cursor.execute(
                "INSERT INTO users (email, password_hash, wallet_address) VALUES (?, ?, ?)",
                (f"wallet_{wallet_address[:8]}@ipr-manager.com", generate_password_hash(wallet_address), wallet_address)
            )
            conn.commit()
            
            # Get the newly created user
            cursor.execute("SELECT * FROM users WHERE wallet_address = ?", (wallet_address,))
            user = cursor.fetchone()
        
        # Set session data
        session['user_id'] = user[0]
        session['email'] = user[1]
        session['wallet_address'] = wallet_address
        
        if user[3]:
            session['first_name'] = user[3]
        if user[4]:
            session['last_name'] = user[4]
        
        conn.close()
        return True, "Wallet login successful"
    except Exception as e:
        return False, f"Wallet login error: {str(e)}"

def logout_user():
    """Logout the current user"""
    session.clear()
    return True, "Logout successful"

def get_user_by_id(user_id):
    """Get user details by ID"""
    try:
        conn = sqlite3.connect('../users.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        
        conn.close()
        
        if not user:
            return None
        
        return {
            'id': user[0],
            'email': user[1],
            'first_name': user[3],
            'last_name': user[4],
            'wallet_address': user[5],
            'created_at': user[6]
        }
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return None

def get_user_by_username(email):
    """Get user details by email"""
    try:
        conn = sqlite3.connect('../users.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        
        conn.close()
        
        if not user:
            return None
        
        return {
            'id': user[0],
            'email': user[1],
            'first_name': user[3],
            'last_name': user[4],
            'wallet_address': user[5],
            'created_at': user[6]
        }
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return None

def update_user_wallet(username, wallet_address):
    """Update a user's wallet address by username"""
    try:
        conn = sqlite3.connect('../users.db')
        cursor = conn.cursor()
        
        cursor.execute("UPDATE users SET wallet_address = ? WHERE email = ?", (wallet_address, username))
        
        conn.commit()
        conn.close()
        
        # Update session
        session['wallet_address'] = wallet_address
        
        return True, "Wallet address updated"
    except Exception as e:
        return False, f"Error updating wallet: {str(e)}"

def create_user(username, password, email, wallet_address=None):
    """Create a new user (alias for register_user)"""
    return register_user(email, password, username, "", wallet_address)

def verify_user(username, password):
    """Verify user credentials (alias for login_user)"""
    success, _ = login_user(username, password)
    return success

def require_login(f):
    """Decorator to require login for routes"""
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def require_wallet(f):
    """Decorator to require wallet connection for routes"""
    def decorated_function(*args, **kwargs):
        if 'wallet_address' not in session:
            flash('Please connect your wallet to access this page', 'error')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    return decorated_function