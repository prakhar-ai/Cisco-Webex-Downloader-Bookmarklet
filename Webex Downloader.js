javascript:(function(){
let REGEX = /^https?:\/\/(.+?)\.webex\.com\/(?:recordingservice|webappng)\/sites\/(.+?)\/recording\/(?:play|playback)\/([a-f0-9]{32})/g;
let match = REGEX.exec(location.href);
let subdomain = match[1];
let sitename = match[2];
let recording_id = match[3];
function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  }
let Password = prompt("Enter Recording Password: ");
fetch(`https://${subdomain}.webex.com/webappng/api/v1/recordings/${recording_id}/stream?siteurl=${sitename}`,{
    headers : {
      "accept": "application/json, text/plain, */*",
      "accesspwd" : Password
    }
  })
    .then(response => response.json())
    .then(data => {
        let host = data["mp4StreamOption"]["host"];
        let recording_dir = data["mp4StreamOption"]["recordingDir"];
        let timestamp = data["mp4StreamOption"]["timestamp"];
        let token = data["mp4StreamOption"]["token"];
        let xml_name = data["mp4StreamOption"]["xmlName"];
        let playback_option = data["mp4StreamOption"]["playbackOption"];
        let meeting_name = data["recordName"];
        fetch(`${host}/apis/html5-pipeline.do?recordingDir=${recording_dir}&timestamp=${timestamp}&token=${token}&xmlName=${xml_name}&isMobileOrTablet=false&ext=${playback_option}`)
            .then(response => response.text())
            .then(text => (new window.DOMParser()).parseFromString(text, "text/xml"))
            .then(data => {
                let filename = data.getElementsByTagName("Sequence")[0].textContent;
                let mp4Url = `${host}/apis/download.do?recordingDir=${recording_dir}&timestamp=${timestamp}&token=${token}&fileName=${filename}`;
                downloadURI(mp4Url,"Download.mp4")
            })
            .catch(exception => {
                console.log("Error")
            });
    })
    .catch(exception => {
        console.log("Error")
    });
})();