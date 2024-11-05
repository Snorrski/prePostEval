// Initialize global variables
console.log("prePostEval-10:00")
var lmsAPI = window.parent.parent;
var p = GetPlayer();
var iframe = window.parent.document.querySelector(`iframe[name="${window.name}"]`);
var parentElement = iframe.parentElement;
const courseName = window.parent.document.querySelector('.nav-sidebar-header__title').text;
var checked = [];

//old
//const questions = JSON.parse(p.GetVar('questions').replace(/'/g, '"'));
//const q3 = courseName.includes('UFST') ? 'hvor bekendt er du med hvordan man anvender ' : 'hvor bekendt er du med hvordan man i UFST anvender ';
//const questionObj = {
//	pre: ['hvordan vil du vurdere dit kendskab til ','hvor sikker er du på din evne til at anvende din viden og færdigheder indenfor ', q3],
//	post: ['hvordan vil du nu vurdere dit kendskab til ','hvor sikker er du nu på din evne til at anvende din viden og færdigheder indenfor ', q3]
//}
//const q3 = courseName.includes('UFST') ? "hvor godt mener du, at du kender UFST's tilgang til Risikostyring? " : 'hvor bekendt er du med hvordan man i UFST anvender ';
//const course = p.GetVar('course');
//const preOrPost = p.GetVar('preOrPost');
//const min = JSON.parse(p.GetVar('min').replace(/'/g, '"'));
//const max = JSON.parse(p.GetVar('max').replace(/'/g, '"'));

const questionObj = {
	pre: ['hvor meget vil du vurdere, at du ved om ','hvor sikker er du på, at du kan bruge din viden og dine færdigheder indenfor ', "hvor godt mener du, at du kender UFST's tilgang til "],
	post: ['hvor meget vil du nu vurdere, at du ved om ','hvor sikker er du nu på, at du kan bruge din viden og dine færdigheder indenfor ', "hvor godt mener du nu, at du kender UFST's tilgang til "]
}

const studentId = lmsAPI.GetStudentID();
const studentName = lmsAPI.GetStudentName();

