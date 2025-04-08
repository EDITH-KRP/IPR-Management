const IPRegistry = artifacts.require("IPRegistry");

module.exports = function (deployer) {
  deployer.deploy(IPRegistry);
};
