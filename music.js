document.addEventListener('DOMContentLoaded', () => {
    // 建立播放器 UI
    const playerHtml = `
        <div id="music-player" class="glass">
            <button id="musicToggleBtn">
                <i class="fas fa-play"></i> <span>播放音樂</span>
            </button>
            <audio id="bgMusic" loop autoplay>
                <source src="./music/bgm.mp3">
            </audio>
        </div>
    `;
    
    // 注入 HTML
    document.body.insertAdjacentHTML('beforeend', playerHtml);

    // 注入 CSS
    const style = document.createElement('style');
    style.id = 'music-style';
    style.innerHTML = `
        #music-player {
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 10px 20px;
            border-radius: 50px;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        #music-player:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }
        #musicToggleBtn {
            background: none;
            border: none;
            color: #fff;
            font-size: 16px;
            font-family: inherit;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            outline: none;
        }
        #musicToggleBtn i {
            font-size: 18px;
            width: 20px;
        }
        .music-playing #musicToggleBtn i {
            color: #2ecc71;
            animation: bounce 0.8s infinite alternate ease-in-out;
        }
        @keyframes bounce {
            from { transform: translateY(0); }
            to { transform: translateY(-3px); }
        }
    `;
    document.head.appendChild(style);

    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('musicToggleBtn');
    const playerContext = document.getElementById('music-player');
    const icon = btn.querySelector('i');
    const span = btn.querySelector('span');

    // 更新 UI 狀態的函數
    const updateUI = () => {
        if (music.paused) {
            icon.className = 'fas fa-play';
            span.innerText = '播放音樂';
            playerContext.classList.remove('music-playing');
        } else {
            icon.className = 'fas fa-pause';
            span.innerText = '暫停音樂';
            playerContext.classList.add('music-playing');
        }
    };

    // 點擊按鈕切換播放/暫停
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (music.paused) {
            music.play();
        } else {
            music.pause();
        }
    });

    // 監聽實際播放狀態來更新 UI (防呆)
    music.addEventListener('play', updateUI);
    music.addEventListener('pause', updateUI);

    // 加上錯誤捕捉：檔案遺失或無法載入時的 UI 提示
    music.addEventListener('error', () => {
        icon.className = 'fas fa-exclamation-triangle';
        icon.style.color = '#e74c3c'; // 紅色警告
        span.innerText = '找不到音樂檔';
        playerContext.classList.remove('music-playing');
    });

    // 頁面載入後自動嘗試播放
    const tryAutoplay = async () => {
        try {
            // 這個寫法能讓有互動記憶的瀏覽器自動播放
            await music.play();
        } catch (err) {
            console.log('Autoplay prevented by browser. Waiting for user interaction.');
            const startOnInteraction = () => {
                music.play();
                document.removeEventListener('click', startOnInteraction);
                document.removeEventListener('scroll', startOnInteraction);
            };
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('scroll', startOnInteraction, { once: true });
        }
    };
    
    tryAutoplay();
});
