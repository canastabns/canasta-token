// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after a time".
 *
 * For a more complete vesting schedule, see {TokenVesting}.
 */
contract TokenTimeLock {
    using SafeERC20 for IERC20;

    // ERC20 basic token contract being held
    IERC20 public token;

    // beneficiary of tokens after they are released
    address public beneficiary;

    // timestamp when token release is enabled
    uint256 public releaseTime;

    constructor(
        IERC20 _token,
        address _beneficiary,
        uint256 _releaseTime
    ) {
        require(_releaseTime > block.timestamp, "_releaseTime > block.timestamp");

        token = _token;
        beneficiary = _beneficiary;
        releaseTime = _releaseTime;
    }

    /**
     * @notice Transfers tokens held by timelock to beneficiary.
     */
    function release() external {
        // solhint-disable-next-line not-rely-on-time
        require(
            block.timestamp >= releaseTime,
            "release: current time is before release time"
        );

        uint256 amount = token.balanceOf(address(this));
        require(amount > 0, "TokenTimeLock: no tokens to release");

        token.safeTransfer(beneficiary, amount);
    }
}
