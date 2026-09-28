const REFRESH_INTERVAL = 300000; // 5 minutes

async function fetchNews() {
    const container = document.getElementById('news-container');
    
    try {
        // Use RSS2JSON service to convert Google News RSS to JSON
        const searchQuery = 'Accenture OR "Accenture Federal Services"';
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=15`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
            displayNews(data.items);
            updateTimestamp();
        } else {
            throw new Error('Failed to fetch news');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        container.innerHTML = `<div class="error">Unable to load news. Please try again later.<br><small>${error.message}</small></div>`;
    }
}

function displayNews(articles) {
    const container = document.getElementById('news-container');
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="loading">No recent news found.</div>';
        return;
    }
    
    container.innerHTML = articles.map(article => {
        const date = new Date(article.pubDate);
        const timeAgo = getTimeAgo(date);
        
        // Clean up the title (remove source suffix that Google News adds)
        const title = article.title.replace(/ - [^-]+$/, '');
        
        return `
            <div class="news-item">
                <div class="news-title">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                        ${title}
                    </a>
                </div>
                <div class="news-meta">
                    <span class="news-source">Google News</span>
                    <span class="news-date">${timeAgo}</span>
                </div>
                ${article.description ? `<div class="news-description">${stripHtml(article.description)}</div>` : ''}
            </div>
        `;
    }).join('');
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

function updateTimestamp() {
    const timestamp = document.querySelector('.last-updated');
    const now = new Date();
    timestamp.textContent = `Updated: ${now.toLocaleTimeString()}`;
}

// Initial load
fetchNews();

// Auto-refresh every 5 minutes
setInterval(fetchNews, REFRESH_INTERVAL);
