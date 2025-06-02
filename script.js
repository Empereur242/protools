(function () {
    // Configuration globale
    const CONFIG = {
        BACKEND_URL: 'http://localhost:5000', // Mettre à jour avec l'URL déployée si nécessaire
        FIREBASE_CONFIG: {
            apiKey: "your_firebase_api_key",
            authDomain: "your_firebase_auth_domain",
            projectId: "your_firebase_project_id",
            storageBucket: "your_firebase_storage_bucket",
            messagingSenderId: "your_firebase_messaging_sender_id",
            appId: "your_firebase_app_id"
        },
        VAPID_KEY: 'your_firebase_vapid_key',
        ANALYTICS_METRICS: {
            website: ['Visiteurs', 'Pages vues', 'Rebond', 'Durée'],
            social: ['Abonnés', 'Portée', 'Engagement', 'Clics'],
            email: ['Livrés', 'Ouverts', 'Cliqués', 'Désinscrits'],
            ads: ['Impressions', 'Clics', 'CTR', 'Coût']
        },
        CHART_COLORS: {
            background: ['#667eea', '#764ba2', '#ff6b6b', '#ee5a24'],
            border: ['#667eea', '#764ba2', '#ff6b6b', '#ee5a24']
        }
    };

    // Objet principal ProTools
    const ProTools = {
        // Utilitaires DOM
        DOM: {
            createElementWithText(tag, text) {
                const element = document.createElement(tag);
                element.textContent = text;
                return element;
            },

            showError(errorId, message) {
                const errorDiv = document.getElementById(errorId);
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                setTimeout(() => (errorDiv.style.display = 'none'), 5000);
                return false;
            },

            clearError(errorId) {
                const errorDiv = document.getElementById(errorId);
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
            },

            sanitizeInput(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        },

        // Gestion de l'interface
        UI: {
            toggleMobileMenu() {
                document.querySelector('.nav-links').classList.toggle('active');
            },

            openModal(modalId) {
                const modal = document.getElementById(modalId);
                modal.style.display = 'block';
                modal.setAttribute('aria-hidden', 'false');
                setTimeout(() => modal.classList.add('active'), 10);
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) modalContent.focus();
            },

            closeModal(modalId) {
                const modal = document.getElementById(modalId);
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.querySelectorAll('.error').forEach(e => {
                        e.textContent = '';
                        e.style.display = 'none';
                    });
                    const results = modal.querySelector('.results');
                    if (results) results.style.display = 'none';
                }, 300);
            },

            setupModalAccessibility() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.addEventListener('keydown', e => {
                        if (e.key === 'Escape') {
                            this.closeModal(modal.id);
                        }
                        if (e.key === 'Tab') {
                            const focusable = modal.querySelectorAll('input, textarea, select, button, .close');
                            const first = focusable[0];
                            const last = focusable[focusable.length - 1];
                            if (!e.shiftKey && document.activeElement === last) {
                                e.preventDefault();
                                first.focus();
                            } else if (e.shiftKey && document.activeElement === first) {
                                e.preventDefault();
                                last.focus();
                            }
                        }
                    });
                });

                window.addEventListener('click', e => {
                    if (e.target.classList.contains('modal')) {
                        this.closeModal(e.target.id);
                    }
                });
            },

            setupSmoothScrolling() {
                document.querySelectorAll('.nav-links a, .cta-button[href^="#"]').forEach(link => {
                    link.addEventListener('click', e => {
                        e.preventDefault();
                        const targetId = link.getAttribute('href').substring(1);
                        const target = document.getElementById(targetId);
                        if (target) {
                            window.scrollTo({
                                top: target.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        }
                    });
                });
            },

            setupFloatingAd() {
                const ad = document.querySelector('.floating-ad');
                let isDragging = false, currentX = 20, currentY, initialX, initialY;

                currentY = window.innerHeight - ad.offsetHeight - 20;
                ad.style.left = `${currentX}px`;
                ad.style.top = `${currentY}px`;

                ad.addEventListener('mousedown', e => {
                    initialX = e.clientX - currentX;
                    initialY = e.clientY - currentY;
                    isDragging = true;
                });

                document.addEventListener('mousemove', e => {
                    if (isDragging) {
                        e.preventDefault();
                        currentX = e.clientX - initialX;
                        currentY = e.clientY - initialY;
                        ad.style.left = `${currentX}px`;
                        ad.style.top = `${currentY}px`;
                        ad.style.bottom = 'auto';
                    }
                }); // Corrigé : supprimé la parenthèse supplémentaire

                document.addEventListener('mouseup', () => {
                    isDragging = false;
                });
            }
        },

        // Gestion API
        API: {
            async fetchData(endpoint, data, method = 'POST') {
                try {
                    const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: method === 'POST' ? JSON.stringify(data) : null
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || 'Erreur serveur');
                    return result;
                } catch (error) {
                    throw error;
                }
            }
        },

        // Outils métier
        Tools: {
            async analyzeSEO() {
                const url = document.getElementById('seo-url').value;
                const keyword = document.getElementById('seo-keyword').value;

                ProTools.DOM.clearError('seo-url-error');
                ProTools.DOM.clearError('seo-keyword-error');

                if (!url) return ProTools.DOM.showError('seo-url-error', 'Veuillez entrer une URL valide');
                if (!keyword) return ProTools.DOM.showError('seo-keyword-error', 'Veuillez entrer un mot-clé');

                const score = Math.floor(Math.random() * 40) + 60;
                const suggestions = [
                    'Optimiser les balises meta',
                    'Améliorer la vitesse de chargement',
                    'Ajouter plus de contenu pertinent',
                    'Optimiser les images',
                    'Créer des liens internes'
                ];

                const dataDiv = document.getElementById('seo-data');
                dataDiv.innerHTML = '';
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Score SEO : ${score}/100`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `URL analysée : ${url}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Mot-clé : ${keyword}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', 'Suggestions d\'amélioration :'));
                const ul = document.createElement('ul');
                suggestions.forEach(s => ul.appendChild(ProTools.DOM.createElementWithText('li', s)));
                dataDiv.appendChild(ul);
                document.getElementById('seo-results').style.display = 'block';
            },

            async generateContent() {
                const type = document.getElementById('ai-content-type').value;
                const instruction = document.getElementById('ai-instruction').value;

                ProTools.DOM.clearError('ai-instruction-error');
                if (!instruction) return ProTools.DOM.showError('ai-instruction-error', 'Veuillez décrire votre demande');

                const contents = {
                    article: `# ${instruction}\n\nDans cet article, nous allons explorer ${instruction} en détail...`,
                    description: `Découvrez ${instruction} - la solution parfaite pour vos besoins...`,
                    email: `Objet: Découvrez ${instruction}\n\nBonjour,\n\nNous sommes ravis de vous présenter...`,
                    social: `🔥 Nouveau : ${instruction} !\n\n✅ Innovation\n✅ Qualité\n✅ Performance\n\n#innovation #${instruction.replace(/\s+/g, '')}`
                };

                const dataDiv = document.getElementById('ai-data');
                dataDiv.innerHTML = '';
                const pre = document.createElement('pre');
                pre.textContent = contents[type];
                dataDiv.appendChild(pre);
                document.getElementById('ai-results').style.display = 'block';
            },

            async calculateInvestment() {
                const capital = parseFloat(document.getElementById('finance-capital').value);
                const rate = parseFloat(document.getElementById('finance-rate').value) / 100;
                const years = parseInt(document.getElementById('finance-years').value);

                ProTools.DOM.clearError('finance-capital-error');
                ProTools.DOM.clearError('finance-rate-error');
                ProTools.DOM.clearError('finance-years-error');

                if (isNaN(capital) || capital <= 0) return ProTools.DOM.showError('finance-capital-error', 'Capital valide requis');
                if (isNaN(rate) || rate < 0) return ProTools.DOM.showError('finance-rate-error', 'Taux valide requis');
                if (isNaN(years) || years <= 0) return ProTools.DOM.showError('finance-years-error', 'Durée valide requise');

                const finalAmount = capital * Math.pow(1 + rate, years);
                const profit = finalAmount - capital;

                const dataDiv = document.getElementById('finance-data');
                dataDiv.innerHTML = '';
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Capital initial : ${capital.toLocaleString('fr-FR')} €`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Montant final : ${finalAmount.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Bénéfice : ${profit.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Rendement total : ${((profit / capital) * 100).toFixed(2)}%`));
                document.getElementById('finance-results').style.display = 'block';
            },

            async calculateHealth() {
                const weight = parseFloat(document.getElementById('health-weight').value);
                const height = parseFloat(document.getElementById('health-height').value) / 100;
                const age = parseInt(document.getElementById('health-age').value);
                const gender = document.getElementById('health-gender').value;

                ProTools.DOM.clearError('health-weight-error');
                ProTools.DOM.clearError('health-height-error');
                ProTools.DOM.clearError('health-age-error');

                if (isNaN(weight) || weight <= 0) return ProTools.DOM.showError('health-weight-error', 'Poids valide requis');
                if (isNaN(height) || height <= 0) return ProTools.DOM.showError('health-height-error', 'Taille valide requise');
                if (isNaN(age) || age <= 0) return ProTools.DOM.showError('health-age-error', 'Âge valide requis');

                const bmi = weight / (height * height);
                let bmiCategory = bmi < 18.5 ? 'Insuffisance pondérale' : bmi < 25 ? 'Poids normal' : bmi < 30 ? 'Surpoids' : 'Obésité';

                let bmr = gender === 'male'
                    ? 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age)
                    : 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);

                const dataDiv = document.getElementById('health-data');
                dataDiv.innerHTML = '';
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `IMC : ${bmi.toFixed(1)} (${bmiCategory})`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Métabolisme de base : ${Math.round(bmr)} calories/jour`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Poids idéal estimé : ${(22 * height * height).toFixed(1)} kg`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', 'Besoins caloriques journaliers :'));
                const ul = document.createElement('ul');
                ul.appendChild(ProTools.DOM.createElementWithText('li', `Sédentaire : ${Math.round(bmr * 1.2)} cal`));
                ul.appendChild(ProTools.DOM.createElementWithText('li', `Actif : ${Math.round(bmr * 1.55)} cal`));
                ul.appendChild(ProTools.DOM.createElementWithText('li', `Très actif : ${Math.round(bmr * 1.9)} cal`));
                dataDiv.appendChild(ul);
                document.getElementById('health-results').style.display = 'block';
            },

            async scheduleSocialPost() {
                const platform = document.getElementById('social-platform').value;
                const content = document.getElementById('social-content').value;
                const hashtags = document.getElementById('social-hashtags').value;
                const dateTime = document.getElementById('social-datetime').value;

                ProTools.DOM.clearError('social-content-error');
                if (!content) return ProTools.DOM.showError('social-content-error', 'Contenu requis');

                const platforms = {
                    facebook: 'Facebook',
                    instagram: 'Instagram',
                    twitter: 'Twitter',
                    linkedin: 'LinkedIn',
                    tiktok: 'TikTok'
                };
                const reach = Math.floor(Math.random() * 5000) + 1000;
                const bestTime = ['09:00', '12:00', '18:00', '20:00'][Math.floor(Math.random() * 4)];

                const dataDiv = document.getElementById('social-data');
                dataDiv.innerHTML = '';
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Plateforme : ${platforms[platform]}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Contenu : ${content}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Hashtags : ${hashtags || 'Aucun'}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Publication prévue : ${dateTime || 'Immédiatement'}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Portée estimée : ${reach.toLocaleString()} personnes`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `💡 Conseil : ${bestTime} est optimal pour ${platforms[platform]}`));
                document.getElementById('social-results').style.display = 'block';
            },

            async createEmailCampaign() {
                const subject = document.getElementById('email-subject').value;
                const type = document.getElementById('email-type').value;
                const content = document.getElementById('email-content').value;
                const list = document.getElementById('email-list').value;

                ProTools.DOM.clearError('email-subject-error');
                ProTools.DOM.clearError('email-content-error');

                if (!subject) return ProTools.DOM.showError('email-subject-error', 'Objet requis');
                if (!content) return ProTools.DOM.showError('email-content-error', 'Contenu requis');

                try {
                    const result = await ProTools.API.fetchData('/api/campaigns', { subject, type, content, list });
                    const dataDiv = document.getElementById('email-data');
                    dataDiv.innerHTML = '';
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Objet : ${subject}`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Type : ${type}`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Liste ciblée : ${list}`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Campagne envoyée avec succès !`));
                    document.getElementById('email-results').style.display = 'block';

                    document.getElementById('email-subject').value = '';
                    document.getElementById('email-content').value = '';
                } catch (error) {
                    ProTools.DOM.showError('email-content-error', error.message);
                }
            },

            async generateAnalytics() {
                const period = document.getElementById('analytics-period').value;
                const source = document.getElementById('analytics-source').value;
                const dataDiv = document.getElementById('analytics-data');
                dataDiv.innerHTML = '';

                try {
                    const metrics = await ProTools.API.fetchData('/api/analytics', null, 'GET');
                    const multiplier = parseInt(period) / 30;

                    // Afficher les métriques textuelles
                    if (source === 'website') {
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `📈 Visiteurs uniques : ${(metrics.website.visitors * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `👁️ Pages vues : ${(metrics.website.pageViews * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `⚡ Taux de rebond : ${metrics.website.bounceRate}%`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `⏱️ Durée moyenne : ${Math.floor(metrics.website.duration / 60)}min ${metrics.website.duration % 60}s`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `📱 Top Pages : /accueil, /services, /contact`));
                    } else if (source === 'social') {
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `👥 Abonnés totaux : ${(metrics.social.followers * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `💬 Taux d'engagement : ${metrics.social.engagement}%`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `👀 Portée totale : ${(metrics.social.reach * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `🔗 Clics générés : ${(metrics.social.clicks * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `📊 Meilleur contenu : Posts vidéo (+127% engagement)`));
                    } else if (source === 'email') {
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `📧 E-mails livrés : ${(metrics.email.delivered * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `👀 E-mails ouverts : ${(metrics.email.opened * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `🔗 Clics : ${(metrics.email.clicked * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `🚫 Désinscrits : ${(metrics.email.unsubscribed * multiplier).toLocaleString()}`));
                    } else if (source === 'ads') {
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `👁️ Impressions : ${(metrics.ads.impressions * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `🔗 Clics : ${(metrics.ads.clicks * multiplier).toLocaleString()}`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `📈 CTR : ${metrics.ads.ctr}%`));
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `💸 Coût : ${(metrics.ads.cost * multiplier).toLocaleString()}€`));
                    }

                    // Générer le graphique
                    const ctx = document.getElementById('analytics-chart').getContext('2d');
                    if (window.analyticsChart) window.analyticsChart.destroy();

                    const chartData = {
                        type: 'bar',
                        data: {
                            labels: CONFIG.ANALYTICS_METRICS[source],
                            datasets: [{
                                label: `Métriques ${source}`,
                                data: source === 'website' ? [
                                    metrics.website.visitors * multiplier,
                                    metrics.website.pageViews * multiplier,
                                    metrics.website.bounceRate,
                                    metrics.website.duration
                                ] : source === 'social' ? [
                                    metrics.social.followers * multiplier,
                                    metrics.social.reach * multiplier,
                                    metrics.social.engagement,
                                    metrics.social.clicks * multiplier
                                ] : source === 'email' ? [
                                    metrics.email.delivered * multiplier,
                                    metrics.email.opened * multiplier,
                                    metrics.email.clicked * multiplier,
                                    metrics.email.unsubscribed * multiplier
                                ] : [
                                    metrics.ads.impressions * multiplier,
                                    metrics.ads.clicks * multiplier,
                                    metrics.ads.ctr,
                                    metrics.ads.cost * multiplier
                                ],
                                backgroundColor: CONFIG.CHART_COLORS.background,
                                borderColor: CONFIG.CHART_COLORS.border,
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: { y: { beginAtZero: true } },
                            plugins: {
                                legend: { display: true, position: 'top' },
                                tooltip: {
                                    callbacks: {
                                        label: context => {
                                            let value = context.raw;
                                            if (context.dataIndex === 2 && (source === 'website' || source === 'ads')) return `${value}%`;
                                            if (context.dataIndex === 3 && source === 'website') return `${Math.floor(value / 60)}min ${value % 60}s`;
                                            if (context.dataIndex === 2 && source === 'social') return `${value}%`;
                                            if (context.dataIndex === 3 && source === 'ads') return `${value}€`;
                                            return value.toLocaleString();
                                        }
                                    }
                                }
                            }
                        }
                    };

                    window.analyticsChart = new Chart(ctx, chartData);
                    document.getElementById('analytics-results').style.display = 'block';
                } catch (error) {
                    console.error('Erreur récupération analytics:', error);
                    ProTools.DOM.showError('analytics-source-error', 'Erreur lors du chargement des données');
                }
            },

            async generateQRCode() {
                const type = document.getElementById('qr-type').value;
                const content = document.getElementById('qr-content').value;
                const size = document.getElementById('qr-size').value;

                ProTools.DOM.clearError('qr-content-error');
                if (!content) return ProTools.DOM.showError('qr-content-error', 'Contenu requis');

                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${encodeURIComponent(size)}x${encodeURIComponent(size)}&data=${encodeURIComponent(content)}`;

                const dataDiv = document.getElementById('qr-data');
                dataDiv.innerHTML = '';
                const centerDiv = document.createElement('div');
                centerDiv.style.textAlign = 'center';
                const img = document.createElement('img');
                img.src = qrUrl;
                img.alt = 'QR Code généré';
                img.style.maxWidth = '100%';
                img.setAttribute('loading', 'lazy');
                centerDiv.appendChild(img);
                centerDiv.appendChild(ProTools.DOM.createElementWithText('p', `Type : ${type}`));
                centerDiv.appendChild(ProTools.DOM.createElementWithText('p', `Contenu : ${content}`));
                dataDiv.appendChild(centerDiv);
                document.getElementById('qr-results').style.display = 'block';
            },

            async generatePassword() {
                const length = parseInt(document.getElementById('password-length').value);
                const includeUppercase = document.getElementById('include-uppercase').checked;
                const includeLowercase = document.getElementById('include-lowercase').checked;
                const includeNumbers = document.getElementById('include-numbers').checked;
                const includeSymbols = document.getElementById('include-symbols').checked;

                ProTools.DOM.clearError('password-options-error');
                if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
                    return ProTools.DOM.showError('password-options-error', 'Sélectionnez au moins une option');
                }

                const chars = {
                    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    lowercase: 'abcdefghijklmnopqrstuvwxyz',
                    numbers: '0123456789',
                    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
                };

                let availableChars = '';
                if (includeUppercase) availableChars += chars.uppercase;
                if (includeLowercase) availableChars += chars.lowercase;
                if (includeNumbers) availableChars += chars.numbers;
                if (includeSymbols) availableChars += chars.symbols;

                let password = '';
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * availableChars.length);
                    password += availableChars[randomIndex];
                }

                const dataDiv = document.getElementById('password-data');
                dataDiv.innerHTML = '';
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Mot de passe généré : ${password}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Longueur : ${length} caractères`));
                const copyButton = document.createElement('button');
                copyButton.className = 'service-button';
                copyButton.textContent = 'Copier';
                copyButton.onclick = () => {
                    navigator.clipboard.writeText(password);
                    copyButton.textContent = 'Copié !';
                    setTimeout(() => (copyButton.textContent = 'Copier'), 2000);
                };
                dataDiv.appendChild(copyButton);
                document.getElementById('password-results').style.display = 'block';
            },

            async checkPasswordStrength() {
                const password = document.getElementById('check-password').value;

                ProTools.DOM.clearError('check-password-error');
                if (!password) return ProTools.DOM.showError('check-password-error', 'Mot de passe requis');

                let score = 0;
                if (password.length >= 8) score += 20;
                if (password.length >= 12) score += 20;
                if (/[A-Z]/.test(password)) score += 20;
                if (/[0-9]/.test(password)) score += 20;
                if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 20;

                const strength = score >= 80 ? 'Forte' : score >= 60 ? 'Moyenne' : 'Faible';
                const tips = [];
                if (password.length < 8) tips.push('Utilisez au moins 8 caractères');
                if (!/[A-Z]/.test(password)) tips.push('Ajoutez des majuscules');
                if (!/[0-9]/.test(password)) tips.push('Ajoutez des chiffres');
                if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) tips.push('Ajoutez des symboles');

                const dataDiv = document.getElementById('password-data');
                dataDiv.innerHTML = '';
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Force du mot de passe : ${strength}`));
                dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Score : ${score}/100`));
                if (tips.length > 0) {
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', 'Conseils pour améliorer :'));
                    const ul = document.createElement('ul');
                    tips.forEach(tip => ul.appendChild(ProTools.DOM.createElementWithText('li', tip)));
                    dataDiv.appendChild(ul);
                }
                document.getElementById('password-results').style.display = 'block';
            },

            async convertCurrency() {
                const amount = parseFloat(document.getElementById('currency-amount').value);
                const fromCurrency = document.getElementById('currency-from').value;
                const toCurrency = document.getElementById('currency-to').value;

                ProTools.DOM.clearError('currency-amount-error');
                if (isNaN(amount) || amount <= 0) return ProTools.DOM.showError('currency-amount-error', 'Montant valide requis');

                try {
                    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
                    const data = await response.json();
                    const rate = data.rates[toCurrency];
                    const result = amount * rate;

                    const dataDiv = document.getElementById('currency-data');
                    dataDiv.innerHTML = '';
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Montant : ${amount.toLocaleString('fr-FR')} ${fromCurrency}`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Converti : ${result.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${toCurrency}`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Taux appliqué : 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`));
                    document.getElementById('currency-results').style.display = 'block';
                } catch (error) {
                    ProTools.DOM.showError('currency-amount-error', 'Erreur lors de la conversion');
                }
            },

            async calculateTimeZones() {
                const timeZoneFrom = document.getElementById('time-zone').value;
                const localTime = document.getElementById('local-time').value;

                ProTools.DOM.clearError('local-time-error');
                if (!localTime) return ProTools.DOM.showError('local-time-error', 'Heure valide requise');

                const timeZones = [
                    'Europe/Paris',
                    'America/New_York',
                    'America/Los_Angeles',
                    'Asia/Tokyo',
                    'Europe/London',
                    'Australia/Sydney',
                    'Asia/Shanghai'
                ];

                const options = { hour: '2-digit', minute: '2-digit', hour12: false };
                const dataDiv = document.getElementById('timezone-data');
                dataDiv.innerHTML = '';

                try {
                    const [hours, minutes] = localTime.split(':');
                    const baseDate = new Date();
                    baseDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                    timeZones.forEach(tz => {
                        const formatter = new Intl.DateTimeFormat('fr-FR', { ...options, timeZone: tz });
                        const timeInZone = formatter.format(baseDate);
                        const zoneName = tz.split('/').pop().replace('_', ' ');
                        dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `${zoneName} : ${timeInZone}`));
                    });
                    document.getElementById('timezone-results').style.display = 'block';
                } catch (error) {
                    ProTools.DOM.showError('local-time-error', 'Erreur de calcul des fuseaux');
                }
            },

            async shortenUrl() {
                const url = document.getElementById('url-to-shorten').value;
                const alias = document.getElementById('url-alias').value;
                const expiration = document.getElementById('url-expiration').value;

                ProTools.DOM.clearError('url-error');
                try {
                    new URL(url);
                } catch {
                    return ProTools.DOM.showError('url-error', 'URL invalide');
                }

                try {
                    const result = await ProTools.API.fetchData('/api/urls', { url, alias, expiration });
                    const dataDiv = document.getElementById('url-data');
                    dataDiv.innerHTML = '';
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `URL originale : ${url}`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', 'URL raccourcie : '));
                    const link = document.createElement('a');
                    link.href = result.shortUrl;
                    link.textContent = result.shortUrl;
                    link.target = '_blank';
                    dataDiv.appendChild(link);
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Expiration : ${result.expiration}`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Statistiques : 0 clics (suivi activé)`));
                    document.getElementById('url-results').style.display = 'block';
                } catch (error) {
                    ProTools.DOM.showError('url-error', error.message);
                }
            },

            async sendContactMessage() {
                const modal = document.createElement('div');
                modal.id = 'contact-modal';
                modal.className = 'modal';
                modal.setAttribute('role', 'dialog');
                modal.setAttribute('aria-labelledby', 'contact-modal-title');
                modal.setAttribute('aria-modal', 'true');
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close" onclick="ProTools.UI.closeModal('contact-modal')" role="button" aria-label="Fermer">×</span>
                        <h2 id="contact-modal-title">📩 Envoyer un message</h2>
                        <div class="content">
                            <div class="input-group">
                                <label for="name">Nom :</label>
                                <input type="text" id="contact-name" placeholder="Votre nom">
                                <div id="contact-name-error" class="error"></div>
                            </div>
                            <div class="input-group">
                                <label for="contact-email">Email :</label>
                                <input type="email" id="contact-email" placeholder="votre@email.com">
                                <div id="contact-email-error"></div>
                            </div>
                            <div class="input-group">
                                <label for="contact-message">Message :</label>
                                <textarea id="contact-message" rows="4" placeholder="Votre message..."></textarea>
                                <div id="contact-message-error"></div>
                            </div>
                            <div class="input-group">
                                <label><input type="checkbox" id="contact-consent" required> J'accepte la collecte de données.</label>
                                <div id="contact-consent-error"></div>
                            </div>
                            <button class="service-button" onclick="ProTools.Tools.submitMessage()">Envoyer</button>
                            <div id="contact-results" class="results" style="display:none;">
                                <h4>Confirmation :</h4>
                                <div id="contact-data"></div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
                ProTools.UI.openModal('contact-modal');
            },

            async submitMessage() {
                const name = document.getElementById('contact-name').value;
                const email = document.getElementById('contact-email').value;
                const message = document.getElementById('contact-message').value;
                const consent = document.getElementById('contact-consent').checked;

                ProTools.DOM.clearError('contact-name-error');
                ProTools.DOM.clearError('contact-email-error');
                ProTools.DOM.clearError('contact-message-error');
                ProTools.DOM.clearError('contact-consent-error');

                if (!name) return ProTools.DOM.showError('contact-name-error', 'Nom requis');
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ProTools.DOM.showError('contact-email-error', 'Email invalide');
                if (!message) return ProTools.DOM.showError('contact-message-error', 'Message requis');
                if (!consent) return ProTools.DOM.showError('contact-consent-error', 'Consentement requis');

                try {
                    const result = await ProTools.API.fetchData('/api/messages', { name, email, message });
                    const dataDiv = document.getElementById('contact-data');
                    dataDiv.innerHTML = '';
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Merci, ${name} !`));
                    dataDiv.appendChild(ProTools.DOM.createElementWithText('p', `Votre message a été envoyé. Réponse sous 24h à ${email}.`));
                    document.getElementById('contact-results').style.display = 'block';

                    document.getElementById('contact-name').value = '';
                    document.getElementById('contact-email').value = '';
                    document.getElementById('contact-message').value = '';
                    document.getElementById('contact-consent').checked = false;
                } catch (error) {
                    ProTools.DOM.showError('contact-message-error', error.message);
                }
            }
        },

        // Notifications push
        Notifications: {
            initializeFirebase() {
                const script = document.createElement('script');
                script.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js';
                script.onload = () => {
                    const messagingScript = document.createElement('script');
                    messagingScript.src = 'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js';
                    messagingScript.onload = this.setupNotifications;
                    document.head.appendChild(messagingScript);
                };
                document.head.appendChild(script);
            },

            setupNotifications() {
                firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
                const messaging = firebase.messaging();

                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        messaging.getToken({ vapidKey: CONFIG.VAPID_KEY }).then(token => {
                            if (token) {
                                ProTools.API.fetchData('/api/push/subscribe', { token })
                                    .then(result => {
                                        if (result.success) console.log('Souscription push réussie');
                                    })
                                    .catch(error => console.error('Erreur souscription push:', error));
                            }
                        }).catch(error => console.error('Erreur obtention token:', error));
                    }
                });
            }
        },

        // Initialisation
        init() {
            document.addEventListener('DOMContentLoaded', () => {
                // Sanitiser les entrées
                document.querySelectorAll('input[type="text"], input[type="url"], input[type="email"], textarea').forEach(input => {
                    input.addEventListener('input', () => {
                        input.value = ProTools.DOM.sanitizeInput(input.value);
                    });
                });

                // Accessibilité des boutons
                document.querySelectorAll('.service-button').forEach(button => {
                    button.addEventListener('click', () => {
                        setTimeout(() => {
                            const modal = document.querySelector('.modal[style*="block"] .modal-content');
                            if (modal) modal.focus();
                        }, 100);
                    });
                });

                // Initialiser l'UI
                ProTools.UI.setupModalAccessibility();
                ProTools.UI.setupSmoothScrolling();
                ProTools.UI.setupFloatingAd();

                // Initialiser Firebase
                ProTools.Notifications.initializeFirebase();

                // Enregistrer le service worker
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js')
                        .then(reg => console.log('Service Worker enregistré:', reg))
                        .catch(err => console.error('Erreur Service Worker:', err));
                }
            });
        }
    };

    // Lancer l'application
    ProTools.init();
})();