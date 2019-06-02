const path = require('path')
const assert = require('assert')
const Web3 = require('web3')
const ganache = require('ganache-cli')
const BigNumber = require('bignumber.js')

const web3 = new Web3(ganache.provider())

const DiaryAccount = require(path.resolve(__dirname, "../build/contracts/DiaryAccount.json"));
const DiaryRegistery = require(path.resolve(__dirname,"../build/contracts/DiaryRegistery.json"))

let diaryAccount;
let diaryRegistery;
let accounts;
describe('测试日记DAPP的职能', () => {
    before(async () => {
        accounts = await web3.eth.getAccounts();
        // diaryAccount = await new web3.eth.Contract(DiaryAccount.abi)
        //     .deploy({ data: DiaryAccount.bytecode })
        //     .send({
        //         from: accounts[9],
        //         gas: '5000000'
        //     });
        
        diaryRegistery = await new web3.eth.Contract(DiaryRegistery.abi)
        .deploy({data:DiaryRegistery.bytecode})
        .send({
            from:accounts[8],
            gas: '5000000'
        })
    })
    
    it('在平台上注册：用户名，日记账户', async()=>{
        await diaryRegistery.methods.register('blue',accounts[0]).send({
            from:accounts[0],
            gas:'5000000'
        })
    })
    it('返回已注册账户数量',async()=>{
        let total = await diaryRegistery.methods.getNumberOfAcounts().call();
        assert.equal(total,1)
    })
    
    it('根据昵称返回其日记的账户地址',async()=>{
        let addr = await diaryRegistery.methods.getAddressOfName('blue').call()
        assert.equal(addr,accounts[0])
    })

    it('根据日记账户返回昵称', async()=>{
        let nickname = await diaryRegistery.methods.getNameOfAddress(accounts[0]).call()
        assert.equal(nickname,'blue')
    })

    it('根据Id返回账户',async()=>{
        let addr = await diaryRegistery.methods.getAddressOfId(0).call()
        assert.equal(addr,accounts[0])
    })

    it('取回打赏',async ()=>{
        let oldBalance = new BigNumber(await web3.eth.getBalance(diaryRegistery.options.address))
        await web3.eth.sendTransaction({
            from:accounts[0],
            to:diaryRegistery.options.address,
            value:web3.utils.toWei('1')
        })
        await diaryRegistery.methods.adminRegisteryDonations().send({
            from:accounts[8]
        })
        let newBalance = new BigNumber(await web3.eth.getBalance(diaryRegistery.options.address))
        let dif = newBalance.minus(oldBalance);
        assert.equal(dif,web3.utils.toWei('0'))
    })
    /*
    it('diaryAccount合约部署成功', async () => {
        assert.ok(diaryAccount.options.address)
        assert.ok(diaryRegistery.options.address)
    })
    it('发日记', async () => {
        await diaryAccount.methods.diary("hello Ethereum").send({
            from: accounts[9]
        })
        let total = await diaryAccount.methods.getNumberOfDiarys().call();
        assert.equal(total, 1)
    })

    it('根据id获取日记', async () => {
        let diary = await diaryAccount.methods.getDiary(0).call();
        assert(diary, 'hello Ethereum')
    })

    it('获取最新日记', async () => {
        await diaryAccount.methods.diary("a blue day").send({
            from: accounts[9]
        })
        let diary = await diaryAccount.methods.getLastestDiary().call()
        assert.equal("a blue day", diary[0]);
    })

    it('得到日记的所有者', async () => {
        assert.equal(accounts[9], await diaryAccount.methods.getOwnerAddress().call())
    })

    it('得到日记总数', async () => {
        let total = await diaryAccount.methods.getNumberOfDiarys().call();
        assert.equal(total, 2)
    })
    it('接受打赏', async () => {
        let oldBalance = new BigNumber(await web3.eth.getBalance(diaryAccount.options.address))
        await web3.eth.sendTransaction({
            from: accounts[0],
            to: diaryAccount.options.address,
            value: web3.utils.toWei('1')
        })
        let newBalance = new BigNumber(await web3.eth.getBalance(diaryAccount.options.address))
        let dif = newBalance.minus(oldBalance);
        assert.equal(dif,web3.utils.toWei('1'))
        // diaryAccount.events.LogDonate((err,result)=>{
        //     if(err){
        //         console.log(err)
        //     }else{

        //     }
        // })

    })
    it('取回打赏',async()=>{
        let oldBalance = new BigNumber(await web3.eth.getBalance(diaryAccount.options.address))
        await diaryAccount.methods.adminRetrieveDonations(accounts[9])
        .send({
            from:accounts[9]
        })
        let newBalance = new BigNumber(await web3.eth.getBalance(diaryAccount.options.address))
        let dif = oldBalance.minus(newBalance)
        assert.equal(dif,web3.utils.toWei('1'))

    })
    it('删除合约', async()=>{
        await diaryAccount.methods.adminDeleteAccount().call({
            from:accounts[9]
        })
        let newBalance = new BigNumber(await web3.eth.getBalance(diaryAccount.options.address))
        assert.equal(newBalance,web3.utils.toWei('0'))
    })
    */
})