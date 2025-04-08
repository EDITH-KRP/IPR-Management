// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.1;
import "hardhat/console.sol";

contract Ipbidder {
    uint public bidCount;

    struct IPownerBidders {
        uint256 tokenID;
        address owneraddress;
        string ownerIPname;
        uint bidValue;
        address bidderAddress;
        bool bidAccepted;
        uint256 timestamp;
    }

    mapping(uint256 => IPownerBidders[]) public ipbidders;
    mapping(uint256 => mapping(address => uint256)) public bid;
    mapping(address => bool) public hasBid;

    event LogReceivedFunds(address sender, uint amount, uint tokenId);
    event LogReturnedFunds(address recipient, uint amount, uint tokenId);
    event BidAccepted(uint256 tokenId, address bidder, uint256 bidValue);
    
    constructor() {
        bidCount = 1;
    }

    function placeBid(uint256 tokenId, address _owneraddress, string memory _ownerIPname) external payable {
        require(msg.value > 0, "Bid value must be greater than zero.");
        
        bid[tokenId][msg.sender] += msg.value;
        ipbidders[tokenId].push(IPownerBidders(
            tokenId,
            _owneraddress,
            _ownerIPname,
            bid[tokenId][msg.sender],
            msg.sender,
            false,
            block.timestamp
        ));

        hasBid[msg.sender] = true;
        bidCount++; // ✅ Increment bid count
        emit LogReceivedFunds(msg.sender, msg.value, tokenId);
    }

    function acceptBid(uint256 tokenId, uint256 bidIndex) external {
        require(ipbidders[tokenId].length > bidIndex, "Invalid bid index.");
        IPownerBidders storage selectedBid = ipbidders[tokenId][bidIndex];
        require(msg.sender == selectedBid.owneraddress, "Only the IP owner can accept bids.");
        require(!selectedBid.bidAccepted, "Bid already accepted.");

        selectedBid.bidAccepted = true;
        bid[tokenId][selectedBid.bidderAddress] = 0; // ✅ Reset bid before transferring

        payable(selectedBid.owneraddress).transfer(selectedBid.bidValue); // ✅ Safe ETH transfer
        emit BidAccepted(tokenId, selectedBid.bidderAddress, selectedBid.bidValue);
    }

    function refundBid(uint256 tokenId) external {
        require(bid[tokenId][msg.sender] > 0, "No bid to refund.");
        
        uint256 refundAmount = bid[tokenId][msg.sender];
        bid[tokenId][msg.sender] = 0; // ✅ Prevent reentrancy

        payable(msg.sender).transfer(refundAmount); 
        emit LogReturnedFunds(msg.sender, refundAmount, tokenId);
    }

    function getBidsForToken(uint256 tokenId) external view returns (IPownerBidders[] memory) {
        return ipbidders[tokenId];
    }

    function getMyBids() external view returns (IPownerBidders[] memory) {
        uint256 count = 0;
        uint256 totalTokens = bidCount;

        for (uint256 i = 1; i < totalTokens; i++) {
            uint256 len = ipbidders[i].length;
            for (uint256 j = 0; j < len; j++) {
                if (ipbidders[i][j].bidderAddress == msg.sender) {
                    count++;
                }
            }
        }

        IPownerBidders[] memory myBids = new IPownerBidders[](count);
        uint256 index = 0;

        for (uint256 i = 1; i < totalTokens; i++) {
            uint256 len = ipbidders[i].length;
            for (uint256 j = 0; j < len; j++) {
                if (ipbidders[i][j].bidderAddress == msg.sender) {
                    myBids[index++] = ipbidders[i][j];
                }
            }
        }

        return myBids;
    }
}
