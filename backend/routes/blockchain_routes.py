from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from services.blockchain_service import get_contract_balance, get_transaction_status

blockchain_bp = Blueprint('blockchain', __name__, url_prefix='/api/blockchain')

@blockchain_bp.route('/transaction/<tx_hash>')
def get_transaction(tx_hash):
    """Get transaction details"""
    status = get_transaction_status(tx_hash)
    return jsonify(status)

@blockchain_bp.route('/contract/balance')
def contract_balance():
    """Get contract balance"""
    balance = get_contract_balance()
    return jsonify({"balance": balance})

@blockchain_bp.route('/verify-signature', methods=['POST'])
def verify_signature():
    """Verify a wallet signature"""
    data = request.json
    message = data.get('message')
    signature = data.get('signature')
    address = data.get('address')
    
    # Verify the signature using web3
    from services.blockchain_service import verify_signature
    is_valid = verify_signature(message, signature, address)
    
    return jsonify({"valid": is_valid})