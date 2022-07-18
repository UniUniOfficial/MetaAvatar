const throwCatch = require('./helper/throw.js');
const timeHelper = require('./helper/time.js');

const GenesisAvatar = artifacts.require("GenesisAvatar");
const TestToken = artifacts.require("TestToken");

function hashAndSign(data, signer) {
  return web3.eth.accounts.sign(
    web3.utils.keccak256(data), 
    signer.privateKey
  )['signature'];
}

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

  it("It should airdrop 3 avatars", async function () {
    // Setup owner
    owner = accounts[0];

    // Setup signer;
    await web3.eth.accounts.wallet.create(1);
    const signer = web3.eth.accounts.wallet[0];
    await ga.setMintSigner(signer.address);

    // Setup accounts.
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    // Succeed in airdrop a avatar
    let expires = timeHelper.getTimestampInSeconds() + 3600;
    let nonce = 1;
    let data = await web3.utils.encodePacked(
      {value: account1, type: "address"},
      {value: expires, type: "uint64"},
      {value: nonce, type: "uint64"},
    );
    let sig = hashAndSign(data, signer);

    await ga.mintAirdrop(account1, expires, nonce, sig, {from: account1});
    const account1_nft_num = (await ga.balanceOf(account1)).toNumber();
    assert.equal(account1_nft_num, 1, "It doesn't mint 1 NFT of "+account1);
    
    // avoid replay attack
    await throwCatch.expectRevert(
      ga.mintAirdrop(account1, expires, nonce, sig, {from: account1})
    );

    // avoid account-spoofing attack
    expires = timeHelper.getTimestampInSeconds() + 3600;
    nonce = 2;
    data = await web3.utils.encodePacked(
      {value: account1, type: "address"},
      {value: expires, type: "uint64"},
      {value: nonce, type: "uint64"},
    );
    sig = hashAndSign(data, signer);
    await throwCatch.expectRevert(
      ga.mintAirdrop(account2, expires, nonce, sig, {from: account1})
    )
    await throwCatch.expectRevert(
      ga.mintAirdrop(account2, expires, nonce, sig, {from: account2})
    );
    await throwCatch.expectRevert(
      ga.mintAirdrop(account1, expires, nonce, sig, {from: account2})
    );

    nonce = 2;
    data = await web3.utils.encodePacked(
      {value: account2, type: "address"},
      {value: expires, type: "uint64"},
      {value: nonce, type: "uint64"},
    );
    sig = hashAndSign(data, signer);
    await ga.mintAirdrop(account2, expires, nonce, sig, {from: account2});

    nonce = 3;
    data = await web3.utils.encodePacked(
      {value: account3, type: "address"},
      {value: expires, type: "uint64"},
      {value: nonce, type: "uint64"},
    );
    sig = hashAndSign(data, signer);
    await ga.mintAirdrop(account3, expires, nonce, sig, {from: account3});

    nonce = 4;
    expires = timeHelper.getTimestampInSeconds() - 3600;
    data = await web3.utils.encodePacked(
      {value: account3, type: "address"},
      {value: expires, type: "uint64"},
      {value: nonce, type: "uint64"},
    );
    sig = hashAndSign(data, signer);
    await throwCatch.expectRevert(
      ga.mintAirdrop(account3, expires, nonce, sig, {from: account3})
    );

    // Check the contract state
    const totalSupply = (await ga.totalSupply()).toNumber();
    assert.equal(totalSupply, 3, "It doesn't have 3 NFTs totally");
  });
});
