const searchInput = document.querySelector('.search-input');
const searchList = document.querySelector(".search-list");
const searchItems = searchList.children;
const cards = document.querySelector(".repos");

const debounce = (fn, debounceTime) => {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, debounceTime)
    }
}

async function sendRequest(input) {
    const url = `https://api.github.com/search/repositories?q=${input}&per_page=5`;
    const response = await fetch(url);
    if (response.ok){
        const result = await response.json();
        return result.items
    }
}

function createListItem() {
    const item = document.createElement("li");
    item.classList.add("search-item");
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("search-button");

    item.append(button);

    const fragment = new DocumentFragment();
    fragment.append(item);
    searchList.append(fragment);
}

async function autoComplete(input) {
    if (input){
        const reposArr = await sendRequest(input);
        reposArr.forEach(() => createListItem());
        while (searchItems.length > reposArr.length) searchList.lastElementChild.remove();
        searchList.classList.remove("search-list--hidden");

        reposArr.forEach ( (repos, index) => {
            const element = searchItems[index].firstElementChild;
            element.textContent = repos.name;

            element.dataset.name = repos.name;
            element.dataset.owner = repos.owner.login;
            element.dataset.stars = repos.stargazers_count;
        })
    }
}

function createCard(button) {
    const data = button.dataset;

    const listItem = document.createElement("li");
    listItem.classList.add("repos-item");
    const card = document.createElement("div");
    const name = document.createElement("p");
    const owner = document.createElement("p");
    const stars = document.createElement("p");
    const closeBtn = document.createElement("button");

    name.textContent = `Name: ${data.name}`;
    owner.textContent = `Owner: ${data.owner}`;
    stars.textContent = `Stars: ${data.stars}`;
    card.append(name);
    card.append(owner);
    card.append(stars);

    closeBtn.type = "button";
    closeBtn.classList.add("repos-delete");

    listItem.append(card);
    listItem.append(closeBtn);

    const fragment = new DocumentFragment();
    fragment.append(listItem);
    cards.append(fragment);
}

let delay = debounce(autoComplete, 1000);

searchInput.addEventListener('input', (evt) => {
    evt.preventDefault()
    delay(evt.target.value)
    if (evt.target.value.length === 0){
        searchList.classList.add("search-list--hidden");
    }
})

searchList.addEventListener('click', (evt) => {
    const target = evt.target;
    if (target.type === "button") {
        createCard(evt.target);
        searchList.classList.add("search-list--hidden");
        searchInput.value = "";
    }
});

const reposCards = document.querySelector(".repos");

reposCards.addEventListener('click', (event) => {
    if (event.target.type === "button"){
        event.target.parentElement.remove();
    }
});