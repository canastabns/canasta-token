const Web3 = require('web3');

const FirstGovernanceTokenSaleContract = artifacts.require("./FirstGovernanceTokenSale"),
  CNSTContract = artifacts.require("./CNST");

const DeployConstants = require('../constants/deploy');

const migrationRepository = require('../repositories/migrationDB'),

  getCNSTContract = async () => {
    const CNSTAddress = await migrationRepository.getByKeyName('CNST');
    return CNSTContract.at(CNSTAddress);
  };

module.exports = async function (deployer, network, accounts) {
  const CNSTInstance = await getCNSTContract();

  await deployer.deploy(
    FirstGovernanceTokenSaleContract,
    CNSTInstance.address,
    DeployConstants.SALE_BENEFICIARY_ADDRESS
  );

  const firstGovernanceTokenSaleContractInstance = await FirstGovernanceTokenSaleContract.deployed();

  await migrationRepository.saveByKeyName(
    'FirstGovernanceTokenSale',
    firstGovernanceTokenSaleContractInstance.address
  );

  const amount = Web3.utils.toWei(`400000`, 'ether');

  await CNSTInstance.mint(
    firstGovernanceTokenSaleContractInstance.address,
    amount,
    {from: accounts[0]}
  );
}
