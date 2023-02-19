//SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidAddress();
error InvalidContract();
error PriceTooLow();
error DurationTooLow();
error BidTooLow();
error AuctionNotActive();
error DeadlinePassed();
error DeadlineNotPassed();

contract Auction is IERC721Receiver, ReentrancyGuard, Ownable {
    struct auction {
        address seller;
        uint128 price;
        uint256 duration;
        uint256 maxBid;
        address maxBidUser;
        bool isActive;
        uint256[] bidAmounts;
        address[] users;
    }

    mapping(address => mapping(uint256 => auction)) public tokenToAuction;

    mapping(address => mapping(uint256 => mapping(address => uint256)))
        public bids;

    /**
       Seller puts the item on auction
    */
    function createTokenAuction(
        address _nft,
        uint256 _tokenId,
        uint128 _price,
        uint256 _duration
    ) external onlyOwner {
        if (msg.sender != address(0)) {
            revert InvalidAddress();
        } else if (_nft != address(0)) {
            revert InvalidContract();
        } else if (_price > 0) {
            revert PriceTooLow();
        } else if (_duration > 0) {
            revert DurationTooLow();
        }
        ERC721(_nft).safeTransferFrom(msg.sender, address(this), _tokenId);
        tokenToAuction[_nft][_tokenId] = auction({
            seller: msg.sender,
            price: uint128(_price),
            duration: _duration,
            maxBid: 0,
            maxBidUser: address(0),
            isActive: true,
            bidAmounts: new uint256[](0),
            users: new address[](0)
        });
    }

    /**
       Users bid for a particular nft, the max bid is compared and set if the current bid id highest
    */
    function bid(address _nft, uint256 _tokenId) external payable nonReentrant {
        auction memory _auctionDetails = tokenToAuction[_nft][_tokenId];
        if (msg.value <= _auctionDetails.price) {
            revert BidTooLow();
        } else if (!_auctionDetails.isActive) {
            revert AuctionNotActive();
        } else if (block.timestamp < _auctionDetails.duration) {
            revert DeadlinePassed();
        }

        if (_auctionDetails.bidAmounts.length == 0) {
            bids[_nft][_tokenId][msg.sender] = msg.value;
            tokenToAuction[_nft][_tokenId].maxBid = msg.value;
            tokenToAuction[_nft][_tokenId].maxBidUser = msg.sender;
            tokenToAuction[_nft][_tokenId].users.push(msg.sender);
            tokenToAuction[_nft][_tokenId].bidAmounts.push(msg.value);
        } else {
            if (
                msg.value <=
                _auctionDetails.bidAmounts[
                    _auctionDetails.bidAmounts.length - 1
                ]
            ) {
                revert BidTooLow();
            }
            if (bids[_nft][_tokenId][msg.sender] > 0) {
                (bool success, ) = msg.sender.call{
                    value: bids[_nft][_tokenId][msg.sender]
                }("");
                require(success);
            }
            bids[_nft][_tokenId][msg.sender] = msg.value;
            tokenToAuction[_nft][_tokenId].maxBid = msg.value;
            tokenToAuction[_nft][_tokenId].maxBidUser = msg.sender;
            tokenToAuction[_nft][_tokenId].users.push(msg.sender);
            tokenToAuction[_nft][_tokenId].bidAmounts.push(msg.value);
        }
    }

    /**
       Called by the seller when the auctionDetails duration is over the hightest bid user get's the nft and other bidders get eth back
    */
    function executeSale(
        address _nft,
        uint256 _tokenId
    ) external nonReentrant onlyOwner {
        auction memory _auctionDetails = tokenToAuction[_nft][_tokenId];
        if (block.timestamp < _auctionDetails.duration) {
            revert DeadlineNotPassed();
        } else if (!_auctionDetails.isActive) {
            revert AuctionNotActive();
        }
        tokenToAuction[_nft][_tokenId].isActive = false;
        if (_auctionDetails.bidAmounts.length == 0) {
            ERC721(_nft).safeTransferFrom(
                address(this),
                _auctionDetails.seller,
                _tokenId
            );
        } else {
            (bool success, ) = _auctionDetails.seller.call{
                value: _auctionDetails.maxBid
            }("");
            require(success);
            for (uint256 i = 0; i < _auctionDetails.users.length; i++) {
                if (_auctionDetails.users[i] != _auctionDetails.maxBidUser) {
                    (success, ) = _auctionDetails.users[i].call{
                        value: bids[_nft][_tokenId][_auctionDetails.users[i]]
                    }("");
                    require(success);
                }
            }
            ERC721(_nft).safeTransferFrom(
                address(this),
                _auctionDetails.maxBidUser,
                _tokenId
            );
        }
    }

    /**
       Called by the seller if they want to cancel the auctionDetails for their nft so the bidders get back the locked eeth and the seller get's back the nft
    */
    function cancelAuction(
        address _nft,
        uint256 _tokenId
    ) external nonReentrant onlyOwner {
        auction memory _auctionDetails = tokenToAuction[_nft][_tokenId];
        if (!_auctionDetails.isActive) {
            revert AuctionNotActive();
        }
        tokenToAuction[_nft][_tokenId].isActive = false;
        bool success;
        for (uint256 i = 0; i < _auctionDetails.users.length; i++) {
            (success, ) = _auctionDetails.users[i].call{
                value: bids[_nft][_tokenId][_auctionDetails.users[i]]
            }("");
            require(success);
        }
        ERC721(_nft).safeTransferFrom(
            address(this),
            _auctionDetails.seller,
            _tokenId
        );
    }

    function getTokenAuctionDetails(
        address _nft,
        uint256 _tokenId
    ) public view returns (auction memory) {
        return tokenToAuction[_nft][_tokenId];
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    receive() external payable {}
}
