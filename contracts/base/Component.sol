// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


abstract contract Component is ERC721, ERC721Enumerable, EIP712, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Keep airdrop secure
    address public mintSigner;

    // Mapping nonce used, avoid replay attacks
    mapping(uint64 => bool) private _usedMintNonce;

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

    function mintPublic() external payable {
        if (acceptToken == address(0)) {
            require(msg.value == mintPrice, "Mint: Not enough payment to mint");
        } else {
            IERC20(acceptToken).transferFrom(_msgSender(), address(this), mintPrice);
        }

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(_msgSender(), tokenId);
    }

    function mintAirdrop(address to, uint64 expires, uint64 nonce, bytes calldata signature) external {
        require(expires > block.timestamp, "Airdrop: The airdrop is expired");
        require(!_usedMintNonce[nonce], "Airdrop: Nonce is used");
        require(_verify(_hash(to, expires, nonce), signature), "Airdrop: Invalid signature");
        require(msg.sender == to, "Airdrop: Only white list users can mint");
        
        _usedMintNonce[nonce] = true;
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
    }

    /**
     * @dev after the call, no NFT is allowed to mint, and max supply is also determinate
     */
    function lockup() external onlyOwner {
        mintPermitted = false;
        maxSupply = totalSupply();
    }

    function withdraw(address withdrawAddress) external onlyOwner {
        require(withdrawAddress != address(0), "Withdraw: No withdraw address");
        if (acceptToken == address(0)) {
            payable(withdrawAddress).transfer(address(this).balance);
        } else {
            IERC20(acceptToken).transfer(
                withdrawAddress, 
                IERC20(acceptToken).balanceOf(address(this))
            );
        }
    }

    function setMintSigner(address signer) external onlyOwner {
        mintSigner = signer;
    }

    function _hash(address account, uint64 expires, uint64 nonce) internal pure returns (bytes32) {
        return ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(account, expires, nonce)));
    }

    function _verify(bytes32 digest, bytes memory signature) internal view returns (bool) {
        return mintSigner == ECDSA.recover(digest, signature);
    }

    /**
     * @dev Override the logic that limit the NFTs totally to max supply
     */
    function _safeMint(address to, uint256 tokenId) internal override virtual {
        require(mintPermitted, "Mint: No NFT is allowed to mint");
        require(tokenId <= maxSupply, "Mint: Total supply of NFTs is reached to max supply limit");
        super._safeMint(to, tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}