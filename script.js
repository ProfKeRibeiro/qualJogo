let pontos = 0;
let player;
let trackName;
let erros = 0;
let jogos = {};
let playTimeout;
let tentativasOuvir = 0;
let musicaAnterior;
let connect_to_device;

function startGame() {
  if (trackName.includes("-")) {
    const partes = trackName.split("-");
    trackName = partes[0].trim();
  }
  trackName = trackName.trim();
  return trackName;
}

function atualizarPontuacao() {
  //a pontuação não pode ser menor que 0
  if (pontos < 0) {
    pontos = 0;
  }
  const pontuacaoElement = document.getElementById("score");
  pontuacaoElement.innerText = `Pontuação: ${pontos}`;
}

function mostrarMensagem(mensagem) {
  const mensagemContainer = document.getElementById("mensagem-container");
  const mensagemElement = document.getElementById("mensagem");

  mensagemContainer.classList.remove("hidden");

  mensagemElement.innerText = mensagem;
}

function reiniciarJogo() {
  mostrarMensagem("Você perdeu!");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

function extrairNomeDaMusica() {
  if (trackName.includes("-")) {
    const partes = trackName.split("-");
    trackName = partes[0].trim();
  }
  trackName = trackName.trim();
  return trackName;
}

const tempoDaMusica = 15000;
let stopTimeout;

function playMusic() {
  player.togglePlay();
  setTimeout(() => {
    player.pause();
  }, tempoDaMusica);
}

function getToken() {
    fetch("token.json")
      .then((response) => response.json())
      .then((data) => {
        token = data.token;
      });
  }
  getToken();

window.onSpotifyWebPlaybackSDKReady = () => {
  player = new Spotify.Player({
    name: "Web Playback SDK Quick Start Player",
    getOAuthToken: (cb) => {
      cb(token);
    },
    volume: 0.5,
  });

  const musicasEJogos = {
    "super mario bros. theme": "super mario",
    "tetris theme": "tetris",
    "donkey kong country theme": "donkey kong",
    "crash bandicoot theme": "crash",
    "san andreas theme song": "gta",
    "bomberman theme (area 1)": "bomberman",
    "god of war iii overture": "god of war",
    "among us theme": "among us",
    "genshin impact main theme": "genshin impact",
    "free fire lobby: original": "free fire",
  };

  //um array com os albuns que serão usados no jogo
  let album_uri = [
    "spotify:playlist:0rEetDb8PbNZcjJ30SS51d",
    "spotify:playlist:7ipjrgeonBt6MqTQeFT4TR",
    "spotify:playlist:3xZtCKskNZaYgX4AV8n8I8",
  ];
  //função para escolher um album aleatorio do array
  let randomAlbum = album_uri[Math.floor(Math.random() * album_uri.length)];
  album_uri = randomAlbum;

  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    connect_to_device = () => {
      fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            context_uri: album_uri,
            play: false,
          }),
          headers: new Headers({
            Authorization: "Bearer " + token,
          }),
        }
      )
        .then((response) => console.log(response))
        .then((data) => {
          player.addListener("player_state_changed", ({ track_window }) => {
            trackName = track_window.current_track.name.toLowerCase();
            console.log("Current Track:", trackName);

            if (musicasEJogos[trackName]) {
              jogos[trackName] = musicasEJogos[trackName];
            }
          });
        });
    };
  });
  let isConnected;
  let contador_musicas = 0;
  document.getElementById("play-music").addEventListener("click", (e) => {
    //previne que a pagina seja recarregada zerando a pontuação
    e.preventDefault();
//verifica se o usuario clicou em play quando o estado da musica é paused
    player.getCurrentState().then((state) => {
      if (state.paused == true) {
        console.log(state.paused)
        pontos -= 2;
        atualizarPontuacao();
        //mostrar os pontos valendo
        alert(`Você perderá 2 pontos por não ter acertado a música no tempo suficiente.`) ;
        if (trackName === musicaAnterior) {
          playMusic();
          tentativasOuvir++;
          if (tentativasOuvir === 3) {
            reiniciarJogo();
          }
        }
      }
    });
  
    if (!isConnected) {
      connect_to_device();
      isConnected = true;
    }
    playMusic();
  });

  document.getElementById("btn-resposta").addEventListener("click", (event) => {
    event.preventDefault();
    let resposta = document.getElementById("resposta").value;
    resposta = resposta.toLowerCase();

    if (jogos[trackName] && resposta === jogos[trackName]) {
      alert("Você Acertou, Parabéns!");
      pontos += 10;
      atualizarPontuacao();
      document.getElementById("resposta").value = "";
      player.nextTrack();
      setTimeout(() => {
        document.getElementById("mensagem-container").classList.add("hidden");
      }, 1300);
      contador_musicas++;
      if (contador_musicas === 4) {
        alert(`PARABÉNS, Você finalizou o jogo!!! Sua pontuação é ${pontos}` );
        window.location.href = "index.html";
      }
    } else {
      alert("Você errou, tente novamente!");
      pontos -= 5;
      atualizarPontuacao();
      erros++;
      if (erros === 3) {
        reiniciarJogo();
      }
    }
  });

  player.connect();
};
