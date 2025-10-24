// Store questions and user data
let questions = {};
let currentUser = null;
let currentQuiz = {
    questions: [],
    currentIndex: 0,
    score: 0
};
let currentEditingQuestion = null;
let questionCounter = 1;

// Load data from localStorage when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadQuestionsFromStorage();
});

// Save and load functions for localStorage
function saveQuestionsToStorage() {
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
}

function loadQuestionsFromStorage() {
    const storedQuestions = localStorage.getItem('quizQuestions');
    if (storedQuestions) {
        questions = JSON.parse(storedQuestions);
    }
}

// Login handlers
function showAdminLogin() {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('studentLogin').style.display = 'none';
}

function showStudentLogin() {
    document.getElementById('studentLogin').style.display = 'flex';
    document.getElementById('adminLogin').style.display = 'none';
}

function adminLoginHandler() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === 'admin123' && password === '1234') {
        document.querySelector('.login-container').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
    } else {
        alert('Invalid credentials!');
    }
}

function studentLoginHandler() {
    const name = document.getElementById('studentName').value;
    if (name.trim()) {
        currentUser = name;
        document.getElementById('studentNameDisplay').textContent = name;
        document.querySelector('.login-container').style.display = 'none';
        document.getElementById('studentDashboard').style.display = 'block';
    } else {
        alert('Please enter your name!');
    }
}

// Admin functions
function showQuestionForm(subject) {
    const questionList = document.getElementById('questionList');
    const questionForm = document.getElementById('questionForm');
    const questionListSubject = document.getElementById('questionListSubject');
    
    questionListSubject.textContent = subject;
    document.getElementById('selectedSubject').textContent = subject;
    
    // Show existing questions first
    displayQuestionList(subject);
    questionList.style.display = 'block';
    questionForm.style.display = 'none';
}

