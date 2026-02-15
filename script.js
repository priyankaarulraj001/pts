// Date Display Functionality
function updateDate() {
    const now = new Date();
    
    // Calculate IST time by adding UTC+5:30 offset to the current time
    // This works regardless of the system's timezone
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istTime = new Date(now.getTime() + istOffset);
    
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const formatted = istTime.toLocaleString('en-IN', options);
    
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        dateDisplay.textContent = formatted;
    }
}

// Initialize date when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
});

// Preloader functionality
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    const mainContent = document.querySelector('.main-content');

    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hidden');
        }
        if (mainContent) {
            mainContent.classList.add('visible');
            
            // Initialize scroll animations
            initScrollAnimations();
        }
    }, 1000); // Show preloader for 1 second
});

// Scroll-triggered animations using Intersection Observer
function initScrollAnimations() {
    // Create observer options
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of element is visible
    };

    // Create observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Trigger animations for news sections
                triggerNewsSectionAnimations(entry.target);
                
                // Stop observing once triggered
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe news sections
    const newsSections = document.querySelector('.news-sections');
    if (newsSections) {
        observer.observe(newsSections);
    }
}

// Trigger animations for a specific section
function triggerNewsSectionAnimations(section) {
    if (!section) return;
    
    // Get columns and animate them
    const columns = section.querySelectorAll('.news-column');
    columns.forEach((column, index) => {
        // Reset and restart animation
        column.style.animation = 'none';
        column.offsetHeight; // Force reflow
        column.style.animation = null;
        
        // Add animation class
        column.classList.add('animate-in');
    });

    // Get headers and animate them
    const headers = section.querySelectorAll('.column-header');
    headers.forEach((header, index) => {
        header.style.animation = 'none';
        header.offsetHeight; // Force reflow
        header.style.animation = null;
    });

    // Get articles and animate them with stagger
    const articles = section.querySelectorAll('.news-article');
    articles.forEach((article, index) => {
        article.style.animation = 'none';
        article.offsetHeight; // Force reflow
        article.style.animation = null;
        article.classList.add('animate-in');
    });
}

// Theme toggle functionality with localStorage persistence
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const body = document.body;
    const icon = themeToggle.querySelector('i');
    
    // Check for saved preference on page load
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        body.classList.add('dark-mode');
        if (icon) {
            icon.className = 'ri-sun-fill';
        }
    }
    
    // Toggle function
    const toggleTheme = () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');
        
        // Update icon
        if (icon) {
            icon.className = isDarkMode ? 'ri-sun-fill' : 'ri-moon-fill';
        }
        
        // Save preference
        localStorage.setItem('darkMode', isDarkMode);
        
        // Dispatch custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { darkMode: isDarkMode } }));
    };
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Listen for theme changes from other scripts
    window.addEventListener('themeChanged', (e) => {
        console.log('Theme changed to:', e.detail.darkMode ? 'dark' : 'light');
    });
}

// Side navigation functionality
const sideNavButton = document.getElementById('side-nav-button');
const sideNav = document.getElementById('side-nav');
const sideNavOverlay = document.getElementById('side-nav-overlay');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

function openSideNav() {
    sideNav.classList.add('active');
    document.body.classList.add('side-nav-open');
    document.body.style.overflow = 'hidden';
}

function closeSideNav() {
    sideNav.classList.remove('active');
    document.body.classList.remove('side-nav-open');
    document.body.style.overflow = '';
}

function toggleSideNav() {
    if (sideNav.classList.contains('active')) {
        closeSideNav();
    } else {
        openSideNav();
    }
}

if (sideNavButton && sideNav) {
    sideNavButton.addEventListener('click', toggleSideNav);
}

// Mobile menu toggle functionality
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        const menu = document.querySelector('.menu');
        if (menu) {
            menu.classList.toggle('active');
            this.classList.toggle('active');
        }
    });
}

// Mobile menu item click handler for dropdown menus
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu > li');
    
    menuItems.forEach(item => {
        const link = item.querySelector('a');
        const dropdown = item.querySelector('.dropdown, .mega-menu');
        
        if (link && dropdown) {
            // For touch devices - toggle on click instead of hover
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    // Close other open menus
                    menuItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherDropdown = otherItem.querySelector('.dropdown, .mega-menu');
                            if (otherDropdown) {
                                otherDropdown.style.display = 'none';
                            }
                        }
                    });
                    
                    // Toggle current menu
                    if (dropdown.style.display === 'block') {
                        dropdown.style.display = 'none';
                    } else {
                        dropdown.style.display = 'block';
                    }
                }
            });
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992) {
            const menu = document.querySelector('.menu');
            const mobileToggle = document.getElementById('mobile-menu-toggle');
            
            if (menu && menu.classList.contains('active')) {
                if (!menu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    menu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            }
        }
    });
    
    // Handle window resize to reset menu state
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            const menu = document.querySelector('.menu');
            const mobileToggle = document.getElementById('mobile-menu-toggle');
            const dropdowns = document.querySelectorAll('.dropdown, .mega-menu');
            
            if (menu) {
                menu.classList.remove('active');
            }
            if (mobileToggle) {
                mobileToggle.classList.remove('active');
            }
            dropdowns.forEach(dd => {
                dd.style.display = '';
            });
        }
    });
});

// Close nav when clicking on overlay
if (sideNavOverlay) {
    sideNavOverlay.addEventListener('click', closeSideNav);
}

// Close nav when pressing ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideNav && sideNav.classList.contains('active')) {
        closeSideNav();
    }
});

// Close nav when clicking outside
document.addEventListener('click', (e) => {
    if (sideNav && sideNav.classList.contains('active')) {
        if (!sideNav.contains(e.target) && !sideNavButton.contains(e.target)) {
            closeSideNav();
        }
    }
});

// Close side nav with close button
const sideNavClose = document.getElementById('side-nav-close');
if (sideNavClose) {
    sideNavClose.addEventListener('click', closeSideNav);
}

// ============================================
// MEGA MENU CENTERED POSITIONING
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Position all mega menus at the center of the menu container
    const menuItems = document.querySelectorAll('.has-mega');
    const menu = document.querySelector('.menu');
    
    if (menu && menuItems.length > 0) {
        function positionMegaMenus() {
            const menuRect = menu.getBoundingClientRect();
            const menuCenter = menuRect.left + (menuRect.width / 2);
            
            menuItems.forEach(item => {
                const megaMenu = item.querySelector('.mega-menu');
                if (megaMenu) {
                    // Position mega menu at the center of the menu container
                    megaMenu.style.left = '50%';
                    megaMenu.style.transform = 'translateX(-50%)';
                }
            });
        }
        
        // Position on load and resize
        positionMegaMenus();
        window.addEventListener('resize', positionMegaMenus);
        
        // Also position when hovering over each menu item
        menuItems.forEach(item => {
            item.addEventListener('mouseenter', positionMegaMenus);
        });
    }
});

// ============================================
// Language Support - API-based Translation
// Uses Google Translate API for all translations (no static data)
// ============================================

// All translations now done via Google Translate API - no static dictionaries

// Translation cache for dynamic content (only needed for breaking news, articles)
const translationCache = {};

// Language code mapping for Google Translate
const languageCodeMap = {
    'en': 'en',
    'tam': 'ta',
    'hin': 'hi'
};

