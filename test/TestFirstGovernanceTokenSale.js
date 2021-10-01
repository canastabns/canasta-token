const Web3 = require("web3"),
  truffleAssert = require('truffle-assertions');

const CNSTContract = artifacts.require('./CNST'),
  FirstGovernanceTokenSaleContract = artifacts.require('./FirstGovernanceTokenSale');

const DeployConstants = require('../constants/deploy'),
  {utils: {toBN}} = Web3;

contract('FirstGovernanceTokenSale', function (accounts) {
  let CNSTInstance,
    FirstGovernanceTokenSaleInstance;

  before(async () => {
    CNSTInstance = await CNSTContract.new();
    FirstGovernanceTokenSaleInstance = await FirstGovernanceTokenSaleContract.new(
      CNSTInstance.address,
      DeployConstants.SALE_BENEFICIARY_ADDRESS,
    );

    await CNSTInstance.addMinter(accounts[0], {from: accounts[0]});

    const amount = Web3.utils.toWei('100', 'ether');
    await CNSTInstance.mint(FirstGovernanceTokenSaleInstance.address, amount, {from: accounts[0]});
  });

  it(`Check if token address is correct`, async () => {
    const tokenAddress = await FirstGovernanceTokenSaleInstance.token();

    assert.equal(tokenAddress, CNSTInstance.address);
  });

  it(`Check if beneficiary address is correct`, async () => {
    const beneficiaryAddress = await FirstGovernanceTokenSaleInstance.beneficiary();

    assert.equal(beneficiaryAddress, DeployConstants.SALE_BENEFICIARY_ADDRESS);
  });

  it(`Check if sale price is correct`, async () => {
    const salePrice = await FirstGovernanceTokenSaleInstance.tokenSaleCost();

    assert.equal(salePrice, Web3.utils.toWei('0.01', 'ether'));
  });

  it(`Buy token (out stock)`, async () => {
    const buyAmount = Web3.utils.toWei('101', 'ether'),
      sentAmountValue = Web3.utils.toWei('1', 'ether');

    await truffleAssert.fails(
      FirstGovernanceTokenSaleInstance.buyToken(
        buyAmount,
        {from: accounts[3], value: sentAmountValue}
      ),
      truffleAssert.ErrorType.REVERT,
      "sale: not enough tokens to sell"
    );
  });

  it(`Buy token`, async () => {
    const buyAmount = Web3.utils.toWei('99', 'ether'),
      sentAmountValue = Web3.utils.toWei('1', 'ether');

    await FirstGovernanceTokenSaleInstance.buyToken(
      buyAmount,
      {from: accounts[3], value: sentAmountValue}
    );

    const buyerTokenBalance = Web3.utils.toWei(
      `${(await CNSTInstance.balanceOf(accounts[3]))}`,
      'wei'
    );

    assert.equal(buyerTokenBalance, buyAmount);
  });

  it(`Buy token (return gas) `, async () => {
    const buyAmount = Web3.utils.toWei(
        '1',
        'ether'
      ),
      sentAmountValue = Web3.utils.toWei(
        '0.03', 'ether'
      ),
      buyerBalance = Web3.utils.toWei(
        await web3.eth.getBalance(accounts[3]),
        'wei'
      );

    const [
      priceForTokens
    ] = await Promise.all([
      FirstGovernanceTokenSaleInstance.getPrice(buyAmount),
      FirstGovernanceTokenSaleInstance.buyToken(
        buyAmount,
        {from: accounts[3], value: sentAmountValue, gasPrice: 0}
      )
    ]);

    const newBuyerBalance = Web3.utils.toWei(
        await web3.eth.getBalance(accounts[3]),
        'wei'
      ),
      chargedAmount = toBN(`${buyerBalance}`).sub(toBN(`${newBuyerBalance}`));

    assert.equal(
      priceForTokens,
      chargedAmount.toString()
    );
  });

  it(`Buy token (not balance)`, async () => {
    const buyAmount = Web3.utils.toWei('100', 'ether'),
      sentAmountValue = Web3.utils.toWei('1', 'ether');

    await truffleAssert.fails(
      FirstGovernanceTokenSaleInstance.buyToken(
        buyAmount,
        {from: accounts[3], value: sentAmountValue}
      ),
      truffleAssert.ErrorType.REVERT,
      "sale: no tokens to sale"
    );
  });

  it(`Change beneficiary`, async () => {
    await FirstGovernanceTokenSaleInstance.changeBeneficiary(
      accounts[4],
      {from: accounts[0], gasPrice: 0}
    )

    const beneficiaryAddress = await FirstGovernanceTokenSaleInstance.beneficiary();

    assert.equal(beneficiaryAddress, accounts[4]);
  });

  it(`Change beneficiary (Error only owner)`, async () => {
    await truffleAssert.fails(
      FirstGovernanceTokenSaleInstance.changeBeneficiary(
        accounts[4],
        {from: accounts[7], gasPrice: 0}
      ),
      truffleAssert.ErrorType.REVERT,
      "Ownable: caller is not the owner."
    );
  });

});
