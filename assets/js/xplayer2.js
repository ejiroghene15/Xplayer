/*
Xplayer is a simple web audio player app developed by EjiroGhene
Feel free to play around the code
 */
$(function () {
    // Force localStorage to be the backend driver.
    localforage.config({
        driver: localforage.INDEXEDDB,
        name: 'playlist',
        storeName: "song",
        version: 3,
        description: "A simple database to store songs that are added to a users playlist"
    });

    localforage.ready().then(function () {
        setTimeout(() => {
            $("#preloader").addClass("animated fadeOut");
            fetchSongs();
        }, 500);
    });

    let sng = $("audio")[0];
    let sngTitle = $("#song-title")
    let songlist = $("#song-list");
    let bgs = [
        './assets/imgs/mcover.jpg',
        './assets/imgs/mbg.jpg',
        './assets/imgs/mbg2.jpg',
        './assets/imgs/mbg3.jpg',
        './assets/imgs/mbg4.jpg'
    ];

    function callbg() {
        $.each(bgs, (i, val) => fadeBg(i)(setTimeout));
    };

    let fadeBg = (i) => {
        return timer = (time) => {
            time(function () {
                $("#wrapper").css({ "backgroundImage": `url(${bgs[i]})`, "transition": "all 1s linear 1s" });
                if (i == bgs.length - 1) { clearTimeout(time); time(() => callbg(), i * 4000) };
                if(sng.ended) clearTimeout(time);
            }, i * 8000);
        }
    }

    $("#upload").click(function () {
        $(":file").trigger("click");
    });

    $("#song-list").on("click", "li.songs", function () {
        let title = $(this).attr("title");
        $(this).prepend(`<img src="./assets/imgs/music.png" alt="" id="np" title='Now playing'/>`);
        $(this).siblings().find("#np").remove();
        clearPausedSong();
        changeIcon();
        playSong(title);
    });

    $(".micon").on("click", "#play", function () {
        if (sng.src !== '') {
            if (sng.ended == true) trackTime();
            sng.play();
            $(this).attr({ src: "./assets/imgs/pause.png", id: "pause" });
        } else {
            alert("Click on a song to play");
        }
    })

    $(".micon").on("click", "#pause", function () {
        if (sng.src !== '') {
            sng.pause();
            $(this).attr({ src: "./assets/imgs/play.png", id: "play" });
        }
    })

    $("#next").on("click", function () {
        let currentSong = $("#song-title").text();
        changeSong(currentSong, 'next');
    })

    $("#prev").on("click", function () {
        let currentSong = $("#song-title").text();
        changeSong(currentSong, 'prev');
    })

    $("#music").change(function () {
        let file = this.files;
        for (let i = 0; i < file.length; i++) {
            if (file[i].type.match("audio/")) {
                let size = file[i].size / 1000;
                let name = file[i].name.slice(0, file[i].name.length - 4);
                size = Number.parseFloat(size / 1000).toPrecision(3) + " MB";
                let reader = new FileReader();
                reader.onload = function (fr) {
                    localforage.getItem(`${name}`, function (err, value) {
                        if (value == null) {
                            localforage.setItem(`${name}`, { "name": name, "size": size, "source": fr.target.result }).then(() => {
                                songlist.append(songList(name, size))
                            })
                        } else {
                            alert("This song is already on your playlist");
                        }
                    });
                }
                reader.readAsDataURL(file[i]);
            }
        }
    });

    function playSong(songName) {
        localforage.getItem(`${songName}`).then(function (song) {
            sngTitle.text(song.name);
            let src = $("#xplayer").attr("src");
            if (src !== song.source) {
                sng.src = song.source;
            }
            sng.play();
            trackTime();
        }).catch(function () {
            alert("Xplayer encountered an error playing this track");
        });
    }

    function changeSong(currentSong, dir) {
        if (currentSong !== '') {
            let el = $(document).find(`.songs[title='${currentSong}']`);
            el = (dir == "next") ? el.next() : el.prev();
            el.prepend(`<img src="./assets/imgs/music.png" alt="" id="np" title='Now playing'/>`);
            el.siblings().find("#np").remove();
            let title = el.attr("title");
            if (title !== undefined) {
                clearPausedSong();
                changeIcon();
                playSong(title);
            }
        }
    }

    function trackTime() {
        callbg();
        let timer = setInterval(function () {
            if (isNaN(sng.currentTime) || isNaN(sng.duration)) {
                $("#tt").text("0:00 / 0:00");
            } else {
                $("#tt").text(currentTime(sng.currentTime) + " / " + currentTime(sng.duration));
                if (sng.ended == true) {
                    clearPausedSong();
                    clearInterval(timer);
                }
            }
        }, 1000)
    };

    function currentTime(t) {
        let duration = parseInt(t);
        let hours = parseInt(duration / (60 * 60));
        let mins = parseInt(duration % (60 * 60) / 60);
        let secs = parseInt(duration % 60);
        secs = secs < 10 ? `0${secs}` : secs;
        return duration = hours > 0 ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`;
    }

    function fetchSongs() {
        localforage.iterate(function (song) {
            songlist.append(songList(song.name, song.size))
        });
    }

    function changeIcon() {
        $("#play").attr({ src: "./assets/imgs/pause.png", id: "pause" });
    }

    function clearPausedSong() {
        $("#pause").attr({ src: "./assets/imgs/play.png", id: "play" });
    }

    function songList(name, size) {
        return `
        <li class='songs animated fadeInDown' title='${name}'>
        <span class='title'><b>${name}</b></span>
        <p>Size: ${size}</p>
        </li>`;
    }
});