// Instant language switch for static UI elements - Using Google Translate API
async function switchStaticLanguage(targetLang) {
    if (targetLang !== 'tam' && targetLang !== 'hin') {
        // Restore English - we need to track original text
        restoreEnglishText();
        return;
    }
    
    // Translate all elements with data-i18n attribute using API
    const i18nElements = document.querySelectorAll('[data-i18n]');
    
    for (const element of i18nElements) {
        const key = element.getAttribute('data-i18n');
        
        // Skip if no key
        if (!key) continue;
        
        // Skip if already in the target language
        if (element.getAttribute('data-current-lang') === targetLang) continue;
        
        // Store original text if not already stored
        if (!element.getAttribute('data-original-text')) {
            element.setAttribute('data-original-text', element.textContent);
        }
        
        // Translate using API
        const translatedText = await translateText(key, targetLang);
        
        if (translatedText) {
            element.textContent = translatedText;
            element.setAttribute('data-current-lang', targetLang);
        }
    }
    
    // Handle HTML content in elements
    const i18nHtmlElements = document.querySelectorAll('[data-i18n-html]');
    for (const element of i18nHtmlElements) {
        const key = element.getAttribute('data-i18n-html');
        
        if (!key) continue;
        
        if (!element.getAttribute('data-original-html')) {
            element.setAttribute('data-original-html', element.innerHTML);
        }
        
        const translatedHtml = await translateText(key, targetLang);
        if (translatedHtml) {
            element.innerHTML = translatedHtml;
            element.setAttribute('data-current-lang', targetLang);
        }
    }
    
    // Handle placeholders
    const i18nPlaceholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    for (const element of i18nPlaceholderElements) {
        const key = element.getAttribute('data-i18n-placeholder');
        
        if (!key) continue;
        
        if (!element.getAttribute('data-original-placeholder')) {
            element.setAttribute('data-original-placeholder', element.placeholder);
        }
        
        const translatedPlaceholder = await translateText(key, targetLang);
        if (translatedPlaceholder) {
            element.placeholder = translatedPlaceholder;
            element.setAttribute('data-current-lang', targetLang);
        }
    }
}

// Restore English text
function restoreEnglishText() {
    // Restore from data-original-text for all elements (Tamil and Hindi)
    const translatedElements = document.querySelectorAll('[data-current-lang="tam"], [data-current-lang="hin"]');
    
    translatedElements.forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
        }
        element.setAttribute('data-current-lang', 'en');
    });
    
    // Restore from data-original-html for HTML content elements
    const translatedHtmlElements = document.querySelectorAll('[data-i18n-html][data-current-lang="tam"], [data-i18n-html][data-current-lang="hin"]');
    translatedHtmlElements.forEach(element => {
        const originalHtml = element.getAttribute('data-original-html');
        if (originalHtml) {
            element.innerHTML = originalHtml;
        }
        element.setAttribute('data-current-lang', 'en');
    });
    
    // Restore placeholders for all elements with data-i18n-placeholder
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
        const originalPlaceholder = element.getAttribute('data-original-placeholder');
        if (originalPlaceholder) {
            element.placeholder = originalPlaceholder;
        }
        element.setAttribute('data-current-lang', 'en');
    });
    
    // Also restore elements with data-original-text but no data-current-lang attribute
    // This handles dynamically translated content
    const autoTranslateElements = document.querySelectorAll('[data-auto-translate]');
    autoTranslateElements.forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText && element.getAttribute('data-current-lang') !== 'en') {
            element.textContent = originalText;
            element.setAttribute('data-current-lang', 'en');
        }
    });
}

// Function to translate text using Google Translate API (only for dynamic content)
async function translateText(text, targetLang) {
    if (!text || text.trim() === '') return text;
    if (targetLang === 'en') return text;
    
    // Check cache first
    const cacheKey = `${targetLang}_${text}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }
    
    try {
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${languageCodeMap[targetLang]}&dt=t&q=${encodeURIComponent(text)}`
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data && data[0]) {
                const translated = data[0].map(item => item[0]).join('');
                translationCache[cacheKey] = translated;
                return translated;
            }
        }
    } catch (error) {
        console.log('Translation not available, using original text');
    }
    
    return text;
}

// Function to translate dynamic content (breaking news, articles) using API
async function translateDynamicContent(targetLang) {
    if (targetLang === 'en') return;
    
    // Translate elements with data-auto-translate attribute
    const autoTranslateElements = document.querySelectorAll('[data-auto-translate]');
    for (const element of autoTranslateElements) {
        const originalText = element.getAttribute('data-original-text') || element.textContent;
        
        if (!element.getAttribute('data-original-text')) {
            element.setAttribute('data-original-text', originalText);
        }
        
        const translated = await translateText(originalText, targetLang);
        element.textContent = translated;
    }
    
    // Translate breaking news ticker spans
    const breakingNewsSpans = document.querySelectorAll('.breaking-ticker span');
    for (const span of breakingNewsSpans) {
        if (span.textContent.trim() && !span.querySelector('i') && span.textContent !== '•') {
            const originalText = span.getAttribute('data-original-text') || span.textContent;
            
            if (!span.getAttribute('data-original-text')) {
                span.setAttribute('data-original-text', originalText);
            }
            
            const translated = await translateText(originalText, targetLang);
            span.textContent = translated;
        }
    }
}

// Main function to change language - Instant switching for UI, API for dynamic content
async function changeLanguage(lang) {
    // Save preference to localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // Update dropdown selection
    const dropdown = document.getElementById('language-selector');
    if (dropdown) {
        dropdown.value = lang;
    }
    
    // API-based translation for all UI elements
    switchStaticLanguage(lang);
    
    // Translate dynamic content (breaking news, articles) using API
    // This has delay but is acceptable for dynamic content
    if (lang === 'tam' || lang === 'hin') {
        await translateDynamicContent(lang);
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
}

// Initialize language on page load - Tamil is default
document.addEventListener('DOMContentLoaded', async function() {
    // Get saved language or default to Tamil
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'tam';
    
    // Apply saved language immediately (instant for static UI)
    switchStaticLanguage(savedLanguage);
    
    // If Tamil or Hindi, also translate dynamic content
    if (savedLanguage === 'tam' || savedLanguage === 'hin') {
        await translateDynamicContent(savedLanguage);
    }
    
    // Add event listener to language selector
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.value = savedLanguage;
        languageSelector.addEventListener('change', function() {
            changeLanguage(this.value);
        });
    }
});

// Make translation function available globally
window.translateText = translateText;
window.changeLanguage = changeLanguage;

