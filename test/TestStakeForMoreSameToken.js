const Web3 = require("web3"),
  truffleAssert = require('truffle-assertions');

const CNSTContract = artifacts.require('./CNST'),
  StakeForMoreSameTokenContract = artifacts.require('./StakeForMoreSameToken');

const {evm} = require('./test-utils');

contract('StakeForMoreSameToken', function (accounts) {
  let CNSTInstance,
    StakeForMoreSameTokenInstance;

  const minterAndDeployAddress = accounts[0],
    buyerAddress = accounts[5];

  before(async () => {
    CNSTInstance = await CNSTContract.new();

    StakeForMoreSameTokenInstance = await StakeForMoreSameTokenContract.new(
      CNSTInstance.address
    );

    await CNSTInstance.addMinter(minterAndDeployAddress, {from: minterAndDeployAddress});
  });

  it(`Check if token address is correct`, async () => {
    const tokenAddress = await StakeForMoreSameTokenInstance.token();

    assert.equal(tokenAddress, CNSTInstance.address);
  });

  it(`Create Stake (without token amount approve)`, async () => {
    const amount = Web3.utils.toWei('100', 'ether');
    await CNSTInstance.mint(buyerAddress, amount, {from: minterAndDeployAddress});

    await truffleAssert.fails(
      StakeForMoreSameTokenInstance
        .createStake(amount, {from: buyerAddress}),
      truffleAssert.ErrorType.REVERT,
      "ERC20: transfer amount exceeds allowance."
    );
  });

  it(`Create Stake (success)`, async () => {
    const amount = Web3.utils.toWei('100', 'ether');
    await CNSTInstance.mint(buyerAddress, amount, {from: minterAndDeployAddress});

    await CNSTInstance.approve(
      StakeForMoreSameTokenInstance.address,
      amount,
      {from: buyerAddress}
    );

    await StakeForMoreSameTokenInstance.createStake(amount, {from: buyerAddress});

    const stakeAmount = await StakeForMoreSameTokenInstance.stakeAmountOf(buyerAddress);

    await StakeForMoreSameTokenInstance.removeStake(amount, {from: buyerAddress});

    assert.equal(stakeAmount, amount);
  });

  it(`Try claim reward passed 1 hour with balance 0 in contract`, async () => {
    const snapshot = await evm.snapshot();
    try {
      const amount = Web3.utils.toWei('100', 'ether');
      await CNSTInstance.mint(buyerAddress, amount, {from: minterAndDeployAddress});
      await CNSTInstance.mint(accounts[6], amount, {from: minterAndDeployAddress});
      await CNSTInstance.mint(accounts[7], amount, {from: minterAndDeployAddress});

      await CNSTInstance.approve(
        StakeForMoreSameTokenInstance.address,
        amount,
        {from: buyerAddress}
      );

      await CNSTInstance.approve(
        StakeForMoreSameTokenInstance.address,
        amount,
        {from: accounts[6]}
      );

      await CNSTInstance.approve(
        StakeForMoreSameTokenInstance.address,
        amount,
        {from: accounts[7]}
      );

      await StakeForMoreSameTokenInstance.createStake(amount, {from: buyerAddress});
      await StakeForMoreSameTokenInstance.createStake(amount, {from: accounts[6]});
      await StakeForMoreSameTokenInstance.createStake(amount, {from: accounts[7]});

      await evm.advanceTime(3600001);

      await StakeForMoreSameTokenInstance.distributeRewards({from: minterAndDeployAddress});

      const rewards = await StakeForMoreSameTokenInstance.rewardOf(buyerAddress);

      assert.equal(0, rewards);

      await snapshot.restore();
    } catch (error) {
      await snapshot.restore();
      throw error;
    }
  });

  it(`Claim reward passed 2 hours with balance in contract`, async () => {
    const snapshot = await evm.snapshot();
    try {
      const buyerAddress = accounts[8];

      const amount = Web3.utils.toWei('100', 'ether');
      const contractAmount = Web3.utils.toWei('400000', 'ether');
      await CNSTInstance.mint(buyerAddress, amount, {from: minterAndDeployAddress});
      await CNSTInstance.mint(StakeForMoreSameTokenInstance.address, contractAmount, {from: minterAndDeployAddress});

      await CNSTInstance.approve(
        StakeForMoreSameTokenInstance.address,
        amount,
        {from: buyerAddress}
      );
      await StakeForMoreSameTokenInstance.createStake(amount, {from: buyerAddress});

      await evm.advanceTime(72001);

      await StakeForMoreSameTokenInstance.distributeRewards({from: minterAndDeployAddress});

      const rewards = await StakeForMoreSameTokenInstance.rewardOf(buyerAddress);

      await StakeForMoreSameTokenInstance.withdrawReward({from: buyerAddress});

      const rewardsPostWithdraw = await StakeForMoreSameTokenInstance.rewardOf(buyerAddress);

      const buyerTokenBalance = await CNSTInstance.balanceOf(buyerAddress);

      assert.equal(rewards.toString(), buyerTokenBalance.toString());
      assert.equal(rewardsPostWithdraw.toString(), '0');

      await snapshot.restore();
    } catch (error) {
      await snapshot.restore();
      throw error;
    }
  });

  it(`Claim reward without available rewards`, async () => {
    await truffleAssert.fails(
      StakeForMoreSameTokenInstance.withdrawReward({from: buyerAddress}),
      truffleAssert.ErrorType.REVERT,
      "!reward."
    );
  });

  it(`Try remove a staking an amount (great that the staked amount)`, async () => {
    const amount = Web3.utils.toWei('100', 'ether');
    const removeAmount = Web3.utils.toWei('101', 'ether');
    await CNSTInstance.mint(buyerAddress, amount, {from: minterAndDeployAddress});

    await CNSTInstance.approve(
      StakeForMoreSameTokenInstance.address,
      amount,
      {from: buyerAddress}
    );

    await StakeForMoreSameTokenInstance.createStake(amount, {from: buyerAddress});

    await truffleAssert.fails(
      StakeForMoreSameTokenInstance.removeStake(removeAmount, {from: buyerAddress}),
      truffleAssert.ErrorType.REVERT,
      "!holderAmount >= _stake."
    );
  });

});
