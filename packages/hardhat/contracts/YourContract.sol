pragma solidity ^0.8.7;

interface IBurnNFT {

    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function mint() external payable returns (uint256);

}

contract YourContract {

    IBurnNFT burny;
    uint256 burnyPrice;

    constructor(address _burny, uint256 _burnyPrice) {
        burny = IBurnNFT(_burny);
        burnyPrice = _burnyPrice;
    }

    function onlyMint(uint256 _baseFee, address to) public payable {
        require(block.basefee / uint(1_000_000_000) == _baseFee, "no");
        require(msg.value >= burnyPrice, "more");
        uint256 id = burny.mint{ value: burnyPrice }();
        if (msg.value > burnyPrice) {
            block.coinbase.call{ value:msg.value-burnyPrice }("");
        }
        burny.safeTransferFrom(address(this), to, id);
    }

    function baseFee() external view returns(uint256){
      return block.basefee;
    }

    // Safely receive ERC721s
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }
}
