const Web3 = require('web3');
const path = require('path')
const fs = require('fs');
const TruffleContract = require('truffle-contract');

const DiaryReigstery = require(path.resolve(__dirname, "../../build/contracts/DiaryRegistery.json"))

let web3Provider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
let web3 =new Web3(web3Provider);

let contract = TruffleContract(DiaryReigstery)

contract.setProvider(web3Provider)

web3 = new Web3(web3Provider);
(async ()=>{
    let accounts = await web3.eth.getAccounts();
    let diaryRegistery =await  contract.new({
        from: accounts[9],
        gas: 5000000
    });
    
    fs.writeFileSync(path.resolve(__dirname,"./address.js"),"const address ="+JSON.stringify(diaryRegistery.address))
    
})()