// ============================================
// SPOT SLIDER FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if Swiper is loaded
    if (typeof Swiper === 'undefined') {
        console.error('Swiper is not loaded! Check the CDN link.');
        return;
    }
    
    console.log('Swiper version:', Swiper.version);
    
    // Check if slider element exists
    const sliderElement = document.querySelector('.main-slider');
    if (!sliderElement) {
        console.error('Slider element .main-slider not found!');
        return;
    }
    
    console.log('Slider element found, initializing...');
    
    // Select top thumbnails FIRST before using them
    const topThumbItems = document.querySelectorAll('.top-thumb-item');
    const topThumbsList = document.getElementById('top-thumbs-list');
    
    // Function to update thumbnail active state - declare BEFORE using in callbacks
    function updateTopThumbnails(activeIndex) {
        if (!topThumbsList) return;

        const items = topThumbsList.querySelectorAll('.top-thumb-item');

        items.forEach((item) => {
            const dataIndex = parseInt(item.getAttribute('data-index'));
            if (dataIndex === activeIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Initialize Main Slider with Parallax
    const mainSlider = new Swiper('.main-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        loop: true,
        speed: 1000,
        parallax: true,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        on: {
            slideChange: function() {
                // Update active state in top thumbnails
                const activeIndex = this.realIndex;
                updateTopThumbnails(activeIndex);
                
                // Reset progress bar animation
                const progressFill = document.querySelector('.top-thumbs-progress-fill');
                if (progressFill) {
                    progressFill.style.transition = 'none';
                    progressFill.style.width = '0%';
                    setTimeout(() => {
                        progressFill.style.transition = 'width 5s linear';
                        progressFill.style.width = '100%';
                    }, 50);
                }
            },
            slideChangeTransitionStart: function() {
                // Parallax reset on slide change
                const images = document.querySelectorAll('.slide-image img');
                images.forEach(img => {
                    img.style.transition = 'transform 7s ease';
                });
            },
            slideChangeTransitionEnd: function() {
                // Animate active slide content
                const activeSlide = document.querySelector('.main-slider .swiper-slide-active');
                if (activeSlide) {
                    const textElements = activeSlide.querySelectorAll('.slide-text > *');
                    textElements.forEach((el, index) => {
                        el.style.opacity = '0';
                        el.style.transform = index < 2 ? 'translateY(20px)' : 'translateX(-20px)';
                        setTimeout(() => {
                            el.style.transition = 'all 0.6s ease';
                            el.style.opacity = '1';
                            el.style.transform = 'translate(0)';
                        }, index * 100);
                    });
                }
            }
        }
    });

    // Top Thumbnail Click Handler with animations
    topThumbItems.forEach((item) => {
        item.addEventListener('click', function(e) {
            // Get the data-index of the clicked item
            const dataIndex = parseInt(this.getAttribute('data-index'));

            // Add click feedback animation
            this.classList.add('clicked');
            setTimeout(() => {
                this.classList.remove('clicked');
            }, 150);

            // Create ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);

            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);

            // Go to the clicked slide
            mainSlider.slideToLoop(dataIndex);

            // Update active state
            updateTopThumbnails(dataIndex);

            // Reset progress bar
            const progressFill = document.querySelector('.top-thumbs-progress-fill');
            if (progressFill) {
                progressFill.style.transition = 'none';
                progressFill.style.width = '0%';
                setTimeout(() => {
                    progressFill.style.transition = 'width 5s linear';
                    progressFill.style.width = '100%';
                }, 50);
            }
        });
    });

    // Pause autoplay on hover
    const mainSliderEl = document.querySelector('.main-slider');
    if (mainSliderEl) {
        mainSliderEl.addEventListener('mouseenter', () => {
            mainSlider.autoplay.stop();
            // Pause progress bar
            const progressFill = document.querySelector('.top-thumbs-progress-fill');
            const computedStyle = window.getComputedStyle(progressFill);
            const currentWidth = computedStyle.width;
            progressFill.style.transition = 'none';
            progressFill.style.width = currentWidth;
        });
        mainSliderEl.addEventListener('mouseleave', () => {
            mainSlider.autoplay.start();
            // Resume progress bar
            const progressFill = document.querySelector('.top-thumbs-progress-fill');
            const computedWidth = parseFloat(progressFill.style.width) || 0;
            const remainingTime = (100 - computedWidth) / 100 * 5000;
            progressFill.style.transition = `width ${remainingTime}ms linear`;
            progressFill.style.width = '100%';
        });
    }

    // Initialize progress bar on first load
    setTimeout(() => {
        const progressFill = document.querySelector('.top-thumbs-progress-fill');
        if (progressFill) {
            progressFill.style.transition = 'width 5s linear';
            progressFill.style.width = '100%';
        }
    }, 1000);

    console.log('Spot Slider initialized successfully');
});


// ============================================
// VERTICAL SLIDER FUNCTIONALITY
// ============================================

// Get titles from the DOM
var titleMain  = $("#animatedHeading");
var titleSubs  = titleMain.find("slick-active");

if (titleMain.length) {

  titleMain.slick({
    autoplay: false,
    arrows: false,
    dots: false,
    slidesToShow: 3,
    centerPadding: "10px",
    draggable: false,
    infinite: true,
    pauseOnHover: false,
    swipe: false,
    touchMove: false,
    vertical: true,
    verticalScrolling: true,
    speed: 2000,
    autoplaySpeed: 3000,
    useTransform: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
    adaptiveHeight: true
  });

  // On init
  $(".slick-dupe").each(function(index, el) {
    $("#animatedHeading").slick('slickAdd', "<div>" + el.innerHTML + "</div>");
  });

// Manually refresh positioning of slick
  titleMain.slick('slickPlay');
};

// ============================================
// CATEGORY SLIDER FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if Swiper is loaded
    if (typeof Swiper === 'undefined') {
        console.error('Swiper is not loaded! Check the CDN link.');
        return;
    }
    
    // Initialize Category Slider
    const categorySlider = new Swiper('.category-slider', {
        slidesPerView: 4,
        spaceBetween: 20,
        loop: true,
        speed: 600,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        navigation: {
            nextEl: '.category-slider-next',
            prevEl: '.category-slider-prev'
        },
        pagination: {
            el: '.category-slider-pagination',
            clickable: true,
            dynamicBullets: false
        },
        breakpoints: {
            1200: {
                slidesPerView: 4,
                spaceBetween: 20
            },
            900: {
                slidesPerView: 3,
                spaceBetween: 15
            },
            576: {
                slidesPerView: 2,
                spaceBetween: 10
            },
            0: {
                slidesPerView: 1,
                spaceBetween: 0
            }
        },
        on: {
            init: function() {
                // Add animation class to first slide
                const firstSlide = document.querySelector('.category-slider .swiper-slide:first-child .category-card');
                if (firstSlide) {
                    firstSlide.classList.add('animate-in');
                }
            },
            slideChange: function() {
                // Add animation to current slide
                const activeSlide = document.querySelector('.category-slider .swiper-slide-active .category-card');
                if (activeSlide) {
                    activeSlide.classList.add('animate-in');
                }
            }
        }
    });
    
    // Pause autoplay on hover
    const categorySliderSection = document.querySelector('.category-slider-section');
    if (categorySliderSection) {
        categorySliderSection.addEventListener('mouseenter', () => {
            categorySlider.autoplay.stop();
        });
        categorySliderSection.addEventListener('mouseleave', () => {
            categorySlider.autoplay.start();
        });
    }
    
    console.log('Category Slider initialized successfully');
});


// ============================================
// TRENDING NOW SLIDER FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if Swiper is loaded
    if (typeof Swiper === 'undefined') {
        console.error('Swiper is not loaded! Check the CDN link.');
        return;
    }
    
    // Initialize Trending Slider
    const trendingSlider = new Swiper('.trending-slider', {
        slidesPerView: 4,
        spaceBetween: 20,
        loop: true,
        speed: 600,
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        navigation: {
            nextEl: '.trending-next',
            prevEl: '.trending-prev'
        },
        pagination: {
            el: '.trending-pagination',
            clickable: true,
            dynamicBullets: false
        },
        breakpoints: {
            1200: {
                slidesPerView: 4,
                spaceBetween: 20
            },
            900: {
                slidesPerView: 3,
                spaceBetween: 15
            },
            576: {
                slidesPerView: 2,
                spaceBetween: 10
            },
            0: {
                slidesPerView: 1,
                spaceBetween: 0
            }
        },
        on: {
            init: function() {
                // Add animation class to first slide cards
                const firstSlideCards = document.querySelectorAll('.trending-slider .swiper-slide:first-child .trending-card');
                firstSlideCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 100);
                });
            },
            slideChange: function() {
                // Add animation to current slide cards
                const activeSlideCards = document.querySelectorAll('.trending-slider .swiper-slide-active .trending-card');
                activeSlideCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate-in');
                    }, index * 100);
                });
            }
        }
    });
    
    // Pause autoplay on hover
    const trendingSection = document.querySelector('.trending-section');
    if (trendingSection) {
        trendingSection.addEventListener('mouseenter', () => {
            trendingSlider.autoplay.stop();
        });
        trendingSection.addEventListener('mouseleave', () => {
            trendingSlider.autoplay.start();
        });
    }
    
    console.log('Trending Slider initialized successfully');
});


