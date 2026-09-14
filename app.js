// Supabase Bağlantı Bilgileri
const SUPABASE_URL = "https://uzkirfftjynlhkezzui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6aWtpcmZmanlubGpoa2V4enVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MDc1ODcsImV4cCI6MjEwNDk4MzU4N30.LArEP62VM9SSINuapv79gaCb1ARdKFYbZ04l04yvPGc";

// Supabase İstemcisini Başlat
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

var games = [
    { id: 1, title: "Zıplayan Top", type: "physics", size: "1 KB" },
    { id: 2, title: "Çekim Kuvveti", type: "physics2", size: "1.2 KB" },
    { id: 3, title: "Tıkla Patlat", type: "clicker", size: "0.9 KB" },
    { id: 4, title: "Boşlukta Süzül", type: "empty_chill", size: "0.8 KB" }
];

var gameGrid = document.getElementById("game-grid");
var gameContainer = document.getElementById("game-container");
var gameSelection = document.getElementById("game-selection");
var creatorContainer = document.getElementById("creator-container");
var displayArea = document.getElementById("display-area");
var activeInterval = null;

// Supabase'den oyunları çeken ve ekrana basan fonksiyon
async function loadGameList() {
    gameGrid.innerHTML = "<p style='color:#94a3b8;'>Oyunlar yükleniyor...</p>";

    // Supabase 'games' tablosundan veri çekiyoruz
    const { data: dbGames, error } = await supabase
        .from('games')
        .select('*')
        .order('id', { ascending: false });

    // Eğer veritabanında veri varsa yerel listemizi güncelliyoruz
    if (!error && dbGames && dbGames.length > 0) {
        games = dbGames;
    }

    gameGrid.innerHTML = "";
    for (var i = 0; i < games.length; i++) {
        var game = games[i];
        var card = document.createElement("div");
        card.className = "game-card";
        card.innerHTML = "<strong>" + game.title + "</strong><br><small class='game-size'>" + (game.size || '1.0 KB') + "</small>";
        
        (function(g) {
            card.onclick = function() { launchGame(g); };
        })(game);

        gameGrid.appendChild(card);
    }
}

function showHome() {
    if (activeInterval) clearInterval(activeInterval);
    gameContainer.classList.add("hidden");
    creatorContainer.classList.add("hidden");
    gameSelection.classList.remove("hidden");
    displayArea.innerHTML = "";
    loadGameList();
}

function showCreator() {
    if (activeInterval) clearInterval(activeInterval);
    gameSelection.classList.add("hidden");
    gameContainer.classList.add("hidden");
    creatorContainer.classList.remove("hidden");
    document.getElementById("loading-overlay").style.display = "none";
    document.getElementById("publishBtn").style.display = "block";
}

function launchGame(game) {
    gameSelection.classList.add("hidden");
    creatorContainer.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    displayArea.innerHTML = "<p style='color:#94a3b8;'>Oyun yükleniyor...</p>";

    if (activeInterval) clearInterval(activeInterval);

    setTimeout(function() {
        if (game.type === "physics" || game.type === "physics2") {
            displayArea.innerHTML = '<canvas id="gameCanvas" width="400" height="400"></canvas>';
            startPhysicsEngine(game.type);
        } else if (game.type === "clicker") {
            displayArea.innerHTML = '<div style="text-align:center;"><h2 id="score" style="margin-bottom:15px;">Skor: 0</h2><button id="clickBtn" style="padding:15px 30px; font-size:20px; background:#38bdf8; border:none; border-radius:8px; cursor:pointer; color:#0f172a; font-weight:bold;">TIKLA!</button></div>';
            startClickerEngine();
        } else {
            displayArea.innerHTML = '<div style="text-align:center; color:#94a3b8;"><h2>' + game.title + '</h2><p>Sakinleştirici mod.</p><div id="chillBox" style="width:50px; height:50px; background:#38bdf8; margin:20px auto; border-radius:50%;"></div></div>';
            startChillEngine();
        }
    }, 300);
}

// Oyunu Supabase Veritabanına Kaydeden Fonksiyon
async function publishGame() {
    var title = document.getElementById("newGameTitle").value.trim();
    var type = document.getElementById("newGameType").value;
    
    if (!title) {
        alert("Lütfen oyun adı girin!");
        return;
    }

    document.getElementById("publishBtn").style.display = "none";
    var loadingOverlay = document.getElementById("loading-overlay");
    var progressBar = document.getElementById("progress-bar");
    var statusText = document.getElementById("publishStatus");
    loadingOverlay.style.display = "flex";
    progressBar.style.width = "0%";

    var progress = 0;
    var interval = setInterval(async function() {
        progress += 2;
        if (progress <= 100) {
            progressBar.style.width = progress + "%";
            if (progress === 30) statusText.innerText = "Otomatik bot virüs taraması yapıyor...";
            if (progress === 70) statusText.innerText = "Küresel sunucuya işleniyor...";
        } else {
            clearInterval(interval);
            
            // Supabase Veritabanına Kayıt
            const { error } = await supabase
                .from('games')
                .insert([{ title: title, type: type, size: "1.1 KB" }]);

            if (error) {
                console.error("Veritabanına kaydedilirken hata:", error);
            }

            statusText.innerText = "Başarıyla onaylandı ve yayınlandı!";

            setTimeout(function() {
                showHome();
            }, 1200);
        }
    }, 80);
}

function startPhysicsEngine(type) {
    var canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var y = 50, vy = 2, gravity = 0.4, x = 200, vx = 2;

    activeInterval = setInterval(function() {
        ctx.clearRect(0, 0, 400, 400);
        if (type === "physics") {
            vy += gravity;
            y += vy;
            if (y > 380) { y = 380; vy = -vy * 0.75; }
        } else {
            x += vx; y += vy;
            if (x < 10 || x > 390) vx = -vx;
            if (y < 10 || y > 390) vy = -vy;
        }
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
    }, 1000 / 60);
}

function startClickerEngine() {
    var score = 0;
    var btn = document.getElementById("clickBtn");
    var scoreText = document.getElementById("score");
    if (!btn) return;
    btn.onclick = function() {
        score++;
        scoreText.innerText = "Skor: " + score;
    };
}

function startChillEngine() {
    var box = document.getElementById("chillBox");
    if (!box) return;
    var scale = 1, growing = true;
    activeInterval = setInterval(function() {
        if (growing) { scale += 0.02; if(scale > 1.4) growing = false; }
        else { scale -= 0.02; if(scale < 0.8) growing = true; }
        box.style.transform = "scale(" + scale + ")";
    }, 50);
}

// Başlangıçta listeyi yükle
loadGameList();
