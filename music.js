document.addEventListener('DOMContentLoaded', () => {
    // 依據不同頁面設定不同的鋼琴輕音樂
    // 全部頁面統一採用同一首背景音樂
    const audioSrc = './music/bgm.mp3';

    // 建立播放器 UI
    const playerHtml = `
        <div id="music-player" class="glass">
            <button id="musicToggleBtn">
                <i class="fas fa-play"></i> <span>播放音樂</span>
            </button>
            <audio id="bgMusic" loop autoplay>
                <source src="${audioSrc}">
            </audio>
        </div>
    `;
    
    // 注入 HTML
    document.body.insertAdjacentHTML('beforeend', playerHtml);

    // 注入 CSS (加上轉場用的 class)
    const style = document.createElement('style');
    style.id = 'music-style'; // 標記為我們的專屬樣式
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
        /* 換頁淡入淡出動畫設定 */
        .spa-transition {
            transition: opacity 0.3s ease-in-out;
            opacity: 1;
        }
        .spa-faded {
            opacity: 0;
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

    // 嘗試自動播放 (現代瀏覽器通常會阻擋無互動的自動播放，所以加上互動觸發)
    const tryAutoplay = async () => {
        try {
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

    // 初始化第一次嘗試播放
    if (!window.musicInitialized) {
        tryAutoplay();
        window.musicInitialized = true;
    }

    // ==========================================
    // SPA 無縫換頁路由 (PJAX 核心)
    // ==========================================
    const navigateTo = async (url) => {
        try {
            // 抓出原本要過場的節點
            const getTransitionNodes = () => Array.from(document.body.children)
                .filter(c => c.id !== 'music-player' && c.tagName !== 'SCRIPT');

            // 1. 舊畫面淡出
            const oldNodes = getTransitionNodes();
            oldNodes.forEach(c => {
                c.classList.add('spa-transition');
                c.classList.add('spa-faded');
            });

            // 2. 取回新頁面 HTML
            const response = await fetch(url);
            const html = await response.text();
            const newDoc = new DOMParser().parseFromString(html, 'text/html');

            // 3. 等待淡出動畫完畢
            setTimeout(() => {
                // 原頁面的資源清理 (舊的 style tags 等)
                document.head.querySelectorAll('style:not(#music-style)').forEach(s => s.remove());
                oldNodes.forEach(c => c.remove());

                // 替換標題與樣式
                document.title = newDoc.title;
                newDoc.head.querySelectorAll('style').forEach(s => {
                    document.head.appendChild(document.importNode(s, true));
                });

                // 植入新畫面的 DOM
                const newNodes = Array.from(newDoc.body.children)
                    .filter(c => c.id !== 'music-player' && c.tagName !== 'SCRIPT');
                
                newNodes.forEach(c => {
                    c.classList.add('spa-transition');
                    c.classList.add('spa-faded'); // 剛插入時透明
                    document.body.insertBefore(document.importNode(c, true), document.getElementById('music-player'));
                });

                // 滾回頂部並重置 navbar 滾動監聽造成的殘留 class
                window.scrollTo(0, 0);
                const nav = document.getElementById('navbar');
                if (nav) nav.classList.remove('scrolled');

                // 觸發重新渲染，執行淡入
                requestAnimationFrame(() => {
                    newNodes.forEach(c => c.classList.remove('spa-faded'));
                });
            }, 300); // 配合 CSS 的 0.3s
            
        } catch (error) {
            console.error('SPA Navigation Failed:', error);
            window.location.href = url; // 若出錯直接使用原生換頁
        }
    };

    // 全域監聽原本的連結點擊
    document.addEventListener('click', (e) => {
        // 尋找被點擊的是不是 <a> 標籤
        const a = e.target.closest('a');
        if (!a || !a.href) return;
        
        // 檢查是否為同一網域且指向上下文 HTML，並且不是錨點 (hash)
        const url = new URL(a.href);
        if (url.origin === window.location.origin && url.pathname.endsWith('.html')) {
            // 【重要修復】如果是直接雙擊在檔案總管打開 (file://)，瀏覽器會基於安全阻擋背景載入(CORS)與修改歷史紀錄(pushState)
            // 所以在 file:// 協定下，我們不啟動 SPA 功能，直接讓瀏覽器原生跳轉 (降級處理)
            if (window.location.protocol === 'file:') {
                return; // 不去 e.preventDefault()，直接用傳統方式換頁
            }

            e.preventDefault();
            try {
                window.history.pushState({}, '', url.href); // 同步網址列
            } catch (err) { /* ignore fallback errors */ }
            navigateTo(url.href);
        }
    });

    // 支援瀏覽器上一頁 / 下一頁
    window.addEventListener('popstate', () => {
        navigateTo(window.location.href);
    });

    // ==========================================
    // 全域功能移植 (解決 SPA 抽換後原生腳本不執行的問題)
    // ==========================================
    
    // 首頁用到的文字複製功能
    window.copyText = function(elementId, btnElement) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const textToCopy = el.innerText;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = btnElement.innerHTML;
            btnElement.innerHTML = '<i class="fas fa-check"></i> 複製成功!';
            btnElement.style.background = 'rgba(76, 175, 80, 0.4)';
            btnElement.style.color = '#fff';
            setTimeout(() => {
                btnElement.innerHTML = originalText;
                btnElement.style.background = '';
                btnElement.style.color = '';
            }, 2000);
        });
    };

    // 導覽列的滾動特效 (全域共用)
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) {
            if (window.scrollY > 50) { 
                nav.classList.add('scrolled'); 
            } else { 
                nav.classList.remove('scrolled'); 
            }
        }
    });

});