// ============================================
// VIDEO SLIDER FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if Swiper is loaded
    if (typeof Swiper === 'undefined') {
        console.error('Swiper is not loaded! Check the CDN link.');
        return;
    }
    
    // Initialize Video Slider
    const videoSlider = new Swiper('.video-slider', {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        loop: true,
        speed: 800,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        navigation: {
            nextEl: '.video-next',
            prevEl: '.video-prev'
        },
        pagination: {
            el: '.video-pagination',
            clickable: true,
            dynamicBullets: false
        },
        on: {
            slideChange: function() {
                // Update active state in thumbnail list
                const activeIndex = this.realIndex;
                updateVideoThumbnails(activeIndex);
            },
            slideChangeTransitionStart: function() {
                // Add fade animation to thumbnail image
                const activeSlide = document.querySelector('.video-slider .swiper-slide-active .video-thumbnail img');
                if (activeSlide) {
                    activeSlide.style.transition = 'transform 0.5s ease';
                }
            }
        }
    });
    
    // Function to update thumbnail active state
    function updateVideoThumbnails(activeIndex) {
        const thumbItems = document.querySelectorAll('.video-thumb-item');
        
        thumbItems.forEach((item) => {
            const dataIndex = parseInt(item.getAttribute('data-index'));
            if (dataIndex === activeIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Thumbnail click handler
    const thumbItems = document.querySelectorAll('.video-thumb-item');
    thumbItems.forEach((item) => {
        item.addEventListener('click', function() {
            const dataIndex = parseInt(this.getAttribute('data-index'));
            
            // Update active state
            thumbItems.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Navigate to the clicked slide
            videoSlider.slideToLoop(dataIndex);
        });
    });
    
    // Pause autoplay on video container hover
    const videoSection = document.querySelector('.video-section');
    if (videoSection) {
        videoSection.addEventListener('mouseenter', () => {
            videoSlider.autoplay.stop();
        });
        videoSection.addEventListener('mouseleave', () => {
            videoSlider.autoplay.start();
        });
    }
    
    console.log('Video Slider initialized successfully');
});

// ============================================
// AIR QUALITY INDEX FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initAQI();
    initLocationDetection();
});

// ============================================
// WAQI API TOKEN (Deprecated - Now using Open-Meteo)
// Get WAQI token at: https://aqicn.org/data-platform/token/ (no longer required)
// Now using FREE Open-Meteo API for air quality data
// ============================================
const apiToken = ''; // No longer needed - using Open-Meteo

// AQI Configuration
const AQI_CONFIG = {
    // Free Open-Meteo Air Quality API (no token required)
    openMeteoApiUrl: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    waqiApiUrl: 'https://api.waqi.info/feed/',
    updateInterval: 30 * 60 * 1000, // 30 minutes
    defaultLocation: { lat: 28.6139, lon: 77.2090 }, // Delhi
    useOpenMeteo: true // Use Open-Meteo as primary (free, no token needed)
};

let currentLocation = {
    name: 'Delhi, India',
    coords: AQI_CONFIG.defaultLocation
};

function initAQI() {
    // Load saved location from localStorage
    const savedLocation = localStorage.getItem('userAqiLocation');
    if (savedLocation) {
        try {
            currentLocation = JSON.parse(savedLocation);
            updateLocationDisplay(currentLocation.name);
        } catch (e) {
            console.log('Error parsing saved location');
        }
    }
    
    console.log('AQI Widget initialized using Open-Meteo API (FREE, no token required)');
    
    // Fetch real data using Open-Meteo API
    fetchAQIData();
    
    // Set up interval for periodic updates
    setInterval(fetchAQIData, AQI_CONFIG.updateInterval);
}

// ============================================
// LOCATION DETECTION FUNCTIONALITY
// ============================================

function initLocationDetection() {
    const detectBtn = document.getElementById('detect-location-btn');
    const searchInput = document.getElementById('city-search-input');
    const searchBtn = document.getElementById('search-city-btn');
    
    if (detectBtn) {
        detectBtn.addEventListener('click', detectUserLocation);
    }
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => searchCityByName(searchInput.value));
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchCityByName(searchInput.value);
            }
        });
    }
}

function detectUserLocation() {
    const detectBtn = document.getElementById('detect-location-btn');
    const statusEl = document.getElementById('location-status');
    const searchEl = document.getElementById('location-search');
    
    // Show loading state
    detectBtn.classList.add('loading');
    detectBtn.innerHTML = '<i class="ri-loader-4-line"></i><span>Detecting...</span>';
    hideStatus();
    
    // First, try browser geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log('Browser geolocation detected:', latitude, longitude);
                reverseGeocode(latitude, longitude, detectBtn, statusEl, searchEl);
            },
            (error) => {
                console.log('Browser geolocation failed:', error.message);
                // Fallback to IP-based location detection
                detectLocationByIP(detectBtn, statusEl, searchEl);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        // Browser doesn't support geolocation, use IP detection
        detectLocationByIP(detectBtn, statusEl, searchEl);
    }
}

async function detectLocationByIP(detectBtn, statusEl, searchEl) {
    try {
        // Use IP-API to detect location by IP
        const response = await fetch(
            'https://ipapi.co/json/',
            {
                headers: {
                    'User-Agent': 'PTSNews/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('IP detection failed');
        }
        
        const data = await response.json();
        
        console.log('IP-based location detected:', data);
        
        // Extract location from response
        let locationString = '';
        if (data.city) {
            locationString = data.city;
            if (data.region && data.region !== data.city) {
                locationString += ', ' + data.region;
            }
            if (data.country_name && data.country_name !== 'China') {
                locationString += ', ' + data.country_name;
            }
        }
        
        if (!locationString || locationString.includes('undef') || !locationString.trim()) {
            // Fallback to default location
            locationString = AQI_CONFIG.defaultLocation;
        }
        
        // Update current location
        currentLocation = {
            name: locationString,
            coords: { lat: data.latitude || AQI_CONFIG.defaultCoords.lat, lon: data.longitude || AQI_CONFIG.defaultCoords.lon }
        };
        
        // Save to localStorage
        localStorage.setItem('userAqiLocation', JSON.stringify(currentLocation));
        
        // Update UI
        updateLocationDisplay(locationString);
        resetButton(detectBtn);
        showStatus(`Location detected: ${locationString}`, 'success', 'ri-check-double-fill');
        
        // Fetch AQI for new location
        fetchAQIData();
        
        console.log('IP Location updated:', locationString);
        
    } catch (error) {
        console.error('IP detection error:', error);
        // Final fallback: use default location
        currentLocation = {
            name: AQI_CONFIG.defaultLocation,
            coords: AQI_CONFIG.defaultCoords
        };
        
        localStorage.setItem('userAqiLocation', JSON.stringify(currentLocation));
        updateLocationDisplay(AQI_CONFIG.defaultLocation);
        resetButton(detectBtn);
        showStatus('Using default location: ' + AQI_CONFIG.defaultLocation, 'info', 'ri-information-fill');
        fetchAQIData();
    }
}

async function reverseGeocode(lat, lon, detectBtn, statusEl, searchEl) {
    try {
        // Use IP-API for faster geocoding
        const response = await fetch(
            `https://ip-api.com/json/${lat},${lon}?fields=city,regionName,country`,
            {
                headers: {
                    'User-Agent': 'PTSNews/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Geocoding API failed');
        }
        
        const data = await response.json();
        
        // Extract location from response
        let locationString = '';
        if (data.city) {
            locationString = data.city;
            if (data.regionName && data.regionName !== data.city) {
                locationString += ', ' + data.regionName;
            }
            if (data.country && data.country !== 'China') {
                locationString += ', ' + data.country;
            }
        }
        
        if (!locationString || locationString.includes('undef')) {
            // Fallback to coordinates
            locationString = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
        }
        
        // Update current location
        currentLocation = {
            name: locationString,
            coords: { lat, lon }
        };
        
        // Save to localStorage
        localStorage.setItem('userAqiLocation', JSON.stringify(currentLocation));
        
        // Update UI
        updateLocationDisplay(locationString);
        resetButton(detectBtn);
        showStatus(`Location detected: ${locationString}`, 'success', 'ri-check-double-fill');
        
        // Fetch AQI for new location
        fetchAQIData();
        
        console.log('Location updated:', locationString);
        
    } catch (error) {
        console.error('Geocoding error:', error);
        // Fallback: try OpenStreetMap Nominatim as backup
        try {
            const nomResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'PTSNews/1.0'
                    }
                }
            );
            
            if (nomResponse.ok) {
                const nomData = await nomResponse.json();
                let cityName = nomData.address?.city || nomData.address?.town || nomData.address?.village || nomData.address?.county || '';
                let locationString = cityName;
                if (nomData.address?.country) {
                    locationString += ', ' + nomData.address.country;
                }
                
                if (locationString && !locationString.includes('undef')) {
                    currentLocation = {
                        name: locationString,
                        coords: { lat, lon }
                    };
                    localStorage.setItem('userAqiLocation', JSON.stringify(currentLocation));
                    updateLocationDisplay(locationString);
                    resetButton(detectBtn);
                    showStatus(`Location detected: ${locationString}`, 'success', 'ri-check-double-fill');
                    fetchAQIData();
                    return;
                }
            }
        } catch (nomError) {
            console.error('Nominatim fallback error:', nomError);
        }
        
        // Final fallback: use coordinates
        currentLocation = {
            name: `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`,
            coords: { lat, lon }
        };
        
        localStorage.setItem('userAqiLocation', JSON.stringify(currentLocation));
        updateLocationDisplay('Your Location');
        resetButton(detectBtn);
        showStatus('Location detected (coordinates used)', 'info', 'ri-information-fill');
        fetchAQIData();
    }
}

