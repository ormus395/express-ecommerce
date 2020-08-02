const deleteProduct = (button) => {
  let id = button.parentNode.querySelector("[name=id]").value;
  let _csrf = button.parentNode.querySelector("[name=_csrf]").value;

  fetch("/admin/deleteProduct", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id, _csrf: _csrf }),
  })
    .then((response) => {
      return response.json();
    })
    .then((jsonResponse) => {
      button.parentNode.parentNode.remove();
      let header = document.querySelector(".main-header");
      console.log(header);
      let message = `
         <div class="message message--success">
            ${jsonResponse.message}
         </div>
      `;
      header.insertAdjacentHTML("afterend", message);
    })
    .catch((err) => {
      console.log(err);
      alert("There was an issue deleting this product.");
    });
};
