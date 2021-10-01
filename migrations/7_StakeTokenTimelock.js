const Web3 = require('web3');

const DateHelpers = require('../utils/date');

const TokenTimeLockContract = artifacts.require("./TokenTimeLock"),
  CNSTContract = artifacts.require("./CNST");

const migrationRepository = require('../repositories/migrationDB'),

  getCNSTContract = async () => {
    const CNSTAddress = await migrationRepository.getByKeyName('CNST');
    return CNSTContract.at(CNSTAddress);
  };

/**
 * @description Define how much stake time lock.
 * @param deployer
 * @param network
 * @param accounts
 * @return {Promise<void>}
 */
module.exports = async function (deployer, network, accounts) {
  const CNSTInstance = await getCNSTContract(),
    beneficiaryAddress = await migrationRepository.getByKeyName('StakeForMoreSameToken')

  await deployTimeLock({
    accounts,
    deployer,
    deployName: 'StakeTimeLock1',
    _amount: 200000,
    sumDays: 180,
    CNSTInstance,
    beneficiaryAddress
  });
}

async function deployTimeLock({
                                deployer,
                                accounts,
                                deployName = 'StakeTokenTimelock',
                                _amount = '200000',
                                sumDays = 180,
                                CNSTInstance,
                                beneficiaryAddress = "0x0"
                              }) {

  const currentDateInUnixTime = DateHelpers.currentDateToUnixTime(),
    futureDateInUnixTime = DateHelpers.addDaysToUnixTime(currentDateInUnixTime, sumDays)

  await deployer.deploy(
    TokenTimeLockContract,
    CNSTInstance.address,
    beneficiaryAddress,
    futureDateInUnixTime,
  );
  const timeLockInstanceContract = await TokenTimeLockContract.deployed();

  await migrationRepository
    .saveByKeyName(deployName, timeLockInstanceContract.address);

  const amount = Web3.utils.toWei(`${_amount}`, 'ether');

  await CNSTInstance.mint(timeLockInstanceContract.address, amount, {from: accounts[0]});
}
