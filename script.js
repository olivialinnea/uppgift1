"use strict";

const mainUser = {
    id: 2,
    alias: "Olivia",
    favs: [],
};

showMainFirst();
async function showMainFirst(){
    let paintingAr = JSON.parse(localStorage.getItem("Paintings"));
    const data = await userFetching();

    let main = data.message.filter(main => main.id == mainUser.id);

    let mainFavs = data.message.filter(user => user.id == mainUser.id);
  
    let mainFavsInt = mainFavs.map(function(item) {return parseInt(item, 10);});

    document.querySelector("#frameContainer").append(loadingScreen("#frameContainer"));
    console.log(mainFavs);

    return getPaintings(paintingAr, main, mainFavsInt, mainFavs);
}

async function getUserApi(){
    const response = await fetch("http://mpp.erikpineiro.se/dbp/sameTaste/users.php");
    const data = await response.json();

    return data;
};

getUserApi()
    .then (data => showMainFirst(data));

userFetching();
async function userFetching(){
    document.querySelector("#userContainer").innerHTML = "";
    let paintingArray = JSON.parse(localStorage.getItem("Paintings"));
    const data = await getUserApi();

    let users = data.message;
    // localStorage.setItem(`Users`, JSON.stringify(users));

    let sortedUsers = users.sort((a,b) => a.alias > b.alias)

    let main = users.filter(main => main.id == mainUser.id);
    users.unshift(...main);
    users.splice(21, 1);

    let userDiv;
    let mainFavs = users.find(user => user.id == mainUser.id).favs;
    let mainFavsInt = mainFavs.map(function(item) {return parseInt(item, 10);});
    // console.log(main);

    let userLoadingDiv = document.createElement("div");
    userLoadingDiv.classList.add("userLoading");
    userLoadingDiv.innerHTML = `
    <div class="loading"><p>Updating users...<p></div>
    `;
    document.querySelector("#userContainer").append(userLoadingDiv);

    setInterval(() => {
        userLoadingDiv.remove();
    }, 3000);


    sortedUsers.forEach(n => {
        userDiv = document.createElement("div");
        userDiv.classList.add("userDiv");
        document.querySelector("#userContainer").append(userDiv);

        // let mainFav = users.find(user => user.id == mainUser.id).favs;
        let numFavInt = n.favs.map(function(item) {return parseInt(item, 10);});
        let commonFavs = numFavInt.filter(fav => mainFavsInt.includes(fav));
        let commonFavsInt = commonFavs.map(function(item) {return parseInt(item, 10);});

        let common = commonFavsInt.filter(fav => mainFavsInt.includes(fav));

        // let common = n.favs.filter(fav => mainFav.includes(fav));
        // console.log(common)
        // console.log(n);

        if(main[0].id === n.id){
            userDiv.innerHTML = `<span>${n.alias}</span> <span class="length">[${n.favs.length}]</span>`;
        } else {
            userDiv.innerHTML = `<span>${n.alias}</span> <span class="length">[${n.favs.length}]</span><span>(${common.length})</span>`;
        }
        userDiv.addEventListener("click", (e) => {
            document.querySelector("#frameContainer").innerHTML = "";

            var active = document.querySelector(".userSelected");
            active.classList.remove("userSelected");
            document.querySelector("#userContainer").firstChild.classList.add("mainUser");
            e.target.classList.add("userSelected");

            // console.log(userDiv.firstElementChild.innerHTML);
            let clickedUser = n.id;
            // console.log(e.target.firstChild);
            let specificUser = data.message.find(user => user.id == `${clickedUser}`);

            let mainFavPaintings = mainFavs.map(function(item){return parseInt(item,10);});
            let specificUserFavs = specificUser.favs.map(fave => parseInt(fave, 10));
    
            let filteredUserFavs = paintingArray.filter((id) => { 
                let specificClickUser = specificUser.favs.map(fave => parseInt(fave, 10))

                if (specificUser.id == mainUser.id){
                    return mainFavPaintings;
                } else {
                    return specificClickUser.includes((id.objectID));
                }
            });
            getPaintings(filteredUserFavs, specificUser, paintingArray, common, specificUserFavs);
        });
    });

    let allUsers = document.querySelectorAll(".userDiv");
    allUsers[0].classList.add("userSelected");

    return data;
}

// userFetching();