function displayQuestionList(subject) {
    const container = document.getElementById('questionListContainer');
    container.innerHTML = '';
    
    const addNewBtn = document.createElement('button');
    addNewBtn.textContent = 'Add New Questions';
    addNewBtn.onclick = () => showNewQuestionForm(subject);
    container.appendChild(addNewBtn);

    if (!questions[subject]) {
        questions[subject] = [];
        return;
    }

    questions[subject].forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.text}</p>
            <p>Type: ${question.type} | Level: ${question.level}</p>
            <button onclick="editQuestion('${subject}', ${index})">Edit</button>
        `;
        container.appendChild(questionDiv);
    });
}

function showNewQuestionForm(subject) {
    currentEditingQuestion = null;
    document.getElementById('questionList').style.display = 'none';
    document.getElementById('questionForm').style.display = 'block';
    
    // Reset the question container and add a fresh question form
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    
    // Add the first question form
    addNewQuestionToForm();
    
    // Reset question counter
    questionCounter = 1;
}

function addNewQuestionToForm() {
    questionCounter++;
    const questionsContainer = document.getElementById('questionsContainer');
    const subject = document.getElementById('selectedSubject').textContent;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-entry';
    questionDiv.dataset.index = questionCounter - 1;
    
    questionDiv.innerHTML = `
        <h4>Question ${questionCounter}</h4>
        <input type="number" class="questionNumber" placeholder="Question Number" value="${questions[subject] ? questions[subject].length + questionCounter : questionCounter}">
        <select class="questionLevel">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
        </select>
        <select class="questionType" onchange="updateAnswerOptionsForQuestion(this)">
            <option value="integer">Integer</option>
            <option value="multiple">Multiple Choice</option>
            <option value="single">Single Correct</option>
            <option value="blanks">Fill in the Blanks</option>
        </select>
        <textarea class="questionText" placeholder="Enter question"></textarea>
        <div class="answerOptions"></div>
        <div class="correctOptionsContainer" style="display: none;"></div>
        <input type="text" class="correctAnswer" placeholder="Correct answer">
        <button onclick="removeQuestion(this)" class="remove-question-btn">Remove Question</button>
    `;
    
    questionsContainer.appendChild(questionDiv);
    updateAnswerOptionsForQuestion(questionDiv.querySelector('.questionType'));
}

function removeQuestion(button) {
    const questionEntry = button.closest('.question-entry');
    
    // Don't remove if it's the only question
    if (document.querySelectorAll('.question-entry').length <= 1) {
        alert("You must have at least one question.");
        return;
    }
    
    questionEntry.remove();
    
    // Renumber the questions
    document.querySelectorAll('.question-entry').forEach((entry, index) => {
        entry.querySelector('h4').textContent = `Question ${index + 1}`;
        entry.dataset.index = index;
    });
    
    questionCounter = document.querySelectorAll('.question-entry').length;
}

function editQuestion(subject, index) {
    currentEditingQuestion = { subject, index };
    const question = questions[subject][index];
    
    // Clear existing questions and add a single form for editing
    document.getElementById('questionsContainer').innerHTML = '';
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-entry';
    questionDiv.dataset.index = 0;
    
    questionDiv.innerHTML = `
        <h4>Edit Question</h4>
        <input type="number" class="questionNumber" placeholder="Question Number" value="${index + 1}">
        <select class="questionLevel">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
        </select>
        <select class="questionType" onchange="updateAnswerOptionsForQuestion(this)">
            <option value="integer">Integer</option>
            <option value="multiple">Multiple Choice</option>
            <option value="single">Single Correct</option>
            <option value="blanks">Fill in the Blanks</option>
        </select>
        <textarea class="questionText" placeholder="Enter question"></textarea>
        <div class="answerOptions"></div>
        <div class="correctOptionsContainer" style="display: none;"></div>
        <input type="text" class="correctAnswer" placeholder="Correct answer">
    `;
    
    document.getElementById('questionsContainer').appendChild(questionDiv);
    
    // Set values
    questionDiv.querySelector('.questionLevel').value = question.level;
    questionDiv.querySelector('.questionType').value = question.type;
    questionDiv.querySelector('.questionText').value = question.text;
    
    updateAnswerOptionsForQuestion(questionDiv.querySelector('.questionType'));
    
    if (question.options && question.options.length > 0) {
        const optionInputs = questionDiv.querySelectorAll('.option-input');
        question.options.forEach((option, i) => {
            if (optionInputs[i]) optionInputs[i].value = option;
        });
        
        // Set correct options for multiple choice or single correct
        if (question.type === 'multiple' || question.type === 'single') {
            setTimeout(() => {
                updateCorrectOptionsUIForQuestion(questionDiv.querySelector('.questionType'), questionDiv);
                
                // Check the correct options
                const correctOptions = question.correctAnswer.split(',');
                const checkboxes = questionDiv.querySelectorAll('.correctOptionsContainer input');
                checkboxes.forEach((checkbox, i) => {
                    checkbox.checked = correctOptions.includes(question.options[i]);
                });
            }, 100);
        } else {
            questionDiv.querySelector('.correctAnswer').value = question.correctAnswer;
        }
    } else {
        questionDiv.querySelector('.correctAnswer').value = question.correctAnswer;
    }
    
    document.getElementById('questionList').style.display = 'none';
    document.getElementById('questionForm').style.display = 'block';
    
    // Reset question counter for next add
    questionCounter = 1;
}

function showQuestionList() {
    const subject = document.getElementById('selectedSubject').textContent;
    document.getElementById('questionForm').style.display = 'none';
    displayQuestionList(subject);
    document.getElementById('questionList').style.display = 'block';
}

function updateAnswerOptionsForQuestion(selectElement) {
    const questionEntry = selectElement.closest('.question-entry');
    const type = selectElement.value;
    const container = questionEntry.querySelector('.answerOptions');
    const correctOptionsContainer = questionEntry.querySelector('.correctOptionsContainer');
    
    container.innerHTML = '';
    correctOptionsContainer.innerHTML = '';
    correctOptionsContainer.style.display = 'none';
    
    // Show or hide the text input for correct answer based on question type
    const correctAnswerInput = questionEntry.querySelector('.correctAnswer');
    correctAnswerInput.style.display = (type === 'multiple' || type === 'single') ? 'none' : 'block';

    if (type === 'multiple' || type === 'single') {
        for (let i = 0; i < 4; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Option ${i + 1}`;
            input.className = 'option-input';
            input.onchange = () => updateCorrectOptionsUIForQuestion(selectElement, questionEntry);
            container.appendChild(input);
        }
        
        // Add a note about selecting correct options
        const note = document.createElement('p');
        note.textContent = 'Enter all options first, then select the correct one(s) below.';
        note.style.fontStyle = 'italic';
        container.appendChild(note);
        
        // Create empty container for correct options selection
        updateCorrectOptionsUIForQuestion(selectElement, questionEntry);
    }
}

