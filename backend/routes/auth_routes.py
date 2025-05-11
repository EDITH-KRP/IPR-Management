from flask import Blueprint, render_template, redirect, url_for, flash, request, session, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models.user_model import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    """User registration route"""
    if request.method == 'POST':
        # Handle both form data and JSON data
        if request.is_json:
            data = request.json
            name = data.get('name')
            email = data.get('email')
            wallet_address = data.get('wallet_address')
            password = data.get('password')
        else:
            name = request.form.get('name')
            email = request.form.get('email')
            wallet_address = request.form.get('wallet_address')
            password = request.form.get('password')
        
        # Validate inputs
        if not name or not email or not wallet_address or not password:
            if request.is_json:
                return jsonify({'error': 'All fields are required'}), 400
            flash('All fields are required', 'error')
            return render_template('register.html')
        
        # Check if user already exists
        if User.find_by_email(email):
            if request.is_json:
                return jsonify({'error': 'Email already registered'}), 400
            flash('Email already registered', 'error')
            return render_template('register.html')
        
        if User.find_by_wallet(wallet_address):
            if request.is_json:
                return jsonify({'error': 'Wallet address already registered'}), 400
            flash('Wallet address already registered', 'error')
            return render_template('register.html')
        
        # Create new user
        new_user = User(
            name=name,
            email=email,
            wallet_address=wallet_address,
            password_hash=generate_password_hash(password)
        )
        new_user.save()
        
        # Log in the new user
        login_user(new_user)
        
        if request.is_json:
            return jsonify({
                'message': 'Registration successful!',
                'user': {
                    'id': new_user.id,
                    'name': new_user.name,
                    'email': new_user.email,
                    'wallet_address': new_user.wallet_address
                }
            }), 201
        
        flash('Registration successful!', 'success')
        return redirect(url_for('index'))
    
    return render_template('register.html')

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    """User login route"""
    if request.method == 'POST':
        # Handle both form data and JSON data
        if request.is_json:
            data = request.json
            email = data.get('email')
            password = data.get('password')
        else:
            email = request.form.get('email')
            password = request.form.get('password')
        
        # Find user by email
        user = User.find_by_email(email)
        
        if not user or not check_password_hash(user.password_hash, password):
            if request.is_json:
                return jsonify({'error': 'Invalid email or password'}), 401
            flash('Please check your login details and try again.', 'error')
            return render_template('login.html')
        
        # Log in user
        login_user(user)
        
        if request.is_json:
            return jsonify({
                'message': 'Login successful!',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'wallet_address': user.wallet_address
                }
            })
        
        flash('Login successful!', 'success')
        return redirect(url_for('index'))
    
    return render_template('login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    """User logout route"""
    logout_user()
    
    # Check if the request is from API
    if request.headers.get('Accept') == 'application/json':
        return jsonify({'message': 'You have been logged out.'})
    
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@auth_bp.route('/profile')
@login_required
def profile():
    """User profile/dashboard route"""
    # Check if the request is from API
    if request.headers.get('Accept') == 'application/json':
        return jsonify({
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'wallet_address': current_user.wallet_address
            }
        })
    
    return render_template('profile.html')