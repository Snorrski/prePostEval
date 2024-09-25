// Initialize global variables
console.log("13:14")
var lmsAPI = window.parent.parent;
var p = GetPlayer();
var iframe = window.parent.document.querySelector(`iframe[name="${window.name}"]`);
var parentElement = iframe.parentElement;
var checked;
function allQuestionsAnswered(form) {
    // Get all unique radio button groups by name
    const radioGroups = new Set([...form.querySelectorAll('input[type="radio"]')].map(radio => radio.name));

    // Check if each group has a checked option
    for (const groupName of radioGroups) {
        const isGroupChecked = [...form.querySelectorAll(`input[name="${groupName}"]`)].some(radio => radio.checked);
        if (!isGroupChecked) {
            return false; // If any group doesn't have a checked radio button, return false
        }
    }

    return true; // If all groups have a checked radio button, return true
}
// Adjust iframe style
function adjustIframe() {
  parentElement.style.cssText = "height: auto; padding: 0;";
  iframe.style.display = "none";
}
/*function highlightLabel(event) {
    console.log('hey!');
        const radioWrapper = event.target.closest('.likert');
        const labels = radioWrapper.querySelectorAll('label');
        labels.forEach(label => label.style.backgroundColor = "#fff");
        event.target.labels[0].style.backgroundColor = "#14143c";
    }*/

function highlightLabel(event) {
    console.log('Label clicked');
    const radioWrapper = event.target.closest('.likert');
    const labels = radioWrapper.querySelectorAll('label');
	const q = event.target.name;
    // Reset background for all labels
    labels.forEach(label => {
        label.style.backgroundColor = "#fff";
        label.style.backgroundImage = "none"; // Remove background image from all labels
        label.style.border = "2px solid #14143c"; // Restore the border color
    });

    // Highlight the clicked label
    const selectedLabel = event.target.labels[0];
    selectedLabel.style.backgroundColor = "#14143c";
    selectedLabel.style.backgroundImage = "url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 8 8%27%3e%3cpath fill=%27%23FFF%27 d=%27M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z%27/%3e%3c/svg%3e')";
    selectedLabel.style.backgroundRepeat = "no-repeat";
    selectedLabel.style.backgroundPosition = "center";
    selectedLabel.style.backgroundSize = "10px 10px"; // Adjust size of checkmark
    selectedLabel.style.border = "2px solid #14143c"; // Ensure border remains visible
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
	const qPretext = preOrPost === "pre" ? "Før du har taget modulet, " : "Efter du har taget modulet., ";
  
  const form = document.createElement('form');
  form.id = "likertForm";
  form.style.margin = "20px";
  form.innerHTML = `<div style="font-weight: bold;">${formHeading} for ${courseName}</div><p>${formMessage}</p><br>`;
  
  questions.forEach((questionText, index) => {
	const questionDiv = document.createElement('div');
	questionDiv.className = "question";
	const questionP = document.createElement('p');qPretext
	questionP.innerHTML = `${qPretext}${questionText}`;
	questionDiv.appendChild(questionP);
	const likert = createLikertScale(questionText, min[index], max[index], `question${index + 1}`);
	questionDiv.appendChild(likert);
	form.appendChild(questionDiv);
  });
  
  form.appendChild(createSubmitButton());
  form.onsubmit = event => checkData(event, false);
  parentElement.appendChild(form);
  addListenersToRadioButtons(form);
}

// Create Likert scale options for each question
// Create Likert scale options for each question
function createLikertScale(questionText, minText, maxText, name) {
    const likert = document.createElement('div');
    likert.className = "likert";
    likert.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin: 10px 0 20px 0;";
    
    // Add the minText label on the left
    likert.innerHTML = `<span style="width: 10%; text-align: left;">${minText}</span>`;
    
    // Create a container for the radio buttons and labels
    const radioContainer = document.createElement('div');
    radioContainer.style.cssText = "position: relative; display: flex; justify-content: space-between; flex-grow: 1; margin: 10px;";
    
    // Create and append the radio buttons with labels
    for (let i = 1; i <= 5; i++) {
        const radioId = `${name}-${i}`;
        radioContainer.appendChild(createRadioButton(name, radioId, i));
    }

    // Add the connecting line, placing it behind the labels and radio buttons
    const line = document.createElement('div');
    line.style.cssText = `
        position: absolute; 
        width: 100%; 
        height: 2px; 
        top: 50%; 
        background-color: #14143c; 
        z-index: 0; /* Ensures it's behind the labels */
    `;
    radioContainer.appendChild(line);

    // Append the radio button container to the likert div
    likert.appendChild(radioContainer);
    
    // Add the maxText label on the right
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
    radioInput.style.display = "none"; // Hide the actual radio button
  
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.style.cssText = `
        display: inline-block; 
        width: 20px; 
        height: 20px; 
        border-radius: 50%; 
        background-color: #fff; 
        border: 2px solid #14143c; 
        position: relative; /* Ensure z-index works */
        z-index: 1; /* Keep the label in front of the line */
    `;

    // Create the radio button wrapper
    const radioWrapper = document.createElement('div');
    radioWrapper.style.cssText = `
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 20px; /* Match the label height to avoid the extra 26px */
    `;
    
    radioWrapper.appendChild(radioInput);
    radioWrapper.appendChild(label);

    return radioWrapper;
}

/*function createLikertScale(questionText, minText, maxText, name) {
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
}*/

// Create a single radio button for the Likert scale
/*function createRadioButton(name, id, value) {
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
  	radioWrapper.innerHTML += '<label for="' + id + '" style="display: inline-block;width: 20px;height: 20px;border-radius: 50%;background-color: #fff;; border: 2px solid #14143c;"></label>';
  	radioWrapper.className = "radioWrapper";
  	return radioWrapper;
}*/


// Highlight the label when a radio button is clicked

function addListenersToRadioButtons(form) {
	console.log('addListenersToRadioButtons');
  	const inputs = form.querySelectorAll('input[type="radio"]');
	inputs.forEach(input => {
    		input.addEventListener('click', highlightLabel);
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