function updateCorrectOptionsUIForQuestion(selectElement, questionEntry) {
    const type = selectElement.value;
    const container = questionEntry.querySelector('.correctOptionsContainer');
    container.innerHTML = '';
    container.style.display = 'block';
    
    const optionInputs = questionEntry.querySelectorAll('.option-input');
    const options = Array.from(optionInputs).map(input => input.value);
    
    const label = document.createElement('label');
    label.textContent = 'Select correct answer(s):';
    container.appendChild(label);
    
    options.forEach((option, index) => {
        if (!option) return;
        
        const div = document.createElement('div');
        const input = document.createElement('input');
        input.type = type === 'single' ? 'radio' : 'checkbox';
        input.name = `correctOption_${questionEntry.dataset.index}`;
        input.value = index;
        input.id = `correctOption_${questionEntry.dataset.index}_${index}`;
        
        const optionLabel = document.createElement('label');
        optionLabel.htmlFor = `correctOption_${questionEntry.dataset.index}_${index}`;
        optionLabel.textContent = option;
        
        div.appendChild(input);
        div.appendChild(optionLabel);
        container.appendChild(div);
    });
}

function submitAllQuestions() {
    const subject = document.getElementById('selectedSubject').textContent;
    const questionEntries = document.querySelectorAll('.question-entry');
    let allValid = true;
    let savedCount = 0;
    
    if (!questions[subject]) {
        questions[subject] = [];
    }
    
    questionEntries.forEach(entry => {
        const questionNumber = parseInt(entry.querySelector('.questionNumber').value) - 1;
        const level = entry.querySelector('.questionLevel').value;
        const type = entry.querySelector('.questionType').value;
        const questionText = entry.querySelector('.questionText').value;
        
        if (!questionText) {
            alert(`Please fill in the question text for Question ${parseInt(entry.dataset.index) + 1}!`);
            allValid = false;
            return;
        }
        
        let options = [];
        let correctAnswer = '';
        
        if (type === 'multiple' || type === 'single') {
            options = Array.from(entry.querySelectorAll('.option-input')).map(input => input.value);
            if (options.some(opt => !opt)) {
                alert(`Please fill in all options for Question ${parseInt(entry.dataset.index) + 1}!`);
                allValid = false;
                return;
            }
            
            // Get selected correct options
            const selectedOptions = Array.from(entry.querySelectorAll(`.correctOptionsContainer input:checked`))
                .map(input => options[parseInt(input.value)]);
            
            if (selectedOptions.length === 0) {
                alert(`Please select at least one correct option for Question ${parseInt(entry.dataset.index) + 1}!`);
                allValid = false;
                return;
            }
            
            if (type === 'single' && selectedOptions.length > 1) {
                alert(`Please select only one correct option for single correct type in Question ${parseInt(entry.dataset.index) + 1}!`);
                allValid = false;
                return;
            }
            
            correctAnswer = selectedOptions.join(',');
        } else {
            correctAnswer = entry.querySelector('.correctAnswer').value;
            if (!correctAnswer) {
                alert(`Please provide the correct answer for Question ${parseInt(entry.dataset.index) + 1}!`);
                allValid = false;
                return;
            }
        }
        
        if (!allValid) return;
        
        const questionData = {
            text: questionText,
            type: type,
            level: level,
            options: options,
            correctAnswer: correctAnswer
        };
        
        if (currentEditingQuestion) {
            questions[subject][currentEditingQuestion.index] = questionData;
        } else {
            // Insert at specific position or append
            if (questionNumber >= 0 && questionNumber <= questions[subject].length) {
                questions[subject].splice(questionNumber, 0, questionData);
            } else {
                questions[subject].push(questionData);
            }
        }
        
        savedCount++;
    });
    
    if (allValid) {
        // Save to localStorage after adding/updating questions
        saveQuestionsToStorage();
        
        alert(`${savedCount} question(s) saved successfully!`);
        showQuestionList();
        currentEditingQuestion = null;
    }
}

