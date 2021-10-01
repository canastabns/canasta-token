const Web3 = require('web3');

const DateHelpers = require('../utils/date'),
  DeployConstants = require('../constants/deploy');

const TokenTimeLockContract = artifacts.require("./TokenTimeLock"),
  CNSTContract = artifacts.require("./CNST");

const migrationRepository = require('../repositories/migrationDB'),

  getCNSTContract = async () => {
    const CNSTAddress = await migrationRepository.getByKeyName('CNST');
    return CNSTContract.at(CNSTAddress);
  };

/**
 * @description Define how much time lock.
 * @param deployer
 * @param network
 * @param accounts
 * @return {Promise<void>}
 */
module.exports = async function (deployer, network, accounts) {
  const CNSTInstance = await getCNSTContract();

  await deployTimeLock({
    accounts,
    deployer,
    deployName: 'TokenTimeLock2',
    _amount: 50000,
    sumDays: 180,
    CNSTInstance
  });
}

async function deployTimeLock({
                                deployer,
                                accounts,
                                deployName = 'TokenTimeLock',
                                _amount = '50000',
                                sumDays = 60,
                                CNSTInstance
                              }) {

  const currentDateInUnixTime = DateHelpers.currentDateToUnixTime(),
    futureDateInUnixTime = DateHelpers.addDaysToUnixTime(currentDateInUnixTime, sumDays)

  await deployer.deploy(
    TokenTimeLockContract,
    CNSTInstance.address,
    DeployConstants.TIME_LOCK_BENEFICIARY_ADDRESS,
    futureDateInUnixTime,
  );
  const timeLockInstanceContract = await TokenTimeLockContract.deployed();

  await migrationRepository
    .saveByKeyName(deployName, timeLockInstanceContract.address);

  const amount = Web3.utils.toWei(`${_amount}`, 'ether');

  await CNSTInstance.mint(timeLockInstanceContract.address, amount, {from: accounts[0]});
}
