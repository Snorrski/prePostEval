// Initialize global variables
console.log("saveNoteData-13:30")

var lmsAPI = window.parent.parent;
const t =  window.parent.document.getElementsByClassName('nav-sidebar-header__title')[0].innerText;
console.log(window.name);
const ifrm = window.parent.document.querySelector('iframe[name="' + window.name + '"]');
const studentId = lmsAPI.GetStudentID();
const studentName = lmsAPI.GetStudentName();
var d; 
let sendData = {
    userId: studentId,
};
let userData = {};
saveNoteData(sendData).then(result => {
    console.log(result);
    console.log(result.data.userData);
    console.log(typeof result.data.userData);
    if (result && result.data.userData) {
        sendData.userData = JSON.parse(result.data.userData);
        userData = sendData.userData[t];
	    console.log(userData)
	    d = userData;
	    loadInput();
	    if (d!=="") {generateContainers()} else {generateContainersNoInput()}
    }
});


var p = GetPlayer();
var srcObj = {
	JSZip:'https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js',
	saveAs: 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
	htmlDocx: 'https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.js'
};
var srcKey = Object.keys(srcObj);
for (var i = 0; i<srcKey.length;i++) {
	if(typeof window[srcKey[i]] == "undefined") {
		console.log('add ' + srcKey[i] + ' at init');
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.src = srcObj[srcKey[i]]; 
		$('head').append(script);
	}
};

var parentEl = ifrm.parentElement;
const targetCOntainer = parentEl.parentElement;
//parentEl.style.innerHTML = "";
parentEl.style.cssText = "height: auto; padding: 0; display:none;";
function generateContainers() {
	var containerEl = document.createElement('div')
	containerEl.id = "newContainer";
	containerEl.setAttribute("style", "margin: 10px; padding: 20px; border: 1px solid #001e3c; border-radius: 10px;");

	var printDiv = document.createElement('div');
	printDiv.id = "printMe";	
	printDiv.style.marginBottom = "1.1em";
	printDiv.innerHTML = '<h3 style="font-size:1.2em"><b>Dine noter for'+t+'</b></h3><p></p><br>';
	//printDiv.innerHTML = '<h3 style="font-size:1.2em"><b>'+p.GetVar("header")+'</b></h3><p>'+p.GetVar("intro_body")+'</p><br>';
	containerEl.appendChild(printDiv);

	var printBtn = document.createElement('button');
	printBtn.className = "usrBtns";
	printBtn.id = "printBtn";
	printBtn.innerText = "Print";
	printBtn.addEventListener('click', printData, false);
	printBtn.setAttribute("style", "background-color: #001e3c; border: none; color: white; padding: 5px 25px; margin: 5px; text-align: center; border-radius: 5px; display: inline-block; cursor: pointer;")
	containerEl.appendChild(printBtn);
	
	var gemBtn = document.createElement('button');
	gemBtn.className = "usrBtns";
	gemBtn.id = "gemBtn";
	gemBtn.innerText = "Gem";
	gemBtn.addEventListener('click', saveData, false);
	gemBtn.setAttribute("style", "background-color: #001e3c; border: none; color: white; padding: 5px 25px; margin: 5px; text-align: center; border-radius: 5px; display: inline-block; cursor: pointer;")
	containerEl.appendChild(gemBtn);
	
	var endDiv = document.createElement('div');
	endDiv.style.marginTop = "1.1em";
	endDiv.innerHTML = '<h3 style="font-size:1.2em;margin-top: 20"><b>BEMÆRK:</b></h3><p>Når du lukker kurset kan du vælge mellem:</p><p style="text-align: center;"><b>GÅ UD OG AFSLUT</b>   eller  <b> GÅ UD OG FORTSÆT SENERE.</b></p><p>Vælge du at kunne fortsætte senere, markeres modulet ikke som færdigt endnu.<br>Vælger du at afslutte, gemmes dine data ikke længere i kurset. Sørg derfor for at gemme refleksionsarket på egen computer før du afslutter.</p>';
	containerEl.appendChild(endDiv);
	targetCOntainer.appendChild(containerEl);
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
	targetCOntainer.appendChild(containerEl);
}
function arrayRemove(arr, value) {
	return arr.filter(function(ele){ 
		return ele != value; 
	});
}
function loadInput() {
	
	var printMe = window.parent.document.getElementById('printMe');
	if (printMe) {
		if (userData != d) {
			if (userData != "") {
				var subjects = arrayRemove(Object.keys(userData),'JM');
				for (var i = 0; i<subjects.length; i++) {
					if (!window.parent.document.getElementById("usrContnt_"+subjects[i])) {
						printMe.innerHTML += '<div class="usrContnt" id="usrContnt_'+subjects[i]+'"><h4><b>'+subjects[i]+'</b></h4>' + userData[subjects[i]] + '</div>';
					} else {window.parent.document.getElementById("usrContnt_"+subjects[i]).innerHTML = '<h4><b>'+subjects[i]+'</b></h4>' + userData[subjects[i]]};
				};
			};
		};
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
	var extraContent = p.GetVar('extraContent');
	var content = '<!DOCTYPE html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>'+parent.window.document.getElementById('printMe').outerHTML + '<table></table>' + extraContent + '</body></html>';
	setTimeout(function(){
		var converted = htmlDocx.asBlob(content);
		saveAs(converted, 'Mine noter om Hiim & Hippe.docx');
	},100);
};

async function saveNoteData(obj) {
    const sendObj = Object.assign({}, obj);
    sendObj["getOrSet"] = false;
    console.log(sendObj);
    sendObj.userData = JSON.stringify(sendObj.userData);
    console.log(sendObj);
    try {
        const response = await fetch('https://prod-138.westeurope.logic.azure.com:443/workflows/6f8638a8e48d482b9ef535c4fda33cba/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Exdn2JK8CrtQ4Tn2R8HZIEhHxkWIKiYJNkXBgtoDcVM', {
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

//setInterval(loadInput,1000);
