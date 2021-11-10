/* simple vanilla page menu, feel free to replace with react */

document.addEventListener("DOMContentLoaded",function(){

  const pageMenu = document.getElementById('pageMenu')
  const openMenu = document.getElementById('openMenu')
  const closeMenu = document.getElementById('closeMenu')

  openMenu.addEventListener('click', () => {
    pageMenu.classList.add('visible')
    openMenu.classList.add('hide')
    closeMenu.classList.remove('hide')
    console.log("PAGE MENU : OPEN")
  });

  closeMenu.addEventListener('click', () => {
    pageMenu.classList.remove('visible')
    openMenu.classList.remove('hide')
    closeMenu.classList.add('hide')    
    console.log("PAGE MENU : CLOSE")
  });


})





