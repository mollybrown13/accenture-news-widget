const REFRESH_INTERVAL = 300000; // 5 minutes

async function fetchNews() {
    const container = document.getElementById('news-container');
    
    try {
        // Use AllOrigins CORS proxy with Google News RSS
        const searchQuery = 'Accenture OR "Accenture Federal Services"';
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(proxyUrl);
        const text = await response.text();
        
        // Parse XML RSS feed
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = xml.querySelectorAll('item');
        
        if (items.length > 0) {
            displayNews(items);
            updateTimestamp();
        } else {
            container.innerHTML = '<div class="loading">No recent news found.</div>';
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        container.innerHTML = `<div class="error">Unable to load news. Please try again later.</div>`;
    }
}

function displayNews(items) {
    const container = document.getElementById('news-container');
    
    const articles = Array.from(items).slice(0, 15).map(item => {
        const title = item.querySelector('title')?.textContent || 'No title';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        
        const date = new Date(pubDate);
        const timeAgo = getTimeAgo(date);
        
        // Clean up title (remove source suffix)
        const cleanTitle = title.replace(/ - [^-]+$/, '');
        
        return `
            <div class="news-item">
                <div class="news-title">
                    <a href="${link}" target="_blank" rel="noopener noreferrer">
                        ${cleanTitle}
                    </a>
                </div>
                <div class="news-meta">
                    <span class="news-source">Google News</span>
                    <span class="news-date">${timeAgo}</span>
                </div>
                ${description ? `<div class="news-description">${stripHtml(description)}</div>` : ''}
            </div>
        `;
    }).join('');
    
    container.innerHTML = articles;
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
