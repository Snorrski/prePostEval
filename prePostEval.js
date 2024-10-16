// Initialize global variables
console.log("prePostEval-12:50")
var lmsAPI = window.parent.parent;
var p = GetPlayer();
var iframe = window.parent.document.querySelector(`iframe[name="${window.name}"]`);
var parentElement = iframe.parentElement;
var checked = [];
const questions = JSON.parse(p.GetVar('questions').replace(/'/g, '"'));
const min = JSON.parse(p.GetVar('min').replace(/'/g, '"'));
const max = JSON.parse(p.GetVar('max').replace(/'/g, '"'));
const courseName = window.parent.document.querySelector('.nav-sidebar-header__title').text;
const loadingDiv = document.createElement('div');
loadingDiv.id = 'loading';
const form = document.createElement('form');
form.id = "likertForm";

// Adjust iframe style
function adjustIframe() {
  	parentElement.style.cssText = "height: auto; padding: 0;";
  	iframe.style.display = "none";
}

// Add loading symbol
function showLoading(loading) {
    // Create a spinner (you can customize this as needed)
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.cssText = `
        border: 5px solid #f3f3f3;
        border-top: 5px solid #14143c;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    `;

    loadingDiv.appendChild(spinner);
	if (loading) {
		loadingDiv.style.cssText = `
		        display: flex;
		        justify-content: center;
		        align-items: center;
		        height: 100px;
		        margin-top: 20px;
		`;
		parentElement.appendChild(loadingDiv);
	} else {
		loadingDiv.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.3); /* Semi-transparent background */
   			border-radius:15px;
			display: flex;
		    	justify-content: center;
    			align-items: center;
    			z-index: 1000; /* Ensure it overlaps everything else */
  		`;
		form.appendChild(loadingDiv);
	}
    
}

// Remove loading symbol
function hideLoading() {
    //const loadingDiv = document.getElementById('loading');
	console.log(loadingDiv);
    if (loadingDiv) {
        parentElement.removeChild(loadingDiv);
    }
}

// Add CSS for spinner animation (you could add this to a <style> tag)
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

function highlightLabel(event) {
	//console.log('Label clicked');
    const radioWrapper = event.target.closest('.likert');
    const labels = radioWrapper.querySelectorAll('label');
	const q = event.target.name;
	if (!checked.includes(q)) {
		checked.push(q);
		/*if (checked.length === questions.length) {
			const submitBtn = document.getElementById('submitBtn');
			submitBtn.disabled = false;
			submitBtn.style.cursor = "pointer";
			submitBtn.style.background = "#14143c";
			console.log("enabled");
		}*/
	};
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
	console.log(data.data);
  	if (check) {
    	data.message !== "answered" ? buildForm() : thankYou(check);
  	} else {
	  	thankYou(check)
  	}
}

// Prepare the data and send it to the API
// Modify checkData to handle incomplete form submissions
function checkData(event = null, check = true) {
	if (event) event.preventDefault();
	if (event) console.log(event)
    //if (event && event.preventDefault) event.preventDefault();
    
    // Clear any previous warning messages
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) {
        warningMessage.remove();
    }
    
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
    console.log(checked);

    // If the form is being checked (not submitting) or all questions are answered, proceed
    if (check || checked.length === questions.length) {
        // If submitting, gather form data
        if (!check && event) {
            const formData = new FormData(event.target);
            formData.forEach((value, key) => jsonData[key] = value);
        }

        sendDataToAPI(jsonData, check);
    } else {
        // If not all questions are answered, display a warning message
        const form = event.target;
        const warning = document.createElement('div');
        warning.id = 'warningMessage';
        warning.style.cssText = "color: red; text-align: center; margin-top: 10px;";
        warning.textContent = "Du skal udfylde alle fem spørgsmål, før du kan gemme dit svar.";
        form.appendChild(warning);
    }
}


/*function checkData(event = null, check = true) {
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
	console.log(checked);
  	if (!check && event && checked.length === questions.length) {
		const formData = new FormData(event.target);
    	formData.forEach((value, key) => jsonData[key] = value);  
  	}
	if (check || checked.length === questions.length) {
		sendDataToAPI(jsonData, check);
	}
}*/

// Build the Likert scale form
function buildForm() {
	hideLoading();
  	const preOrPost = p.GetVar('preOrPost');
  	const formHeading = preOrPost === "pre" ? "Præmåling" : "Postmåling";
  	const formMessage = preOrPost === "pre" ?
  		'Før du gennemfører modulet, vil vi gerne have dig til at vurdere <i>din egen</i> viden, ekspertise og fortrolighed med emnet:' :
  		'Efter du har gennemført modulet, vil vi gerne have dig til <i>igen</i> at vurdere din egen viden, ekspertise og fortrolighed med emnet:';
	const qPretext = preOrPost === "pre" ? "Før du har taget modulet, " : "Efter du har taget modulet, ";
  
  form.style.cssText = "padding: 20px; border: 1px solid #14143c; border-radius: 15px; position: relative;";
	form.className = "block-text"
  form.innerHTML = `<div style="font-weight: bold;">${formHeading} for ${courseName}</div><p>${formMessage}</p><br>`;
  
  questions.forEach((questionText, index) => {
	const questionDiv = document.createElement('div');
	questionDiv.className = "question";
	const questionP = document.createElement('p');
	questionP.innerHTML = `${qPretext}${questionText}`;
	  questionP.style.cssText= "margin-bottom: 0; padding-top: 1rem;";
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
function createLikertScale(questionText, minText, maxText, name) {
    const likert = document.createElement('div');
    likert.className = "likert";
    likert.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin: 10px 0 20px 0;";
    
    // Add the minText label on the left
    //likert.innerHTML = `<span style="width: 10%; text-align: left;">${minText}</span>`;
    const minLabel = document.createElement('span');
	minLabel.style.cssText = "width: 10%; text-align: left;";
	minLabel.textContent = minText;
	likert.appendChild(minLabel);	
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
    line.style.cssText = "position: absolute; width: 100%; height: 2px; top: 49%; background-color: #14143c; z-index: 0;"
    //radioContainer.appendChild(line);
	radioContainer.insertBefore(line, radioContainer.firstChild); 
    // Append the radio button container to the likert div
    likert.appendChild(radioContainer);
    
    // Add the maxText label on the right
    const maxLabel = document.createElement('span');
	maxLabel.style.cssText = "width: 10%; text-align: right;";
	maxLabel.textContent = maxText;
	likert.appendChild(maxLabel);
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
		cursor: pointer;
        position: relative; /* Ensure z-index works */
        z-index: 1; /* Keep the label in front of the line */
    `;

    // Create the radio button wrapper
	const radioWrapper = document.createElement('div');
   		radioWrapper.style.cssText = `
    	display: flex; 
    	justify-content: center; 
    	align-items: center; 
    	height: 20px; /* Match the label height to avoid extra height */
	`;

    radioWrapper.appendChild(radioInput);
    radioWrapper.appendChild(label);
    return radioWrapper;
}

// Highlight the label when a radio button is clicked

function addListenersToRadioButtons(form) {
    // Add 'click' event listener to radio buttons
    const inputs = form.querySelectorAll('input[type="radio"]');
    inputs.forEach(input => {
        input.addEventListener('click', highlightLabel);
    });

    // Add 'focusout' event listener to the form
    form.addEventListener('focusout', function(event) {
	console.log('focusOut added');
        // Check if the focus is moving outside the form
        if (!form.contains(event.relatedTarget)) {
            console.log('Focus left the form, submitting...');
		submitForm;
            //form.submit();  // Trigger form submission
        }
    });
}

// Create a submit button for the form
function createSubmitButton() {
	const btnDiv = document.createElement('div');
	btnDiv.style.cssText = "display: flex; justify-content: center;";
	const btn = document.createElement('button');
	btn.style.cssText = "background: #14143c; color: #fff; padding: 0.5em 2em; border-radius: 5px;cursor: pointer;";
	btn.onclick = submitForm;
	//btnDiv.appendChild(btn);
	btnDiv.innerHTML = '<input id="submitBtn" style="background: #14143c; color: #fff; padding: 0.5em 2em; border-radius: 5px; cursor: pointer;" type="submit" value="Gem" />';
	return btnDiv;
}
function submitForm() {
	console.log(checked.length)
	console.log(questions.length)
	if (checked.length === questions.length) {
		form.submit()
	}
	
}

// Display thank you message if the survey is already completed
function thankYou(check) {
	console.log('hide')
	console.log(loadingDiv);
	//hideLoading();
  	const message = p.GetVar('preOrPost') === "pre" ? "præmålingen" : "postmålingen";
	const html = check ? `<div style="color: grey;">Du har allerede udfyldt ${message} for ${courseName}.</div>` : `<div style="color: grey;"><strong>Tak.</strong> Du har udfyldt ${message} for ${courseName}.</div>`;
  	parentElement.innerHTML = html;
}

// Initialize the script
function prePostInit() {
	adjustIframe();
	showLoading(true);
	checkData(null, true);  // Initially check if the survey is already completed
}

prePostInit();
