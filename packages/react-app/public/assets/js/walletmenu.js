/* simple vanilla wallet menu, feel free to replace with react */

document.addEventListener("DOMContentLoaded",function(){

  console.log("WALLET MENU")

  const openWalletMenu = document.getElementById('openWalletMenu')
  const closeWalletMenu = document.getElementById('closeWalletMenu')
  const walletMenu = document.getElementById('walletMenu')

  openWalletMenu.addEventListener('click', () => {
    walletMenu.classList.add('visible')
    console.log("WALLET MENU : OPEN")
  });

  closeWalletMenu.addEventListener('click', () => {
    walletMenu.classList.remove('visible')
    console.log("WALLET MENU : CLOSE")
  });


})