function handleLocationError(error, detectBtn, statusEl, searchEl) {
    resetButton(detectBtn);
    
    switch (error.code) {
        case error.PERMISSION_DENIED:
            showStatus('Location permission denied. Please search for your city manually.', 'warning', 'ri-forbid-fill');
            detectBtn.classList.add('denied');
            searchEl.style.display = 'flex';
            break;
        case error.POSITION_UNAVAILABLE:
            showStatus('Location information unavailable. Please try searching for your city.', 'error', 'ri-error-warning-fill');
            searchEl.style.display = 'flex';
            break;
        case error.TIMEOUT:
            showStatus('Location request timed out. Please try again or search for your city.', 'warning', 'ri-time-fill');
            searchEl.style.display = 'flex';
            break;
        default:
            showStatus('An unknown error occurred. Please search for your city.', 'error', 'ri-error-fill');
            searchEl.style.display = 'flex';
    }
}

async function searchCityByName(cityName) {
    if (!cityName || cityName.trim() === '') {
        showStatus('Please enter a city name.', 'warning', 'ri-alert-fill');
        return;
    }
    
    const searchBtn = document.getElementById('search-city-btn');
    const searchInput = document.getElementById('city-search-input');
    const statusEl = document.getElementById('location-status');
    
    // Show loading
    searchBtn.innerHTML = '<i class="ri-loader-4-line"></i>';
    searchBtn.disabled = true;
    hideStatus();
    
    try {
        // Use Nominatim to search for the city
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'PTSNews/1.0'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('City search failed');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            
            // Get display name
            let displayName = result.display_name || cityName;
            // Shorten the display name
            const parts = displayName.split(',');
            displayName = parts.slice(0, 3).join(', ');
            
            // Update current location
            currentLocation = {
                name: displayName,
                coords: { lat, lon }
            };
            
            // Save to localStorage
            localStorage.setItem('userAqiLocation', JSON.stringify(currentLocation));
            
            // Update UI
            updateLocationDisplay(displayName);
            showStatus(`City found: ${displayName}`, 'success', 'ri-check-double-fill');
            
            // Fetch AQI for new location
            fetchAQIData();
            
            console.log('City search result:', displayName, lat, lon);
            
        } else {
            showStatus(`City "${cityName}" not found. Please try a different search.`, 'error', 'ri-error-warning-fill');
        }
        
    } catch (error) {
        console.error('City search error:', error);
        showStatus('Error searching for city. Please try again.', 'error', 'ri-error-fill');
    } finally {
        // Reset search button
        searchBtn.innerHTML = '<i class="ri-search-line"></i>';
        searchBtn.disabled = false;
    }
}

function updateLocationDisplay(locationName) {
    const locationEl = document.getElementById('aqi-location');
    const titleEl = document.getElementById('aqi-title-text');
    
    if (locationEl) {
        locationEl.textContent = locationName;
    }
    
    if (titleEl) {
        titleEl.textContent = 'Air Quality Index';
    }
}

function showStatus(message, type, iconClass) {
    const statusEl = document.getElementById('location-status');
    if (!statusEl) return;
    
    statusEl.textContent = message;
    statusEl.className = 'location-status ' + type;
    statusEl.style.display = 'flex';
    
    // Add icon
    const icon = document.createElement('i');
    icon.className = iconClass;
    statusEl.insertBefore(icon, statusEl.firstChild);
}

function hideStatus() {
    const statusEl = document.getElementById('location-status');
    if (statusEl) {
        statusEl.style.display = 'none';
        statusEl.className = 'location-status';
        // Remove any icons that were added
        const icon = statusEl.querySelector('i');
        if (icon) icon.remove();
    }
}

function resetButton(detectBtn) {
    if (!detectBtn) {
        detectBtn = document.getElementById('detect-location-btn');
    }
    
    if (detectBtn) {
        detectBtn.classList.remove('loading', 'denied');
        detectBtn.innerHTML = '<i class="ri-map-pin-line"></i><span>Detect My Location</span>';
    }
}

// ============================================
// AQI DATA FETCHING - Using FREE Open-Meteo API
// No token required - completely free!
// ============================================

async function fetchAQIData() {
    try {
        console.log('Fetching AQI data using Open-Meteo API...');
        console.log('Current location:', currentLocation.name);
        console.log('Coordinates:', currentLocation.coords);

        // Show loading status
        const aqiStatusElement = document.getElementById('aqi-status');
        if (aqiStatusElement) {
            aqiStatusElement.textContent = 'Updating...';
        }

        // Get coordinates
        const lat = currentLocation.coords?.lat ?? AQI_CONFIG.defaultLocation.lat;
        const lon = currentLocation.coords?.lon ?? AQI_CONFIG.defaultLocation.lon;

        // Build Open-Meteo API URL
        const apiUrl = `${AQI_CONFIG.openMeteoApiUrl}?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,no2,ozone,sulfur_dioxide,carbon_monoxide&timezone=auto`;

        console.log('Open-Meteo API URL:', apiUrl);

        const response = await fetch(apiUrl);

        console.log('API Response status:', response.status);
        console.log('API Response OK:', response.ok);

        if (!response.ok) {
            console.error('API request failed with status:', response.status);
            throw new Error('API request failed with status: ' + response.status);
        }

        const data = await response.json();

        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data.current && data.current.us_aqi !== undefined) {
            // We have valid AQI data
            console.log('Current AQI:', data.current.us_aqi);
            console.log('PM2.5:', data.current.pm2_5);
            console.log('PM10:', data.current.pm10);
            console.log('NO2:', data.current.no2);
            console.log('Ozone:', data.current.ozone);

            // Show success message
            const statusEl = document.getElementById('location-status');
            if (statusEl) {
                statusEl.innerHTML = '<i class="ri-check-double-fill"></i>Live data loaded';
                statusEl.className = 'location-status success';
                statusEl.style.display = 'flex';
            }

            // Update display with Open-Meteo data
            updateAQIDisplay({
                aqi: data.current.us_aqi,
                pm25: data.current.pm2_5,
                pm10: data.current.pm10,
                no2: data.current.no2,
                o3: data.current.ozone,
                so2: data.current.sulfur_dioxide,
                co: data.current.carbon_monoxide
            });

            console.log('AQI data fetched successfully from Open-Meteo');
        } else {
            console.log('No AQI data in response, trying fallback...');
            showDemoData();
        }
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
        // Check if it's a CORS error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.log('CORS or network error detected - trying alternative approach...');
            // Try alternative approach without CORS mode
            try {
                await fetchAQIDataAlternative();
                return;
            } catch (altError) {
                console.error('Alternative approach also failed:', altError);
            }
        }

        // Show error message with demo data
        const statusEl = document.getElementById('location-status');
        if (statusEl) {
            statusEl.innerHTML = '<i class="ri-information-fill"></i>Showing demo data (API error)';
            statusEl.className = 'location-status info';
            statusEl.style.display = 'flex';
        }

        showDemoData();
    }
}

