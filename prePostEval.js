// Initialize global variables
console.log("12:10")
var lmsAPI = window.parent.parent;
var p = GetPlayer();
var iframe = window.parent.document.querySelector(`iframe[name="${window.name}"]`);
var parentElement = iframe.parentElement;

// Adjust iframe style
function adjustIframe() {
  parentElement.style.cssText = "height: auto; padding: 0;";
  iframe.style.display = "none";
}
function highlightLabel(event) {
    console.log('hey!');
        /*const radioWrapper = event.target.closest('.likert');
        const labels = radioWrapper.querySelectorAll('label');
        labels.forEach(label => label.style.backgroundColor = "#fff");
        console.log(event.target)
        console.log(event.target.labels[0])
        event.target.labels[0].style.backgroundColor = "#14143c";*/
    }
// Send the JSON data to the API endpoint
function sendDataToAPI(jsonData, check) {
  const apiURL = 'https://prod-236.westeurope.logic.azure.com:443/workflows/7fea2dec7f99427689f6b676bfbd5f29/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Nx_u-9wDlM8c7HrkQLIkx-7bhrQ5ml0IPGi452noa_U';
  
  fetch(apiURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jsonData),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Success:', data);
    handleAPIResponse(data, check);
  })
  .catch(error => console.error('Error:', error));
}

// Handle the response from the API
function handleAPIResponse(data, check) {
  console.log(data.message);
  console.log(data.data);
  if (check) {
    data.message !== "answered" ? buildForm() : thankYou();
  }
}

// Prepare the data and send it to the API
function checkData(event = null, check = true) {
  if (event && event.preventDefault) event.preventDefault();
  
  const studentId = lmsAPI.GetStudentID();
  const studentName = lmsAPI.GetStudentName();
  const course = p.GetVar('course');
  const preOrPost = p.GetVar('preOrPost');
  const jsonData = {
    name: studentName,
    id: studentId,
    course,
    check,
    "pre/post": preOrPost
  };
  console.log(jsonData);
  // Add form data if not checking
  if (!check && event) {
    const formData = new FormData(event.target);
    formData.forEach((value, key) => jsonData[key] = value);  
  }

sendDataToAPI(jsonData, check);
}

// Build the Likert scale form
function buildForm() {
  const questions = JSON.parse(p.GetVar('questions').replace(/'/g, '"'));
  const min = JSON.parse(p.GetVar('min').replace(/'/g, '"'));
  const max = JSON.parse(p.GetVar('max').replace(/'/g, '"'));
  const courseName = window.parent.document.querySelector('.nav-sidebar-header__title').text;
  const preOrPost = p.GetVar('preOrPost');
  const formHeading = preOrPost === "pre" ? "Præmåling" : "Postmåling";
  const formMessage = preOrPost === "pre" ?
  'Før du gennemfører modulet, vil vi gerne have dig til at vurdere <i>din egen</i> viden, ekspertise og fortrolighed med emnet.' :
  'Efter du har gennemført modulet, vil vi gerne have dig til <i>igen</i> at vurdere din egen viden, ekspertise og fortrolighed med emnet.';
  
  const form = document.createElement('form');
  form.id = "likertForm";
  form.style.margin = "20px";
  form.innerHTML = `<div style="font-weight: bold;">${formHeading} for ${courseName}</div><p>${formMessage}</p><br>`;
  
  questions.forEach((questionText, index) => {
  const questionDiv = document.createElement('div');
  questionDiv.className = "question";
  const questionP = document.createElement('p');
  questionP.innerHTML = `${questionText}`;
    questionDiv.appendChild(questionP);
  const likert = createLikertScale(questionText, min[index], max[index], `question${index + 1}`);
  questionDiv.appendChild(likert);
  form.appendChild(questionDiv);
  });
  
  form.appendChild(createSubmitButton());
  form.onsubmit = event => checkData(event, false);
  parentElement.appendChild(form);
  addListenersToRadioButtons();
}

// Create Likert scale options for each question
function createLikertScale(questionText, minText, maxText, name) {
  const likert = document.createElement('div');
  likert.className = "likert";
  likert.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin: 10px 0 20px 0;";
  likert.innerHTML = `<span style="width: 10%; text-align: left;">${minText}</span>`;
  
  const radioContainer = document.createElement('div');
  radioContainer.style.cssText = "position: relative; display: flex; justify-content: space-between; flex-grow: 1; margin: 10px;";
   radioContainer.innerHTML += '<div style="position: absolute;width: 100%; height: 2px; top: 36%; background-color: #14143c;z-index: 1;"></div>';
  for (let i = 1; i <= 5; i++) {
    const radioId = `${name}-${i}`;
    radioContainer.appendChild(createRadioButton(name, radioId, i));
  }
 
  likert.appendChild(radioContainer);
  likert.innerHTML += `<span style="width: 10%; text-align: right;">${maxText}</span>`;
  
  return likert;
}

// Create a single radio button for the Likert scale
function createRadioButton(name, id, value) {
  const radioInput = document.createElement('input');
  radioInput.type = "radio";
  radioInput.name = name;
  radioInput.value = value;
  radioInput.id = id;
  radioInput.style.display = "none";
  
  const label = document.createElement('label');
  label.setAttribute('for', id);
  label.style.cssText = "display: inline-block; width: 20px; height: 20px; border-radius: 50%; background-color: #fff; border: 2px solid #14143c;";
  
  // Attach the click event to the label
  const radioWrapper = document.createElement('div');
  radioWrapper.appendChild(radioInput);
  //radioWrapper.appendChild(label);
  radioWrapper.innerHTML += '<label for="' + id + '" style="display: inline-block;width: 20px;height: 20px;border-radius: 50%;background-color: #fff;; border: 2px solid #14143c;"></label>';
  //radioWrapper.style.zIndex = "2";
  radioWrapper.className = "radioWrapper";
  return radioWrapper;
}


// Highlight the label when a radio button is clicked

function addListenersToRadioButtons() {
  //const labels = document.querySelectorAll('label');
  const inputs = document.querySelectorAll('input[type="radio"]');
  inputs.forEach(input => {
    input.addEventListener('click', highlightLabel);
    console.log(input)
  });
}

// Create a submit button for the form
function createSubmitButton() {
  const btnDiv = document.createElement('div');
  btnDiv.style.cssText = "display: flex; justify-content: center;";
  btnDiv.innerHTML = '<input type="submit" value="Submit" />';
  return btnDiv;
}

// Display thank you message if the survey is already completed
function thankYou() {
    const courseName = document.getElementsByClassName('nav-sidebar-header__title')[0].text;
  const message = p.GetVar('preOrPost') === "pre" ? "præmålingen" : "postmålingen";
  const html = `<div style="color: grey;">Du har allerede udfyldt ${message} for ${courseName}.</div>`;
  parentElement.innerHTML = html;
}

// Initialize the script
function prePostInit() {
  adjustIframe();
  checkData(null, true);  // Initially check if the survey is already completed
}

prePostInit();
