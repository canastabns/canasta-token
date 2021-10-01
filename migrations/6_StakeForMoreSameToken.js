const StakeForMoreSameTokenContract = artifacts.require("./StakeForMoreSameToken"),
  CNSTContract = artifacts.require("./CNST");

const migrationRepository = require('../repositories/migrationDB'),

  getCNSTContract = async () => {
    const CNSTAddress = await migrationRepository.getByKeyName('CNST');
    return CNSTContract.at(CNSTAddress);
  };

module.exports = async function (deployer, network, accounts) {
  const CNSTInstance = await getCNSTContract();

  await deployer.deploy(
    StakeForMoreSameTokenContract,
    CNSTInstance.address
  );

  const stakeForMoreSameTokenContractInstance = await StakeForMoreSameTokenContract.deployed();

  await migrationRepository.saveByKeyName(
    'StakeForMoreSameToken',
    stakeForMoreSameTokenContractInstance.address
  );
}
