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
  // Setup owner
  owner = accounts[0];

  let ga;
  let tt
  
  before(async () => {
    tt = await TestToken.new();
    token_address = tt.address;
    ga = await GenesisAvatar.new(owner, max_supply, token_address, price);
  });

  it("It should pay and mint nft by local coin", async function () {
    // Setup accounts.
    const account1 = accounts[1];

    await ga.setMintPrice("0x0000000000000000000000000000000000000000", price, {from: owner});

    // Fail to min with token
    await tt.transfer(account1, price);

    await throwCatch.expectRevert(
      ga.mintPublic({from: account1})
    );
    await tt.approve(ga.address, price.muln(10), {from: account1});
    await throwCatch.expectRevert(
      ga.mintPublic({from: account1})
    );

    // Succeed in mint with paying
    await ga.mintPublic({from: account1, value: price});

    // Set new price
    newPrice = price.muln(2);
    await ga.setMintPrice("0x0000000000000000000000000000000000000000", newPrice, {from: owner});

    // Succeed in mint with paying
    await ga.mintPublic({from: account1, value: newPrice});
  
    // Check the contract state
    const totalSupply = (await ga.totalSupply()).toNumber();
    assert.equal(totalSupply, 2, "It doesn't have 2 NFTs totally");

    const income = price.add(newPrice);
    const balance = await web3.eth.getBalance(ga.address);
    assert.equal(balance, income, "Genesis Avatar get mint income of "+income);
  });
});
