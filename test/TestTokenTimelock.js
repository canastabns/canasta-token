const truffleAssert = require('truffle-assertions');

const CNSTContract = artifacts.require('./CNST'),
  TokenTimeLockContract = artifacts.require('./TokenTimeLock');

const DeployConstants = require('../constants/deploy'),
  DateHelpers = require('../utils/date'),
  {evm} = require('./test-utils');

contract('TokenTimeLockContract', function (accounts) {
  let CNSTInstance,
    TokenTimeLockInstance;

  const currentDateInUnixTime = DateHelpers.currentDateToUnixTime(),
    futureDateInUnixTime = DateHelpers.addMinutesToUnixTime(currentDateInUnixTime, 1),
    contractBalance = 400000;

  before(async () => {
    CNSTInstance = await CNSTContract.new();
    TokenTimeLockInstance = await TokenTimeLockContract.new(
      CNSTInstance.address,
      DeployConstants.TIME_LOCK_BENEFICIARY_ADDRESS,
      `${futureDateInUnixTime}`
    );


    await CNSTInstance.addMinter(accounts[0], {from: accounts[0]});
    await CNSTInstance.mint(TokenTimeLockInstance.address, contractBalance, {from: accounts[0]});
  });

  it(`Check that token address must be a valid contract`, async () => {
    const token = await TokenTimeLockInstance.token();

    assert.equal(CNSTInstance.address, token);
  });

  it(`Check beneficiary address must be ${DeployConstants.TIME_LOCK_BENEFICIARY_ADDRESS}`, async () => {
    const beneficiaryAddress = await TokenTimeLockInstance.beneficiary();

    assert.equal(beneficiaryAddress, DeployConstants.TIME_LOCK_BENEFICIARY_ADDRESS);
  });

  it(`Check releaseTime must be ${futureDateInUnixTime}`, async () => {
    const releaseTime = await TokenTimeLockInstance.releaseTime();

    assert.equal((releaseTime).toNumber(), futureDateInUnixTime);
  });

  it(`Check contract balance`, async () => {
    const balance = await CNSTInstance.balanceOf(TokenTimeLockInstance.address);

    assert.equal(contractBalance, balance);
  });

  it(`Release tokens (early throw error)`, async () => {
    await truffleAssert.fails(
      TokenTimeLockInstance.release({gasPrice: 0}),
      truffleAssert.ErrorType.REVERT,
      "release: current time is before release time."
    );
  });

  it(`Release tokens`, async () => {
    const snapshot = await evm.snapshot();
    try {
      await evm.advanceTime(80000);

      await TokenTimeLockInstance.release({gasPrice: 0});

      const balanceContract = await CNSTInstance.balanceOf(TokenTimeLockInstance.address);

      assert.equal(balanceContract.toString(), '0');

      await snapshot.restore();
    } catch (error) {
      await snapshot.restore();
      throw error;
    }
  });

  it(`Release tokens (not token balance)`, async () => {
    const snapshot = await evm.snapshot();
    try {
      await evm.advanceTime(80000);

      await TokenTimeLockInstance.release({gasPrice: 0});

      await truffleAssert.fails(
        TokenTimeLockInstance.release({gasPrice: 0}),
        truffleAssert.ErrorType.REVERT,
        "TokenTimeLock: no tokens to release."
      );

      await snapshot.restore();
    } catch (error) {
      await snapshot.restore();
      throw error;
    }
  });

});
