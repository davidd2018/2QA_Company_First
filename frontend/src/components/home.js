document.addEventListener("DOMContentLoaded", () => {
  console.log("Home component loaded");

  const icons = document.querySelectorAll(".header-icons .icon");

  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      alert("Chức năng đang phát triển 🚧");
    });
  });
});
