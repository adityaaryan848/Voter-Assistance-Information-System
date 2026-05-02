const app = (function() {
    // State
    let currentRole = null;
    let currentStep = 0;
    let flashcardIndex = 0;

    // Data Models
    const journeys = {
        first_time: [
            { title: "Verify Eligibility", desc: "Ensure you are 18+ and an Indian Citizen.", isCompleted: false },
            { title: "Fill Form 6", desc: "Apply online via NVSP or Voter Helpline App.", isCompleted: false },
            { title: "BLO Verification", desc: "Booth Level Officer will verify your address.", isCompleted: false },
            { title: "EPIC Generation", desc: "Receive your Voter ID card via post.", isCompleted: false }
        ],
        existing: [
            { title: "Search in Electoral Roll", desc: "Verify your name in the voter list.", isCompleted: false },
            { title: "Find Polling Booth", desc: "Locate where you need to go to vote.", isCompleted: false },
            { title: "Check Candidates", desc: "Review the affidavits of contesting candidates.", isCompleted: false },
            { title: "Cast Your Vote", desc: "Carry EPIC or an alternate ID and vote.", isCompleted: false }
        ],
        candidate: [
            { title: "Check Eligibility", desc: "Ensure you are 25+ (Lok Sabha/Assembly) and a registered voter.", isCompleted: false },
            { title: "File Nomination", desc: "Submit Form 2A/2B along with security deposit.", isCompleted: false },
            { title: "Submit Affidavit", desc: "File Form 26 detailing assets and criminal records.", isCompleted: false },
            { title: "Campaign & Comply", desc: "Follow Model Code of Conduct and expenditure limits.", isCompleted: false }
        ]
    };

    const flashcards = [
        { myth: "You can vote online in Indian Elections.", fact: "No, you cannot.", desc: "Currently, the Election Commission of India only allows in-person voting via EVMs, or postal ballots for specific categories (like armed forces and election duty staff)." },
        { myth: "You need a Voter ID card to vote.", fact: "Not strictly true.", desc: "If your name is on the electoral roll, you can vote using other ECI-approved photo IDs like Aadhaar, PAN card, or Passport." },
        { myth: "NOTA means election gets cancelled if it wins.", fact: "Incorrect.", desc: "Even if NOTA (None of the Above) gets the highest votes, the candidate with the second-highest votes is declared the winner." },
        { myth: "You can be registered to vote in two cities.", fact: "Illegal.", desc: "It is illegal to be enrolled at more than one place. You must fill Form 8 to shift your constituency instead of re-registering." },
        { myth: "Candidates can spend unlimited money.", fact: "False.", desc: "ECI sets strict expenditure limits (e.g., ₹95 Lakhs for major Lok Sabha seats) which candidates must legally adhere to." }
    ];

    // Initialization
    function init() {
        setupNavigation();
        renderFlashcards();
        
        // Listen for enter key in chat
        document.getElementById('chat-input').addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

    // Navigation
    function setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                navigate(target);
            });
        });
    }

    function navigate(targetId) {
        // If targeting dashboard but no role selected, go to onboarding
        if (targetId === 'dashboard' && !currentRole) {
            targetId = 'onboarding';
        }

        // Update Nav Active State
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if(btn.getAttribute('data-target') === targetId || (targetId === 'onboarding' && btn.getAttribute('data-target') === 'dashboard')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Show specific section
        document.querySelectorAll('.view-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');
    }

    // Role Selection & Dashboard
    function setRole(role) {
        currentRole = role;
        currentStep = 0;
        updateDashboard();
        navigate('dashboard');
    }

    function updateDashboard() {
        const journey = journeys[currentRole];
        const timeline = document.getElementById('journey-timeline');
        timeline.innerHTML = '';

        let nextStepFound = false;

        journey.forEach((step, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            
            if (step.isCompleted) {
                item.classList.add('completed');
            } else if (!nextStepFound) {
                item.classList.add('active');
                updateNextStepCard(step);
                currentStep = index;
                nextStepFound = true;
            }

            item.innerHTML = `
                <h4>${index + 1}. ${step.title}</h4>
                <p>${step.desc}</p>
            `;
            timeline.appendChild(item);
        });

        if (!nextStepFound) {
            // All completed
            document.getElementById('next-step-title').textContent = "Journey Completed!";
            document.getElementById('next-step-desc').textContent = "You have completed all steps for your role.";
            document.querySelector('.action-buttons').style.display = 'none';
        } else {
            document.querySelector('.action-buttons').style.display = 'flex';
        }

        const completedCount = journey.filter(s => s.isCompleted).length;
        const progressPercent = (completedCount / journey.length) * 100;
        document.getElementById('journey-progress').style.width = `${progressPercent}%`;
        document.getElementById('progress-text').textContent = `Step ${completedCount} of ${journey.length} completed`;
    }

    function updateNextStepCard(step) {
        document.getElementById('next-step-title').innerHTML = step.title;
        document.getElementById('next-step-desc').innerHTML = step.desc;
    }

    function markStepComplete() {
        if (currentRole && journeys[currentRole][currentStep]) {
            journeys[currentRole][currentStep].isCompleted = true;
            updateDashboard();
        }
    }

    // Flashcards
    function renderFlashcards() {
        const container = document.getElementById('flashcard-container');
        container.innerHTML = '';

        flashcards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = `flashcard ${index === flashcardIndex ? 'active' : ''}`;
            cardEl.innerHTML = `
                <div class="flashcard-inner" onclick="this.parentElement.classList.toggle('flipped')">
                    <div class="flashcard-front">
                        <span class="badge myth">Myth</span>
                        <h3>${card.myth}</h3>
                        <div class="flip-hint"><i data-lucide="rotate-cw"></i> Tap to flip</div>
                    </div>
                    <div class="flashcard-back">
                        <span class="badge fact">Fact</span>
                        <h3>${card.fact}</h3>
                        <p>${card.desc}</p>
                    </div>
                </div>
            `;
            container.appendChild(cardEl);
        });
        updateFlashcardCounter();
        lucide.createIcons();
    }

    function nextCard() {
        if (flashcardIndex < flashcards.length - 1) {
            flashcardIndex++;
            renderFlashcards();
        }
    }

    function prevCard() {
        if (flashcardIndex > 0) {
            flashcardIndex--;
            renderFlashcards();
        }
    }

    function updateFlashcardCounter() {
        document.getElementById('card-counter').textContent = `${flashcardIndex + 1} / ${flashcards.length}`;
    }

    // AI Assistant Logic (Mock)
    function sendChatMessage(text = null) {
        const input = document.getElementById('chat-input');
        const message = text || input.value.trim();
        
        if (!message) return;

        appendMessage('user', message);
        input.value = '';

        // Simulate typing and AI response
        setTimeout(() => {
            const response = generateAIResponse(message);
            appendMessage('bot', response);
        }, 600);
    }

    function appendMessage(sender, htmlContent) {
        const chatMessages = document.getElementById('chat-messages');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        const avatarIcon = sender === 'bot' ? 'bot' : 'user';
        
        msgDiv.innerHTML = `
            <div class="avatar"><i data-lucide="${avatarIcon}"></i></div>
            <div class="message-content">${htmlContent}</div>
        `;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        lucide.createIcons();
    }

    function generateAIResponse(userMessage) {
        const msg = userMessage.toLowerCase();
        
        if (msg.includes('form 8') || msg.includes('correction') || msg.includes('shift')) {
            return `
                <p><strong>Form 8</strong> is used for:</p>
                <ul>
                    <li>Shifting of residence</li>
                    <li>Correction of entries in the electoral roll</li>
                    <li>Replacement of EPIC without alteration</li>
                    <li>Marking of Person with Disability</li>
                </ul>
                <p>You can fill it out on the voters.eci.gov.in portal.</p>
            `;
        }
        
        if (msg.includes('missing') || msg.includes('not in list')) {
            return `
                <p>If your name is missing from the list, you should:</p>
                <ol>
                    <li>Search your details on <strong>electoralsearch.eci.gov.in</strong></li>
                    <li>If it's truly missing, you must apply as a new voter using <strong>Form 6</strong></li>
                    <li>If you suspect it was wrongly deleted, contact your BLO (Booth Level Officer).</li>
                </ol>
            `;
        }

        if (msg.includes('apply') || msg.includes('new voter') || msg.includes('form 6')) {
            return `
                <p>To apply for a new Voter ID (Form 6), follow these steps:</p>
                <ol>
                    <li>Go to voters.eci.gov.in or download Voter Helpline App.</li>
                    <li>Register/Login with your mobile number.</li>
                    <li>Fill out Form 6.</li>
                    <li>Upload an address proof and an age proof.</li>
                    <li>Submit and note down the reference number for tracking.</li>
                </ol>
            `;
        }

        return `
            <p>I'm here to help with Indian Elections. I can assist you with:</p>
            <ul>
                <li>Voter Registration (Form 6)</li>
                <li>Corrections (Form 8)</li>
                <li>Finding polling booths</li>
                <li>Candidate eligibility</li>
            </ul>
            <p>Could you provide more specific details about your query?</p>
        `;
    }

    // Eligibility Checker Modal
    function checkEligibility() {
        document.getElementById('eligibility-modal').classList.add('active');
        document.getElementById('eligibility-result').classList.add('hidden');
    }

    function closeModal() {
        document.getElementById('eligibility-modal').classList.remove('active');
    }

    function runEligibilityCheck() {
        const citizen = document.querySelector('input[name="citizen"]:checked');
        const age = document.getElementById('age-input').value;
        const resident = document.querySelector('input[name="resident"]:checked');
        const resultBox = document.getElementById('eligibility-result');

        if (!citizen || !age || !resident) {
            resultBox.className = 'result-box error';
            resultBox.innerHTML = 'Please fill out all fields.';
            resultBox.classList.remove('hidden');
            return;
        }

        if (citizen.value === 'yes' && parseInt(age) >= 18 && resident.value === 'yes') {
            resultBox.className = 'result-box success';
            resultBox.innerHTML = '<i data-lucide="check-circle" style="vertical-align: middle;"></i> <strong>You are Eligible!</strong> You can proceed to fill Form 6.';
            
            // Auto complete first step if first time
            if (currentRole === 'first_time' && currentStep === 0) {
                setTimeout(() => {
                    markStepComplete();
                    closeModal();
                }, 2000);
            }
        } else {
            resultBox.className = 'result-box error';
            resultBox.innerHTML = '<i data-lucide="alert-circle" style="vertical-align: middle;"></i> <strong>Not Eligible.</strong> You must be an Indian citizen, at least 18 years old, and a resident of the area.';
        }
        lucide.createIcons();
    }

    // Expose public methods
    return {
        init,
        navigate,
        setRole,
        markStepComplete,
        nextCard,
        prevCard,
        sendChatMessage,
        handleChatInput: (e) => { if (e.key === 'Enter') sendChatMessage(); },
        checkEligibility,
        closeModal,
        runEligibilityCheck
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', app.init);
