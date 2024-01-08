var data =  {
                "tree 1"    :   {
                                    "material"  :   "wood",
                                    "age"       :   "200",
                                    
                                    "n_images"  :   "1"
                                },

                "tree 2"    :   {
                                    "material"  :   "wood",
                                    "age"       :   "2500",

                                    "n_images"  :   "1"
                                },

                "stone 1"   :   {
                                    "material"  :   "rock",
                                    "age"       :   "4000",

                                    "n_images"  :   "1"
                                },

                "stone 2"   :   {
                                    "material"  :   "rock",
                                    "age"       :   "80",

                                    "n_images"  :   "1"
                                }  
            }







function start(){
    // BIND ENTER => SUBMIT
    document.body.addEventListener('keypress', function(event) {
        if (event.key == "Enter"){
            guess();
        }
    });

    // SET FOCUS TO INPUT
    document.getElementById('input_box').focus()


    // SET IMAGE
    set_image();

    // INIT SEARCH ELEMENTS
    var data_keys = Object.keys(data)

    for (i = 0; i < data_keys.length; i++) {
        var li = document.createElement('li')

        li.href = data_keys[i];
        li.innerHTML = data_keys[i];
        // li.onclick = "change_zoom()";
        // console.log(data[data_keys[i]]['age'])

        var ul = document.getElementById('suggestions');
        li.addEventListener('click', function(){
            paste_to_search(this.innerHTML);
        });

        ul.appendChild(li);
        
    }

    // CORRECT WIDTHS / HEIGHTS FOR MOBILE
    if (window.innerWidth < 1440){
        var new_width = "250px";
        var new_height = "250px";

        var pages = document.getElementsByClassName('page');
        for (i = 0; i < pages.length; i++){ pages[i].style.width = new_width; }

        var containers = document.getElementsByClassName('container');
        for (i = 0; i < containers.length; i++){ containers[i].style.width = new_width; containers[i].style.height = new_height; }

        var fade_out_container = document.getElementById('display_fade');
        fade_out_container.style.width = new_width;
        fade_out_container.style.height = new_height;
    }

}

function paste_to_search( txt ) {
    document.getElementById('input_box').value = txt;

    filter_search(1);
}


function RNG(seed) {
    this.m = 0x80000000; // 2**31
    this.a = 21348305;
    this.b = 92322;

    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}

RNG.prototype.next_int = function() {
    this.state = (this.a * this.state + this.b) % this.m;
    return this.state;
}

RNG.prototype.next_float = function() {
    return this.next_int() / (this.m - 1);
}

RNG.prototype.next_range = function(start, end) {
    var range = end - start;
    var f = this.next_int() / this.m;
    return start + Math.floor(range * f);
}

RNG.prototype.choice = function(array) {
    return array[this.next_range(0, array.length)];
}

const startDate = new Date(2024, 0, 6)
var todayDate = new Date()

var seed = Math.ceil(Math.abs((startDate - todayDate) / (86400 * 1000)))
var rng = new RNG(seed);





var Main = {};

Main.scale_deg = 0;

Main.x_origin_percent = 0;
Main.y_origin_percent = 0;

Main.correct_guess = "lärarle";



function set_image(){
    Main.scale_deg = 10.0;

    Main.x_origin_percent = rng.next_float()*100;
    Main.y_origin_percent = rng.next_float()*100;

    Main.correct_guess = rng.choice(Object.keys(data));

    image_element = document.getElementById("image1");

    image_element.style.transform = `scale(${Main.scale_deg})`;
    image_element.style.transformOrigin = `${Main.x_origin_percent}% ${Main.y_origin_percent}%`;

    image_element.setAttribute('src', "images/" + Main.correct_guess.replace(" ", "_") + ".png");
}

function change_zoom(){
    Main.scale_deg = Math.max(Main.scale_deg - 2, 1);

    image_element = document.getElementById("image1");

    image_element.style.transform = `scale(${Main.scale_deg})`;
    image_element.style.transformOrigin = `${Main.x_origin_percent}% ${Main.y_origin_percent}%`;
}

function guess() {
    input_box_element = document.getElementById('input_box');

    val = input_box_element.value

    fade = document.getElementById("display_fade")

    // EVALUATION OF CORRECTNESS SHOULD BE % BASED 
    if (val.toLowerCase() == Main.correct_guess) {
        fade.innerHTML = "CORRECT"
        fade.style.background = "green";

        Main.scale_deg = 1
    }

    else {
        fade.innerHTML = "INCORRECT"
        fade.style.background = "red";
    }

    fade.style.opacity = "0.8";
    setTimeout(() => fade.style.opacity = 0, 1500);

    input_box_element.value = "";

    change_zoom();
    filter_search();
}



function filter_search( minimum ) {
    var input = document.getElementById('input_box').value.toLowerCase();

    var l = document.getElementById('suggestions')
    var searches = l.getElementsByTagName("li");

    var m = 0;

    for (i = 0; i < searches.length; i++) {
        txt = searches[i].innerHTML;

        if ((txt.toLowerCase().indexOf(input) > -1) && !(input === "")){
            searches[i].style.display = "list-item";
            m += 1
        }
        else {
            searches[i].style.display = "none";
        }
    }
    var minimum = minimum ? minimum : 0

    console.log(minimum)
    if ((m > minimum) && !(input === "")){
        l.style.display = "block";
    }
    else {
        l.style.display = "none";
    }

}