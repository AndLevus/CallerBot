document.addEventListener("DOMContentLoaded", function (event) {

    if (document.querySelectorAll('.audio-player')){
        const audioPlayers = document.querySelectorAll(".audio-player");
        for (let i = 0; i < audioPlayers.length; i++) {
            const audioPlayer = audioPlayers[i];
            let audio;
            getAudioMetaData(audioPlayer.dataset.audio).then(metadata => {
                let tick;
                audio = metadata;
                audio.addEventListener(
                    "play",
                    () => {
                        tick = setInterval(() => updateProgress(audioPlayer, audio), 500);
                    },
                    false
                );
                audio.addEventListener(
                    "pause",
                    () => {
                        clearInterval(tick);
                        playBtn.classList.remove("pause");
                        playBtn.classList.add("play");
                    },
                    false
                );
                audioPlayer.querySelector(".length").textContent = getTimeCodeFromNum(audio.duration);
                metadata.volume = .75;
            });

            const playBtn = audioPlayer.querySelector(".toggle-play");
            playBtn.addEventListener(
                "click",
                () => {
                    if (audio.paused) {
                        playBtn.classList.remove("play");
                        playBtn.classList.add("pause");
                        audio.play();
                    } else {
                        playBtn.classList.remove("pause");
                        playBtn.classList.add("play");
                        audio.pause();
                    }
                },
                false
            );

            const timeline = audioPlayer.querySelector(".timeline");
            timeline.addEventListener("click", e => {
                const timelineWidth = window.getComputedStyle(timeline).width;
                const timeToSeek = e.offsetX / parseInt(timelineWidth) * audio.duration;
                audio.currentTime = timeToSeek;
            }, false);



            audioPlayer.querySelector(".toggle-mute").addEventListener("click", (e) => {
                audio.muted = !audio.muted;
                if (audio.muted) {
                    e.target.classList.remove("on");
                    e.target.classList.add("off");
                } else {
                    e.target.classList.add("on");
                    e.target.classList.remove("off");
                }
            });
        }
    }
    if (document.querySelector('.spoiler-list')){
        const spoilers = document.querySelectorAll('.spoiler-list .spoiler-item');
        for (const spoiler of spoilers) {
            spoiler.getElementsByClassName('spoiler-title')[0].addEventListener("click", function (e) {
                e.target.parentElement.classList.toggle('open');
            });
        }
    }

    if (document.querySelectorAll('.form-control')){
        for (const input of document.querySelectorAll('.form-control')){
            input.addEventListener("blur", function(e) {
                validateInput(e);
            }, true);
        }
    }

    if (document.querySelector('.api-menu')){
        const apiLinks = document.querySelectorAll('.api-menu a');
        for (const link of apiLinks){
            link.addEventListener('click', function (e) {
                e.preventDefault();

                const childActiveNode = e.target.parentNode.parentNode.querySelectorAll('li.active');
                if (childActiveNode){
                    childActiveNode.forEach((active)=>{
                        active.classList.remove('active');
                    });
                }

                e.target.parentElement.classList.add('active');
                const target = document.querySelector(this.getAttribute('href'));
                if (target){
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }

            });
        }
    }

    const phone =  document.querySelectorAll(".form-control.phone");

    new Inputmask("+7 (999) 999-99-99", { "clearIncomplete": true }).mask(phone);

    const email =  document.querySelectorAll(".form-control.email");

    new Inputmask("email", { "clearIncomplete": true }).mask(email);



});

function updateProgress(audioPlayer, audio){
    const progressBar = audioPlayer.querySelector(".progress");

    progressBar.style.width = audio.currentTime / audio.duration * 100 + "%";
    audioPlayer.querySelector(".current-time").textContent = getTimeCodeFromNum(
        audio.currentTime
    );
}

function getAudioMetaData(src) {
    return new Promise(function(resolve) {
        let audio = new Audio();

        audio.addEventListener(
            "loadedmetadata",
            () => {
                resolve(audio);
            },
            false
        );
        audio.preload = 'metadata';
        audio.src = src;
    });
}

function getTimeCodeFromNum(num) {
    let seconds = parseInt(num);
    let minutes = parseInt(seconds / 60);
    seconds -= minutes * 60;
    const hours = parseInt(minutes / 60);
    minutes -= hours * 60;

    if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
    return `${String(hours).padStart(2, 0)}:${minutes}:${String(
        seconds % 60
    ).padStart(2, 0)}`;
}

function openModal(id) {
    if(document.querySelector('.modal#' + id)){
        document.getElementsByTagName('body')[0].classList.add('overflow');
        document.querySelector('.modal#' + id).classList.add('show')
    }
}

function closeModal() {
    document.getElementsByTagName('body')[0].classList.remove('overflow');
    document.querySelector('.modal.show').classList.remove('show');
}

function validateInput(input) {
    const reqStatus = input.target.required;
    const parent = input.target.parentElement;
    const type = (input.target.classList.contains('email') ? 'email' : input.target.classList.contains('phone') ? 'phone' : 'text');

    const validLength = (()=>
    {
        switch(type){
            case 'text': return (input.target.value.length === 0);
            case 'phone':
            case 'email':
                return (input.target.value.indexOf('_') > -1 || input.target.value.length === 0);
            default     : return false;
        }

    })();

    const inValid = (reqStatus && validLength) && true;
    if(inValid){
        switch (type) {
            case 'text':
                parent.dataset.error = 'Поле не может быть пустым';
                return;
                break;
            case 'phone':
                parent.dataset.error = 'Введите корректный телефон';
                return;
                break;
            case 'email':
                parent.dataset.error = 'Введите корректный email';
                return;
                break;

        }
    } else {
        if (typeof parent.dataset.error !== 'undefined'){
            delete parent.dataset.error;
        }
        return true;
    }

}

class Slider {
    constructor (rangeElement, valueElement, options) {
        this.rangeElement = rangeElement
        this.valueElement = valueElement
        this.options = options

        // Attach a listener to "change" event
        this.rangeElement.addEventListener('input', this.updateSlider.bind(this))
    }

    // Initialize the slider
    init() {
        this.rangeElement.setAttribute('min', options.min);
        this.rangeElement.setAttribute('max', options.max)
        this.rangeElement.value = options.cur

        this.updateSlider()
    }

    // Format the money
    asMoney(value) {
        return '$' + parseFloat(value)
            .toLocaleString('en-US', { maximumFractionDigits: 2 })
    }

    generateBackground(rangeElement) {
        if (this.rangeElement.value === this.options.min) {
            return
        }

        let percentage =  (this.rangeElement.value - this.options.min) / (this.options.max - this.options.min) * 100
        return 'background: linear-gradient(to right, #FF6A1C, #FF6A1C ' + percentage + '%, #E0E0E0 ' + percentage + '%, #E0E0E0 100%)'
    }

    updateSlider (newValue) {
        this.valueElement.innerHTML = this.asMoney(this.rangeElement.value)
        this.rangeElement.style = this.generateBackground(this.rangeElement.value)
    }
}

let rangeElement = document.querySelector('.range [type="range"]')
let valueElement = document.querySelector('.range .range__value span')

let options = {
    min: 0,
    max: 166000,
    cur: 37500
}

if (rangeElement) {
    let slider = new Slider(rangeElement, valueElement, options)

    slider.init()
}