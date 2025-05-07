// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract IPNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    uint256 public requestCounter;

    struct IPRequest {
        address requester;
        string metadataURI;
        uint256 depositAmount;
           requestCounter = 0;
     returns (uint256) {
        require(msg.value > 0, "Deposit required for IP request");
        
        uint256 requestId = requestCounter;
        ipRequests[requestId] = IPRequest({
            requester: msg.sender,
            metadataURI: metadataURI,
            depositAmount: msg.value,
            status: RequestStatus.PENDING,
            requestTime: block.timestamp
        });
        
        requestCounter++;
        emit IPRequestSubmitted(requestId, msg.sender);
        return requestId;
    }

    function verifyIPRequest(uint256 requestId, bool approved) public onlyOwner returns (uint256) {
        require(ipRequests[requestId].status == RequestStatus.PENDING, "Request is not pending");
        
        IPRequest storage request = ipRequests[requestId];
        request.status = approved ? RequestStatus.APPROVED : RequestStatus.REJECTED;
        
        if (approved) {
            uint256 tokenId = mintIPNFT(request.requester, request.metadataURI);
            
            // Set IP details with 1 year expiry by default
            ipDetails[tokenId] = IPDetails({
                expiryTime: block.timestamp + 365 days,
                forSale: false,
                salePrice: 0,
                originalCreator: request.requester,
                transactionHash: ""
            });
            
            emit IPRequestVerified(requestId, tokenId, true);
               requestCounter = 0;
    }

    function requestIPOwnership(string memory metadataURI) public payable returns (uint256) {
        require(msg.value > 0, "Deposit required for IP request");
        
        uint256 requestId = requestCounter;
        ipRequests[requestId] = IPRequest({
            requester: msg.sender,
            metadataURI: metadataURI,
            depositAmount: msg.value,
            status: RequestStatus.PENDING,
            requestTime: block.timestamp
        });
        
        requestCounter++;
        emit IPRequestSubmitted(requestId, msg.sender);
        return requestId;
    }

    function verifyIPRequest(uint256 requestId, bool approved) public onlyOwner returns (uint256) {
        require(ipRequests[requestId].status == RequestStatus.PENDING, "Request is not pending");
        
        IPRequest storage request = ipRequests[requestId];
        request.status = approved ? RequestStatus.APPROVED : RequestStatus.REJECTED;
        
        if (approved) {
            uint256 tokenId = mintIPNFT(request.requester, request.metadataURI);
            
            // Set IP details with 1 year expiry by default
            ipDetails[tokenId] = IPDetails({
                expiryTime: block.timestamp + 365 days,
                forSale: false,
                salePrice: 0,
                originalCreator: request.requester,
                transactionHash: ""
            });
            
            emit IPRequestVerified(requestId, tokenId, true);
            return tokenId;
        } else {
            // Refund deposit if rejected
            payable(request.requester).transfer(request.depositAmount);
            emit IPRequestVerified(requestId, 0, false);
            return 0;
        }
    }

    function registerPatent(uint256 tokenId, string memory txHash) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can register the patent");
        
        IPDetails storage details = ipDetails[tokenId];
        details.transactionHash = txHash;
        
        emit PatentRegistered(tokenId, msg.sender, txHash);
    }

    function listIPForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list for sale");
        require(ipDetails[tokenId].expiryTime > block.timestamp, "IP has expired");
        
        ipDetails[tokenId].forSale = true;
        ipDetails[tokenId].salePrice = price;
        
        emit IPListedForSale(tokenId, price);
    }

    function placeBid(uint256 tokenId) public payable {
        require(ipDetails[tokenId].forSale, "IP is not for sale");
        require(msg.value > 0, "Bid amount must be greater than 0");
        require(ipDetails[tokenId].expiryTime > block.timestamp, "IP has expired");
        require(ownerOf(tokenId) != msg.sender, "Owner cannot bid on their own IP");
        
        bidsForIP[tokenId].push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            active: true
        }));
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function acceptBid(uint256 tokenId, uint256 bidIndex) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can accept bids");
        require(bidIndex < bidsForIP[tokenId].length, "Invalid bid index");
        require(bidsForIP[tokenId][bidIndex].active, "Bid is not active");
        
        Bid storage acceptedBid = bidsForIP[tokenId][bidIndex];
        address bidder = acceptedBid.bidder;
        uint256 amount = acceptedBid.amount;
        
        // Mark bid as inactive
        acceptedBid.active = false;
        
        // Transfer NFT to bidder
        _transfer(msg.sender, bidder, tokenId);
        
        // Transfer bid amount to seller
        payable(msg.sender).transfer(amount);
        
        // Update sale status
        ipDetails[tokenId].forSale = false;
        ipDetails[tokenId].salePrice = 0;
        
        // Refund other active bids
        for (uint256 i = 0; i < bidsForIP[tokenId].length; i++) {
            if (i != bidIndex && bidsForIP[tokenId][i].active) {
                Bid storage otherBid = bidsForIP[tokenId][i];
                otherBid.active = false;
                payable(otherBid.bidder).transfer(otherBid.amount);
            }
        }
        
        emit BidAccepted(tokenId, bidder, amount);
    }

    function extendIPDuration(uint256 tokenId, uint256 additionalTime) public payable {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can extend duration");
        require(msg.value > 0, "Payment required for extension");
        
        ipDetails[tokenId].expiryTime += additionalTime;
        
        emit IPDurationExtended(tokenId, ipDetails[tokenId].expiryTime);
    }

    function checkIPExpiry(uint256 tokenId) public {
        require(ipDetails[tokenId].expiryTime <= block.timestamp, "IP has not expired yet");
        
        // Transfer expired IP to contract owner (or burn it)
        _transfer(ownerOf(tokenId), owner(), tokenId);
    }

    function getBidsForIP(uint256 tokenId) public view returns (address[] memory, uint256[] memory, bool[] memory) {
        uint256 bidCount = bidsForIP[tokenId].length;
        
        address[] memory bidders = new address[](bidCount);
        uint256[] memory amounts = new uint256[](bidCount);
        bool[] memory active = new bool[](bidCount);
        
        for (uint256 i = 0; i < bidCount; i++) {
            Bid storage bid = bidsForIP[tokenId][i];
            bidders[i] = bid.bidder;
            amounts[i] = bid.amount;
            active[i] = bid.active;
        }
        
        return (bidders, amounts, active);
    }

    function mintIPNFT(address recipient, string memory tokenURI) internal return tokenId;
        } else {
            // Refund deposit if rejected
            payable(request.requester).transfer(request.depositAmount);
            emit IPRequestVerified(requestId, 0, false);
            return 0;
        }
    }

    function registerPatent(uint256 tokenId, string memory txHash) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can register the patent");
        
        IPDetails storage details = ipDetails[tokenId];
        details.transactionHash = txHash;
        
        emit PatentRegistered(tokenId, msg.sender, txHash);
    }

    function listIPForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list for sale");
        require(ipDetails[tokenId].expiryTime > block.timestamp, "IP has expired");
        
        ipDetails[tokenId].forSale = true;
        ipDetails[tokenId].salePrice = price;
        
        emit IPListedForSale(tokenId, price);
    }

    function placeBid(uint256 tokenId) public payable {
        require(ipDetails[tokenId].forSale, "IP is not for sale");
        require(msg.value > 0, "Bid amount must be greater than 0");
        require(ipDetails[tokenId].expiryTime > block.timestamp, "IP has expired");
        require(ownerOf(tokenId) != msg.sender, "Owner cannot bid on their own IP");
        
        bidsForIP[tokenId].push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            active: true
        }));
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function acceptBid(uint256 tokenId, uint256 bidIndex) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can accept bids");
        require(bidIndex < bidsForIP[tokenId].length, "Invalid bid index");
        require(bidsForIP[tokenId][bidIndex].active, "Bid is not active");
        
        Bid storage acceptedBid = bidsForIP[tokenId][bidIndex];
        address bidder = acceptedBid.bidder;
        uint256 amount = acceptedBid.amount;
        
        // Mark bid as inactive
        acceptedBid.active = false;
        
        // Transfer NFT to bidder
        _transfer(msg.sender, bidder, tokenId);
        
        // Transfer bid amount to seller
        payable(msg.sender).transfer(amount);
        
        // Update sale status
        ipDetails[tokenId].forSale = false;
        ipDetails[tokenId].salePrice = 0;
        
        // Refund other active bids
        for (uint256 i = 0; i < bidsForIP[tokenId].length; i++) {
            if (i != bidIndex && bidsForIP[tokenId][i].active) {
                Bid storage otherBid = bidsForIP[tokenId][i];
                otherBid.active = false;
                payable(otherBid.bidder).transfer(otherBid.amount);
            }
        }
        
        emit BidAccepted(tokenId, bidder, amount);
    }

    function extendIPDuration(uint256 tokenId, uint256 additionalTime) public payable {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can extend duration");
        require(msg.value > 0, "Payment required for extension");
        
        ipDetails[tokenId].expiryTime += additionalTime;
        
        emit IPDurationExtended(tokenId, ipDetails[tokenId].expiryTime);
    }

    function checkIPExpiry(uint256 tokenId) public {
        require(ipDetails[tokenId].expiryTime <= block.timestamp, "IP has not expired yet");
        
        // Transfer expired IP to contract owner (or burn it)
        _transfer(ownerOf(tokenId), owner(), tokenId);
    }

    function getBidsForIP(uint256 tokenId) public view returns (address[] memory, uint256[] memory, bool[] memory) {
        uint256 bidCount = bidsForIP[tokenId].length;
        
        address[] memory bidders = new address[](bidCount);
        uint256[] memory amounts = new uint256[](bidCount);
        bool[] memory active = new bool[](bidCount);
        
        for (uint256 i = 0; i < bidCount; i++) {
            Bid storage bid = bidsForIP[tokenId][i];
            bidders[i] = bid.bidder;
            amounts[i] = bid.amount;
            active[i] = bid.active;
        }
        
        return (bidders, amounts, active);
    }

    function mintIPNFT(address recipient, string memory tokenURI) internal RequestStatus status;
        uint256 requestTime;
    }

    struct IPDetails {
        uint256 expiryTime;
        bool forSale;
        uint256 salePrice;
        address originalCreator;
        string transactionHash;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        bool active;
    }

    enum RequestStatus { PENDING, APPROVED, REJECTED }

    mapping(uint256 => IPRequest) public ipRequests;
    mapping(uint256 => IPDetails) public ipDetails;
    mapping(uint256 => Bid[]) public bidsForIP;

    event IPRequestSubmitted(uint256 indexed requestId, address indexed requester);
    event IPRequestVerified(uint256 indexed requestId, uint256 indexed tokenId, bool approved);
    event IPListedForSale(uint256 indexed tokenId, uint256 price);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event BidAccepted(uint256 indexed tokenId, address indexed bidder, uint256 amount);
    event IPDurationExtended(uint256 indexed tokenId, uint256 newExpiryTime);
    event PatentRegistered(uint256 indexed tokenId, address indexed owner, string transactionHash);

    constructor() ERC721("PatentRegistryNFT", "PRNFT") Ownable(msg.sender) {
        tokenCounter = 0;
        requestCounter = 0;
    }

    function requestIPOwnership(string memory metadataURI) public payable returns (uint256) {
        require(msg.value > 0, "Deposit required for IP request");
        
        uint256 requestId = requestCounter;
        ipRequests[requestId] = IPRequest({
            requester: msg.sender,
            metadataURI: metadataURI,
            depositAmount: msg.value,
            status: RequestStatus.PENDING,
            requestTime: block.timestamp
        });
        
        requestCounter++;
        emit IPRequestSubmitted(requestId, msg.sender);
        return requestId;
    }

    function verifyIPRequest(uint256 requestId, bool approved) public onlyOwner returns (uint256) {
        require(ipRequests[requestId].status == RequestStatus.PENDING, "Request is not pending");
        
        IPRequest storage request = ipRequests[requestId];
        request.status = approved ? RequestStatus.APPROVED : RequestStatus.REJECTED;
        
        if (approved) {
            uint256 tokenId = mintIPNFT(request.requester, request.metadataURI);
            
            // Set IP details with 1 year expiry by default
            ipDetails[tokenId] = IPDetails({
                expiryTime: block.timestamp + 365 days,
                forSale: false,
                salePrice: 0,
                originalCreator: request.requester,
                transactionHash: ""
            });
            
            emit IPRequestVerified(requestId, tokenId, true);
            return tokenId;
        } else {
            // Refund deposit if rejected
            payable(request.requester).transfer(request.depositAmount);
            emit IPRequestVerified(requestId, 0, false);
            return 0;
        }
    }

    function registerPatent(uint256 tokenId, string memory txHash) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can register the patent");
        
        IPDetails storage details = ipDetails[tokenId];
        details.transactionHash = txHash;
        
        emit PatentRegistered(tokenId, msg.sender, txHash);
    }

    function listIPForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list for sale");
        require(ipDetails[tokenId].expiryTime > block.timestamp, "IP has expired");
        
        ipDetails[tokenId].forSale = true;
        ipDetails[tokenId].salePrice = price;
        
        emit IPListedForSale(tokenId, price);
    }

    function placeBid(uint256 tokenId) public payable {
        require(ipDetails[tokenId].forSale, "IP is not for sale");
        require(msg.value > 0, "Bid amount must be greater than 0");
        require(ipDetails[tokenId].expiryTime > block.timestamp, "IP has expired");
        require(ownerOf(tokenId) != msg.sender, "Owner cannot bid on their own IP");
        
        bidsForIP[tokenId].push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            active: true
        }));
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function acceptBid(uint256 tokenId, uint256 bidIndex) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can accept bids");
        require(bidIndex < bidsForIP[tokenId].length, "Invalid bid index");
        require(bidsForIP[tokenId][bidIndex].active, "Bid is not active");
        
        Bid storage acceptedBid = bidsForIP[tokenId][bidIndex];
        address bidder = acceptedBid.bidder;
        uint256 amount = acceptedBid.amount;
        
        // Mark bid as inactive
        acceptedBid.active = false;
        
        // Transfer NFT to bidder
        _transfer(msg.sender, bidder, tokenId);
        
        // Transfer bid amount to seller
        payable(msg.sender).transfer(amount);
        
        // Update sale status
        ipDetails[tokenId].forSale = false;
        ipDetails[tokenId].salePrice = 0;
        
        // Refund other active bids
        for (uint256 i = 0; i < bidsForIP[tokenId].length; i++) {
            if (i != bidIndex && bidsForIP[tokenId][i].active) {
                Bid storage otherBid = bidsForIP[tokenId][i];
                otherBid.active = false;
                payable(otherBid.bidder).transfer(otherBid.amount);
            }
        }
        
        emit BidAccepted(tokenId, bidder, amount);
    }

    function extendIPDuration(uint256 tokenId, uint256 additionalTime) public payable {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can extend duration");
        require(msg.value > 0, "Payment required for extension");
        
        ipDetails[tokenId].expiryTime += additionalTime;
        
        emit IPDurationExtended(tokenId, ipDetails[tokenId].expiryTime);
    }

    function checkIPExpiry(uint256 tokenId) public {
        require(ipDetails[tokenId].expiryTime <= block.timestamp, "IP has not expired yet");
        
        // Transfer expired IP to contract owner (or burn it)
        _transfer(ownerOf(tokenId), owner(), tokenId);
    }

    function getBidsForIP(uint256 tokenId) public view returns (address[] memory, uint256[] memory, bool[] memory) {
        uint256 bidCount = bidsForIP[tokenId].length;
        
        address[] memory bidders = new address[](bidCount);
        uint256[] memory amounts = new uint256[](bidCount);
        bool[] memory active = new bool[](bidCount);
        
        for (uint256 i = 0; i < bidCount; i++) {
            Bid storage bid = bidsForIP[tokenId][i];
            bidders[i] = bid.bidder;
            amounts[i] = bid.amount;
            active[i] = bid.active;
        }
        
        return (bidders, amounts, active);
    }

    function mintIPNFT(address recipient, string memory tokenURI) internal returns (uint256) {
        uint256 newTokenId = tokenCounter;
        _safeMint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        tokenCounter++;
        return newTokenId;
    }
}