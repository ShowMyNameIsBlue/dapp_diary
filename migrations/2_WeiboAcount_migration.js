const DiaryRegistery = artifacts.require("DiaryRegistery");
const DiaryAcount = artifacts.require("DiaryAcount");
module.exports = function(deployer) {
  deployer.deploy(DiaryRegistery);
  deployer.deploy(DiaryAcount);
};
