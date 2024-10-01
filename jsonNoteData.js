// Script to save
console.log('14:01');
const lmsAPI = window.parent.parent;
const p = GetPlayer();
/*const srcObj = {
    JSZip: 'https://cdn.jsdelivr.net/npm/jszip@3.7.1/dist/jszip.min.js',
    saveAs: 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js',
    htmlDocx: 'https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.js'
};
const head = document.getElementsByTagName("head")[0];
const srcKey = Object.keys(srcObj);
srcKey.forEach((key) => {
    if (typeof window[key] === "undefined") {
        console.log('add ' + key + ' at init');
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = srcObj[key];
        head.appendChild(script);
    }
});*/

const s = window.parent.document.getElementsByClassName('lesson-header__title')[0].innerText;
const ifrm = window.parent.document.querySelector('iframe[name="' + window.name + '"]');
const studentId = lmsAPI.GetStudentID();
const studentName = lmsAPI.GetStudentName();
let sendData = {
    userData: {},
    userId: studentId,
};
let userData = {};
sendData.userData[s] = {"notes": ""};
// Ensure async data is ready before working with it
getSetNotes(sendData, false).then(result => {
    if (result && result.userData && result.userData.hasOwnProperty(s)) {
        sendData.userData = JSON.parse(result.userData);
        inp.innerHTML = sendData.userData[s].notes;
    }
});

const prnt = ifrm.parentElement;
prnt.style.height = "auto";
prnt.style.paddingBottom = 0;
prnt.parentElement.style.padding = 0;
ifrm.style.display = "none";

const div = document.createElement('div');
div.id = "newContainer";
const inp = document.createElement('div');
inp.className = "userInput";
inp.id = s + "_userInput";
inp.contentEditable = "true";
inp.style.cssText = "margin: 10px; padding:  10px; border: 1px solid #001e3c; min-height: 1.5em;";

// Save input on blur event
inp.addEventListener("blur", saveInput);
div.appendChild(inp);
prnt.appendChild(div);

// Save input data
function saveInput(event) {
    sendData.userData[s].notes = this.innerHTML;
    getSetNotes(sendData, true).then(result => {
        console.log('The data I got back:', result);
    });
}

// Define async function to get/set notes
async function getSetNotes(obj, set) {
    obj["getOrSet"] = set;
    obj.userData = JSON.stringify(obj.userData);
    console.log(obj);
    try {
        const response = await fetch('https://prod-138.westeurope.logic.azure.com:443/workflows/6f8638a8e48d482b9ef535c4fda33cba/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Exdn2JK8CrtQ4Tn2R8HZIEhHxkWIKiYJNkXBgtoDcVM', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj),
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
