"use strict";

const mainUser = {
    id: 2,
    alias: "Olivia",
    favs: [],
}

async function userFetching(){
    document.querySelector("#userContainer").innerHTML = "";
    const response = await fetch("http://mpp.erikpineiro.se/dbp/sameTaste/users.php");
    const data = await response.json();

    let users = data.message;
    // localStorage.setItem(`Users`, JSON.stringify(users));

    let sortedUsers = users.sort((a,b) => a.alias > b.alias)

    let main = users.filter(main => main.id == mainUser.id);
    users.unshift(...main);
    users.splice(21, 1);

    let userDiv;

    sortedUsers.forEach(n => {
        userDiv = document.createElement("div");
        userDiv.classList.add("userDiv");
        document.querySelector("#userContainer").append(userDiv);
        document.querySelector("#userContainer").firstChild.classList.add("mainUser");

        let mainFav = users.find(user => user.id == mainUser.id).favs;

        let common = n.favs.filter(fav => mainFav.includes(fav));

        console.log(common.length);

        userDiv.innerHTML = `<span>${n.alias}</span> <span class="length">[${n.favs.length}]</span><span>(${common.length})</span>`;

        userDiv.addEventListener("click", (e) => {
            document.querySelector("#frameContainer").innerHTML = "";
            let clickedUser = e.target.firstChild.innerHTML;
            let specificUser = data.message.find(user => user.alias == `${clickedUser}`);
    
            let filteredUserFavs = paintingArray.filter((id) => { 
                let specificClickUser = specificUser.favs.map(fave => parseInt(fave, 10))
    
                return specificClickUser.includes((id.objectID))
            });
    
            getPaintings(filteredUserFavs, specificUser);
        });
    });

    let paintingArray = JSON.parse(localStorage.getItem("Paintings"));

    return data;
}

userFetching();

function loadingScreen(whichElement){
    let loadingDiv = document.createElement("div");
    let theList = document.querySelector(`${whichElement}`);
    let darkDiv = document.createElement("div");
    loadingDiv.innerHTML = `
    <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
    `;

    darkDiv.classList.add("darkDiv");
    theList.append(darkDiv);
    darkDiv.append(loadingDiv);

    setInterval(() => {
        loadingDiv.remove();
        darkDiv.remove();
    }, 3000);
    return loadingDiv;
}

setInterval(function(){
    userFetching();
}, 30000)

async function paintingFetching(){
    const response = await fetch(new Request('https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=11&q=snow'));
    const data = await response.json();

    let artArray = [];

    for (let i = 0; i < data.objectIDs.length; i++){
        let id = data.objectIDs[i];

        let art = getArtInfo(id);
        artArray.push(art);
    }

    let artWorksPromises = await Promise.all(artArray);
    let artWorksResponse = artWorksPromises.map(response => response.json())
    let artWorks = await Promise.all(artWorksResponse);

    let sortedArtWorks = artWorks.sort((a,b) => a.artistDisplayName > b.artistDisplayName);

    const mappedArtWorks = sortedArtWorks.map(obj => { return {
        objectID: obj.objectID,
        art: obj.primaryImageSmall,
        title: obj.title,
        artist: obj.artistDisplayName
    }});

    let stringedObj = JSON.stringify(mappedArtWorks);
    localStorage.setItem(`Paintings`,`${stringedObj}`);
}
paintingFetching();

const storagePaintings = JSON.parse(localStorage.getItem(`Paintings`));


async function getPaintings(paintings, user){

    const response = await fetch("http://mpp.erikpineiro.se/dbp/sameTaste/users.php");
    const data = await response.json();

    let users = await data.message;

    paintings.forEach(pain => {
        let div = document.createElement("div");
        div.classList.add("wrapperDiv");
        document.querySelector("#frameContainer").append(div);
        
        let painting = document.createElement("img");
        painting.src = pain.art;

        let titleName = document.createElement("p");
        let aName = document.createElement("p");

        painting.classList.add("painting");
        titleName.classList.add("title");
        aName.classList.add("aristName");

        titleName.append(pain.title);
        aName.append(pain.artist);
        div.append(painting, titleName, aName); 
        div.prepend(addFavoriteWork(pain.objectID, user, paintings, users));
    })
}

getPaintings(storagePaintings);


async function getArtInfo(objID){
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objID}`;
    const rqst = await new Request(url);
    const response = fetch(rqst);

    return response;
}


function addFavoriteWork(painID, user, favoritePaintings, users){
    let button = document.createElement("button");
    let artWorks = JSON.parse(localStorage.getItem("Paintings"));

    // localStorage.setItem("Users", users);

    let favoriteArray;

    if (!user){
        user = users.find(user => user.id === mainUser.id);
        favoriteArray = user.favs;
    } else {
        favoriteArray = favoritePaintings.map(obj => obj.objectID);
    }

    console.log(favoriteArray.includes(painID));
    console.log(favoriteArray);

    if (favoriteArray.includes(painID)){
        button.innerHTML = "REMOVE"
        button.classList.add("remove");
    } else {
        button.innerHTML = "ADD";
        button.classList.add("add");
    }

    button.addEventListener("click", function (e){
        if (button.classList.contains("add")){
            console.log("add");

            let click = e.target.nextElementSibling.currentSrc;

            let findObjectID = artWorks.find(painting => click === painting.art);
            console.log(findObjectID.objectID);

            button.innerHTML = "REMOVE";
            button.classList.remove("add");
            button.classList.add("remove");

            document.querySelector("#userContainer").append(loadingScreen("#userContainer"));

            fetch(new Request("http://mpp.erikpineiro.se/dbp/sameTaste/users.php", {
                method: "PATCH",
                body: JSON.stringify({id: mainUser.id, addFav: findObjectID.objectID}),
                headers: {"Content-type": "application/json; charset=utf-8"},
            }))
            .then( response => {
                userFetching();
                if (response.status == 409){
                    console.log("maximum favs reached");
                } else if (response.status == 404){
                    console.log("use_ID finns inte i DB");
                } else if (response.status == 400) {
                    console.log("bad request: various");
                } else if (response.status == 415){
                    console.log("skicka en JSON tack");
                } else if (response.status == 200){
                    console.log("gick att lägga till");
                } else {
                    return response.json();
                }
            });
        }   else if (button.classList.contains("remove")){
                console.log("remove");
                let click = e.target.nextElementSibling.currentSrc;
    
                let findObjectID = artWorks.find(painting => click == painting.art);
                console.log(findObjectID.objectID);
    
                button.innerHTML = "ADD";
                button.classList.remove("remove");
                button.classList.add("add");
    
                fetch(new Request("http://mpp.erikpineiro.se/dbp/sameTaste/users.php",
                {
                    method: "PATCH",
                    body: JSON.stringify({id: mainUser.id, removeFav: findObjectID.objectID}),
                    headers: {"Content-type": "application/json; charset=UTF-8"},
                }))
                .then ( response => {
                    userFetching();
                    if (response.status == 404){
                        console.log("not found: user_ID ex");
                    } else if (response.status == 400){
                        console.log("bad request, various");
                    } else if (response.status == 415){
                        console.log("skicka en JSON TACK.");
                    } else if (response.status == 200){
                        console.log("borttagning gick bra.");
                    }
                    else {
                        return response.json();
                    }
                });
        }
    });
    return button;
}


