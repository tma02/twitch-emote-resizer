var pica = pica();
var URL = window.URL || window.webkitURL;

var body = document.querySelector('body');
var sourceImg = document.querySelector('#source');
var canvases = [
  document.querySelector('#c28'),
  document.querySelector('#c56'),
  document.querySelector('#c112'),
];

sourceImg.addEventListener('load', () => {
  canvases.forEach((e) => {
    pica.resize(sourceImg, e, {
      quality: 2,
      alpha: true,
    });
  });
});

body.ondragover = (e) => {
  e.preventDefault();
};

body.ondrop = (e) => {
  e.preventDefault();
  console.log(e.dataTransfer.files);
  sourceImg.src = URL.createObjectURL(e.dataTransfer.files[0]);
};
