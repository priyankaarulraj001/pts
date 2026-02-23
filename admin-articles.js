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
            
            // Get current language to display appropriate title
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            let articleTitle = article.title || '';
            let articleSummary = article.summary || '';
            
            // Use translated content based on language
            if (currentLang === 'tam' && article.title_tamil) {
                articleTitle = article.title_tamil;
                articleSummary = article.summary_tamil || '';
            } else if (currentLang === 'hin' && article.title_hindi) {
                articleTitle = article.title_hindi;
                articleSummary = article.summary_hindi || '';
            }
            
            // Only display image if user entered data with image
            const imageHtml = isValidImage(article.image) ? `
                <div class="trending-image">
                    <img src="${article.image}" alt="${articleTitle}">
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
                            <a href="article.html?id=${article.id}" data-i18n="" data-auto-translate="true">${articleTitle}</a>
                        </h3>
                        <p class="trending-excerpt" data-i18n="" data-auto-translate="true">${articleSummary || ''}</p>
                        <div class="trending-meta">
                            <span class="trending-date">${article.date || ''}</span>
                            <a href="article.html?id=${article.id}" class="read-more-link" data-i18n="Read More" data-auto-translate="true">Read More</a>
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
    
    // Get current language
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';
    
    // Group articles by main category
    const articlesByCategory = {};
    
    articles.forEach(article => {
        const mainCategory = getMainCategory(article.category);
        const categoryKey = getCategoryKey(mainCategory);
        
        // Get translated title based on language
        let displayTitle = article.title || '';
        let displaySummary = article.summary || '';
        
        if (currentLang === 'tam' && article.title_tamil) {
            displayTitle = article.title_tamil;
            displaySummary = article.summary_tamil || '';
        } else if (currentLang === 'hin' && article.title_hindi) {
            displayTitle = article.title_hindi;
            displaySummary = article.summary_hindi || '';
        }
        
        // Store article with display text
        const articleWithDisplay = {
            ...article,
            display_title: displayTitle,
            display_summary: displaySummary
        };
        
        if (!articlesByCategory[categoryKey]) {
            articlesByCategory[categoryKey] = [];
        }
        articlesByCategory[categoryKey].push(articleWithDisplay);
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
    
    // Use display_title if available (from language-aware processing), otherwise fallback to original
    const title = article.display_title || article.title || '';
    const summary = article.display_summary || article.summary || '';
    
    // Only show image if user actually uploaded one
    if (isValidImage(article.image)) {
        card.innerHTML = `
            <a href="article.html?id=${article.id}">
                <img class="category-image" src="${article.image}" alt="${title}">
                <h3 data-i18n="">${title}</h3>
                <p data-i18n="">${summary}</p>
            </a>
        `;
    } else {
        // No image - show text only card
        card.innerHTML = `
            <a href="article.html?id=${article.id}">
                <h3 data-i18n="" style="margin-top: 0;">${title}</h3>
                <p data-i18n="">${summary}</p>
            </a>
        `;
    }
    
    return card;
}

// Function to reload articles when language changes
function reloadArticlesForLanguage() {
    // Clear existing articles from DOM
    const trendingWrapper = document.querySelector('.trending-slider .swiper-wrapper');
    if (trendingWrapper) {
        // Remove dynamically added slides (keep original ones)
        const existingSlides = trendingWrapper.querySelectorAll('.swiper-slide');
        existingSlides.forEach(slide => {
            // Check if it was added by admin-articles.js (has article with id)
            const articleLink = slide.querySelector('a[href^="article.html?id="]');
            if (articleLink) {
                slide.remove();
            }
        });
    }
    
    // Clear mega menu articles
    const categoryMegaMenus = {
        'politics': document.querySelector('.menu > li:has(a[data-i18n="Politics"]) .mega-menu'),
        'business': document.querySelector('.menu > li:has(a[data-i18n="Business"]) .mega-menu'),
        'sports': document.querySelector('.menu > li:has(a[data-i18n="Sports"]) .mega-menu'),
        'science': document.querySelector('.menu > li:has(a[data-i18n="Science"]) .mega-menu'),
        'tech': document.querySelector('.menu > li:has(a[data-i18n="Tech"]) .mega-menu')
    };
    
    Object.values(categoryMegaMenus).forEach(megaMenu => {
        if (megaMenu) {
            const cards = megaMenu.querySelectorAll('.mega-card');
            cards.forEach(card => {
                const link = card.querySelector('a[href^="article.html?id="]');
                if (link) {
                    card.remove();
                }
            });
        }
    });
    
    // Reload articles with new language
    loadAdminArticles();
    loadAdminArticlesToMegaMenu();
}

// Listen for language changes and reload articles
document.addEventListener('DOMContentLoaded', function() {
    loadAdminArticles();
    loadAdminArticlesToMegaMenu();
    
    // Override changeLanguage to reload articles after language change
    const originalChangeLanguage = window.changeLanguage;
    window.changeLanguage = async function(lang) {
        await originalChangeLanguage(lang);
        // Reload articles with new language
        reloadArticlesForLanguage();
    };
});