// Alternative API fetch using no-cors mode (for CORS issues)
async function fetchAQIDataAlternative() {
    try {
        const lat = currentLocation.coords?.lat ?? AQI_CONFIG.defaultLocation.lat;
        const lon = currentLocation.coords?.lon ?? AQI_CONFIG.defaultLocation.lon;

        // Try World Air Quality Index API (also free)
        const waqiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`;
        
        console.log('Trying WAQI demo token API:', waqiUrl);

        const response = await fetch(waqiUrl);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'ok' && data.data) {
                console.log('WAQI demo API success:', data.data);
                
                // Show success message
                const statusEl = document.getElementById('location-status');
                if (statusEl) {
                    statusEl.innerHTML = '<i class="ri-check-double-fill"></i>Live data loaded';
                    statusEl.className = 'location-status success';
                    statusEl.style.display = 'flex';
                }
                
                updateAQIDisplay(data.data);
                return;
            }
        }
        
        throw new Error('WAQI demo API failed');
    } catch (error) {
        console.error('Alternative API error:', error);
        throw error; // Will trigger demo data fallback
    }
}

// Fallback: Fetch AQI data using coordinates directly
async function fetchAQIDataByCoords() {
    try {
        // Use current location coordinates with real token
        const coords = currentLocation.coords || AQI_CONFIG.defaultCoords;
        const lat = coords.lat || AQI_CONFIG.defaultCoords.lat;
        const lon = coords.lon || AQI_CONFIG.defaultCoords.lon;
        
        const apiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiToken}`;

        console.log('Trying coordinates URL:', apiUrl);

        const response = await fetch(apiUrl);

        console.log('Coordinates API Response status:', response.status);
        console.log('Coordinates API Response OK:', response.ok);

        if (!response.ok) {
            console.error('Coordinates API request failed with status:', response.status);
            throw new Error('API request failed');
        }

        const data = await response.json();

        console.log('Coordinates API Response:', JSON.stringify(data, null, 2));

        if (data.status === 'ok' && data.data) {
            // Show success message
            const statusEl = document.getElementById('location-status');
            if (statusEl) {
                statusEl.innerHTML = '<i class="ri-check-double-fill"></i>Live data loaded';
                statusEl.className = 'location-status success';
                statusEl.style.display = 'flex';
            }

            updateAQIDisplay(data.data);
            console.log('AQI data fetched via coordinates');
        } else if (data.status === 'ok' && data.aqi) {
            // Direct AQI value
            const statusEl = document.getElementById('location-status');
            if (statusEl) {
                statusEl.innerHTML = '<i class="ri-check-double-fill"></i>Live data loaded';
                statusEl.className = 'location-status success';
                statusEl.style.display = 'flex';
            }
            updateAQIDisplay({ aqi: data.aqi });
            console.log('AQI data fetched via coordinates');
        } else {
            console.log('API returned error status, keeping demo data');
            console.log('Error details:', data);
            showDemoData();
        }
    } catch (error) {
        console.error('Error fetching AQI by coords:', error);
        showDemoData();
    }
}

// Show demo data when API fails
function showDemoData() {
    const statusEl = document.getElementById('location-status');
    if (statusEl) {
        statusEl.innerHTML = '<i class="ri-information-fill"></i>Demo mode: <a href="#" onclick="alert(\'For real data, run on a local server (not file://). Use VSCode Live Server or: python3 -m http.server\'); return false;" style="color: #001A56; font-weight: 600; text-decoration: underline;">Use local server for live data</a>';
        statusEl.className = 'location-status info';
        statusEl.style.display = 'flex';
    }
    
    // Show demo AQI values with realistic pollutant data for Delhi
    const aqiValueElement = document.getElementById('aqi-value');
    const aqiStatusElement = document.getElementById('aqi-status');
    
    if (aqiValueElement) {
        aqiValueElement.textContent = '156';
    }
    
    if (aqiStatusElement) {
        aqiStatusElement.textContent = 'Unhealthy';
        aqiStatusElement.className = 'aqi-status unhealthy';
    }
    
    // Show realistic pollutant values for demo
    updateParameterValue('pm25-value', '78');
    updateParameterValue('pm10-value', '156');
    updateParameterValue('no2-value', '45');
    updateParameterValue('o3-value', '32');
    
    // Update last updated
    const lastUpdatedElement = document.getElementById('aqi-last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        lastUpdatedElement.textContent = 'Demo data - Last updated: ' + timeString;
    }
}

function showDemoTokenMessage() {
    // This function is kept for backwards compatibility but no longer needed
    // Open-Meteo API is free and doesn't require tokens
    console.log('showDemoTokenMessage() is deprecated - using Open-Meteo API');
}

function updateAQIDisplay(data) {
    // Handle different API response formats:
    // Format 1: WAQI API - { "aqi": 156, "iaqi": { "pm25": {"v": 100}, ... } }
    // Format 2: Open-Meteo API - { "aqi": 156, "pm25": 100, "pm10": 50, ... }
    
    let aqiValue = null;
    let pm25 = null;
    let pm10 = null;
    let no2 = null;
    let o3 = null;
    
    // Check for Open-Meteo format first (direct values)
    if (data.pm25 !== undefined || data.pm2_5 !== undefined) {
        aqiValue = data.aqi;
        pm25 = data.pm2_5 ?? data.pm25;
        pm10 = data.pm10;
        no2 = data.no2;
        o3 = data.o3 ?? data.ozone;
    }
    // Check for WAQI format (aqi with nested iaqi)
    else if (data.aqi !== undefined) {
        aqiValue = data.aqi;
        
        // WAQI format has nested iaqi objects like { "pm25": { "v": 100 } }
        if (data.iaqi) {
            pm25 = data.iaqi.pm25?.v ?? data.pm25;
            pm10 = data.iaqi.pm10?.v ?? data.pm10;
            no2 = data.iaqi.no2?.v ?? data.no2;
            o3 = data.iaqi.o3?.v ?? data.ozone ?? data.o3;
        } else {
            // Direct values fallback
            pm25 = data.pm25 ?? data.pm2_5;
            pm10 = data.pm10;
            no2 = data.no2;
            o3 = data.ozone ?? data.o3;
        }
    }
    
    console.log('Processing AQI data:', { aqiValue, pm25, pm10, no2, o3 });
    
    // Update location display
    updateLocationDisplay(currentLocation.name);
    
    const aqiValueElement = document.getElementById('aqi-value');
    if (aqiValueElement) {
        // Add animation effect
        aqiValueElement.style.transform = 'scale(1.1)';
        aqiValueElement.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            aqiValueElement.style.transform = 'scale(1)';
        }, 300);
        aqiValueElement.textContent = aqiValue !== null && aqiValue !== undefined ? aqiValue : '--';
    }
    
    const aqiStatusElement = document.getElementById('aqi-status');
    if (aqiStatusElement) {
        if (aqiValue !== null && aqiValue !== undefined) {
            const statusInfo = getAQIStatus(aqiValue);
            aqiStatusElement.textContent = statusInfo.status;
            aqiStatusElement.className = 'aqi-status ' + statusInfo.class;
        } else {
            aqiStatusElement.textContent = 'No Data';
            aqiStatusElement.className = 'aqi-status';
        }
    }
    
    // Update pollutant parameters with proper formatting
    updateParameterValue('pm25-value', pm25 !== null && pm25 !== undefined ? Math.round(pm25) : '--');
    updateParameterValue('pm10-value', pm10 !== null && pm10 !== undefined ? Math.round(pm10) : '--');
    updateParameterValue('no2-value', no2 !== null && no2 !== undefined ? Math.round(no2) : '--');
    updateParameterValue('o3-value', o3 !== null && o3 !== undefined ? Math.round(o3) : '--');
    
    const lastUpdatedElement = document.getElementById('aqi-last-updated');
    if (lastUpdatedElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        lastUpdatedElement.textContent = 'Last updated: ' + timeString;
    }
    
    console.log('AQI data updated successfully for', currentLocation.name);
}

