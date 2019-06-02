pragma solidity ^0.5.0;

contract  DiaryRegistery{

    mapping(address=>string) _addressToAccountName;

    mapping (uint=>address) _accountIdToAccountAddress;

    mapping (string=>address) _accountNameToAddress;

    uint _numberOfAccounts;

    address payable _registeryAdmin;

    modifier onlyRegisteryAdmin{
        require(msg.sender == _registeryAdmin,"你不是管理员");
        _;
    }

    constructor() public{
        _registeryAdmin = msg.sender;
        _numberOfAccounts = 0;
    }

    //在平台上注册：用户名，日记账户
    function register(string memory name,address accountAddress) public {
        require(_accountNameToAddress[name]==address(0),"账户已经注册");
        require(bytes(_addressToAccountName[accountAddress]).length==0,"用户名已存在");
        require(bytes(name).length <= 64,"不能超过28个字符");

        _addressToAccountName[accountAddress] = name;
        _accountNameToAddress[name] = accountAddress;
        _accountIdToAccountAddress[_numberOfAccounts] = accountAddress;
        _numberOfAccounts++;
    }
    //返回已注册账户数量
    function getNumberOfAcounts() external view returns(uint) {
        return _numberOfAccounts;
    }

    //根据昵称返回其日记的账户地址
    function getAddressOfName(string memory name) public view returns (address) {
        return _accountNameToAddress[name];
    }

    //根据日记账户返回昵称
    function getNameOfAddress(address addr) external view returns(string memory) {
        return _addressToAccountName[addr];
    }

    //根据Id返回账户
    function getAddressOfId(uint id)external view returns(address) {
        return _accountIdToAccountAddress[id];
    }

    //取回打赏
    function adminRegisteryDonations() external onlyRegisteryAdmin {
        _registeryAdmin.transfer(address(this).balance);
    }

    //摧毁合约
    function adminDeleteRegistery( )external onlyRegisteryAdmin {
        selfdestruct(_registeryAdmin);
    }

    //记录每条打赏记录
    event LogDonate(address indexed,uint);

    function()external payable{
        emit LogDonate(msg.sender,msg.value);
    }
}