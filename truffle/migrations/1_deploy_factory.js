const RealtRentOptiFactory = artifacts.require("RealtRentOptiFactory");

module.exports = async function (deployer, network, account) {
  await deployer.deploy(RealtRentOptiFactory);
  const factoryInstance = await RealtRentOptiFactory.deployed();

  if( 'development' === network ) {

  }
  else {
    await factoryInstance.transferOwnership("0x6fdF236519Ef8E87c902334cda01640d578C3fCc");
  }

};
