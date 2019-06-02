App = {
  web3Provider: null,
  contracts: {},
  DiaryAccountAddress: null,
  DiaryRegisteryAddress: null,
  defaultGas: '5000000',
  initWeb3: () => {
    if (typeof web3 !== 'undefined') {

      App.web3Provider = web3.currentProvider;
    } else {
      alert('你的浏览器未安装以太坊钱包，请安装');
      window.location.href = "https://metamask.io/";
    }
    web3 = new Web3(App.web3Provider)

    return App.initContract();
  },

  initContract: async () => {
    App.DiaryRegisteryAddress = address
    $.getJSON('DiaryRegistery.json', (data) => {
      let DiaryRegisteryJson = data
      App.contracts.DiaryRegistery = TruffleContract(DiaryRegisteryJson);
      App.contracts.DiaryRegistery.setProvider(App.web3Provider);

      return App.getPlantFromInfo()
    })
    $.getJSON('DiaryAccount.json', (data) => {
      let DiaryAccountJson = data;
      App.contracts.DiaryAccount = TruffleContract(DiaryAccountJson);
      App.contracts.DiaryAccount.setProvider(App.web3Provider);
    })

  },
  //获取平台信息
  getPlantFromInfo: async () => {

    $("#plantFromAccount").html(App.DiaryRegisteryAddress);
    web3.eth.getBalance(App.DiaryRegisteryAddress, (e, r) => {
      $("#plantFromBalance").html(web3.fromWei(r) + ' ether')
    })
    return App.showAllregister();
  },

  //注册账号
  reigister: async () => {
    let name = $('#d_name').val()
    let DiaryRegisteryInstance = await App.contracts.DiaryRegistery.at(App.DiaryRegisteryAddress)
    if(!name){
      alert("用户名不能为空")
      return
    }
    let isExist = await DiaryRegisteryInstance.getAddressOfName.call(name)
    if (isExist!="0x0000000000000000000000000000000000000000") {
      alert("用户名已存在")
      $('#d_name').val('')
      return;
    }
    let DiaryAccountInstance = await App.contracts.DiaryAccount.new({
      from: web3.eth.defaultAccount,
      gas: App.defaultGas
    })
    //生成账户
    App.DiaryAccountAddress = DiaryAccountInstance.address;
    $('#d_address').val(App.DiaryAccountAddress)

    await DiaryRegisteryInstance.register(name, App.DiaryAccountAddress, {
      from: web3.eth.defaultAccount,
      gas: App.defaultGas
    })
    return App.showAllregister()
  },
  //展示所有已注册用户
  showAllregister: async () => {
    let list = await App.getAllUsers()
    $('#userList').html('');
    list.forEach((item, index) => {
      $('#userList').append("<tr><td>" + item.id + "</td><td>" + item.name + "</td><td>" + item.addr + "</td></tr>")
    })
  },
  //根据id获得账户
  getRegisterUser: async (id) => {

    let DiaryRegisteryInstance = await App.contracts.DiaryRegistery.at(App.DiaryRegisteryAddress)
    let addr = await DiaryRegisteryInstance.getAddressOfId.call(id)
    let name = await DiaryRegisteryInstance.getNameOfAddress.call(addr)
    return { id, name, addr }
  },

  //平台上所有注册用户
  getTotalUsers: async () => {
    App.DiaryRegisteryInstance = await App.contracts.DiaryRegistery.at(App.DiaryRegisteryAddress)
    return App.DiaryRegisteryInstance.getNumberOfAcounts.call()
  },

  //所有注册过的用户的详细信息
  getAllUsers: async () => {
    let users = []
    let total = await App.getTotalUsers()
    for (let i = 0; i < total; i++) {
      let user = await App.getRegisterUser(i);
      users.push(user);
    }
    return users;
  },

  //进行打赏
  sendReward: async () => {
    let amount = $('#amount').val()
    if (!amount) {
      alert('请输入金额')
    } else if (isNaN(amount)) {
      alert('请输入数字')
      $('#amount').val('')
    } else {
      await web3.eth.sendTransaction({
        from: web3.eth.defaultAccount,
        to: App.DiaryRegisteryAddress,
        value: web3.toWei(amount)
      }, async () => {
        $('#amount').val('')
      })
    }
  },
 
     //我是平台主人，取回打赏
  getReward: async()=>{
    try {
    let DiaryRegisteryInstance = await App.contracts.DiaryAccount.at(App.DiaryRegisteryAddress)
    await DiaryRegisteryInstance.adminRegisteryDonations({
      from: web3.eth.defaultAccount,
      gas: App.defaultGas
    })      
    } catch (error) {
     alert("抱歉,你并不是主人") 
     
    }
  },

  //---------------------------------------------------------------------------------------------------------------------
  needReister : async()=>{
    if(!App.DiaryAccountAddress){
      alert("抱歉您还未注册")
      return
    }
  },
  getMessage:async()=>{
   
    let DiaryRegisteryInstance = await App.contracts.DiaryRegistery.at(App.DiaryRegisteryAddress)  
    let nickName =await DiaryRegisteryInstance.getNameOfAddress.call(App.DiaryAccountAddress)
    $('#nickName').html(nickName)
    $('#myAddress').html(App.DiaryAccountAddress)
    web3.eth.getBalance(App.DiaryAccountAddress, (e, r) => {
      $("#totalReward").html(web3.fromWei(r) + ' ether')
    })
  },

  //写日记
  writeDiary: async()=>{
    App.needReister()
    let DiaryAccountInstance = await App.contracts.DiaryAccount.at(App.DiaryAccountAddress)
    let content = $('#content').val();
    await DiaryAccountInstance.diary(content,{
      from: web3.eth.defaultAccount,
      gas: App.defaultAccount
    })
    $('#content').val('');
    return App.showDiaries()
  },
  //展示所有日记
  showDiaries: async()=>{
   let list = await App.getAllDiaries()
   $('#diaryContentList').html('')
   list.forEach((item)=>{
      $("#diaryContentList").append("<tr><td>" + item.id + "</td><td>" + item.diaryContent + "</td><td>" + item.timestamp + "</td></tr>")
   })
  },
  //返回制定id的日记
  getDiaryByid: async (id)=>{
    let DiaryAccountInstance = await App.contracts.DiaryAccount.at(App.DiaryAccountAddress)
    let res =await DiaryAccountInstance.getDiary.call(id)
    return{
      id: id,
      diaryContent: res[0],
      timestamp: res[1]
    }
  },

  //返回账户的日记总数
  getTotalDiary: async ()=>{
    let DiaryAccountInstance = await App.contracts.DiaryAccount.at(App.DiaryAccountAddress)
    return DiaryAccountInstance.getNumberOfDiarys.call();
  },
  
  //返回账户发的所有日记
  getAllDiaries: async()=>{
    let diaries = []
    let total =await App.getTotalDiary();
    for(let i=0;i<total;i++){
      let diary = await App.getDiaryByid(i);
      diaries.push(diary);
    }
    return diaries;    
  },
  getMyReward: async()=>{
    App.needReister()
    let DiaryAccountInstance = await App.contracts.DiaryAccount.at(App.DiaryAccountAddress)
    await DiaryAccountInstance.adminRetrieveDonations(web3.eth.defaultAccount,{
      from: web3.eth.defaultAccount,
      gas: App.defaultGas
    })
    web3.eth.getBalance(App.DiaryAccountAddress, (e, r) => {
      $("#totalReward").html(web3.fromWei(r) + ' ether')
    })
  }

}
$(function () {
  $(window).load(function () {
    App.initWeb3();
    $('#home_tab').click((e)=>{
      e.preventDefault()
      App.showAllregister()
    })
    $('#diary_tab').click((e)=>{
      e.preventDefault()
      App.getMessage()
      App.showDiaries()
    })
    $("#submit").click(() => {
      App.reigister();
    })
    $("#reward").click(() => {
      App.sendReward()
    })
    $('#onwer').click(()=>{
      App.getReward()
    })
    $('#writeNow').click(()=>{
      App.writeDiary()
    })
    $('#myReward').click(()=>{
      App.getMyReward()
    })
  });
});