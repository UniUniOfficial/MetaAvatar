// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./base/Component.sol";


contract GenesisAvatar is Component {
    constructor(address minter, uint maxSupply, address token, uint256 price, uint firstPhraseSupply) 
        Component("UniUni Genesis Avatar", "UGA", maxSupply, token, price, firstPhraseSupply) 
    {
        mintSigner = minter;
    }

    /**
     * @dev overrides Base URI for computing {tokenURI}.
     */
    function _baseURI() internal view virtual override(ERC721) returns (string memory) {
        return "https://uniuni.io/nft/genesisavatar/";
    }
}