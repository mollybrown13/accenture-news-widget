const API_KEY = '0ecfed442f534845885f467ab562b30c'; // Replace with your API key
const REFRESH_INTERVAL = 300000; // 5 minutes in milliseconds

// Search queries for Accenture news
const searchQueries = 'Accenture OR "Accenture Federal Services"';

async function fetchNews() {
    const container = document.getElementById('news-container');
    
    try {
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQueries)}&sortBy=publishedAt&language=en&pageSize=15&apiKey=${API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'ok' && data.articles) {
            displayNews(data.articles);
            updateTimestamp();
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        container.innerHTML = `<div class="error">Unable to load news. Please try again later.</div>`;
    }
}

function displayNews(articles) {
    const container = document.getElementById('news-container');
    
    if (articles.length === 0) {
        container.innerHTML = '<div class="loading">No recent news found.</div>';
        return;
    }
    
    container.innerHTML = articles.map(article => {
        const date = new Date(article.publishedAt);
        const timeAgo = getTimeAgo(date);
        
        return `
            <div class="news-item">
                <div class="news-title">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                        ${article.title}
                    </a>
                </div>
                <div class="news-meta">
                    <span class="news-source">${article.source.name}</span>
                    <span class="news-date">${timeAgo}</span>
                </div>
                ${article.description ? `<div class="news-description">${article.description}</div>` : ''}
            </div>
        `;
    }).join('');
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
