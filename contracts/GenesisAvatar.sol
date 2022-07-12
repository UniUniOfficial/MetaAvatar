// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./base/Component.sol";


contract GenesisAvatar is Component {
    constructor() 
        Component("Genesis Avatar", "GA", 10_000, address(0), 1*10**18) {
    }
}