const course = courseName.includes('UFST') ? courseName.replace('i UFST','') : courseName;
const preOrPost = getPreOrPost();
let done = p.GetVar('done');
const jsonData = {
	name: studentName,
	id: studentId,
	courseName,
	check: true,
	"pre/post": preOrPost
};
const questions = preOrPost === "pre" ? questionObj.pre : questionObj.post;
const min = ['Meget lidt', 'Meget usikker', 'Slet ikke'];
const max = ['Rigtig meget', 'Meget sikker', 'Rigtig godt'];
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
    const loadingDiv = window.parent.document.getElementById('loading');
    if (loadingDiv) {
		console.log('hiding');
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
    .line-style {
	    position: absolute; 
	    width: 100%; 
	    height: 15%; 
	    top: 45%; 
	    background-color: #14143c; 
	    z-index: 0;
	}
`;
style.id = "customStyle";
document.head.appendChild(style);
window.parent.document.head.appendChild(style);
function highlightLabel(event) {
	//console.log('Label clicked');
    const radioWrapper = event.target.closest('.likert');
    const labels = radioWrapper.querySelectorAll('label');
	const q = event.target.name;
	console.log(checked)
	if (!checked.includes(q)) {
		checked.push(q);
		if (checked.length === questions.length) {
			const submitBtn = window.parent.document.getElementById('submitBtn');
			submitBtn.disabled = false;
			submitBtn.style.cssText += "cursor: pointer; background: #14143c; font-weight: bold; color: white;";
			console.log("enabled");
		}
	};
	console.log(checked)
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
	console.log(JSON.stringify(jsonData));
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
	  	thankYou(check);
		p.SetVar('done', true);
  	}
}

// Prepare the data and send it to the API
// Modify checkData to handle incomplete form submissions
function checkData(event = null, check = true) {
	if (event) event.preventDefault();
	if (event) console.log(event)
    //if (event && event.preventDefault) event.preventDefault();
    console.log(event)
	console.log(check)
    // Clear any previous warning messages
    const warningMessage = document.getElementById('warningMessage');
    if (warningMessage) {
        warningMessage.remove();
    }
	jsonData.check = check;
    console.log(jsonData);
    console.log(checked.length);
	console.log(questions.length);	
    // If the form is being checked (not submitting) or all questions are answered, proceed
    if (check || checked.length === questions.length) {
        // If submitting, gather form data
        if (!check && event) {
			showLoading(false);
            const formData = new FormData(event.target);
            formData.forEach((value, key) => {
		    	const modifiedKey = `${key}-${preOrPost}`; // Modify the key
		    	jsonData[modifiedKey] = value; // Use the modified key
				console.log(modifiedKey)
				console.log(value)
			});
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

// Build the Likert scale form
function buildForm() {
	hideLoading();
  	//const preOrPost = p.GetVar('preOrPost');
  	const formHeading = preOrPost === "pre" ? "Før-måling" : "Efter-måling";
  	const formMessage = preOrPost === "pre" ?
  		'Før du gennemfører modulet, vil vi gerne have dig til at vurdere <i>din egen</i> viden, ekspertise og fortrolighed med emnet, med særligt fokus på hvordan det anvendes i UFST:' :
  		'Du har nu gernnemført det faglige indhold i modulet. Før du går videre til afrundingen, vil vi gerne have dig til <i>igen</i> at vurdere din egen viden, ekspertise og fortrolighed med emnet, med særligt fokus på hvordan det anvendes i UFST:';
	const qPretext = preOrPost === "pre" ? "Før du starter på modulet, " : "Efter du har taget modulet, ";
	form.style.cssText = "padding: 20px 20px 50px 20px; border: 1px solid #14143c; position: relative;";
	form.className = "block-text";
	form.innerHTML = `<div style="font-weight: bold; ">${formHeading} for ${courseName}</div><p style="line-height: 1.3;">${formMessage}</p>`;
  
  questions.forEach((questionText, index) => {
	const questionDiv = document.createElement('div');
	questionDiv.className = "question";
	  questionDiv.marginBottom = "30px";
	const questionP = document.createElement('p');
	questionP.innerHTML = `${qPretext}${questionText}${course}?`;
	  questionP.style.cssText= "margin-bottom: 0; padding-top: 1rem; line-height: 1.3;";
	questionDiv.appendChild(questionP);
	const likert = createLikertScale(questionText, min[index], max[index], `question${index + 1}`);
	questionDiv.appendChild(likert);
	form.appendChild(questionDiv);
  });
  
  form.appendChild(createSubmitButton());
  form.onsubmit = event => checkData(event, false);
  parentElement.appendChild(form);
	if (preOrPost === "post") checkCompletion(form);
  addListenersToRadioButtons(form);
}

// Create Likert scale options for each question
function createLikertScale(questionText, minText, maxText, name) {
    const likert = document.createElement('div');
    likert.className = "likert";
    likert.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin: 10px 0 25px 0;";
    
    // Add the minText label on the left
    
    const minLabel = document.createElement('span');
	minLabel.style.cssText = "width: 9%; font-weight: bold; text-align: right;line-height: 1.3; margin-right: 10px";
	//minLabel.textContent = minText;
	minLabel.innerHTML = minText.replace(' ', '<br>');
	likert.appendChild(minLabel);	
    // Create a container for the radio buttons and labels
    const radioContainer = document.createElement('div');
    radioContainer.style.cssText = "position: relative; display: flex; justify-content: space-between; flex-grow: 1; margin: 10px 0;";
    
    // Create and append the radio buttons with labels
    for (let i = 1; i <= 7; i++) {
        const radioId = `${name}-${i}`;
        radioContainer.appendChild(createRadioButton(name, radioId, i));
    }

    // Add the connecting line, placing it behind the labels and radio buttons
    const line = document.createElement('div');
	line.className = "line-style";
    //line.style.cssText = "position: absolute; width: 100%; height: 3px; top: 44%; background-color: #14143c; z-index: 0;"
    //radioContainer.appendChild(line);
	radioContainer.insertBefore(line, radioContainer.firstChild); 
    // Append the radio button container to the likert div
    likert.appendChild(radioContainer);
    
    // Add the maxText label on the right
    const maxLabel = document.createElement('span');
	maxLabel.style.cssText = "width: 9%; font-weight: bold; margin-left: 10px; text-align: left;line-height: 1.3;";
	maxLabel.innerHTML = maxText.replace(' ', '<br>');
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
	btnDiv.innerHTML = '<input id="submitBtn" disabled style="position: absolute; bottom: 0; width: 100%; background: #72728A; color: #D0D0D8; padding: 0.5em 0;" type="submit" value="Gem" />';
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
	console.log(loadingDiv);
	const message = preOrPost === "pre" ? "før-målingen" : "efter-målingen";
	if (check) p.SetVar('done', true);
	//const html = check ? `<div style="color: grey;">Du har allerede udfyldt ${message} for ${courseName}.</div>` : `<div style="color: grey;"><strong>Tak.</strong> Du har udfyldt ${message} for ${courseName}.</div>`;
  	//form.innerHTML = html;
	check ? parentElement.innerHTML = `<div style="color: grey;">Du har allerede udfyldt ${message} for ${courseName}.</div>` : form.innerHTML = `<div style="color: grey;"><strong>Tak.</strong> Du har udfyldt ${message} for ${courseName}.</div>`;
	hideLoading();
}

// Initialize the script
function prePostInit() {
	adjustIframe();
	showLoading(true);
	checkData(null, true);  // Initially check if the survey is already completed
}
function getPreOrPost() {
	const menuItemName = window.parent.document.querySelector('.lesson-header__title').textContent
	const menuItems = []
	window.parent.document.querySelector('.nav-sidebar__outline-list').getElementsByClassName('nav-sidebar__outline-list-item').forEach(item => {menuItems.push(item.textContent)})
	const pORp = menuItems.indexOf(menuItemName) < menuItems.length/2 ? "pre" : "post";
	return pORp;
}
function checkCompletion(el) {
	let arr = Array.from(window.parent.document.querySelectorAll('button.lesson-progress__action'))
	arr.pop();
	let test = arr.every(btn => btn.getAttribute('aria-label') == "Completed. Click to reset");
	if (!test) {
		const overlay = document.createElement('div');
		overlay.id = "customOverlay";
	    	overlay.style.cssText = `
		        position: absolute;
		        top: 0;
		        left: 0;
		        width: 100%;
		        height: 100%;
		        background-color: rgba(0, 0, 0, 0.5); /* 50% opacity gray */
		        display: flex;
		        justify-content: center;
		        align-items: center;
		 		text-align: center;
		        color: white;
		        font-size: 1.5em;
		        font-weight: bold;
		        z-index: 1000; /* Ensure overlay is above form content */
		    `;
	    // Add centered message text
	    overlay.textContent = "Du skal gennemgå hele modulet før du udfylder post-evalueringen.";
	
	    // Append overlay to the form
	    form.style.position = 'relative'; // Ensure form has relative positioning
		form.insertBefore(overlay,form.children[0]);
	} else if (window.parent.document.getElementById('overlay')) {
		window.parent.document.getElementById('overlay').style.display = "none";
	}
}
prePostInit();
