# IP-NFT DApp

A decentralized application for registering and trading intellectual property as NFTs.

## Overview

This platform allows users to:
- Register intellectual property as NFTs on Ethereum
- Store patent metadata on IPFS via Filebase
- List patents for sale and accept bids
- Search and browse registered patents

## Project Structure

- `backend/`: Flask backend for handling user authentication, IP registration, and blockchain interactions
- `contracts/`: Solidity smart contracts for the IP-NFT system
- `frontend/`: Optional standalone frontend (if not using Flask templates)

## Setup Instructions

1. Install dependencies:
   ```
   cd backend
   pip install -r requirements.txt
   ```

2. Configure environment variables:
   - Create a `.env` file in the `backend/` directory
   - Add your Alchemy API key, Filebase credentials, and other configuration

3. Deploy smart contract:
   ```
   cd contracts
   python deploy.py
   ```

4. Run the application:
   ```
   cd backend
   python app.py
   ```

## Workflow

1. User Onboarding: Sign up/login with email and wallet address
2. Homepage: View all registered IP NFTs
3. IP Registration: Upload metadata and mint NFT
4. Patent Search: Find patents by title or keyword
5. Trading: List patents for sale, place bids, and transfer ownership
6. User Dashboard: View owned patents, bids, and transaction history