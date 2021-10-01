const CNSTContract = artifacts.require('./CNST');

const {
  addressHelpers
} = require('./test-utils');

contract('CNST', function (accounts) {
  let CNSTInstance;

  before(async () => {
    CNSTInstance = await CNSTContract.new();
  });

  it('Check metadata', async () => {
    const [
      tokenName,
      tokenSymbol,
      tokenDecimals
    ] = await Promise.all([
      CNSTInstance.name(),
      CNSTInstance.symbol(),
      CNSTInstance.decimals(),
    ]);

    assert.equal(tokenName, "canasta.domains");
    assert.equal(tokenSymbol, "CNST");
    assert.equal(tokenDecimals, 18);
  });

  it('Add minter', async () => {
    await CNSTInstance.addMinter(accounts[0], { from: accounts[0] });

    const checkMinter = await CNSTInstance.minters(accounts[0]);

    assert.equal(checkMinter, true);
  });

  it('Remove minter', async () => {
    await CNSTInstance.removeMinter(accounts[0], { from: accounts[0] });

    const checkMinter = await CNSTInstance.minters(accounts[0]);

    assert.equal(checkMinter, false);
  });

  it('Remove governance', async () => {
    const nullAddress = addressHelpers.getNullAddress();
    await CNSTInstance.setGovernance(nullAddress, { from: accounts[0] });
    const currentGovernanceAddress = await CNSTInstance.governance();

    assert.equal(currentGovernanceAddress, nullAddress);
  });

});
