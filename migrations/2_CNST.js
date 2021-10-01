const Web3 = require('web3');

const CNSTContract = artifacts.require("./CNST");
const migrationRepository = require('../repositories/migrationDB');

const DeployConstants = require('../constants/deploy');

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(CNSTContract);

  const CNSTInstanceContract = await CNSTContract.deployed();

  const amount = Web3.utils.toWei('100000', 'ether');

  await migrationRepository.saveByKeyName('CNST', CNSTInstanceContract.address);
  await CNSTInstanceContract.addMinter(DeployConstants.MINTER_ADDRESS, {from: accounts[0]});
  await CNSTInstanceContract.mint(
    DeployConstants.SALE_BENEFICIARY_ADDRESS,
    amount,
    {from: accounts[0]}
  );
}
