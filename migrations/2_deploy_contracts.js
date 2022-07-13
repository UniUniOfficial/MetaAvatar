const supply = 10;
const address = "0x0000000000000000000000000000000000000000";
const price = web3.utils.toBN('1000000000000000000');
var GenesisAvatar = artifacts.require("GenesisAvatar");

module.exports = function (deployer) {
  deployer.deploy(GenesisAvatar, supply, address, price);
};
