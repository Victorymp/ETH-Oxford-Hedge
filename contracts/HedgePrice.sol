// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {TestFtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/TestFtsoV2Interface.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";

/**
 * @title HedgePriceFeed
 * @notice Reads FTSO price feeds for the Hedge Widget
 * @dev Deployed on Coston2 testnet for ETH Oxford hackathon
 */
contract HedgePriceFeed {
    
    struct FeedInfo {
        bytes21 id;
        string symbo
    }
    
    // Core feeds
    FeedInfo[] public feeds;
    
    // Events hedgebot
    event PriceChecked(string indexed symbol, uint256 price, int8 decimals, uint64 timestamp);
    event HedgeSignal(string indexed symbol, uint256 price, string signal);
    
    constructor() {
        // Initialize with your target feeds
        feeds.push(FeedInfo(bytes21(0x01464c522f55534400000000000000000000000000), "FLR/USD"));
        feeds.push(FeedInfo(bytes21(0x014254432f55534400000000000000000000000000), "BTC/USD"));
        feeds.push(FeedInfo(bytes21(0x014554482f55534400000000000000000000000000), "ETH/USD"));
        feeds.push(FeedInfo(bytes21(0x015852502f55534400000000000000000000000000), "XRP/USD"));
        feeds.push(FeedInfo(bytes21(0x01534f4c2f55534400000000000000000000000000), "SOL/USD"));
        feeds.push(FeedInfo(bytes21(0x01444f47452f555344000000000000000000000000), "DOGE/USD"));
    }
    
    
    /**
     * @notice Get a single price feed by index
     */
    function getFeedPrice(uint256 feedIndex) 
        external 
        view 
        returns (
            string memory symbol,
            uint256 price,
            int8 decimals,
            uint64 timestamp
        ) 
    {
        require(feedIndex < feeds.length, "Invalid feed index");
        
        TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        (price, decimals, timestamp) = ftsoV2.getFeedById(feeds[feedIndex].id);
        symbol = feeds[feedIndex].symbol;
    }
    
    /**
     * @notice Get all configured price feeds at once
     * @dev Used for the ticker
     */
    function getAllPrices() 
        external 
        view 
        returns (
            string[] memory symbols,
            uint256[] memory prices,
            int8[] memory decimals,
            uint64 timestamp
        ) 
    {
        TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        
        uint256 len = feeds.length;
        symbols = new string[](len);
        bytes21[] memory feedIds = new bytes21[](len);
        
        for (uint256 i = 0; i < len; i++) {
            symbols[i] = feeds[i].symbol;
            feedIds[i] = feeds[i].id;
        }
        
        (prices, decimals, timestamp) = ftsoV2.getFeedsById(feedIds);
    }
    
    /**
     * @notice Get price in Wei
     */
    function getPriceInWei(uint256 feedIndex) 
        external 
        view 
        returns (uint256 priceWei, uint64 timestamp) 
    {
        require(feedIndex < feeds.length, "Invalid feed index");
        
        TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        return ftsoV2.getFeedByIdInWei(feeds[feedIndex].id);
    }
    
    /**
     * @notice Check price and emit price signal
     * @dev Call this to log price checks on-chain
     */
    function checkAndSignal(uint256 feedIndex, string calldata signal) external {
        require(feedIndex < feeds.length, "Invalid feed index");
        
        TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
        (uint256 price, int8 decimals, uint64 timestamp) = ftsoV2.getFeedById(feeds[feedIndex].id);
        
        emit PriceChecked(feeds[feedIndex].symbol, price, decimals, timestamp);
        emit HedgeSignal(feeds[feedIndex].symbol, price, signal);
    }
    
    function getFeedCount() external view returns (uint256) {
        return feeds.length;
    }
    
    function getFeedSymbol(uint256 index) external view returns (string memory) {
        require(index < feeds.length, "Invalid index");
        return feeds[index].symbol;
    }
}