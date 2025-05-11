from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import os
import json
import uuid
from datetime import datetime

from services.ipfs_service import upload_to_ipfs, get_from_ipfs
from services.blockchain_service import register_patent, get_all_patents, get_patent_details
from models.patent_model import Patent

ip_bp = Blueprint('ip', __name__, url_prefix='/api/ip')

@ip_bp.route('/register', methods=['GET', 'POST'])
@login_required
def register_ip():
    """Route for registering new intellectual property"""
    if request.method == 'POST':
        # Get form data
        title = request.form.get('title')
        description = request.form.get('description')
        category = request.form.get('category')
        duration = request.form.get('duration', 10)  # Default 10 years
        
        # Validate inputs
        if not title or not description or not category:
            flash('Title, description, and category are required', 'error')
            return render_template('register_patent.html')
        
        # Handle file upload if provided
        file_path = None
        if 'file' in request.files:
            file = request.files['file']
            if file.filename:
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
                file.save(file_path)
        
        # Create metadata JSON
        metadata = {
            "title": title,
            "description": description,
            "category": category,
            "duration": int(duration),
            "creator": current_user.wallet_address,
            "createdAt": datetime.now().isoformat(),
        }
        
        # Upload file to IPFS if exists
        if file_path:
            file_cid = upload_to_ipfs(file_path)
            metadata["file_cid"] = file_cid
        
        # Upload metadata to IPFS
        metadata_cid = upload_to_ipfs(json_data=metadata)
        
        # Register patent on blockchain
        tx_hash, token_id = register_patent(
            wallet_address=current_user.wallet_address,
            cid=metadata_cid
        )
        
        # Store in local database
        patent = Patent(
            title=title,
            description=description,
            category=category,
            owner_id=current_user.id,
            token_id=token_id,
            cid=metadata_cid,
            tx_hash=tx_hash,
            duration=int(duration)
        )
        patent.save()
        
        flash('Patent registered successfully!', 'success')
        return redirect(url_for('ip.view_patent', token_id=token_id))
    
    return render_template('register_patent.html')

@ip_bp.route('/patents')
def list_patents():
    """Route to list all patents"""
    patents = get_all_patents()
    return render_template('patents.html', patents=patents)

@ip_bp.route('/patent/<token_id>')
def view_patent(token_id):
    """Route to view a specific patent"""
    patent_details = get_patent_details(token_id)
    
    # Get metadata from IPFS
    metadata = get_from_ipfs(patent_details['cid'])
    
    return render_template('patent_details.html', 
                          patent=patent_details,
                          metadata=metadata)

@ip_bp.route('/search')
def search_patents():
    """Route to search patents"""
    query = request.args.get('q', '')
    if not query:
        return render_template('search.html', patents=[])
    
    # Search in local database
    patents = Patent.search(query)
    
    return render_template('search.html', patents=patents, query=query)

@ip_bp.route('/list-for-sale/<token_id>', methods=['GET', 'POST'])
@login_required
def list_for_sale(token_id):
    """Route to list a patent for sale"""
    # Verify ownership
    patent = Patent.find_by_token_id(token_id)
    if not patent or patent.owner_id != current_user.id:
        flash('You do not own this patent', 'error')
        return redirect(url_for('ip.view_patent', token_id=token_id))
    
    if request.method == 'POST':
        min_bid = request.form.get('min_bid')
        duration = request.form.get('duration', 30)  # Default 30 days
        
        # Call blockchain service to list for sale
        tx_hash = blockchain_service.list_for_sale(
            wallet_address=current_user.wallet_address,
            token_id=token_id,
            min_bid=min_bid,
            duration=duration
        )
        
        # Update patent status in database
        patent.update_sale_status(True, min_bid, tx_hash)
        
        flash('Patent listed for sale successfully!', 'success')
        return redirect(url_for('ip.view_patent', token_id=token_id))
    
    return render_template('list_for_sale.html', patent=patent)

@ip_bp.route('/place-bid/<token_id>', methods=['POST'])
@login_required
def place_bid(token_id):
    """Route to place a bid on a patent"""
    bid_amount = request.form.get('bid_amount')
    
    # Call blockchain service to place bid
    tx_hash = blockchain_service.place_bid(
        wallet_address=current_user.wallet_address,
        token_id=token_id,
        bid_amount=bid_amount
    )
    
    flash('Bid placed successfully!', 'success')
    return redirect(url_for('ip.view_patent', token_id=token_id))

@ip_bp.route('/accept-bid/<token_id>/<bidder_address>', methods=['POST'])
@login_required
def accept_bid(token_id, bidder_address):
    """Route to accept a bid on a patent"""
    # Verify ownership
    patent = Patent.find_by_token_id(token_id)
    if not patent or patent.owner_id != current_user.id:
        flash('You do not own this patent', 'error')
        return redirect(url_for('ip.view_patent', token_id=token_id))
    
    # Call blockchain service to accept bid
    tx_hash = blockchain_service.accept_bid(
        wallet_address=current_user.wallet_address,
        token_id=token_id,
        bidder_address=bidder_address
    )
    
    # Update patent ownership in database
    # This would typically be done via an event listener
    # but for simplicity we'll do it here
    patent.update_owner(bidder_address)
    
    flash('Bid accepted successfully! Ownership transferred.', 'success')
    return redirect(url_for('ip.view_patent', token_id=token_id))