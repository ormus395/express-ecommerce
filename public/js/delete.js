const grid = document.querySelector(".grid");

console.log(grid);

grid.addEventListener("click", (event) => {
  if (event.target.type === "submit") {
    event.preventDefault();
    event.stopPropagation();
  }
});
