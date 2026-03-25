const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector(
    "input[name='productId']",
  ).value;
  const csrfToken = btn.parentNode.querySelector("input[name='csrf']").value;

  const productElement = btn.closest("article");

  fetch("/admin/product/" + productId, {
    method: "DELETE",
    headers: {
      "x-csrf-token": csrfToken,
    },
  })
    .then((result) => result.json())
    .then((data) => productElement.parentNode.removeChild(productElement))
    .catch((err) => console.log(err));
};
