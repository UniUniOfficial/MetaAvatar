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

  it("It should mint 4 avatars by owner and burn 2 avatars", async function () {
    // Setup accounts.
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    await ga.mint(account1, {from: owner});
    const account1_nft_num = (await ga.balanceOf(account1)).toNumber();
    assert.equal(account1_nft_num, 1, "It doesn't mint 1 NFT of "+account1);

    await ga.mint(account2, {from: owner});
    const account2_nft_num = (await ga.balanceOf(account2)).toNumber();
    assert.equal(account2_nft_num, 1, "It doesn't mint 1 NFT of "+account2);

    await ga.mint(account3, {from: owner});
    const account3_nft_num = (await ga.balanceOf(account3)).toNumber();
    assert.equal(account3_nft_num, 1, "It doesn't mint 1 NFT of "+account3);

    let token_id = 1;
    // Fail to burn
    await throwCatch.expectRevert(
      ga.burn(token_id, {from: owner})
    );
    // burn by itself
    await ga.burn(token_id, {from: account1})

    token_id = 2;
    await throwCatch.expectRevert(
      ga.burn(token_id, {from: owner})
    );
    // burn by other
    await ga.approve(owner, token_id, {from: account2})
    await ga.burn(token_id, {from: owner})

    // Check the contract state
    const totalSupply = (await ga.totalSupply()).toNumber();
    assert.equal(totalSupply, 1, "It doesn't have 1 NFT totally");
  });
});
