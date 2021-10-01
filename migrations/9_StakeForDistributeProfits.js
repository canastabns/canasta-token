const StakeForDistributeProfitsContract = artifacts.require("./StakeForDistributeProfits"),
  CNSTContract = artifacts.require("./CNST");

const migrationRepository = require('../repositories/migrationDB'),

  getCNSTContract = async () => {
    const CNSTAddress = await migrationRepository.getByKeyName('CNST');
    return CNSTContract.at(CNSTAddress);
  };

module.exports = async function (deployer) {
  const CNSTInstance = await getCNSTContract();

  await deployer.deploy(
    StakeForDistributeProfitsContract,
    CNSTInstance.address
  );

  const contractInstance = await StakeForDistributeProfitsContract.deployed();

  await migrationRepository.saveByKeyName(
    'StakeForDistributeProfits',
    contractInstance.address
  );
}
