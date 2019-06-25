$(function () {
    
    var db;
    var dbReq = window.indexedDB.open("playlist", 3);
    var sng = $("audio")[0];
    var sngTitle = $("#song-title")
    var songlist = $("#song-list");

    (function initDb() {
        //  initialize db
        if (!window.indexedDB) {
            console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
        }
        dbReq.onsuccess = function (event) {
            db = dbReq.result;
            if (db.objectStoreNames.contains('song')) {
                fetchSongs(db);
            }
        };
        dbReq.onupgradeneeded = function (event) {
            // Save the IDBDatabase interface 
            var db = event.target.result;
            // Create an objectStore for this database
            let musicTable
            if (!db.objectStoreNames.contains('song')) {
                musicTable = db.createObjectStore("song", { keyPath: "name" });
            }
            musicTable.createIndex("name", "name", { unique: true });
            musicTable.transaction.oncomplete = function () {
                console.log("database created successfully");
            }
        };
    })();

    $("#upload").click(function () {
        $(":file").trigger("click");
    });

    $("#song-list").on("click", "#play", function () {
        let sngPlaying = $(this).parents(".songs").attr("title");
        let fetchSong = db.transaction(["song"]).objectStore("song").get(`${sngPlaying}`);
        fetchSong.onerror = function (event) {
            alert("Xplayer encountered an error playing this track");
        };
        fetchSong.onsuccess = function (event) {
            if (fetchSong.result) {
                sngTitle.text(fetchSong.result.name)
                sng.src = fetchSong.result.source;
                sng.autoplay = true;
            };
        }
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
                    let addsong = db.transaction(["song"], "readwrite").objectStore("song");
                    addsong.get(`${name}`).onsuccess = function (e) {
                        if (e.target.result == undefined) { addsong.add({ "name": name, "size": size, "source": fr.target.result }); songlist.append(songList(name, size)) } else {
                            alert("This song is already on your playlist");
                        }
                    }
                }
                reader.readAsDataURL(file[i]);
            }
        }
    });

    function fetchSongs(db) {
        db.transaction("song").objectStore("song").openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                songlist.append(songList(cursor.value.name, cursor.value.size))
                cursor.continue();
            }
        };
    }

    function songList(name, size) {
        return `
        <li class='songs' title='${name}'>
        <span class='title'><b>${name}</b></span>
        <span class='float-right'>
        <i class='micon'><img src='./assets/imgs/prev.png' id="prev" /></i>
        <i class='micon'><img src='./assets/imgs/play.png' id="play" /></i>
        <i class='micon'><img src='./assets/imgs/next.png' id="next" /></i>
        </span>
        <p>Size: ${size}</p>
        </li>`
    }
});