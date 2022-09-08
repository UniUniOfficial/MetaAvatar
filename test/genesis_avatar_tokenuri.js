const throwCatch = require('./helper/throw.js');

const GenesisAvatar = artifacts.require("GenesisAvatar");
const TestToken = artifacts.require("TestToken");


/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("GenesisAvatar", function (accounts) {
  const max_supply = 10;
  const token_address = "0x0000000000000000000000000000000000000000";
  const price = web3.utils.toBN('1000000000000000000');
  // Setup owner
  owner = accounts[0];

  let ga;

  before(async () => {
    ga = await GenesisAvatar.new(owner, max_supply, token_address, price, max_supply);
  });

  it("It should change the token base uri by owner", async function () {
    // Setup accounts.
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
    
    await ga.mint(account1, {from: owner});

    let token_id = 1;
    old_token1_uri = await ga.tokenURI(token_id);

    // Fail to set base uri
    let baseURI = "https://new.com/"
    await throwCatch.expectRevert(
      ga.setBaseURI(baseURI, {from: account1})
    );

    // Succeed in setting base uri
    await ga.setBaseURI(baseURI, {from: owner})
    
    new_token1_uri = await ga.tokenURI(token_id);
    assert.equal(new_token1_uri, "https://new.com/1", "URI of Token "+token_id+" should change to new address");
  });
});
