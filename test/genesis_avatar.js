const GenesisAvatar = artifacts.require("GenesisAvatar");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("GenesisAvatar", function (/* accounts */) {
  it("should assert true", async function () {
    await GenesisAvatar.deployed();
    return assert.isTrue(true);
  });
});
