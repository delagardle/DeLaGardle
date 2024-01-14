var data =  {
                "tree"    :   {
                                    "material"  :   "wood",
                                    "age"       :   "200",
                                    
                                    "images" : ["tree 1", "tree 2"]
                                },

                "stone"   :   {
                                    "material"  :   "rock",
                                    "age"       :   "4000",

                                    "images" : ["stone 1", "stone 2"]
                                }
            }


var Main = {};

Main.scale_deg = 0;

Main.x_origin_percent = 0;
Main.y_origin_percent = 0;

Main.correct_guess = "lärarle";

Main.guess_on = -1
Main.bg_guess = {"-1":'gray', "0":'#AD2513', "1":'#1BD618'}



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




function key_press(event) {
    if (event.key == "Enter") {
        guess();
    }
}

function start(){
    // SET TITLE TO CORRECT DATE
    document.getElementById('day').innerHTML = "Day: ";
    var day = document.createElement('span');
    day.classList.add('coloured');
    day.innerHTML = seed;
    document.getElementById('day').appendChild(day);

    // CHECK IF ALREADY DONE
    if (localStorage.getItem('done') && parseInt(localStorage.getItem('last_seed')) == rng.state) {
        show_result(localStorage.getItem('lost') == "true");

        document.body.addEventListener('keypress', function (event) {
            if (event.key == "p") {
                localStorage.clear();
                console.log("Reset Local Storage")
            }
        });

        document.getElementById('display_fade').style.display = "none";
        document.getElementById('img_container').style.display = "none";

        return
    }
    else {localStorage.clear();}

    // BIND ENTER => SUBMIT
    document.body.addEventListener('keypress', key_press);

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

    // INIT GUESS BOXES
    var guess_container = document.getElementsByClassName('guesses_container')[0];
    var n_guesses = 4;

    for (i = 0; i < n_guesses; i++) {
        var g = document.createElement('div');

        g.innerHTML = i + 1;
        g.style.background = Main.bg_guess["-1"];

        g.id = "guess_" + i.toString()

        guess_container.appendChild(g);
    }
}

function paste_to_search( txt ) {
    document.getElementById('input_box').value = txt;

    filter_search(1);
}




// function test(arg) {
//     console.log(arg)
//     return "Done"
// }


function set_image(){
    Main.scale_deg = 5.0;

    Main.x_origin_percent = rng.next_float()*100;
    Main.y_origin_percent = rng.next_float()*100;

    Main.correct_guess = rng.choice(Object.keys(data));

    var image_element = document.getElementById("image1");

    // image_element.style.transform = `scale(${Main.scale_deg})`;
    image_element.style.transformOrigin = `${Main.x_origin_percent}% ${Main.y_origin_percent}%`;

    image_name = rng.choice(data[Main.correct_guess]['images']);
    image_element.setAttribute('src', "images/" + image_name.replace(" ", "_") + ".png");

    image_element.classList.add('image_style_transitions');
}

function change_zoom(){
    Main.scale_deg = Math.max(Main.scale_deg - 1, 1);

    // console.log(Main.scale_deg)

    var image_element = document.getElementById("image1");

    image_element.style.transform = `scale(${Main.scale_deg})`;
    image_element.style.transformOrigin = `${Main.x_origin_percent}% ${Main.y_origin_percent}%`;
}

function guess() {
    Main.guess_on = Math.min(Main.guess_on + 1, 4);
    var correct = false;

    input_box_element = document.getElementById('input_box');
    val = input_box_element.value

    fade = document.getElementById("display_fade")

    if (val.toLowerCase() == Main.correct_guess) {
        fade.innerHTML = "CORRECT"
        fade.style.background = "#1BD618";

        Main.scale_deg = 1

        correct = true
    }

    else {
        fade.innerHTML = "INCORRECT"
        fade.style.background = "#AD2513";

        if (Main.guess_on == 3) {
            Main.scale_deg = 1;
        }
    }

    fade.style.opacity = "0.8";
    setTimeout(() => fade.style.opacity = 0, 1500);


    document.getElementById('guess_' + Main.guess_on.toString()).style.background = Main.bg_guess[+correct]

    // Main.guess_on += correct ? 3 : 0;

    input_box_element.value = "";

    change_zoom();
    filter_search();

    if (Main.guess_on == 3 || correct) { 
        show_result(Main.guess_on == 3 && !correct);
    }
}

function show_result(lost) {
    document.body.removeEventListener('keypress', key_press);

    document.getElementById('input_box').style.display = "none";
    document.getElementById('submit_btn').style.display = "none";

    var result = document.getElementsByClassName('result')[0];

    var id = lost ? 'result_lost' : 'result_won';
    result.classList.add(id);

    var msg = ""

    if (lost) {
        lost_msg = "You did not guess: \'" + Main.correct_guess + "\' correctly<br>Better luck tomorrow!"
        msg = (localStorage.getItem('done') && parseInt(localStorage.getItem('last_seed')) == rng.state) ? localStorage.getItem('result_msg') : lost_msg;
    }

    else {
        var nums = {"1":"1st", "2":"2nd", "3":"3rd", "4":"4th"}
        i = Main.guess_on + 1

        won_msg = "You got it!<br>You guessed \'" + Main.correct_guess + "\' on the " + nums[i.toString()] + " guess"
        msg = (localStorage.getItem('done') && parseInt(localStorage.getItem('last_seed')) == rng.state) ? localStorage.getItem('result_msg') : won_msg;
    }

    result.innerHTML = msg;

    localStorage.setItem('done', 'true');
    localStorage.setItem('last_seed', seed.toString());
    localStorage.setItem('result_msg', msg);
    localStorage.setItem('lost', lost);
}


function filter_search( minimum ) {
    var input = document.getElementById('input_box').value.toLowerCase();

    var l = document.getElementById('suggestions');
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
    var minimum = minimum ? minimum : 0;

    // console.log(minimum)
    if ((m > minimum) && !(input === "")){
        l.style.display = "block";
    }
    else {
        l.style.display = "none";
    }

}


function submit_image() {
    email = "delagardle0011@gmail.com";
    window.location.href = "mailto:" + email + "?subject=Image Suggestion&body=Name: %0D%0A%0D%0AImage:";
}


function buy_coffee() {
    alert("coffee");
}