function loadingScreen(whichElement){
    let loadingDiv = document.createElement("div");
    loadingDiv.classList.add("loadingDiv")
    let theList = document.querySelector(`${whichElement}`);
    loadingDiv.innerHTML = `
    <div class="loading">Fetching paintings...</div>
    `;
    theList.append(loadingDiv);

    setInterval(() => {
        loadingDiv.remove();
    }, 2500);
    return loadingDiv;
}

setInterval(function(){
    userFetching();
}, 30000)

async function paintingFetching(){
    if (localStorage.length == 0) {
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
}
paintingFetching();

const storagePaintings = JSON.parse(localStorage.getItem(`Paintings`));


async function getPaintings(paintings, user, allPaintings, mainFav){
    // console.log(user, paintings);
    const response = await fetch("http://mpp.erikpineiro.se/dbp/sameTaste/users.php");
    const data = await response.json();

    let users = await data.message;

    let array;

    if (user.id == mainUser.id){
        array = paintings;
    } else {
        array = paintings;
    }
    // console.log(array);
    // console.log(user);
    // console.log(common);

    array.forEach(pain => {
        let div = document.createElement("div");
        div.classList.add("wrapperDiv");
        document.querySelector("#frameContainer").append(div);
        let frame = document.createElement("div");
        
        let painting = document.createElement("img");
        painting.src = pain.art;

        let titleName = document.createElement("p");
        let aName = document.createElement("p");

        painting.classList.add("painting");
        titleName.classList.add("title");
        aName.classList.add("aristName");
        frame.classList.add("frame");

        frame.append(painting);
        titleName.append(pain.title);
        aName.append(pain.artist);
        div.append(frame, titleName, aName);
        // console.log(pain)

        // console.log(mainFav);

        // if (common.includes(pain.objectID)){
        //     frame.classList.add("sameFavorite");
        // } 

        if (mainFav.includes(pain.objectID)){
            div.classList.add("favorite");
        }

        if (user.id == mainUser.id){
        div.prepend(addFavoriteWork(pain.objectID, user, paintings, users));
        }
    })
}

// getPaintings(storagePaintings);


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

    if (user){
        user = users.find(user => user.id == mainUser.id);
        favoriteArray = user.favs;
    } else {
        favoriteArray = favoritePaintings.map(obj => obj.objectID);
    }

    // console.log(favoriteArray.includes(painID));
    // console.log(favoriteArray);
    let favoriteArrayInt = favoriteArray.map(function(item){ return parseInt(item, 10);});

    if (favoriteArrayInt.includes(painID)){
        button.innerHTML = "REMOVE"
        button.classList.add("remove");
    } else {
        button.innerHTML = "ADD";
        button.classList.add("add");
    }

    button.addEventListener("click", function (e){
        if (button.classList.contains("add")){
            // console.log("add");

            let click = e.target.nextElementSibling.firstElementChild.currentSrc;
            // console.log(e.target);
            // console.log(click);
            // console.log(artWorks);

            let findObjectID = artWorks.find(painting => click == painting.art);
            // console.log(findObjectID);

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
                    window.alert("Max antal favoriter uppnådd!");
                } else if (response.status == 404){
                    console.log("use_ID finns inte i DB");
                    window.alert("Användaren finns inte i databasen.");
                } else if (response.status == 400) {
                    console.log("bad request: various");
                } else if (response.status == 415){
                    console.log("skicka en JSON tack");
                } else if (response.status == 200){
                    console.log("gick att lägga till");
                    let buttonParent = e.target.parentElement;
                    buttonParent.style.boxShadow = "0 0 5px 5px #b5dda4";

                    button.innerHTML = "REMOVE";
                    button.classList.remove("add");
                    button.classList.add("remove");
                } else {
                    return response.json();
                }
            });
        }   else if (button.classList.contains("remove")){
                console.log("remove");
                let click = e.target.nextElementSibling.firstElementChild.currentSrc;
    
                let findObjectID = artWorks.find(painting => click == painting.art);
                console.log(findObjectID.objectID);
    
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
                        let buttonParent = e.target.parentElement;
                        buttonParent.style.boxShadow = "none";

                        button.innerHTML = "ADD";
                        button.classList.remove("remove");
                        button.classList.add("add");
                    }
                    else {
                        return response.json();
                    }
                });
        }
    });
    return button;
}


