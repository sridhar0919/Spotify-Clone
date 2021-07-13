
let redirect_uri = "index.html";

var clientId = '79d4babdce94446c975a195510b48ada';
var clientSecret = '6e4b0b5e68594b1dab96994c319f7228';

// After agree button is clicked (when loaded it gets executed)
function onPageLoad() {
  // document.body.innerHTML = "";
  if(window.location.search.length > 0) {
    handleRedirect();
  }
}

// while redirecting fetching code value in url
function handleRedirect() {
  let code = getCode();
  fetchAccessToken(code);
  window.history.pushState("", "", redirect_uri); // remove param from url

}

// query paramater for requesting token
function fetchAccessToken(code) {
  let main = `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURI(redirect_uri)}`;
  main += `&client_id=${clientId}&client_secret=${clientSecret}`;
  callAuthorizationApi(main);
}

// Sending API request to fetch access token
async function callAuthorizationApi(main) {
  try {
    let result = await fetch('https://accounts.spotify.com/api/token', {
    method : 'POST',
    headers : {
      'Authorization' : 'Basic ' + btoa(clientId + ":" + clientSecret),
      'Content-Type' : 'application/x-www-form-urlencoded',
      },
    body: `${main}`
    });

    let res = await result.json();
    const token = res.access_token;
    
    // Getting playlist names
    let getPlaylistName = async (token) => {
      const result = await fetch("https://api.spotify.com/v1/users/u3bexdqf9k5hw3yfbiup75yer/playlists", {
        method : 'GET', 
        headers : {
          'Authorization' : 'Bearer ' + token
        }
      });

      const data = await result.json();
      const listDetails = data.items;
      
      let select = document.getElementById('headingPlay');
      
      listDetails.forEach((item) => {
        let option = document.createElement('option');
        option.value = item.name;
        option.innerText = `${item.name}`;
        select.append(option);
      }) 

      let search = document.getElementById('search');

      // Executing content after search button is clicked
      search.addEventListener('click', () => {
        if(select.value == "Best Of Eminem") {
          let div = document.getElementById('himage');
          div.innerHTML = `<img src="${data.items[0].images[0].url}" class="d-inline-block">
                            <div class="d-inline-block img-content">
                              <h4 class="ml-5 text-light">Playlist</h4>
                              <p class="display-4 font-weight-bold  ml-5 text-light">${select.value}</p>
                             </div>`;
          
          let uri = data.items[0].uri.split(":")[2];
          // Calling playlist items api
          search.addEventListener('click', getPlaylistDetails(token, uri));
        }
        else if(select.value == "Beatles") {
          let div = document.getElementById('himage');
          div.innerHTML = `<img src="${data.items[1].images[0].url}" class="d-inline-block">
                          <div class="d-inline-block mt-5">
                            <h4 class="ml-5 text-light">Playlist</h4>
                            <p class="display-4 font-weight-bold  ml-5 text-light">${select.value}</p>
                          </div>`;

          let uri = data.items[1].uri.split(":")[2];
          search.addEventListener('click', getPlaylistDetails(token, uri));
        }
      });
    }

    let getPlaylistDetails = async (token, uri) => {
      
      const result = await fetch(`https://api.spotify.com/v1/playlists/${uri}/tracks`, {
        method : 'GET', 
        headers : {
          'Authorization' : 'Bearer ' + token
        }
      });
      const data = await result.json();
      console.log(data);
      
      let details = document.getElementById('playlist-details');
      let tbody = document.querySelector('tbody');
      tbody.innerHTML = "";
      
      let items = data.items;
      // console.log(items);

      for(let i = 0; i < items.length; i++) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        td.innerHTML = `<i class="fa fa-play-circle fa-2x"></i>`;
        td1.innerText = items[i].track.name;
        let time = items[i].track.duration_ms / 60000;
        td2.innerText = time.toFixed(2);
        tr.append(td,td1,td2);
        tbody.append(tr);
      }


    }

    getPlaylistName(token);
  }
  catch(e) {
    console.log(e);
  }

}

// Getting code value for fetching API
function getCode() {
  let code = null;
  const queryString = window.location.search;
  if(queryString.length > 0) {
    const urlParams = new URLSearchParams(queryString);
    code = urlParams.get('code');
  }
  return code;
}

// Requesting Authorization
function requestAuthorization() {

  let url = 'https://accounts.spotify.com/authorize';
  url += `?client_id=${clientId}&response_type=code&redirect_uri=${encodeURI(redirect_uri)}`;
  url += "&scope=playlist-read-private playlist-read-collaborative user-follow-modify user-follow-read";
  window.location.href = url;
}

