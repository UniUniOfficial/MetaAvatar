const throwCatch = require('./helper/throw.js');
const timeHelper = require('./helper/time.js');

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

    // Succeed in airdrop a avatar
    let expires = timeHelper.getTimestampInSeconds() + 3600;
    let nonce = 1;
    let data = await web3.utils.encodePacked(
      {value: account1, type: "address"},
      {value: expires, type: "uint64"},
      {value: nonce, type: "uint64"},
    );
    let hash = await web3.utils.keccak256(data);
    let sig = await web3.eth.accounts.sign(hash, "766a75d6b54a93d1f254d574b983117236dc8f1bd6d75ac00c549343405ab9cd")['signature'];

    await ga.mintAirdrop(account1, expires, nonce, sig, {from: account1});
    const account1_nft_num = (await ga.balanceOf(account1)).toNumber();
    assert.equal(account1_nft_num, 1, "It doesn't mint 1 NFT of "+account1);
    
    // avoid replay attack
    //await ga.mintAirdrop(account1, expires, nonce, sig, {from: account1});
  });
});
