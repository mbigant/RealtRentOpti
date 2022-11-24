const { expect } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expectEvent } = require('@openzeppelin/test-helpers');
const { BN } = require('@openzeppelin/test-helpers');

const RealtRentOptiFactory = artifacts.require("RealtRentOptiFactory");

contract('RealtRentOptiFactory', (accounts) => {

  const [owner] = accounts;

  let instance;

  beforeEach(async function () {
    instance = await RealtRentOptiFactory.new({from: owner});
  });

  it('should create new contract', async() => {

    const usdcAmountInWei = new BN(10 ** 6); // 1 usdc

    const tx = await instance.createContract(usdcAmountInWei);
    const addressCreate = await instance.contractList(0);
    const ownerContract = await instance.getContractAddress();

    expect(addressCreate).to.not.be.null;
    expect(addressCreate).to.equal(ownerContract);
  });

  it('should revert if maxUsdcAmount is 0', async() => {

    const usdcAmountInWei = new BN(0);

    const tx = instance.createContract(usdcAmountInWei);

    await expectRevert(tx, "Max usdc amount need to be positive");

  });

  it('should revert if address already created contract', async() => {

    const usdcAmountInWei = new BN(10 ** 6); // 1 usdc

    await instance.createContract(usdcAmountInWei);

    const tx2 = instance.createContract(usdcAmountInWei);

    await expectRevert(tx2, "You already created your contract");

  });

});