// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RealtRentOpti.sol";

/**
* @title RealtRentOptiFactory contract
* @author Zerohix.lens
**/
contract RealtRentOptiFactory is Ownable {

    /// Mapping of user addresses to their contract address
    mapping(address => address) private userContract;

    /// List of contract addresses
    address[] public contractList;

    function createContract(uint256 _maxUsdcAmountToSpendPerCall) external {
        require(_maxUsdcAmountToSpendPerCall > 0, "Max usdc amount need to be positive");
        require(userContract[msg.sender] == address(0), "You already created your contract");

        address contractAddress;
        bytes memory bytecode = type(RealtRentOpti).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(_maxUsdcAmountToSpendPerCall, block.timestamp, contractList.length));

        assembly {
            contractAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(contractAddress)) {
                revert(0, 0)
            }
        }

        userContract[msg.sender] = contractAddress;
        contractList.push(contractAddress);

        RealtRentOpti(contractAddress).initialize(msg.sender, _maxUsdcAmountToSpendPerCall);
    }

    function getContractAddress() external view returns(address) {
        return userContract[msg.sender];
    }

}