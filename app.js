var pica = pica();
var URL = window.URL || window.webkitURL;

var body = document.querySelector('body');
var sourceImg = document.querySelector('#source');
var fileName = null;
var canvases = [
  document.querySelector('#c28'),
  document.querySelector('#c56'),
  document.querySelector('#c112'),
];

function download(buttonId, imageId, scale) {
  if (fileName == null) {
    return;
  }
  var button = document.getElementById(buttonId);
  var image = document.getElementById(imageId).toDataURL('image/png').replace('image/png', 'image/octet-stream');
  button.setAttribute('download', `${fileName.split('.')[0]}@${scale}px.png`);
  button.setAttribute('href', image);
}

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
  fileName = e.dataTransfer.files[0].name;
  sourceImg.src = URL.createObjectURL(e.dataTransfer.files[0]);
};
