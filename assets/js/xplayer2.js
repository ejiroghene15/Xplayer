/*
Xplayer is a simple web audio player app developed by EjiroGhene
Feel free to play around the code
 */
$(function () {
	// Force localStorage to be the backend driver.
	localforage.config({
		driver: localforage.INDEXEDDB,
		name: "playlist",
		storeName: "song",
		version: 3,
		description:
			"A simple database to store songs that are added to a users playlist"
	});

	localforage.ready().then(function () {
		setTimeout(() => {
			$("#preloader").addClass("animated fadeOut");
			fetchSongs();
			$("#preloader").css("zIndex", 0)
		}, 500);

	});

	let sng = document.querySelector("#xplayer");
	let sngTitle = $("#song-title");
	let songlist = $("#song-list");
	let bgs = [
		"./assets/imgs/mcover.jpg",
		"./assets/imgs/mbg.jpg",
		"./assets/imgs/mbg3.jpg",
		"./assets/imgs/mbg4.jpg"
	];

	sng.onpause = () => {
		$("#play").attr({ src: "./assets/imgs/play.png" });
	}

	sng.onplay = () => {
		trackTime();
		$("#seekable").prop("disabled", false);
		$("#play").attr({ src: "./assets/imgs/pause.png" });
	}

	sng.onended = () => {
		$("#play").attr({ src: "./assets/imgs/play.png" });
	}

	$("#vol").on("input", function () {
		let volume = $(this).val()
		sng.volume = volume;
	})

	$("#seekable").on("input", function () {
		let currtime = $(this).val();
		sng.currentTime = currtime;
	})

	function animateBackground() {
		$.each(bgs, (i, val) => fadeBg(i)(setTimeout));
	}

	let fadeBg = i => {
		return (timer = time => {
			time(function () {
				if (sng.ended) {
					clearTimeout(time);
				} else {
					$("#wrapper").css({
						backgroundImage: `url(${bgs[i]})`,
						transition: "background 1s linear 1s"
					});
					if (i == bgs.length - 1) {
						time(() => animateBackground(), 5000);
					}
				}
			}, i * 5000);
		});
	};

	$("#upload").click(function () {
		$(":file").trigger("click");
	});

	$("#song-list").on("click", "li.songs", function () {
		let title = $(this).attr("title");
		$(".song-wrapper").find("#np").remove();
		$(".song-wrapper").removeClass("active");
		$(this).parent().prepend(`<img src="./assets/imgs/music.png" alt="" id="np" title='Now playing'/>`);
		$(this).parent().addClass("active");
		playSong(title);
	});

	$(".micon").on("click", "#play", function () {
		if (sng.src !== "") {
			if (sng.ended) {
				animateBackground();
			}
			if (sng.paused) {
				sng.play();
			} else {
				sng.pause();
			}
		}else{
			alert("Click on a song to play");
		}
	});

	$("#next").on("click", function () {
		let currentSong = $("#song-title").text();
		changeSong(currentSong, "next");
	});

	$("#prev").on("click", function () {
		let currentSong = $("#song-title").text();
		changeSong(currentSong, "prev");
	});

	$("ul").on("click", ".del", function () {
		let song_to_delete = $(this).siblings(".songs").attr("title");
		let song_playing = $("#song-title").text();
		if (song_playing !== "") {
			if (song_playing == song_to_delete) {
				alert("You can't delete a song while it's playing");
			} else {
				$(this).parent().remove();
				localforage.removeItem(`${song_to_delete}`).then(function () {
					console.log("song deleted");
				});
			}
		} else {
			$(this).parent().remove();
			localforage.removeItem(`${song_to_delete}`).then(function () {
				console.log("song deleted");
			});
		}
		let sl = $("#song-list").text().trim();
		if (sl == "") {
			$("#no_song").show();
			$("#seekable").prop("disabled", true);
		}
	});

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
							localforage
								.setItem(`${name}`, {
									name: name,
									size: size,
									source: fr.target.result
								})
								.then(() => {
									songlist.append(songList(name, size));
								});
							$("#no_song").hide();
						} else {
							alert(`The song ${name} is already on your playlist`);
						}
					});
				};
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
			animateBackground();
			trackTime();
		});
	}

	function changeSong(currentSong, dir) {
		if (currentSong !== "") {
			let el = $(document).find(`.songs[title='${currentSong}']`).parent();
			el = dir == "next" ? el.next() : el.prev();
			el.addClass("active");
			el.siblings().removeClass("active");
			el.siblings().find("#np").remove();
			el.prepend(`<img src="./assets/imgs/music.png" alt="" id="np" title='Now playing'/>`);
			let title = el.children('.songs').attr("title");
			if (title !== undefined) {
				playSong(title);
			}
		}
	}

	function trackTime() {
		let timer = setInterval(function () {
			if (!(isNaN(sng.currentTime) || isNaN(sng.duration))) {
				$("#seekable").prop({
					"max": sng.duration,
					"value": sng.currentTime
				});
				$("#tt").html(`<span>${currentTime(sng.currentTime)}</span><span>${currentTime(sng.duration)}</span>`);
				if (sng.ended == true) {
					$("#tt").html(`<span>0:00</span><span>${currentTime(sng.duration)}</span>`);
					$("#seekable").val(0);
					clearInterval(timer);
				}
			}
		}, 0);
	}

	function currentTime(t) {
		let duration = parseInt(t);
		let hours = parseInt(duration / (60 * 60));
		let mins = parseInt((duration % (60 * 60)) / 60);
		let secs = parseInt(duration % 60);
		secs = secs < 10 ? `0${secs}` : secs;
		return (duration =
			hours > 0 ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`);
	}

	function fetchSongs() {
		localforage.iterate(function (song) {
			if (song != "") {
				$("#no_song").hide();
				songlist.append(songList(song.name, song.size));
			}
		});
	}

	function songList(name, size) {
		return `
			<div class='d-flex justify-content-between mb-4 song-wrapper list-group-item p-0 animated fadeInDown'>
				<li class='songs flex-grow-1 p-3' title='${name}'>
					<span class='title mr-3'><b>${name}</b></span>
					<p class='mb-0'>Size: ${size}</p>
				</li>
				<span class='bg-light d-flex align-items-center del rounded'><img src="./assets/imgs/del.png" height='26' width='26' /></span>
			</div>`;
	}
});
