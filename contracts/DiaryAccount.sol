pragma solidity ^0.5.0;

contract DiaryAccount{

    struct Diary{
        uint timestamp;
        string diaryString;
    }

    mapping(uint =>  Diary) _diarys;

    uint _numberOfDiarys;

    address payable _adminAddress;

    event LogDonate(address indexed, uint);

    //权限控制
    modifier onlyAdmin{
        require(msg.sender == _adminAddress,"必须是日记主人");
        _;
    }

    constructor() public{
        _numberOfDiarys = 0;
        _adminAddress = msg.sender;
    }

    //发日记
    function diary(string memory diaryString)public onlyAdmin{
        _diarys[_numberOfDiarys].timestamp = block.timestamp;
        _diarys[_numberOfDiarys].diaryString = diaryString;
        _numberOfDiarys++;
    }

    //根据ID获取日记
    function getDiary(uint diaryId)external view returns( string memory, uint){
        return(
            _diarys[diaryId].diaryString,
            _diarys[diaryId].timestamp
        );
    }

    //获取最新的日记
    function getLastestDiary()external view returns(string memory,uint,uint) {
        return(
            _diarys[_numberOfDiarys-1].diaryString,
            _diarys[_numberOfDiarys-1].timestamp,
            _numberOfDiarys
        );
    }

    //得到日记的所有者
    function getOwnerAddress() external view returns(address) {
        return _adminAddress;
    }

    //得到日记的总数
    function getNumberOfDiarys()external view returns(uint) {
        return _numberOfDiarys;
    }

    //取回打赏
    function adminRetrieveDonations(address payable receiver)public onlyAdmin{
       receiver.transfer(address(this).balance);
    }

    //删除合约
    function adminDeleteAccount()external onlyAdmin {
        selfdestruct(_adminAddress);
    }

    //接受打赏
    function ()external payable {
       emit LogDonate(msg.sender,msg.value);
    }
}