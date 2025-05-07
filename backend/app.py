from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
import os
import json
from web3_connection import (
    upload_to_ipfs, request_ip_ownership, verify_ip_request, register_patent,
    list_ip_for_sale, place_bid, accept_bid, get_bids_for_ip, get_ip_details,
    get_ip_request, get_pending_requests, get_owned_nfts, extend_ip_duration,
    check_ip_expiry, search_patents, TEST_MODE, public_address
)
from auth import login_user, register_user, logout_user, update_user_wallet, get_user_by_username, create_user, verify_user, init_db
import sqlite3
from datetime import datetime
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

load_dotenv()

# Initialize the database if it doesn't exist
init_db()

app = Flask(
    __name__,
    template_folder='../frontend/templates',
    static_folder='../frontend/static'
)

app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev_key_for_testing_only")

# Routes
@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        if verify_user(username, password):
            session['username'] = username
            user = get_user_by_username(username)
            if user and user['wallet_address']:
                session['wallet_address'] = user['wallet_address']
            
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password', 'error')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        wallet_address = request.form.get('wallet_address', '')
        
        try:
            create_user(username, password, email, wallet_address)
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            flash(f'Error creating account: {str(e)}', 'error')
    
    return render_template('signup.html')

@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        flash('Please log in to access the dashboard', 'error')
        return redirect(url_for('login'))
    
    wallet_address = session.get('wallet_address', '')
    owned_nfts = []
    
    if wallet_address:
        try:
            owned_nfts = get_owned_nfts(wallet_address)
        except Exception as e:
            flash(f'Error fetching NFTs: {str(e)}', 'error')
    
    return render_template('dashboard.html', owned_nfts=owned_nfts, wallet_address=wallet_address)

