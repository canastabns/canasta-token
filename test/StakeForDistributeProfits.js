const Web3 = require("web3"),
  truffleAssert = require('truffle-assertions');

const CNSTContract = artifacts.require('./CNST'),
  StakeForDistributeProfitsContract = artifacts.require('./StakeForDistributeProfits');

contract('StakeForDistributeProfits', function (accounts) {
  let CNSTInstance,
    StakeForDistributeProfitsInstance;

  const minterAndDeployAddress = accounts[0],
    buyerAddress = accounts[5];

  before(async () => {
    CNSTInstance = await CNSTContract.new();

    StakeForDistributeProfitsInstance = await StakeForDistributeProfitsContract.new(
      CNSTInstance.address
    );

    await CNSTInstance.addMinter(minterAndDeployAddress, {from: minterAndDeployAddress});
  });

  it(`Check if token address is correct`, async () => {
    const tokenAddress = await StakeForDistributeProfitsInstance.token();

    assert.equal(tokenAddress, CNSTInstance.address);
  });

  it(`Create Stake (without token amount approve)`, async () => {
    const amount = Web3.utils.toWei('100', 'ether');
    await CNSTInstance.mint(buyerAddress, amount, {from: minterAndDeployAddress});

    await truffleAssert.fails(
      StakeForDistributeProfitsInstance
        .createStake(amount, {from: buyerAddress}),
      truffleAssert.ErrorType.REVERT,
      "ERC20: transfer amount exceeds allowance."
    );
  });

});
