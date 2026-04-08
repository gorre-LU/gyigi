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

    // ====== 新增全域 UI 功能 (回到頂端、翻譯字卡) ======
    
    // 1. 回到頂端按鈕
    const backToTopHtml = `<div id="backToTopBtn" title="回到最上方"><i class="fas fa-chevron-up"></i></div>`;
    document.body.insertAdjacentHTML('beforeend', backToTopHtml);
    const backToTopBtn = document.getElementById('backToTopBtn');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 2. 韓文字卡 Modal 與 按鈕
    const flashcardHtml = `
        <div id="flashcardBtn" title="求生韓文字卡"><i class="fas fa-language"></i></div>
        <div id="flashcardModal">
            <div class="flashcard-content">
                <span class="close-modal" id="closeFlashcard">&times;</span>
                <div class="flashcard-item">
                    <div class="flashcard-kr">화장실이 어디예요?</div>
                    <div class="flashcard-zh">請問洗手間在哪裡？</div>
                </div>
                <div class="flashcard-item">
                    <div class="flashcard-kr">얼음 적게 주세요.</div>
                    <div class="flashcard-zh">麻煩請給我少冰。</div>
                </div>
                <div class="flashcard-item">
                    <div class="flashcard-kr">전혀 맵지 않게 해주세요.</div>
                    <div class="flashcard-zh">請做完全不辣的（不要放辣椒）。</div>
                </div>
                <div class="flashcard-item">
                    <div class="flashcard-kr">계산해 주세요.</div>
                    <div class="flashcard-zh">麻煩結帳！</div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', flashcardHtml);
    
    const flashcardBtn = document.getElementById('flashcardBtn');
    const flashcardModal = document.getElementById('flashcardModal');
    const closeFlashcard = document.getElementById('closeFlashcard');
    
    flashcardBtn.addEventListener('click', () => {
        flashcardModal.classList.add('show');
    });
    
    closeFlashcard.addEventListener('click', () => {
        flashcardModal.classList.remove('show');
    });
    
    flashcardModal.addEventListener('click', (e) => {
        if (e.target === flashcardModal) {
            flashcardModal.classList.remove('show');
        }
    });

});

// === 全域共用的複製韓文功能 ===
window.copyGlobalText = function(text, btnElement) {
    if(navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(btnElement);
        });
    } else {
        // Fallback for non-HTTPS local testing
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showCopySuccess(btnElement);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
    }
};

function showCopySuccess(btnElement) {
    const originalHtml = btnElement.innerHTML;
    btnElement.innerHTML = '<i class="fas fa-check"></i> 已複製!';
    btnElement.style.background = 'rgba(76, 175, 80, 0.6)';
    btnElement.style.borderColor = 'rgba(76, 175, 80, 0.8)';
    setTimeout(() => {
        btnElement.innerHTML = originalHtml;
        btnElement.style.background = '';
        btnElement.style.borderColor = '';
    }, 2000);
}
