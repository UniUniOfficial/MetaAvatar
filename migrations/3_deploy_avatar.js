const supply = 10;
const price = web3.utils.toBN('1000000000000000000');

var TestToken = artifacts.require("TestToken");
var GenesisAvatar = artifacts.require("GenesisAvatar");

module.exports = function (deployer) {
  deployer.deploy(GenesisAvatar, supply, TestToken.address, price);
};