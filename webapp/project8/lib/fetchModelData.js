function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

      if (xhr.status === 200) {
        try {
          resolve({ data: JSON.parse(xhr.responseText) });
        } 
        catch (err) {
          const error = new Error("JSON Parse Error");
          error.status = 500;
          error.statusText = "JSON Parse Error";
          reject(error);
        }
      } else {
        const error = new Error(xhr.statusText || "Request failed");
        error.status = xhr.status;
        error.statusText = xhr.statusText;
        reject(error);
      }
    };

    xhr.open("GET", url, true);
    xhr.send();
  });
}

export default fetchModel;
