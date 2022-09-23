// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./base/Component.sol";


contract GenesisAvatar is Component {
    constructor(address minter, uint maxSupply, address token, uint256 price, uint firstPhraseSupply) 
        Component("UniUni Genesis Avatar", "UGA", minter, maxSupply, token, price, firstPhraseSupply) 
    {
        setBaseURI("https://uniuni.network/nft/genesisavatar/");
    }
}