@app.route('/update_wallet', methods=['POST'])
def update_wallet():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    wallet_address = request.form.get('wallet_address', '')
    
    if not wallet_address:
        return jsonify({'success': False, 'message': 'No wallet address provided'}), 400
    
    try:
        success, message = update_user_wallet(session['username'], wallet_address)
        if success:
            return jsonify({'success': True, 'message': 'Wallet address updated'})
        else:
            return jsonify({'success': False, 'message': message}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/request_form')
def request_form():
    if 'username' not in session or 'wallet_address' not in session:
        flash('Please log in and connect your wallet', 'error')
        return redirect(url_for('login'))
    
    return render_template('request_form.html', wallet_address=session['wallet_address'])

@app.route('/submit_request', methods=['POST'])
def submit_request():
    if 'username' not in session or 'wallet_address' not in session:
        return jsonify({'success': False, 'message': 'Not logged in or wallet not connected'}), 401
    
    try:
        title = request.form['title']
        description = request.form['description']
        inventor = request.form['inventor']
        date = request.form['date']
        deposit = float(request.form['deposit'])
        
        # Create metadata
        metadata = {
            'title': title,
            'description': description,
            'inventor': inventor,
            'date': date,
            'requester': session['username'],
            'wallet': session['wallet_address'],
            'timestamp': datetime.now().isoformat()
        }
        
        # Upload to IPFS
        metadata_uri = upload_to_ipfs(metadata)
        
        # Submit request to blockchain
        request_id = request_ip_ownership(session['wallet_address'], metadata_uri, deposit)
        
        return jsonify({
            'success': True, 
            'message': 'Request submitted successfully',
            'request_id': request_id,
            'metadata_uri': metadata_uri
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/admin_verify')
def admin_verify():
    if 'username' not in session:
        flash('Please log in to access admin features', 'error')
        return redirect(url_for('login'))
    
    # In a real app, you'd check if the user has admin privileges
    
    try:
        pending_requests = get_pending_requests()
        return render_template('admin_verify.html', pending_requests=pending_requests)
    except Exception as e:
        flash(f'Error fetching pending requests: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/verify_request', methods=['POST'])
def verify_request():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'}), 401
    
    # In a real app, you'd check if the user has admin privileges
    
    try:
        request_id = int(request.form['request_id'])
        approved = request.form.get('approved') == 'true'
        
        result = verify_ip_request(request_id, approved)
        
        if approved:
            return jsonify({
                'success': True, 
                'message': 'Request approved and NFT minted',
                'token_id': result
            })
        else:
            return jsonify({
                'success': True, 
                'message': 'Request rejected'
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/register_patent/<int:token_id>')
def register_patent_form(token_id):
    if 'username' not in session or 'wallet_address' not in session:
        flash('Please log in and connect your wallet', 'error')
        return redirect(url_for('login'))
    
    try:
        details = get_ip_details(token_id)
        return render_template('register_form.html', token_id=token_id, details=details)
    except Exception as e:
        flash(f'Error fetching IP details: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/submit_registration', methods=['POST'])
def submit_registration():
    if 'username' not in session or 'wallet_address' not in session:
        return jsonify({'success': False, 'message': 'Not logged in or wallet not connected'}), 401
    
    try:
        token_id = int(request.form['token_id'])
        
        # Register patent on blockchain
        result = register_patent(token_id, session['wallet_address'])
        
        if result['status'] == 1:
            return jsonify({
                'success': True, 
                'message': 'Patent registered successfully',
                'transaction_hash': result['transaction_hash']
            })
        else:
            return jsonify({'success': False, 'message': 'Transaction failed'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/marketplace')
def marketplace():
    try:
        # In a real app, you'd query all NFTs for sale
        # For now, just show a sample
        nfts_for_sale = []
        
        return render_template('marketplace.html', nfts_for_sale=nfts_for_sale)
    except Exception as e:
        flash(f'Error fetching marketplace data: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/list_for_sale/<int:token_id>')
def list_for_sale_form(token_id):
    if 'username' not in session or 'wallet_address' not in session:
        flash('Please log in and connect your wallet', 'error')
        return redirect(url_for('login'))
    
    try:
        details = get_ip_details(token_id)
        return render_template('list_for_sale.html', token_id=token_id, details=details)
    except Exception as e:
        flash(f'Error fetching IP details: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/submit_listing', methods=['POST'])
def submit_listing():
    if 'username' not in session or 'wallet_address' not in session:
        return jsonify({'success': False, 'message': 'Not logged in or wallet not connected'}), 401
    
    try:
        token_id = int(request.form['token_id'])
        price = float(request.form['price'])
        
        # List NFT for sale on blockchain
        status = list_ip_for_sale(token_id, price, session['wallet_address'])
        
        if status == 1:
            return jsonify({
                'success': True, 
                'message': 'NFT listed for sale successfully'
            })
        else:
            return jsonify({'success': False, 'message': 'Transaction failed'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/place_bid/<int:token_id>')
def place_bid_form(token_id):
    if 'username' not in session or 'wallet_address' not in session:
        flash('Please log in and connect your wallet', 'error')
        return redirect(url_for('login'))
    
    try:
        details = get_ip_details(token_id)
        return render_template('place_bid.html', token_id=token_id, details=details)
    except Exception as e:
        flash(f'Error fetching IP details: {str(e)}', 'error')
        return redirect(url_for('marketplace'))

@app.route('/submit_bid', methods=['POST'])
def submit_bid():
    if 'username' not in session or 'wallet_address' not in session:
        return jsonify({'success': False, 'message': 'Not logged in or wallet not connected'}), 401
    
    try:
        token_id = int(request.form['token_id'])
        bid_amount = float(request.form['bid_amount'])
        
        # Place bid on blockchain
        status = place_bid(token_id, bid_amount, session['wallet_address'])
        
        if status == 1:
            return jsonify({
                'success': True, 
                'message': 'Bid placed successfully'
            })
        else:
            return jsonify({'success': False, 'message': 'Transaction failed'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/view_bids/<int:token_id>')
def view_bids(token_id):
    if 'username' not in session:
        flash('Please log in to view bids', 'error')
        return redirect(url_for('login'))
    
    try:
        bids = get_bids_for_ip(token_id)
        details = get_ip_details(token_id)
        
        return render_template('view_bids.html', token_id=token_id, bids=bids, details=details)
    except Exception as e:
        flash(f'Error fetching bids: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/accept_bid', methods=['POST'])
def accept_bid_route():
    if 'username' not in session or 'wallet_address' not in session:
        return jsonify({'success': False, 'message': 'Not logged in or wallet not connected'}), 401
    
    try:
        token_id = int(request.form['token_id'])
        bid_index = int(request.form['bid_index'])
        
        # Accept bid on blockchain
        status = accept_bid(token_id, bid_index, session['wallet_address'])
        
        if status == 1:
            return jsonify({
                'success': True, 
                'message': 'Bid accepted successfully'
            })
        else:
            return jsonify({'success': False, 'message': 'Transaction failed'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/ip_details/<int:token_id>')
def ip_details(token_id):
    try:
        details = get_ip_details(token_id)
        # In a real app, you'd fetch more data about the IP
        
        return render_template('ip_details.html', token_id=token_id, details=details)
    except Exception as e:
        flash(f'Error fetching IP details: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/search', methods=['GET', 'POST'])
def search():
    if request.method == 'POST':
        query = request.form['query']
        try:
            results = search_patents(query)
            return render_template('search_results.html', results=results, query=query)
        except Exception as e:
            flash(f'Error searching patents: {str(e)}', 'error')
            return redirect(url_for('dashboard'))
    
    return render_template('search.html')

@app.route('/extend_duration/<int:token_id>')
def extend_duration_form(token_id):
    if 'username' not in session or 'wallet_address' not in session:
        flash('Please log in and connect your wallet', 'error')
        return redirect(url_for('login'))
    
    try:
        details = get_ip_details(token_id)
        return render_template('extend_duration.html', token_id=token_id, details=details)
    except Exception as e:
        flash(f'Error fetching IP details: {str(e)}', 'error')
        return redirect(url_for('dashboard'))

@app.route('/submit_extension', methods=['POST'])
def submit_extension():
    if 'username' not in session or 'wallet_address' not in session:
        return jsonify({'success': False, 'message': 'Not logged in or wallet not connected'}), 401
    
    try:
        token_id = int(request.form['token_id'])
        days = int(request.form['days'])
        payment = float(request.form['payment'])
        
        # Extend duration on blockchain
        status = extend_ip_duration(token_id, days, payment, session['wallet_address'])
        
        if status == 1:
            return jsonify({
                'success': True, 
                'message': 'Duration extended successfully'
            })
        else:
            return jsonify({'success': False, 'message': 'Transaction failed'}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/check_expiry/<int:token_id>')
def check_expiry(token_id):
    try:
        status = check_ip_expiry(token_id)
        
        if status == 1:
            return jsonify({
                'success': True, 
                'message': 'IP is still valid'
            })
        else:
            return jsonify({
                'success': True, 
                'message': 'IP has expired'
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/test')
def test():
    return render_template('test.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')