// Calculate approximate AQI from PM2.5 concentration using US EPA breakpoints
function calculateAQIFromPM25(pm25) {
    if (!pm25) return null;
    
    // US EPA AQI breakpoints for PM2.5 (24-hour average)
    const breakpoints = [
        { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
        { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
        { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
        { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
        { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
        { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 }
    ];
    
    for (const bp of breakpoints) {
        if (pm25 >= bp.low && pm25 <= bp.high) {
            // Linear interpolation formula
            return Math.round(((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) + bp.aqiLow);
        }
    }
    
    // If above highest breakpoint
    if (pm25 > 500.4) return 500;
    if (pm25 < 0) return 0;
    
    return null;
}

function updateParameterValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value !== undefined ? value : '--';
    }
}

function getAQIStatus(aqi) {
    if (aqi <= 50) {
        return { status: 'Good', class: 'good' };
    } else if (aqi <= 100) {
        return { status: 'Moderate', class: 'moderate' };
    } else if (aqi <= 150) {
        return { status: 'Unhealthy for Sensitive', class: 'unhealthy-sensitive' };
    } else if (aqi <= 200) {
        return { status: 'Unhealthy', class: 'unhealthy' };
    } else if (aqi <= 300) {
        return { status: 'Very Unhealthy', class: 'very-unhealthy' };
    } else {
        return { status: 'Hazardous', class: 'hazardous' };
    }
}

function showAQIFallback() {
    // This function is no longer needed - demo data is shown by default
    console.log('showAQIFallback() called - demo data is already being shown');
}

// Make functions globally accessible
window.detectUserLocation = detectUserLocation;
window.searchCityByName = searchCityByName;
window.updateLocationDisplay = updateLocationDisplay;

// ============================================
// HOROSCOPE SECTION FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initHoroscope();
});

// Horoscope API Configuration
const HOROSCOPE_CONFIG = {
    // Free horoscope API endpoint
    apiUrl: 'https://horoscope-app-api.vercel.app/api/v1/get-horoscope/daily',
    signMap: {
        'aries': 'aries',
        'taurus': 'taurus',
        'gemini': 'gemini',
        'cancer': 'cancer',
        'leo': 'leo',
        'virgo': 'virgo',
        'libra': 'libra',
        'scorpio': 'scorpio',
        'sagittarius': 'sagittarius',
        'capricorn': 'capricorn',
        'aquarius': 'aquarius',
        'pisces': 'pisces'
    },
    signNames: {
        'aries': 'Aries',
        'taurus': 'Taurus', 
        'gemini': 'Gemini',
        'cancer': 'Cancer',
        'leo': 'Leo',
        'virgo': 'Virgo',
        'libra': 'Libra',
        'scorpio': 'Scorpio',
        'sagittarius': 'Sagittarius',
        'capricorn': 'Capricorn',
        'aquarius': 'Aquarius',
        'pisces': 'Pisces'
    },
    signDateRanges: {
        'aries': 'Mar 21 - Apr 19',
        'taurus': 'Apr 20 - May 20',
        'gemini': 'May 21 - Jun 20',
        'cancer': 'Jun 21 - Jul 22',
        'leo': 'Jul 23 - Aug 22',
        'virgo': 'Aug 23 - Sep 22',
        'libra': 'Sep 23 - Oct 22',
        'scorpio': 'Oct 23 - Nov 21',
        'sagittarius': 'Nov 22 - Dec 21',
        'capricorn': 'Dec 22 - Jan 19',
        'aquarius': 'Jan 20 - Feb 18',
        'pisces': 'Feb 19 - Mar 20'
    },
    signIcons: {
        'aries': 'ri-venus-line',
        'taurus': 'ri-money-dollar-circle-line',
        'gemini': 'ri-chat-3-line',
        'cancer': 'ri-home-heart-line',
        'leo': 'ri-sun-line',
        'virgo': 'ri-leaf-line',
        'libra': 'ri-scales-3-line',
        'scorpio': 'ri-magic-line',
        'sagittarius': 'ri-arrow-right-circle-line',
        'capricorn': 'ri-building-line',
        'aquarius': 'ri-lightbulb-flash-line',
        'pisces': 'ri-water-flash-line'
    }
};

// Store horoscope data
let horoscopeData = {};
let currentHoroscopeIndex = 0;
const horoscopeCardsPerView = 2;

function initHoroscope() {
    // Update date display
    updateHoroscopeDate();
    
    // Initialize navigation
    initHoroscopeNavigation();
    
    // Fetch horoscope data for all signs
    fetchAllHoroscopes();
}

// Get today's date in the required format (YYYY-MM-DD)
function getTodayDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get current week date range
function getCurrentWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Calculate Monday of current week
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    // Calculate Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const options = { month: 'short', day: 'numeric' };
    const startDate = monday.toLocaleDateString('en-US', options);
    const endDate = sunday.toLocaleDateString('en-US', options);
    
    return `${startDate} - ${endDate}`;
}

// Update horoscope date display
function updateHoroscopeDate() {
    const dateDisplay = document.getElementById('horoscope-date-display');
    if (dateDisplay) {
        const weekRange = getCurrentWeekRange();
        dateDisplay.textContent = `(${weekRange})`;
        dateDisplay.style.fontSize = '12px';
        dateDisplay.style.fontWeight = 'normal';
        dateDisplay.style.color = 'var(--text-muted)';
        dateDisplay.style.marginLeft = '10px';
    }
}

// Determine zodiac sign from birth date (stored in localStorage)
function getUserZodiacSign() {
    // First check if user has saved their birthday
    let birthDate = localStorage.getItem('userBirthDate');
    
    if (!birthDate) {
        // If no birth date saved, prompt user or use default (Aries as first sign)
        return null;
    }
    
    const date = new Date(birthDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return getZodiacSignFromDate(month, day);
}

// Get zodiac sign from month and day
function getZodiacSignFromDate(month, day) {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';
    
    return 'aries'; // Default
}

// Fetch horoscope for a specific sign
async function fetchHoroscope(sign) {
    try {
        const date = getTodayDate();
        const response = await fetch(`${HOROSCOPE_CONFIG.apiUrl}/${sign}?date=${date}`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            return {
                sign: sign,
                name: HOROSCOPE_CONFIG.signNames[sign],
                dateRange: HOROSCOPE_CONFIG.signDateRanges[sign],
                icon: HOROSCOPE_CONFIG.signIcons[sign],
                content: data.data.horoscope.data,
                luckyNumber: Math.floor(Math.random() * 9) + 1, // Generate random lucky number
                luckyColor: getLuckyColor(sign),
                compatibility: getCompatibility(sign)
            };
        } else {
            throw new Error('API returned error');
        }
    } catch (error) {
        console.error(`Error fetching horoscope for ${sign}:`, error);
        // Return fallback data
        return getFallbackHoroscope(sign);
    }
}

// Get lucky color for each sign
function getLuckyColor(sign) {
    const colors = {
        'aries': 'Red',
        'taurus': 'Green',
        'gemini': 'Yellow',
        'cancer': 'Silver',
        'leo': 'Gold',
        'virgo': 'Navy',
        'libra': 'Pink',
        'scorpio': 'Maroon',
        'sagittarius': 'Purple',
        'capricorn': 'Brown',
        'aquarius': 'Electric Blue',
        'pisces': 'Sea Green'
    };
    return colors[sign] || 'Red';
}

// Get compatibility signs
function getCompatibility(sign) {
    const compat = {
        'aries': ['Sg', 'Le'],
        'taurus': ['Vi', 'Cp'],
        'gemini': ['Li', 'Aq'],
        'cancer': ['Sc', 'Pi'],
        'leo': ['Ar', 'Sg'],
        'virgo': ['Ta', 'Cp'],
        'libra': ['Ge', 'Aq'],
        'scorpio': ['Cr', 'Pi'],
        'sagittarius': ['Ar', 'Le'],
        'capricorn': ['Ta', 'Vi'],
        'aquarius': ['Li', 'Ge'],
        'pisces': ['Cr', 'Sp']
    };
    return compat[sign] || ['Ar', 'Le'];
}

// Fallback horoscope data when API fails
function getFallbackHoroscope(sign) {
    const weeklyPredictions = {
        'aries': "This week brings significant opportunities for personal and professional growth. Your natural leadership abilities will help you overcome challenges at work. Financial gains are likely through new partnerships or investments.",
        'taurus': "This week focuses on stability and security. Build lasting foundations in your career and personal life. Health improvements come from consistent habits and routines. Unexpected romantic opportunities may arise.",
        'gemini': "Throughout this week, communication will be your strongest asset. Your witty charm opens doors and creates meaningful connections. Creative projects gain momentum with collaborative effort.",
        'cancer': "This week, home and family take center stage. You may feel nostalgic and drawn to spend quality time with loved ones. Family gatherings bring joy and reconciliation. Financial decisions related to property are favorable.",
        'leo': "This week, your confidence soars as the sun illuminates your natural charisma. Leadership opportunities arise - embrace them wholeheartedly. Romance sparkles with passion and excitement throughout the week.",
        'virgo': "Throughout this week, your attention to detail pays off as your analytical mind solves complex problems. Health improvements come from consistent habits. A practical approach to finances brings stability.",
        'libra': "This week, balance and harmony are your focus. Diplomatic skills help resolve conflicts smoothly both at work and home. Artistic pursuits bring inner peace and recognition. A social event introduces someone special.",
        'scorpio': "Throughout this week, mysterious depths are revealed. Your intuition guides you through tricky situations with ease. Transformative energy empowers you to let go of what no longer serves you.",
        'sagittarius': "Adventure calls you this week! Travel, learning, or trying something new fills you with excitement. Optimism guides your decisions, especially regarding long-term goals. Physical activity brings mental clarity.",
        'capricorn': "This week, ambition drives your success. Hard work and discipline lead to recognition and advancement in your career. Practical solutions to long-standing problems emerge unexpectedly.",
        'aquarius': "Innovation sparks this week as your unique ideas gain attention at work. Humanitarian efforts bring fulfillment and new connections. Social circles expand through technology or group activities.",
        'pisces': "Throughout this week, your intuitive gifts are heightened. Creative expression flows effortlessly. Spiritual practices bring peace and insight. A compassionate approach to others returns to you threefold."
    };
    
    return {
        sign: sign,
        name: HOROSCOPE_CONFIG.signNames[sign],
        dateRange: HOROSCOPE_CONFIG.signDateRanges[sign],
        icon: HOROSCOPE_CONFIG.signIcons[sign],
        content: weeklyPredictions[sign] || "This week brings new opportunities and positive energy. Focus on personal growth and building strong relationships with those around you.",
        luckyNumber: Math.floor(Math.random() * 9) + 1,
        luckyColor: getLuckyColor(sign),
        compatibility: getCompatibility(sign)
    };
}

// Fetch all horoscopes
async function fetchAllHoroscopes() {
    const signs = Object.keys(HOROSCOPE_CONFIG.signMap);
    
    // Fetch all signs in parallel
    const promises = signs.map(sign => fetchHoroscope(sign));
    const results = await Promise.all(promises);
    
    // Store results
    results.forEach(data => {
        horoscopeData[data.sign] = data;
    });
    
    // Update the display with fetched data
    updateHoroscopeDisplay();
    updateNavigationButtons();
    
    console.log('Horoscope data fetched successfully');
}

// Initialize navigation buttons
function initHoroscopeNavigation() {
    const prevBtn = document.querySelector('.horoscope-prev');
    const nextBtn = document.querySelector('.horoscope-next');
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => navigateHoroscope(-1));
        nextBtn.addEventListener('click', () => navigateHoroscope(1));
    }
}

