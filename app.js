var pica = pica();
var URL = window.URL || window.webkitURL;

var body = document.querySelector('body');
var sourceImg = document.querySelector('#source');
var fileName = null;
var canvases = [
  document.querySelector('#c28'),
  document.querySelector('#c56'),
  document.querySelector('#c112'),
  document.querySelector('#c18'),
  document.querySelector('#c36'),
  document.querySelector('#c72'),
];
var imageDataHeader = 'data:image/png;base64,';
var quantizerOpts = [
  {
    colors: Math.pow(2, 8),
  },
  {
    colors: Math.pow(2, 12),
  },
  {
    colors: Math.pow(2, 16),
  }
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

function bytesToKB(bytes) {
  return bytes / 1024;
}

sourceImg.addEventListener('load', () => {
  if (sourceImg.width * sourceImg.height > 2000 * 2000) {
    alert('This source image is very large, and may take awhile to process. Please dismiss this alert if you would like to continue.');
  }
  var quantizers = [];
  for (var opt in quantizerOpts) {
    quantizers[opt] = new RgbQuant(quantizerOpts[opt]);
    quantizers[opt].sample(sourceImg);
  }
  canvases.forEach((e) => {
    pica.resize(sourceImg, e, {
      quality: 3,
      alpha: true,
    }).then(() => {
      // approx. size of b64 string
      var compressed = false;
      e.uncompressedSize = Math.round((e.toDataURL('image/png').length - imageDataHeader.length) * (3/4));
      while (e.uncompressedSize > 25000 && quantizers.length > 0) {
        var ctx = e.getContext('2d');
        var imageData = ctx.createImageData(e.width, e.height);
        imageData.data.set(quantizers.pop().reduce(e));
        ctx.putImageData(imageData, 0, 0);
        compressed = true;
        e.uncompressedSize = Math.round((e.toDataURL('image/png').length - imageDataHeader.length) * (3/4));
      }
      e.size = Math.round((e.toDataURL('image/png').length - imageDataHeader.length) * (3/4));
      document.getElementById(`size${e.width}`).innerText = `(${bytesToKB(e.size).toFixed(2)} KB${compressed ? ', compressed' : ''})`;
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
