// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin//contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


abstract contract Component is ERC721, ERC721Enumerable, EIP712, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    uint public maxSupply;

    // the token (ERC20 or Local coin) to mint
    address public immutable acceptToken;    

    // the price to mint
    uint256 public immutable mintPrice;

    // the mint status, if false, no any nft is allowed to mint
    bool public mintPermitted = true;

    constructor(string memory name, string memory symbol, uint maxToken, address token, uint256 price)
        ERC721(name, symbol)
        EIP712(name, "1.0.0") 
    {
        maxSupply = maxToken;
        acceptToken = token;
        mintPrice = price;
    }

    function mint(address to) external onlyOwner {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
    }

    function mintPublic(address to) external payable nonReentrant {
        if (acceptToken == address(0)) {
            require(msg.value == mintPrice, "Mint: not enough coin to mint");
        } else {
            IERC20(acceptToken).transfer(address(this), mintPrice);
        }

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
    }

    function airdrop(address to, uint256 tokenId, bytes calldata signature) external {
        require(_verify(_hash(to, tokenId), signature), "Invalid signature");
        _safeMint(to, tokenId);
    }

    function _hash(address to, uint256 tokenId) internal view returns (bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(
            keccak256("Airdrop(address account, uint256 tokenId)"),
            tokenId,
            to
        )));
    }

    function _verify(bytes32 digest, bytes memory signature) internal view returns (bool) {
        return owner() == ECDSA.recover(digest, signature);
    }

    function stopMint() external onlyOwner {
        mintPermitted = false;
        maxSupply = totalSupply();
    }

    /**
     * @dev Override the logic that limit the NFTs totally to max supply
     */
    function _safeMint(address to, uint256 tokenId) internal override virtual {
        require(mintPermitted, "No NFT is allowed to mint");
        require(tokenId <= maxSupply, "NFTs are reached to max supply limit");
        super._safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}