/*

Used config

MNEMONIC
edit avoid behind drop fit mouse fly enable mandate world return circle



// Need to modify the duration in the stages to quickly test
// need to modify startTime about 2-3 minutes later than the current time to test the process that has not started
// Copy the following Config to config.json

{
    "token":{
        "totalSupply" : 200000000,
        "name" : "eComX Token",
        "symbol" : "eComX",
        "decimals" : 18
    },
    "tokenSale":{
        "receiverAddr" : "0x00",
        "totalSaleAmount" : 56000000,        
        "stages" : [
            {"rate": 500, "duration":120},
            {"rate": 480, "duration":120}
        ],
        "startTime" : Unix timestamp approximately 2-3 minutes later than the current time,,
        "userWithdrawalDelaySec" : 60,
        "clearDelaySec" : 60
    }
}




*/

var Token = artifacts.require("./eComXToken.sol");
var TokenSale = artifacts.require("./ShareTokenSale.sol");
var config = require("../config.json");
var tokenConfig = config.token;
var tokenSaleConfig = config.tokenSale;

var sleep = require('sleep-promise');

var gas = 2000000;

function convertDecimals(number) {    
    return web3.toBigNumber(10).pow(tokenConfig.decimals).mul(number);
}

function getUnixTime(){
    return Math.round(new Date().getTime()/1000);
}

function sleepSec(sec){
    if(sec < 0){
        sec = 0;
    }
    console.log("Sleep :" + sec + " Sec");
    return sleep(sec * 1000); // sleep use ms
}

contract('Exception Data test', function(accounts) {
    var tokenInstance = null;
    var toknSaleInstance = null;

    it("Contract Token will deployed", () => {
        return Token.deployed()
        .then(instance => {
            tokenInstance = instance;
            assert.notEqual(tokenInstance, null);
        });
    });

    it("Contract TokenSale will deployed", () => {
        return TokenSale.deployed()
        .then(instance => {
            toknSaleInstance = instance;
            assert.notEqual(toknSaleInstance, null);
        });
    });

    it("Send value shall be more than 0.1 ether", () => {
        return toknSaleInstance.startTime().then(time => {
            console.log("StartTime:", time.toNumber());
            //wating for starting
            return sleepSec(time.plus(2).sub(getUnixTime()).toNumber());
        })        
        .then(() => {
            console.log("Now:", getUnixTime());
            var hash  = web3.eth.sendTransaction({from: accounts[0], to: toknSaleInstance.address, value: convertDecimals(1), gas: gas});            
            var receipt = web3.eth.getTransactionReceipt(hash);            
            assert.equal(receipt.status, '0x01', "The Transaction will success");
            hash  = web3.eth.sendTransaction({from: accounts[0], to: toknSaleInstance.address, value: convertDecimals(0.1), gas: gas});
            receipt = web3.eth.getTransactionReceipt(hash); 
            assert.equal(receipt.status, '0x01', "The Transaction will success");
            hash  = web3.eth.sendTransaction({from: accounts[1], to: toknSaleInstance.address, value: convertDecimals(0.09), gas: gas});
            receipt = web3.eth.getTransactionReceipt(hash); 
            assert.equal(receipt.status, '0x00', "The Transaction will failure");
        })
    })

});

