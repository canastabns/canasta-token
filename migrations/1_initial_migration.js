const Migrations = artifacts.require("./Migrations.sol");

const migrationRepository = require('../repositories/migrationDB');

module.exports = function(deployer) {
  deployer.deploy(Migrations)
    .then(i => migrationRepository.saveByKeyName('migration', i.address))
};
