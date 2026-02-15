// Load Admin Articles into Respective Topics
// Extract main category from "Category - Subtopic" format
function getMainCategory(fullCategory) {
    if (fullCategory && fullCategory.includes(' - ')) {
        return fullCategory.split(' - ')[0].trim();
    }
    return fullCategory || 'General';
}

// Map category names to match mega menu structure
function getCategoryKey(category) {
    const categoryMap = {
        'Politics': 'politics',
        'Business': 'business',
        'Sports': 'sports',
        'Science': 'science',
        'Tech': 'tech',
        'Technology': 'tech'
    };
    return categoryMap[category] || category?.toLowerCase();
}

// Check if image URL is valid (not empty, undefined, null, or default placeholder)
function isValidImage(imageUrl) {
    // More robust check - must be a non-empty string
    if (!imageUrl || typeof imageUrl !== 'string') {
        return false;
    }
    const trimmed = imageUrl.trim();
    // Check for empty values
    if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
        return false;
    }
    // Check for the old default placeholder image
    if (trimmed === 'assets/images/20260103082456_medium_358x215_40.webp' || 
        trimmed.includes('default-123x83') || 
        trimmed.includes('default-358x215') ||
        trimmed.includes('default-730x400')) {
        return false;
    }
    return true;
}

// Generate unique ID for article
function generateArticleId() {
    return 'article_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get all articles with IDs
function getArticles() {
    return JSON.parse(localStorage.getItem('adminArticles') || '[]');
}

// Save articles with ID if not present
function saveArticles(articles) {
    // Ensure each article has an ID
    articles = articles.map(article => {
        if (!article.id) {
            article.id = generateArticleId();
        }
        return article;
    });
    localStorage.setItem('adminArticles', JSON.stringify(articles));
    return articles;
}

// Initialize - ensure all articles have IDs
function initializeArticles() {
    const articles = getArticles();
    if (articles.length > 0) {
        saveArticles(articles);
    }
}

// Run initialization
initializeArticles();

// Load admin articles and inject into existing Trending section
function loadAdminArticles() {
    const articles = getArticles();
    
    if (articles.length === 0) {
        return; // No articles to display
    }
    
    // Get the trending slider wrapper
    const trendingWrapper = document.querySelector('.trending-slider .swiper-wrapper');
    
    if (trendingWrapper) {
        // Add admin articles to the trending section based on their category
        articles.forEach(article => {
            const mainCategory = getMainCategory(article.category);
            
            // Only display image if user entered data with image
            const imageHtml = isValidImage(article.image) ? `
                <div class="trending-image">
                    <img src="${article.image}" alt="${article.title}">
                    <span class="category-tag">${mainCategory}</span>
                </div>
            ` : `
                <div class="trending-image">
                    <span class="category-tag">${mainCategory}</span>
                </div>
            `;
            
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <article class="trending-card">
                    ${imageHtml}
                    <div class="trending-content">
                        <h3 class="trending-card-title">
                            <a href="article.html?id=${article.id}">${article.title}</a>
                        </h3>
                        <p class="trending-excerpt">${article.summary || ''}</p>
                        <div class="trending-meta">
                            <span class="trending-date">${article.date || ''}</span>
                        </div>
                    </div>
                </article>
            `;
            
            trendingWrapper.appendChild(slide);
        });
    }
}

// Load admin articles into mega menu categories - replaces existing content
function loadAdminArticlesToMegaMenu() {
    const articles = getArticles();
    
    if (articles.length === 0) {
        return; // No articles to display
    }
    
    // Group articles by main category
    const articlesByCategory = {};
    
    articles.forEach(article => {
        const mainCategory = getMainCategory(article.category);
        const categoryKey = getCategoryKey(mainCategory);
        
        if (!articlesByCategory[categoryKey]) {
            articlesByCategory[categoryKey] = [];
        }
        articlesByCategory[categoryKey].push(article);
    });
    
    // Define category mapping - maps category key to the mega menu element
    const categoryMegaMenus = {
        'politics': document.querySelector('.menu > li:has(a[data-i18n="Politics"]) .mega-menu'),
        'business': document.querySelector('.menu > li:has(a[data-i18n="Business"]) .mega-menu'),
        'sports': document.querySelector('.menu > li:has(a[data-i18n="Sports"]) .mega-menu'),
        'science': document.querySelector('.menu > li:has(a[data-i18n="Science"]) .mega-menu'),
        'tech': document.querySelector('.menu > li:has(a[data-i18n="Tech"]) .mega-menu')
    };
    
    // Inject articles into each category's mega menu - REPLACE existing content
    Object.keys(articlesByCategory).forEach(categoryKey => {
        const megaMenu = categoryMegaMenus[categoryKey];
        const categoryArticles = articlesByCategory[categoryKey];
        
        if (megaMenu && categoryArticles.length > 0) {
            // Clear existing mega cards and replace with articles
            megaMenu.innerHTML = '';
            
            // Get up to 4 articles for this category
            const recentArticles = categoryArticles.slice(0, 4);
            
            recentArticles.forEach(article => {
                const articleCard = createMegaMenuArticleCard(article);
                megaMenu.appendChild(articleCard);
            });
        }
    });
}

// Create mega menu card HTML for article - shows image only if valid image exists
function createMegaMenuArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'mega-card';
    
    // Only show image if user actually uploaded one
    if (isValidImage(article.image)) {
        card.innerHTML = `
            <a href="article.html?id=${article.id}">
                <img class="category-image" src="${article.image}" alt="${article.title}">
                <h3 data-i18n="">${article.title}</h3>
                <p data-i18n="">${article.summary || ''}</p>
            </a>
        `;
    } else {
        // No image - show text only card
        card.innerHTML = `
            <a href="article.html?id=${article.id}">
                <h3 data-i18n="" style="margin-top: 0;">${article.title}</h3>
                <p data-i18n="">${article.summary || ''}</p>
            </a>
        `;
    }
    
    return card;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    loadAdminArticles();
    loadAdminArticlesToMegaMenu();
});

