let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  // Calculate minutes and seconds
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and seconds with leading zeros
  let formattedMinutes = String(minutes).padStart(2, '0');
  let formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Return formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
  let response = await a.text();
  console.log(response)

  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])

    }
  }
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li> 
  
  <img class="invert" src="music.svg" alt="">
  <div class="info">
   <div>${song.replaceAll("%20", " ")}</div>
   <div>Singer</div>
  </div>
  <div class="playnow">
   <span>Play now</span>
  <img class="invert" src="play.svg" alt="">
  </div>
  </li>`;
  }

  // attach an event listerner to each song

  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });


}

const playMusic = (track, pause = false) => {
  // let audio=new Audio("/songs/" +track);
  currentSong.src = `/${currFolder}/` + track
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }


  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}
async function displayAlbums() {
  console.log("displaying albums");
  let a = await fetch(`http://127.0.0.1:5500/${folder}/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];
      // Get the metadata of the folder
      let metadataResponse = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let metadata = await metadataResponse.json();
      let card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="play">  
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="#000">
            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="#000" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="">
        <h2>${metadata.title}</h2>
        <p>${metadata.description}</p>`;
      cardContainer.appendChild(card);
    }
  }
}


async function main() {


  //get the list of all the songs
  await getSongs("songs/ncs")
  playMusic(songs[0], true)
  //show all the playlist in the playlist


  // attach and event listener to play,next,previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg"
    }
    else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // listen for time  update event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime,currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}: ${secondsToMinutesSeconds(currentSong.duration)}`

    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })

  // add event listerner to seeek bar

  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration) * percent / 100
  })

  // add event listener to hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  });

  //add event listeer to close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"
  });

  // add and event listerner to previous and next

  previous.addEventListener("click", () => {
    console.log("previous clicked")
    console.log(currentSong);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (index + 1 >= length) {
      playMusic(songs[index + 1])
    }
  });

  next.addEventListener("click", () => {
    console.log("next clicked")

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1])
    }

  });

  // Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log("Setting volume to", e.target.value, "/ 100")
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
  })

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      console.log("Fetching Songs")
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])

    })
  })

  // Add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }

})



}
main()