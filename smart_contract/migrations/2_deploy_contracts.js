const IPRegistry = artifacts.require("IPRegistry");
const ContractIp = artifacts.require("ContractIp");
const Convert = artifacts.require("convert");
const Ipbidder = artifacts.require("Ipbidder");
const ContractIp = artifacts.require("ContractIp");
const Convert = artifacts.require("convert");
const Ipbidder = artifacts.require("Ipbidder");

module.exports = async async function (deployer) {
  // Deploy Convert library first
  await deployer.deploy(Convert);
  
  // Link the Convert library to ContractIp
  await deployer.link(Convert, ContractIp);
  
  // Deploy Ipbidder
  await deployer.deploy(Ipbidder);
  
  // Deploy ContractIp with Ipbidder address
  const ipbidderInstance = await Ipbidder.deployed();
  await deployer.deploy(ContractIp, ipbidderInstance.address);
  
  // Deploy IPRegistry if needed
  await deployer.deploy(IPRegistry);
  
  // Log the deployed contract addresses
  const contractIp = await ContractIp.deployed();
  console.log("ContractIp deployed at:", contractIp.address);
  console.log("Ipbidder deployed at:", ipbidderInstance.address);
  console.log("IPRegistry deployed at:", (await IPRegistry.deployed()).address);
};
