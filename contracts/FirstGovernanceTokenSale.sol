// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev A token holder contract that will sale to first people that decide to support the project
 */
contract FirstGovernanceTokenSale is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // ERC20 basic token contract being held
    IERC20 public token;

    // beneficiary of sale.
    address public beneficiary;

    uint256 public tokenSaleCost = 0.01 ether;

    constructor(IERC20 _token, address _beneficiary) {
        token = _token;
        beneficiary = _beneficiary;
    }

    function changeBeneficiary(address _beneficiary) external onlyOwner {
        beneficiary = _beneficiary;
    }

    function _getPrice(uint256 _amount) private view returns (uint256) {
        return _amount
        .div(1e18)
        .mul(tokenSaleCost);
    }

    function getPrice(uint256 amount) external view returns (uint256) {
        return _getPrice(amount);
    }

    /*
        @notice We allow the purchase of governance tokens for a {tokenSaleCost}
        as well we transfer the balance to a beneficiary.
        @param {amount} in wei
    */
    function buyToken(uint256 amount) external payable {
        uint256 availableToSaleAmount = token.balanceOf(address(this));
        require(availableToSaleAmount > 0, "sale: no tokens to sale");

        require(availableToSaleAmount >= amount, "sale: not enough tokens to sell");

        uint256 totalCost = _getPrice(amount);
        require(msg.value >= totalCost, "sale: value sent is less than the total cost tokens");

        token.safeTransfer(msg.sender, amount);

        if (msg.value > totalCost) {
            payable(msg.sender).transfer(msg.value - totalCost);
        }

        payable(beneficiary).transfer(address(this).balance);
    }
}