// Navigate through horoscope signs
function navigateHoroscope(direction) {
    const totalCards = Object.keys(horoscopeData).length;
    currentHoroscopeIndex += direction * horoscopeCardsPerView;
    
    // Wrap around
    if (currentHoroscopeIndex >= totalCards) {
        currentHoroscopeIndex = 0;
    } else if (currentHoroscopeIndex < 0) {
        currentHoroscopeIndex = Math.floor((totalCards - 1) / horoscopeCardsPerView) * horoscopeCardsPerView;
    }
    
    updateHoroscopeDisplay();
    updateNavigationButtons();
}

// Update navigation button states
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.horoscope-prev');
    const nextBtn = document.querySelector('.horoscope-next');
    const totalCards = Object.keys(horoscopeData).length;
    
    if (prevBtn && nextBtn) {
        prevBtn.style.opacity = currentHoroscopeIndex > 0 ? '1' : '0.5';
        nextBtn.style.opacity = currentHoroscopeIndex < totalCards - horoscopeCardsPerView ? '1' : '0.5';
    }
}

// Update the horoscope display with current data
function updateHoroscopeDisplay() {
    const cards = document.querySelectorAll('.horoscope-card');
    const signKeys = Object.keys(horoscopeData);
    
    cards.forEach((card, index) => {
        const dataIndex = currentHoroscopeIndex + index;
        if (dataIndex < signKeys.length) {
            const signKey = signKeys[dataIndex];
            const data = horoscopeData[signKey];
            
            if (data) {
                updateHoroscopeCard(card, data);
                
                // Add animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            }
        }
    });
}

// Update individual horoscope card
function updateHoroscopeCard(card, data) {
    const header = card.querySelector('.horoscope-card-header');
    const content = card.querySelector('.horoscope-content');
    const luckyNumber = card.querySelector('.lucky-number-value');
    const luckyColor = card.querySelector('.horoscope-lucky-color');
    const compatibility = card.querySelector('.compatibility-signs');
    const signName = card.querySelector('.horoscope-sign-name');
    const dateRange = card.querySelector('.horoscope-date-range');
    const signIcon = card.querySelector('.horoscope-sign-icon i');
    
    if (signName) signName.textContent = data.name;
    if (dateRange) dateRange.textContent = data.dateRange;
    if (signIcon) signIcon.className = data.icon;
    if (luckyColor) luckyColor.textContent = 'Lucky: ' + data.luckyColor;
    if (content) content.textContent = data.content;
    if (luckyNumber) luckyNumber.textContent = data.luckyNumber;
    
    if (compatibility) {
        compatibility.innerHTML = data.compatibility.map(sign => 
            `<span class="compatibility-sign">${sign}</span>`
        ).join('');
    }
}

console.log('Horoscope functionality initialized successfully');
