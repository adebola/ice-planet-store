
const fileSelector = document.getElementById("file-selector");

fileSelector.addEventListener("change", (event) => {

  let isValid = false;
  const file = event.target.files[0];

  if (file.size >= 2097152) { // 2MB
    showMessage('The File is too large and should not exceed 2MB, please select another', 'error');
   fileSelector.innerText = '';
    return;
  }

  const fileReader = new FileReader();
  

  fileReader.onloadend = function (evt) {
    if (evt.target.readyState === FileReader.DONE) {

      let header = '';
     
      const arr = new Uint8Array(evt.target.result).subarray(0, 4);

      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }

      switch (header) {
        case '89504e47':
          isValid = true;
          break;

        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true;
          break;

        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }
    }

    if (isValid) {

      const fileReader2 = new FileReader();
      fileReader2.onloadend = function (evt) {
        console.log(evt);
        $('#prod-image').attr('src', evt.currentTarget.result);
      };

      fileReader2.readAsDataURL(file);
    } else {
      showMessage('Unknown File Format, Images (jpeg, jpg, png) are expected, please try again', 'error');
    }
  }

  console.log(fileSelector.value);

  fileReader.readAsArrayBuffer(file);
});
