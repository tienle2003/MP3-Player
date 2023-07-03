const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MP3 Player";

const playlist = $(".music_playlist");
const playlistBtn = $(".playlist_btn");
const singer = $(".name_singer");
const songName = $(".name_song");
const CDThumb = $(".cd_thumb");
const audio = $("#audio");
const playBtn = $(".fa-play");
const prevBtn = $(".fa-backward-step");
const nextBtn = $(".fa-forward-step");
const randomBtn = $(".btn-random");
const repeatBtn = $(".btn-repeat");
const progress = $(".progress_value");
const volume = $(".volume_value");
const volumeIcon = $(".volume_icon");
const currentTime = $(".progress_time-current");
const durationTime = $(".progress_time-duration");
const CDThumbWidth = CDThumb.offsetWidth;
const listIndex = new Set();
let currentVolume = 1;

const app = {
  currentIndex: 0,
  isPlaying: false,
  isVolumeOff: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  songs: [
    {
      name: "Aloha",
      singer: "Cool",
      path: "./assets/music/song1.mp3",
      image: "./assets/img/song1.jpg",
    },
    {
      name: "Cash Cash",
      singer: "Young Empires",
      path: "./assets/music/song2.mp3",
      image: "./assets/img/song2.jpg",
    },
    {
      name: "Đừng lo anh đợi mà",
      singer: "Mr.Siro",
      path: "./assets/music/song3.mp3",
      image: "./assets/img/song3.jpg",
    },
    {
      name: "Lemon tree",
      singer: "Fools Garden",
      path: "./assets/music/song4.mp3",
      image: "./assets/img/song4.jpg",
    },
    {
      name: "Marry You",
      singer: "Bruno Mars",
      path: "./assets/music/song5.mp3",
      image: "./assets/img/song5.jpg",
    },
    {
      name: "Night Changes",
      singer: "One Direction",
      path: "./assets/music/song6.mp3",
      image: "./assets/img/song6.jpg",
    },
    {
      name: "See You Again",
      singer: "Wiz Khalifa",
      path: "./assets/music/song7.mp3",
      image: "./assets/img/song7.jpg",
    },
    {
      name: "Send it",
      singer: "Austin Mahone",
      path: "./assets/music/song8.mp3",
      image: "./assets/img/song8.jpg",
    },
    {
      name: "The Nights",
      singer: "Avicii",
      path: "./assets/music/song9.mp3",
      image: "./assets/img/song9.jpg",
    },
    {
      name: "Waiting For You",
      singer: "Mono",
      path: "./assets/music/song10.mp3",
      image: "./assets/img/song10.jpg",
    },
  ],

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `<div class="song ${
        index === this.currentIndex ? "active" : ""
      }" data-index="${index}">
                            <img src="${song.image}" alt="" class="song_img">
                            <div class="song_body">
                                <div class="name_song">${song.name}</div>
                                <div class="name_author">${song.singer}</div>
                            </div>
                            <div class="option btn-hover">
                                <i class="fa-solid fa-ellipsis"></i>
                                <div class="wave">
                                        <div class="wave-item"></div>
                                        <div class="wave-item"></div>
                                        <div class="wave-item"></div>
                                </div>
                            </div>
                        </div>`;
    });
    playlist.innerHTML = htmls.join("");
  },

  defineProperties: function () {
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  handleEvents: function () {
    const _this = this;
    
    //xử lí phóng to/ thu nhỏ khi scroll playlist
    playlist.onscroll = function () {
      const scrollTop = playlist.scrollTop;
      const newCdWidth = CDThumbWidth - scrollTop;
      if (window.innerWidth < 740) {
        CDThumb.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
        CDThumb.style.height = newCdWidth > 0 ? newCdWidth + "px" : 0;
      } else {
        CDThumb.style.width = `${240}px`;
        CDThumb.style.height = `${240}px`;
      }
    };

    //xử lí CD quay / dừng
    const cdThumbAnimate = CDThumb.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000, //10 seconds
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    //xử lí khi click play
    playBtn.onclick = function () {
      if (_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    };

    //khi song được play
    audio.onplay = function () {
      _this.isPlaying = true;
      playBtn.classList.remove("fa-play");
      cdThumbAnimate.play();
    };

    //khi song bị pause
    audio.onpause = function () {
      _this.isPlaying = false;
      playBtn.classList.add("fa-play");
      cdThumbAnimate.pause();
    };

    // khi tiến trình bài hát thay đổi
    audio.ontimeupdate = function () {
      if (!audio.duration) {
        durationTime.textContent = "00:00";
      } else {
        const progressPercent = Math.floor(
          (audio.currentTime / audio.duration) * 100
        );
        progress.value = progressPercent;
        currentTime.textContent = _this.formatTimer(audio.currentTime);
        durationTime.textContent = _this.formatTimer(audio.duration);
      }
    };

    //Xử lí khi tua bài hát
    progress.oninput = function (e) {
      const seekTime = (e.target.value * audio.duration) / 100;
      audio.currentTime = seekTime;
    };

    //xử lí âm lượng bài hát
    volume.oninput = function (e) {
      const volumeValue = e.target.value; //1-100
      currentVolume = volumeValue / 100;
      audio.volume = volumeValue / 100; //0-1
      if (volumeValue > 0) {
        volumeIcon.classList.add("fa-volume-high");
        volumeIcon.classList.remove("fa-volume-xmark");
      } else {
        volumeIcon.classList.add("fa-volume-xmark");
        volumeIcon.classList.remove("fa-volume-high");
      }
    };

    //bật/ tắt âm lượng
    volumeIcon.addEventListener("click", () => {
      if (this.isVolumeOff) {
        this.isVolumeOff = false;
        volumeIcon.classList.add("fa-volume-high");
        volumeIcon.classList.remove("fa-volume-xmark");
        volume.value = currentVolume * 100;
        audio.volume = currentVolume;
      } else {
        this.isVolumeOff = true;
        volumeIcon.classList.add("fa-volume-xmark");
        volumeIcon.classList.remove("fa-volume-high");
        volume.value = 0;
        audio.volume = 0;
      }
    });

    //Next song
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.setConfig("currentIndex", _this.currentIndex);
      _this.activeSong();
      _this.scrollToAciveSong();
    };

    //Back song
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.randomSong();
      } else {
        _this.prevSong();
      }
      audio.play();
      _this.setConfig("currentIndex", _this.currentIndex);
      _this.activeSong();
      _this.scrollToAciveSong();
    };

    //random song
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig("isRandom", _this.isRandom);
      _this.activeBtn("isRandom");
    };

    //repeat song
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig("isRepeat", _this.isRepeat);
      _this.activeBtn("isRepeat");
    };

    //xử lí khi audio ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    };

    //show/hide playlist
    playlistBtn.addEventListener("click", () => {
      playlist.classList.toggle("active");
      playlistBtn.classList.toggle("active");
    });

    //lắng nghe hành vi click playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest(".song:not(.active)");
      if (songNode || e.target.closest(".option")) {
        if (e.target.closest(".option")) {
          alert("chưa update :v");
        } else {
          _this.currentIndex = songNode.dataset.index;
          _this.setConfig("currentIndex", Number(_this.currentIndex));
          _this.loadCurrentSong();
          _this.activeSong();
          _this.scrollToAciveSong();
          audio.play();
        }
      }
    };
  },

  activeBtn: function (key) {
    if (key == "isRandom") {
      randomBtn.classList.toggle("active", this.config[key] || false);
    }
    if (key == "isRepeat") {
      repeatBtn.classList.toggle("active", this.config[key] || false);
    }
  },

  activeSong: function () {
    const prevIndex = document.querySelector(".song.active");
    prevIndex.classList.remove("active");
    const songActive = playlist.childNodes[this.currentIndex];
    songActive.classList.add("active");
  },

  scrollToAciveSong: function () {
    setTimeout(() => {
      $(".song.active").scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }, 300);
  },

  loadCurrentSong: function () {
    console.log(this.currentSong)
    singer.textContent = this.currentSong.singer;
    songName.textContent = this.currentSong.name;
    CDThumb.style.backgroundImage = `url(${this.currentSong.image})`;
    audio.src = this.currentSong.path;
  },

  handleConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
    this.currentIndex = this.config.currentIndex || 0;
  },

  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length - 1) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  randomSong: function () {
    if (listIndex.size == this.songs.length - 1) {
      listIndex.clear();
    }
    listIndex.add(this.currentIndex);
    let rand;
    do {
      rand = Math.floor(Math.random() * this.songs.length);
    } while (listIndex.has(rand));
    this.currentIndex = rand;
    this.loadCurrentSong();
  },

  formatTimer: function (number) {
    const minutes = Math.floor(number / 60);
    const seconds = Math.floor(number - minutes * 60);
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  },

  start: function () {
    // định nghĩa các thuộc tính  cho object
    this.defineProperties();
    //lắng nghe/ xử lí các xự kiện DOM
    this.handleEvents();
    //render playlist
    this.render();
    //render giá trị từ local storare ra app
    this.handleConfig();
    this.activeBtn("isRandom");
    this.activeBtn("isRepeat");
    this.activeSong();
    this.scrollToAciveSong();
    // // tải thông tin bài hát đầu tiên
    this.loadCurrentSong();
  },
};

app.start();
