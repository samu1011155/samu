var lastUserInfo = null; // Store the last user info globally
var lastStatus = { message: '', isSuccess: false }; // Store the last status message and its success state
document.addEventListener('DOMContentLoaded', function() {
    setLanguage('fr'); // Set default language to French
    const params = new URLSearchParams(window.location.search);
    const cardId = params.get('card_ID'); // Assume the URL has ?card_ID=EMS1234567

    if (!cardId) {
        updateStatus('Aucun identifiant de carte fourni.', false); // Initialize with French
        return;
    }

    fetchAndVerifyCard(cardId);

    function fetchAndVerifyCard(cardId) {
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSXii8DxTH0ErMJwh5_JMXvMS4Us5YkxTtPC5E9JnKNx6xmf2NHHIHcDK_x73US4K57DK8C5mqL7S3t/pub?gid=0&single=true&output=csv';
        axios.get(sheetUrl)
            .then(response => {
                const csvData = response.data;
               
                parseAndVerify(csvData, cardId);
            })
            .catch(error => {
                console.error('Error fetching data: ', error);
                updateStatus('Erreur lors du chargement des données.', false);
            });
    }

    function parseAndVerify(csvData, cardId) {
        Papa.parse(csvData, {
            complete: function(results) {
                const data = results.data;
                const match = data.find(row => row[0] === cardId);
                if (match) {
                    lastUserInfo = match; // Store the latest valid user info
                    displayUserInfo(match);
                    const message = document.body.getAttribute('lang') === 'fr' ? 
                        "Il est demandé aux autorités de fournir toute l'assistance nécessaire au porteur de cette carte dans l'accomplissement de ses fonctions." : 
                        "السلطات مطلوبة لتوفير كل الدعم اللازم لحامل هذه البطاقة في أداء وظائفه.";
                    updateStatus(message, true);
                } else {
                    const message = document.body.getAttribute('lang') === 'fr' ? 
                        'Aucune donnée trouvée pour cet identifiant.' : 
                        'لم يتم العثور على بيانات لهذا المعرف.';
                    updateStatus(message, false);
                }
            },
            error: function(error) {
                console.error('Error parsing CSV: ', error);
                const message = document.body.getAttribute('lang') === 'fr' ? 
                    "Erreur lors de l'analyse des données." : 
                    "خطأ في تحليل البيانات.";
                updateStatus(message, false);
            }
        });
    }
    
    function displayUserInfo(userInfo) {
        const userInfoDiv = document.getElementById('userInfo');
        userInfoDiv.innerHTML = `
            <center><strong>${userInfo[1]}</strong></center>
            <center><strong>${userInfo[2]}</strong></center>
        `;
    }

    function updateStatus(message, isSuccess) {
        console.log(message, isSuccess);
        const statusDiv = document.getElementById('verificationStatus');
        statusDiv.textContent = message;
        statusDiv.style.color = isSuccess ? 'white' : 'red';
        lastStatus = { message, isSuccess }; // Update lastStatus with the current status
    }
});

function setLanguage(language) {
    document.body.setAttribute('lang', language);
    updateLanguageTexts(language);
    updateButtons(language);
}

function updateLanguageTexts(lang) {
    document.querySelectorAll('.lang').forEach(element => {
        element.textContent = element.getAttribute(`data-${lang}`);
    });
}

function updateButtons(activeLang) {
    const buttons = document.querySelectorAll('.language-toggle button');
    buttons.forEach(button => {
        if(button.id === 'btn' + activeLang.toUpperCase()) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}



function toggleLanguage() {
    const currentLang = document.body.getAttribute('lang');
    const newLang = currentLang === 'fr' ? 'ar' : 'fr';
    setLanguage(newLang);
    if (lastUserInfo) {
        displayUserInfo(lastUserInfo); // Redisplay user info in the new language
    }
    if (lastStatus.message) {
        updateStatus(lastStatus.message, lastStatus.isSuccess); // Redisplay last status in the new language
    }
}

