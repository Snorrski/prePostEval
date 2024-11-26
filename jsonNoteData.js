// Script to save
console.log('11:42');
const lmsAPI = window.parent.parent;
const p = GetPlayer();

const s = window.parent.document.getElementsByClassName('lesson-header__title')[0].innerText;
const t =  window.parent.document.getElementsByClassName('nav-sidebar-header__title')[0].innerText;
const course_id = s.trim().replace(/ /g, "_").replace(/-/g, "_").replace(/,/g, "_").toLowerCase();
const ifrm = window.parent.document.querySelector('iframe[name="' + window.name + '"]');
const studentId = lmsAPI.GetStudentID();
const studentName = lmsAPI.GetStudentName();
let sendData = {
    userData: {},
    user_id: studentId,
    user_name: studentName,
    course_id: course_id,
    course_name: s
};
let userData = {};
sendData.userData[t] = "";
//sendData.userData[t][s] = "";
// Ensure async data is ready before working with it
getSetNotes(sendData, "get").then(result => {
    console.log(result);
    console.log(result.data.userData);
    console.log(typeof result.data.userData);
    if (result && result.data.userData) {
        sendData.userData = JSON.parse(result.data.userData);
        inp.innerHTML = sendData.userData[t];
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
    console.log(sendData.userData)
    sendData.userData[t] = this.innerHTML;
    getSetNotes(sendData, "set").then(result => {
        console.log('The data I got back:', result);
    });
}

// Define async function to get/set notes
async function getSetNotes(obj, set) {
    const sendObj = Object.assign({}, obj);
    sendObj["getOrSet"] = set;
    console.log(sendObj);
    //sendObj.userData = JSON.stringify(sendObj.userData);
    console.log(sendObj);
    try {
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
function jsonNoteData() {}
