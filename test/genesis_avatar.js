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
  
  let ga;

  before(async () => {
    ga = await GenesisAvatar.new(max_supply, token_address, price);
  });

  it("It should read info of Genesis Avatar", async function () {
    // Setup owner
    owner = accounts[0];

    // Check the contract state
    const supply = (await ga.maxSupply()).toNumber();
    assert.equal(supply, max_supply, "Max supply should be "+max_supply);

    const address = (await ga.acceptToken()).toString();
    assert.equal(address, token_address, "token address should be "+token_address);

    const mint_price = (await ga.mintPrice()).toString();
    assert.equal(mint_price, price, "mint price should be "+price);
  });

  it("It should mint 4 avatar by owner", async function () {
    // Setup owner
    owner = accounts[0];

    // Setup accounts.
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
    
    // Fail to mint if not owner
    await throwCatch.expectRevert(
      ga.mint(account1, {from: account1})
    );

    // Succeed in mint if owner
    await ga.mint(owner, {from: owner});
    await ga.mint(owner, {from: owner});
    const owner_nft_num = (await ga.balanceOf(owner)).toNumber();
    assert.equal(owner_nft_num, 2, "It doesn't mint 2 NFTs of owner:"+owner);

    await ga.mint(account1, {from: owner});
    const account1_nft_num = (await ga.balanceOf(account1)).toNumber();
    assert.equal(account1_nft_num, 1, "It doesn't mint 1 NFT of "+account1);

    await ga.mint(account2, {from: owner});
    const account2_nft_num = (await ga.balanceOf(account2)).toNumber();
    assert.equal(account2_nft_num, 1, "It doesn't mint 1 NFT of "+account2);

    let token_id = 4;
    const address = await ga.ownerOf(token_id);
    assert.equal(account2, address, account2+" owns the token:"+token_id);

    // Check the contract state
    const totalSupply = (await ga.totalSupply()).toNumber();
    assert.equal(totalSupply, 4, "It doesn't have 4 NFTs totally");
  });

  it("It should mint 3 avatar by other addresses paying the coin of the blockchain", async function () {
    // Setup owner
    owner = accounts[0];

    // Setup accounts.
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    // Fail to mint without paying
    await throwCatch.expectRevert(
      ga.mintPublic({from: owner})
    );
    await throwCatch.expectRevert(
      ga.mintPublic({from: account3})
    );

    // Succeed in mint with paying
    await ga.mintPublic({from: account1, value: price});
    const account1_nft_num = (await ga.balanceOf(account1)).toNumber();
    assert.equal(account1_nft_num, 2, "It doesn't mint 2 NFTs of "+account1);

    await ga.mintPublic({from: account2, value: price});
    const account2_nft_num = (await ga.balanceOf(account2)).toNumber();
    assert.equal(account2_nft_num, 2, "It doesn't mint 2 NFTs of "+account2);

    await ga.mintPublic({from: account3, value: price});
    const account3_nft_num = (await ga.balanceOf(account3)).toNumber();
    assert.equal(account3_nft_num, 1, "It doesn't mint 1 NFT of "+account3);

    let token_id = 7;
    const address = await ga.ownerOf(token_id);
    assert.equal(account3, address, account3+" owns the token:"+token_id);

    // Check the contract state
    const income = price * 3;
    const balance = await web3.eth.getBalance(ga.address);
    assert.equal(balance, income, "Genesis Avatar get mint income of "+income);
    const totalSupply = (await ga.totalSupply()).toNumber();
    assert.equal(totalSupply, 7, "It doesn't have 7 NFTs totally");
  });
});
