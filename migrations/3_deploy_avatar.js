var TestToken = artifacts.require("TestToken");
var GenesisAvatar = artifacts.require("GenesisAvatar");

module.exports = function (deployer, _network, accounts) {
  const supply = 10;
  const price = web3.utils.toBN('1000000000000000000');
  // Setup owner
  signer = accounts[0];

  deployer.deploy(GenesisAvatar, signer, supply, TestToken.address, price);
};