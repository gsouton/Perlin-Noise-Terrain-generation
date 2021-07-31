const main_element = document.getElementById("main");
const aspect_ratio = 700 / 500;
let width = main_element.getBoundingClientRect().width - 70; // It's bad I know...
let height = width / aspect_ratio;

window.addEventListener('resize', function(){
    width = main.getBoundingClientRect().width - 70;
	height = width / aspect_ratio;
});
