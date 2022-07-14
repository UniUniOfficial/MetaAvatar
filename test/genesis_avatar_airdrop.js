const throwCatch = require('./helper/throw.js');

const GenesisAvatar = artifacts.require("GenesisAvatar");
const TestToken = artifacts.require("TestToken");


/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("GenesisAvatar", function (accounts) {
  const max_supply = 1000;
  let token_address = "";
  const price = web3.utils.toBN("1000000000000000000");

  let ga;
  let tt
  
  before(async () => {
    tt = await TestToken.new();
    token_address = tt.address;
    ga = await GenesisAvatar.new(max_supply, token_address, price);
  });

  it("It should airdrop 3 avatar", async function () {
    // Setup owner
    owner = accounts[0];

    // Setup accounts.
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
  });
});
