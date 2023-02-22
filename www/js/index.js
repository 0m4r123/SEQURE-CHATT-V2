/* Denna script använs för att dölja privata chatten i home.hbs  */
let button = document.getElementById("main");
let publicChatt = document.getElementById("public-chatt");
let secondButton = document.getElementById("second-main");
let privateChatt = document.getElementById("private-chatt");

/* Om knappen Offentlig trycks så visas den offentliga chatt rutan, 
den privata döljs ifall användaren hade den framme*/
button.onclick = function () {
  if (publicChatt.style.display == "none") {
    publicChatt.style.display = "block";
    privateChatt.style.display = "none";
  }
};
/* Om knappen Privat trycks så visas den offentliga chatt rutan, 
den Offentliga döljs ifall användaren hade den framme*/
secondButton.onclick = function () {
  if (privateChatt.style.display == "none") {
    privateChatt.style.display = "block";
    publicChatt.style.display = "none";
  }
};