// Student functions
function startQuiz() {
    const subject = document.getElementById('quizSubject').value;
    const level = document.getElementById('quizLevel').value;
    const type = document.getElementById('quizType').value;

    if (!subject || !level || !type) {
        alert('Please select all quiz options!');
        return;
    }

    if (!questions[subject] || questions[subject].length === 0) {
        alert('No questions available for this selection!');
        return;
    }

    currentQuiz.questions = questions[subject].filter(q => q.level === level && q.type === type);
    if (currentQuiz.questions.length === 0) {
        alert('No questions available for this selection!');
        return;
    }

    currentQuiz.currentIndex = 0;
    currentQuiz.score = 0;
    displayQuestion();
    document.querySelector('.quiz-setup').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
}

function displayQuestion() {
    const question = currentQuiz.questions[currentQuiz.currentIndex];
    const questionDisplay = document.getElementById('questionDisplay');
    const answerInput = document.getElementById('answerInput');

    questionDisplay.innerHTML = `<h3>Question ${currentQuiz.currentIndex + 1}:</h3><p>${question.text}</p>`;
    answerInput.innerHTML = '';

    if (question.type === 'multiple' || question.type === 'single') {
        question.options.forEach((option, index) => {
            const input = document.createElement('input');
            input.type = question.type === 'single' ? 'radio' : 'checkbox';
            input.name = 'answer';
            input.value = option;
            input.id = `option${index}`;

            const label = document.createElement('label');
            label.htmlFor = `option${index}`;
            label.textContent = option;

            const div = document.createElement('div');
            div.appendChild(input);
            div.appendChild(label);
            answerInput.appendChild(div);
        });
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'answer';
        input.placeholder = 'Your answer';
        answerInput.appendChild(input);
    }
}

function submitAnswer() {
    const question = currentQuiz.questions[currentQuiz.currentIndex];
    let userAnswer;

    if (question.type === 'multiple') {
        userAnswer = Array.from(document.querySelectorAll('input[name="answer"]:checked'))
            .map(input => input.value)
            .join(',');
    } else if (question.type === 'single') {
        const selected = document.querySelector('input[name="answer"]:checked');
        userAnswer = selected ? selected.value : '';
    } else {
        userAnswer = document.getElementById('answer').value;
    }

    if (userAnswer.toString().toLowerCase() === question.correctAnswer.toLowerCase()) {
        currentQuiz.score++;
    }

    currentQuiz.currentIndex++;

    if (currentQuiz.currentIndex < currentQuiz.questions.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('scoreDisplay').textContent = 
        `${currentQuiz.score}/${currentQuiz.questions.length}`;
}

function returnToDashboard() {
    document.getElementById('resultContainer').style.display = 'none';
    document.querySelector('.quiz-setup').style.display = 'flex';
    document.getElementById('quizSubject').value = '';
    document.getElementById('quizLevel').value = '';
    document.getElementById('quizType').value = '';
}

// Event Listeners
document.getElementById('questionType').addEventListener('change', updateAnswerOptions);