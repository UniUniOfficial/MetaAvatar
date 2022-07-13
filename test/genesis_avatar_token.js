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

  it("It should mint 3 avatar by other addresses paying the ERC20 token", async function () {
    // Setup owner
    owner = accounts[0];

    // Setup accounts.
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    // Send out the token
    await tt.transfer(account1, price);
    await tt.transfer(account2, price.muln(2));

    // Fail to mint without approve the token
    await throwCatch.expectRevert(
      ga.mintPublic({from: account1})
    );

    // Fail to mint without enough the token
    await tt.approve(ga.address, price, {from: account3});
    await throwCatch.expectRevert(
      ga.mintPublic({from: account3})
    );

    // Succeed in mint with paying the token
    await tt.approve(ga.address, price.muln(10), {from: account1});
    await ga.mintPublic({from: account1});
    await throwCatch.expectRevert(
      ga.mintPublic({from: account1})
    );

    await tt.approve(ga.address, price.muln(10), {from: account2});
    await ga.mintPublic({from: account2});
    await ga.mintPublic({from: account2});
    await throwCatch.expectRevert(
      ga.mintPublic({from: account2})
    );

    let token_id = 3;
    const address = await ga.ownerOf(token_id);
    assert.equal(account2, address, account2+" owns the token:"+token_id);

    // Check the contract state
    const totalSupply = (await ga.totalSupply()).toNumber();
    assert.equal(totalSupply, 3, "It doesn't have 3 NFTs totally");
  });

  it("It should stop and determine the max supply", async function () {
    // Setup owner
    owner = accounts[0];

    // Setup accounts.
    const account1 = accounts[1];

    // Stop minting
    await throwCatch.expectRevert(
      ga.stopMint({from: account1})
    );
    await ga.stopMint();

    // Check the contract state
    const totalSupply = (await ga.totalSupply()).toNumber();
    const maxSupply = (await ga.maxSupply()).toNumber();
    assert.equal(totalSupply, maxSupply, "There are not "+totalSupply+" NFTs totally");
  });
});
