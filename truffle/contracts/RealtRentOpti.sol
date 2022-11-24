// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
* @title RealtRentOpti contract
* @author Zerohix.lens
* @notice Created by RealtRentOptiFactory contract
**/
contract RealtRentOpti is Ownable {

    bool private initialized;

    address private constant WXDAI_ADDRESS = 0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d;
    address private constant USDC_ADDRESS = 0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83;
    address private constant RMM_LENDING_POOL_ADDRESS = 0x5B8D36De471880Ee21936f328AAB2383a280CB2A;
    address private constant CURVE_3CRV_LENDING_POOL = 0x7f90122BF0700F9E7e1F688fe926940E8839F353;
    address private constant XDAI_DEBT_ADDRESS = 0x6a7CeD66902D07066Ad08c81179d17d0fbE36829;

    /// WXDAI token index in the curve's 3pool
    int128 private constant WXDAI_3CRV_INDEX = 0;

    /// USDC token index in the curve's 3pool
    int128 private constant USDC_3CRV_INDEX = 1;

    /// Max amount of USDC spend each time rmmDeposit() or rmmRepay is called, should be close to rent amount
    uint256 private maxUsdcAmountToSpend;

    /// Mapping of whitelisted addresses that can call deposit or repay (ie: Gelato contract...)
    mapping( address => bool ) private whitelist;

    /// List of whitelisted addresses
    address[] public whitelistAddresses;

    /// Maximum of 5 whitelisted addresses
    uint8 private constant MAX_WHITELISTED_ADDRESS = 5;

    /**
    * @dev emitted on deposit
    * @param _amountUSDC the amount of USDC spent
    * @param _amountWXDAI the amount of WXDAI deposited
    **/
    event Deposit( uint256 _amountUSDC, uint256 _amountWXDAI );

    /**
    * @dev emitted on repaid
    * @param _amountUSDC the amount of USDC spent
    * @param _amountWXDAI the amount of WXDAI repaid
    **/
    event Repaid( uint256 _amountUSDC, uint256 _amountWXDAI );

    modifier onlyWhitelisted() {
        require(whitelist[msg.sender ], "Address not whitelisted");
        _;
    }

    function initialize( address _owner, uint256 _maxUsdcAmountToSpend ) public onlyOwner {
        require(!initialized, "Already initialized");
        initialized = true;
        transferOwnership(_owner);
        maxUsdcAmountToSpend = _maxUsdcAmountToSpend;
        whitelist[_owner] = true;
        whitelistAddresses.push(_owner);
    }

    /**
    * @dev Swap USDC to Wxdai from Curve 3pool and deposit on RMM LendingPool
    * @notice Swap USDC to Wxdai and deposit on RMM
    *
    * Emit a Deposit event
    *
    * Requirements:
    * - `msg.sender` must be whitelisted
    * - `owner` must have enough USDC
    * - `owner` must have allowed enough USDC to smartContract
    */
    function rmmDeposit() external onlyWhitelisted {
        require(initialized, "Contract not initialized");

        IERC20 usdc = IERC20(USDC_ADDRESS);

        // owner need to approve contract to spend its usdc
        require(usdc.balanceOf(owner()) > 0, "Insufficient USDC balance");

        // If usdc wallet balance is greater than maxUsdcAmountToSpend then only spend maxUsdcAmountToSpend
        uint256 usdcAmountToDeposit = usdc.balanceOf(owner()) > maxUsdcAmountToSpend ? maxUsdcAmountToSpend : usdc.balanceOf(owner());

        require(usdc.allowance(owner(), address(this)) >= usdcAmountToDeposit, "Insufficient USDC allowance");

        usdc.transferFrom(owner(), address(this), usdcAmountToDeposit );

        // Prepare to swap USDC => WXDAI
        usdc.approve(CURVE_3CRV_LENDING_POOL, usdcAmountToDeposit);

        // USDC is 6 decimals so convert to 18 decimals wxdai equivalent and apply 0.1% max slippage
        uint256 minWxdaiToGet = getMinWxdaiToReceive(usdcAmountToDeposit, 10);

        uint256 wxdaiAmount = _swapUsdcToWxdai(usdcAmountToDeposit, minWxdaiToGet);

        IAaveLendingPool lendingPool = IAaveLendingPool(RMM_LENDING_POOL_ADDRESS);
        IERC20(WXDAI_ADDRESS).approve(RMM_LENDING_POOL_ADDRESS, wxdaiAmount);
        lendingPool.deposit(WXDAI_ADDRESS, wxdaiAmount, owner(), 0);

        emit Deposit(usdcAmountToDeposit, wxdaiAmount);
    }

    /**
    * @dev Swap USDC to Wxdai from Curve 3pool and repaid loan on RMM
    * @notice Swap USDC to Wxdai and repaid on RMM
    *
    * Emit a Repaid event
    *
    * Requirements:
    * - `msg.sender` must be whitelisted
    * - `owner` must have enough USDC
    * - `owner` must have xDai Borrowing
    * - `owner` must have allowed enough USDC to smartContract
    */
    function rmmRepay() external onlyWhitelisted {
        require(initialized, "Contract not initialized");

        IERC20 usdc = IERC20(USDC_ADDRESS);
        require(usdc.balanceOf(owner()) > 0, "Insufficient USDC balance");

        IERC20 xdaiDebt = IERC20(XDAI_DEBT_ADDRESS);
        require(xdaiDebt.balanceOf(owner()) > 0, "Nothing to repaid");
        require(xdaiDebt.balanceOf(owner()) > (maxUsdcAmountToSpend * 10**12), "Debt is to small");

        uint256 usdcAmountAvailable = usdc.balanceOf(owner()) > maxUsdcAmountToSpend ? maxUsdcAmountToSpend : usdc.balanceOf(owner());

        require(usdc.allowance(owner(), address(this)) >= usdcAmountAvailable, "Insufficient USDC allowance");

        usdc.transferFrom(owner(), address(this), usdcAmountAvailable);

        // Prepare to swap USDC => WXDAI
        usdc.approve(CURVE_3CRV_LENDING_POOL, usdcAmountAvailable);
        // USDC is 6 decimals so convert to 18 decimals wxdai equivalent and apply 0.1% max slippage
        uint256 minWxdaiToGet = getMinWxdaiToReceive(usdcAmountAvailable, 10);

        uint256 wxdaiToRepaid = _swapUsdcToWxdai(usdcAmountAvailable, minWxdaiToGet);

        IAaveLendingPool lendingPool = IAaveLendingPool(RMM_LENDING_POOL_ADDRESS);
        IERC20(WXDAI_ADDRESS).approve(RMM_LENDING_POOL_ADDRESS, wxdaiToRepaid);
        lendingPool.repay(WXDAI_ADDRESS, wxdaiToRepaid, 2, owner()); // 2 = variable debt

        emit Repaid(usdcAmountAvailable, wxdaiToRepaid);
    }

    /**
    * @dev Transfer every USDC or WxDai stuck on the contract to the owner
    * @notice Redeem USDC and WxDai to owner
    *
    * Requirements:
    * - `msg.sender` must be the owner
    */
    function redeemTokens() external onlyOwner {
        require(initialized, "Contract not initialized");

        IERC20 usdc = IERC20(USDC_ADDRESS);
        if( usdc.balanceOf(address(this)) > 0 ) {
            usdc.transfer(owner(), usdc.balanceOf(address(this)));
        }
        IERC20 wxdai = IERC20(WXDAI_ADDRESS);
        if( wxdai.balanceOf(address(this)) > 0 ) {
            wxdai.transfer(owner(), wxdai.balanceOf(address(this)));
        }
    }

    /**
    * @notice Update the maximum USDC amount to be spent
    *
    * Requirements:
    * - `msg.sender` must be the owner
    */
    function setMaxUsdcAmountToSpend( uint256 _maxUsdcAmountToSpend ) external onlyOwner {
        maxUsdcAmountToSpend = _maxUsdcAmountToSpend;
    }

    /**
    * @notice Add address to the whitelist
    * @param _address the address to be whitelisted
    *
    * Requirements:
    * - `msg.sender` must be the owner
    * - `_address` must not be already whitelisted
    */
    function whitelistAddress( address _address ) external onlyOwner {

        require(whitelistAddresses.length < MAX_WHITELISTED_ADDRESS, "Max whitelisted addresses reached");
        require(whitelist[_address] == false, "Already whitelisted");

        bool alreadyKnown;

        for( uint8 i = 0; i< whitelistAddresses.length; i++ ) {
            if( whitelistAddresses[i] == _address ) {
                alreadyKnown = true;
                break;
            }
        }

        if( ! alreadyKnown ) {
            whitelistAddresses.push(_address);
        }

        whitelist[_address] = true;
    }

    /**
    * @notice Remove an address from the whitelist
    * @param _addressIndex the index of address in the whitelistAddresses array
    *
    * Requirements:
    * - `msg.sender` must be the owner
    * - `_addressIndex` must exists
    */
    function removeFromWhitelist( uint8 _addressIndex ) external onlyOwner {
        require( whitelistAddresses.length > _addressIndex, "Invalid address index" );
        whitelist[whitelistAddresses[_addressIndex]] = false;
    }

    function whitelistSize() external view returns(uint256) {
        return whitelistAddresses.length;
    }

    function isWhitelisted( address _address ) external view returns(bool) {
        return whitelist[_address];
    }

    function getMinWxdaiToReceive( uint256 _usdcAmount, uint8 _bpsMaxSlippage ) private pure returns(uint256) {
        // 1 bps = 0.01%
        // 10 bps = 10/100/100
        require( _bpsMaxSlippage > 0, "Max slippage required" );
        return (_usdcAmount * 10**12) - (_usdcAmount * 10**12 * _bpsMaxSlippage / 100 / 100);
    }

    function _swapUsdcToWxdai(uint256 _usdcAmount, uint256 _minWxdaiToReceive ) private returns(uint256) {
        ICurveSwap iCurveSwap = ICurveSwap(CURVE_3CRV_LENDING_POOL);
        return iCurveSwap.exchange(USDC_3CRV_INDEX, WXDAI_3CRV_INDEX, _usdcAmount, _minWxdaiToReceive);
    }

}

interface IAaveLendingPool {

    function deposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;

    function repay(
        address asset,
        uint256 amount,
        uint256 rateMode,
        address onBehalfOf
    ) external returns (uint256);
}

interface ICurveSwap {

    function exchange(
        int128 _tokenIndexToSend,
        int128 _tokenIndexToReceive,
        uint256 _tokenAmountToSend,
        uint256 _minAmountToReceive
    ) external returns(uint256);
}