// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title IPNFT
 * @dev Contract for registering intellectual property as NFTs
 */
contract IPNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Platform fee percentage (2%)
    uint256 public constant PLATFORM_FEE = 200; // 2% (in basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Patent struct to store metadata
    struct Patent {
        address owner;
        string cid;
        uint256 registrationTime;
    }
    
    // Sale struct to store sale details
    struct Sale {
        bool isForSale;
        uint256 minBid;
        uint256 endTime;
        mapping(address => uint256) bids;
        address highestBidder;
        uint256 highestBid;
    }
    
    // Mapping from token ID to Patent
    mapping(uint256 => Patent) private _patents;
    
    // Mapping from token ID to Sale
    mapping(uint256 => Sale) private _sales;
    
    // Events
    event PatentRegistered(uint256 indexed tokenId, address indexed owner, string cid);
    event PatentListedForSale(uint256 indexed tokenId, uint256 minBid, uint256 endTime);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event BidAccepted(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 amount);
    
    /**
     * @dev Constructor
     */
    constructor() ERC721("Intellectual Property NFT", "IPNFT") {}
    
    /**
     * @dev Register a new patent
     * @param cid IPFS CID of the patent metadata
     * @return tokenId of the newly minted NFT
     */
    function registerPatent(string memory cid) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, cid);
        
        _patents[newTokenId] = Patent({
            owner: msg.sender,
            cid: cid,
            registrationTime: block.timestamp
        });
        
        emit PatentRegistered(newTokenId, msg.sender, cid);
        
        return newTokenId;
    }
    
    /**
     * @dev Get patent details
     * @param tokenId Token ID of the patent
     * @return owner, cid, registrationTime
     */
    function getPatent(uint256 tokenId) public view returns (address, string memory, uint256) {
        require(_exists(tokenId), "Patent does not exist");
        Patent memory patent = _patents[tokenId];
        return (patent.owner, patent.cid, patent.registrationTime);
    }
    
    /**
     * @dev List a patent for sale
     * @param tokenId Token ID of the patent
     * @param minBid Minimum bid amount
     * @param duration Duration of the sale in seconds
     */
    function listForSale(uint256 tokenId, uint256 minBid, uint256 duration) public {
        require(_exists(tokenId), "Patent does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(minBid > 0, "Minimum bid must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        Sale storage sale = _sales[tokenId];
        sale.isForSale = true;
        sale.minBid = minBid;
        sale.endTime = block.timestamp + duration;
        sale.highestBid = 0;
        sale.highestBidder = address(0);
        
        emit PatentListedForSale(tokenId, minBid, sale.endTime);
    }
    
    /**
     * @dev Get sale details
     * @param tokenId Token ID of the patent
     * @return isForSale, minBid, endTime
     */
    function getSaleDetails(uint256 tokenId) public view returns (bool, uint256, uint256) {
        require(_exists(tokenId), "Patent does not exist");
        Sale storage sale = _sales[tokenId];
        return (sale.isForSale, sale.minBid, sale.endTime);
    }
    
    /**
     * @dev Place a bid on a patent
     * @param tokenId Token ID of the patent
     */
    function placeBid(uint256 tokenId) public payable {
        require(_exists(tokenId), "Patent does not exist");
        Sale storage sale = _sales[tokenId];
        require(sale.isForSale, "Not for sale");
        require(block.timestamp < sale.endTime, "Sale ended");
        require(msg.value >= sale.minBid, "Bid too low");
        require(msg.value > sale.highestBid, "Bid not high enough");
        
        // Refund previous highest bidder
        if (sale.highestBidder != address(0)) {
            payable(sale.highestBidder).transfer(sale.highestBid);
        }
        
        // Update bid
        sale.bids[msg.sender] = msg.value;
        sale.highestBidder = msg.sender;
        sale.highestBid = msg.value;
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }
    
    /**
     * @dev Get highest bid for a patent
     * @param tokenId Token ID of the patent
     * @return highestBidder, highestBid
     */
    function getHighestBid(uint256 tokenId) public view returns (address, uint256) {
        require(_exists(tokenId), "Patent does not exist");
        Sale storage sale = _sales[tokenId];
        return (sale.highestBidder, sale.highestBid);
    }
    
    /**
     * @dev Accept a bid on a patent
     * @param tokenId Token ID of the patent
     * @param bidder Address of the bidder
     */
    function acceptBid(uint256 tokenId, address bidder) public {
        require(_exists(tokenId), "Patent does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        Sale storage sale = _sales[tokenId];
        require(sale.isForSale, "Not for sale");
        require(sale.bids[bidder] > 0, "No bid from this address");
        
        uint256 bidAmount = sale.bids[bidder];
        address seller = msg.sender;
        
        // Calculate platform fee
        uint256 platformFee = (bidAmount * PLATFORM_FEE) / BASIS_POINTS;
        uint256 sellerAmount = bidAmount - platformFee;
        
        // Transfer NFT to buyer
        _transfer(seller, bidder, tokenId);
        
        // Update patent owner
        _patents[tokenId].owner = bidder;
        
        // Reset sale
        sale.isForSale = false;
        sale.minBid = 0;
        sale.endTime = 0;
        sale.highestBid = 0;
        sale.highestBidder = address(0);
        
        // Transfer funds to seller
        payable(seller).transfer(sellerAmount);
        
        emit BidAccepted(tokenId, seller, bidder, bidAmount);
    }
    
    /**
     * @dev Withdraw platform fees
     * @param amount Amount to withdraw
     */
    function withdrawFees(uint256 amount) public onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Get contract balance
     * @return Contract balance
     */
    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}