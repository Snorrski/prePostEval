// Initialize global variables
console.log("saveNoteData-11:48")

var lmsAPI = window.parent.parent;
const t =  window.parent.document.getElementsByClassName('nav-sidebar-header__title')[0].innerText;
console.log(window.name);
var d; 
const lessonTitle = window.parent.document.getElementsByClassName('lesson-header__title')[0].innerText;
const courseName =  window.parent.document.getElementsByClassName('nav-sidebar-header__title')[0].innerText;
const course_id = courseName.trim().replace(/ /g, "_").replace(/-/g, "_").replace(/,/g, "_").toLowerCase();
const ifrm = window.parent.document.querySelector('iframe[name="' + window.name + '"]');
const studentId = lmsAPI.GetStudentID();
const studentName = lmsAPI.GetStudentName();
let sendData = {
    userData: {},
    user_id: studentId,
    user_name: studentName,
    course_id: course_id,
    course_name: courseName,
	getOrSet: "get"
};
let userData = {};
saveNoteData(sendData).then(result => {
    console.log(result);
    console.log(result.data.userData);
    console.log(typeof result.data.userData);
    if (result && result.data.userData) {
        sendData.userData = JSON.parse(result.data.userData);
        userData = sendData.userData;
	    console.log(userData)
	    d = userData;
	    if (d!=="") {generateContainers()} else {generateContainersNoInput()}
    }
});


var p = GetPlayer();
var srcObj = {
	JSZip:'https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js',
	saveAs: 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
	htmlDocx: 'https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.js'
};
for (let key in srcObj) {
	if(typeof window[key] == "undefined") {
		console.log('add ' + key + ' at init');
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = srcObj[key]; 
		$('head').append(script);
	}
};

//var parentEl = ifrm.parentElement;
//const targetContainer = parentEl.parentElement;
//parentEl.style.cssText = "height: auto; padding: 0; display:none;";
const parentEl = ifrm.parentElement;
parentEl.style.height = "auto";
parentEl.style.paddingBottom = 0;
parentEl.parentElement.style.padding = 0;
ifrm.style.display = "none";
const containerEl = document.createElement('div');
containerEl.id = "newContainer";

function generateContainers() {
	containerEl.setAttribute("style", "position: relative; margin: 0px; padding: 20px 20px 50px; border: 1px solid #001e3c; border-radius: 0px;");

	const printDiv = document.createElement('div');
	printDiv.id = "printMe";	
	printDiv.style.marginBottom = "1.1em";
	printDiv.innerHTML = '<h3 style="font-size:1.2em"><b>Dine noter for '+t+'</b></h3><p></p><br>';
	//printDiv.innerHTML = '<h3 style="font-size:1.2em"><b>'+p.GetVar("header")+'</b></h3><p>'+p.GetVar("intro_body")+'</p><br>';
	containerEl.appendChild(printDiv);
	
	const gemBtn = document.createElement('button');
	gemBtn.className = "usrBtns";
	gemBtn.id = "gemBtn";
	gemBtn.innerText = "Gem";
	gemBtn.addEventListener('click', saveData, false);
	gemBtn.setAttribute("style", "position: absolute; bottom: 0; left: 0; width: 100%; background-color: #001e3c; border: none; color: white; padding: 0.5em 0; text-align: center; display: inline-block; cursor: pointer;")
	containerEl.appendChild(gemBtn);
	parentEl.appendChild(containerEl);
	loadInput(printDiv);
}
function generateContainersNoInput() {
	var containerEl = document.createElement('div')
	containerEl.id = "newContainer";
	containerEl.setAttribute("style", "margin: 10px; padding: 20px; border: 1px solid #001e3c; border-radius: 10px;");

	var printDiv = document.createElement('div');
	printDiv.id = "printMe";
	printDiv.style.marginBottom = "1.1em";
	printDiv.innerHTML = '<h3 style="font-size:1.2em"><b>Du har ikke indtastet noget</b></h3><p></p><br>';
	//printDiv.innerHTML = '<h3 style="font-size:1.2em"><b>Du har ikke indtastet noget</b></h3><p>'+p.GetVar("intro_body")+'</p><br>';
	containerEl.appendChild(printDiv);
	targetContainer.appendChild(containerEl);
}
function arrayRemove(arr, value) {
	return arr.filter(function(ele){ 
		return ele != value; 
	});
}

function loadInput(printMe) {
	//var printMe = window.parent.document.getElementById('printMe');
	console.log(printMe)
	
	if (printMe) {
		let html = `<p style="font-weight: bold; font-size: large;">Noter: ${courseName}</p><p>Her finder du dine noter om ${courseName}, inddelt efter emnerne i modulet.</p><br>`;
		for (let subj in userData) {
			html += '<div><h4 style="font-weight: bold; margin: 1em 0 0 0;">'+subj+'</h4><p>' + userData[subj] + '</p></div>';
		};
		console.log(html)
		printMe.innerHTML = html
		d = userData;
	} else {console.log("waiting");};
};

function printData(evt) {
	//var divToPrint = evt.currentTarget.printDiv;
	var printContent = window.parent.document.getElementById('printMe');
	
	var windowUrl = 'Job Receipt';
	var uniqueName = new Date();
	var windowName = 'Print' + uniqueName.getTime();
	var printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
	printWindow.document.write(printContent.innerHTML);
	printWindow.document.close();
	printWindow.focus();
	printWindow.print();
	printWindow.close();
};
function saveData() {	
	var srcObj = {
		JSZip:'https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js',
		saveAs: 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
		htmlDocx: 'https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.js'
	};
	var srcKey = Object.keys(srcObj);
	for (var i = 0; i<srcKey.length;i++) {
		if(typeof window[srcKey[i]] == "undefined") {
			console.log('add ' + srcKey[i]);
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = srcObj[srcKey[i]]; 
			$('head').append(script);
		} else  {console.log(srcKey[i] + ' already added')};
	};
	
	var content = '<!DOCTYPE html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>'+parent.window.document.getElementById('printMe').outerHTML + '<table></table></body></html>';
	setTimeout(function(){
		var converted = htmlDocx.asBlob(content);
		saveAs(converted, 'Mine noter om '+t+'.docx');
	},100);
};

async function saveNoteData(obj) {
    const sendObj = Object.assign({}, obj);
    console.log(sendObj);
    sendObj.userData = JSON.stringify(sendObj.userData);
    console.log(sendObj);
    try {
	//const response = await fetch('https://prod-100.westeurope.logic.azure.com:443/workflows/229877fe5ea549e48b60b451f9be3a75/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=OVWh71fyW6ea3JgurFVBFhmbCppcDRC2yrBaMHQdTtk', {
        const response = await fetch('https://prod-115.westeurope.logic.azure.com:443/workflows/b003239656634116ade3badb0af27eab/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pKpSDjY3kS4p_Q5DCwzP588whroaJe0xcmubkOcyoUE', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sendObj),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full Data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

//setInterval(loadInput,200);
