const { expect } = require('chai');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expectEvent } = require('@openzeppelin/test-helpers');
const { BN } = require('@openzeppelin/test-helpers');

const RealtRentOpti = artifacts.require("RealtRentOpti");

contract('RealtRentOpti', (accounts) => {

  const [owner, user1, user2] = accounts;
  let instance;

  beforeEach(async function () {
    instance = await RealtRentOpti.new({from: owner});
    const usdcAmountInWei = new BN(10 ** 6); // 1 usdc
    await instance.initialize( owner, usdcAmountInWei, {from: owner} );
  });

  it('should revert if non whitelisted want to deposit', async() => {

    const tx = instance.rmmDeposit({from: user1});

    await expectRevert(tx, "Address not whitelisted");
  });

  it('should revert if non whitelisted want to repay', async() => {

    const tx = instance.rmmRepay({from: user1});

    await expectRevert(tx, "Address not whitelisted");
  });

  it('should revert if non owner want to redeemTokens', async() => {

    const tx = instance.redeemTokens({from: user1});

    await expectRevert(tx, "Ownable: caller is not the owner");
  });

  it('should revert if non owner want to set maxUsdcAmount', async() => {

    const tx = instance.setMaxUsdcAmountToSpend(100000,{from: user1});

    await expectRevert(tx, "Ownable: caller is not the owner");
  });

  it('should revert if non owner want to set whitelist an address', async() => {

    const tx = instance.whitelistAddress(user2, {from: user1});

    await expectRevert(tx, "Ownable: caller is not the owner");
  });

  it('should add whitelisted address', async() => {

    await instance.whitelistAddress( user1, {from: owner} );

    const size = await instance.whitelistSize();
    const address = await instance.whitelistAddresses(1); // 0 is owner, 1 is user1
    const isWhitelisted = await instance.isWhitelisted(address);

    expect(size).to.be.bignumber.equal(new BN(2)); // owner + user1
    expect(isWhitelisted).to.be.true;

  });

  it('should remove whitelisted address', async() => {

    await instance.whitelistAddress( user1, {from: owner} );
    await instance.removeFromWhitelist( 1, {from: owner} ); // 0 is owner, 1 is user1

    const size = await instance.whitelistSize();
    const address = await instance.whitelistAddresses(1);
    const isWhitelisted = await instance.isWhitelisted(address);

    expect(size).to.be.bignumber.equal(new BN(2));
    expect(isWhitelisted).to.be.false;

  });

  it('should revert if already whitelisted', async() => {

    await instance.whitelistAddress( user1, {from: owner} );

    const tx = instance.whitelistAddress( user1, {from: owner} );

    await expectRevert(tx, "Already whitelisted");

  });

  it('should allow to whitelisted after removed', async() => {

    await instance.whitelistAddress( user1, {from: owner} );
    await instance.removeFromWhitelist( 1, {from: owner} );
    await instance.whitelistAddress( user1, {from: owner} );

    const isUser1Whitelisted = await instance.isWhitelisted(user1);

    expect(isUser1Whitelisted).to.be.true;

  });

});