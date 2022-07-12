// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./base/Component.sol";


contract GenesisAvatar is Component {
    constructor() 
        Component("Genesis Avatar", "GA", 10_000, address(0), 1*10**18) {
    }

    /**
     * @dev overrides Base URI for computing {tokenURI}.
     */
    function _baseURI() internal view virtual override(ERC721) returns (string memory) {
        return "https://metaid.io/genesisavatar/";
    }
}