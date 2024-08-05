let player;
let currentQuestionIndex = 0;
let score = 0;
let timerInterval;
let videos = [];

const API_KEY = 'AIzaSyB_J4FuqITXd7AxyOT4NPhaV5KtJi1WTsw';  // Замените на ваш API ключ YouTube
const searchQuery = 'popular music';  // Запрос для поиска популярных видео

// Получение списка видео из YouTube API
async function fetchVideos() {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchQuery}&type=video&key=${API_KEY}`);
    const data = await response.json();
    return data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title
    }));
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        playerVars: {
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            showinfo: 0,
            rel: 0,
            fs: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    document.getElementById('start-button').addEventListener('click', startQuiz);
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        startTimer();
    }
}

async function startQuiz() {
    document.getElementById('start-button').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    videos = await fetchVideos();
    loadQuestion();
}

function loadQuestion() {
    const question = videos[currentQuestionIndex];
    player.loadVideoById(question.videoId);
    player.playVideo();
    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';
    const correctIndex = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) {
        const button = document.createElement('button');
        button.textContent = (i === correctIndex) ? question.title : getRandomTitle(correctIndex, i);
        button.classList.add('answer-button', 'btn', 'btn-info', 'm-2');
        button.addEventListener('click', () => checkAnswer(i === correctIndex));
        answersContainer.appendChild(button);
    }
}

function getRandomTitle(correctIndex, currentIndex) {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * videos.length);
    } while (randomIndex === correctIndex || randomIndex === currentIndex);
    return videos[randomIndex].title;
}

function startTimer() {
    let timeLeft = 10;
    document.getElementById('timer').textContent = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            player.stopVideo();
            checkAnswer(false);  // Если не успели ответить
        }
    }, 1000);
}

function checkAnswer(isCorrect) {
    clearInterval(timerInterval);
    if (isCorrect) {
        score++;
    }
    document.getElementById('score').textContent = score;
    currentQuestionIndex++;
    if (currentQuestionIndex < videos.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
}

function endQuiz() {
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('start-button').classList.remove('hidden');
    alert(`Игра окончена! Ваш счёт: ${score}`);
}
