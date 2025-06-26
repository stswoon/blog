const popupMenu = document.querySelector(".popupMenu");

function toggleMenu() {
    popupMenu.style.display = popupMenu.style.display === "none" ? "block" : "none";

    if (popupMenu.style.display === "block") {
        const outsideClickListener = (e) => {
            if (!popupMenu.contains(e.target)) {
                popupMenu.style.display = 'none';
                document.removeEventListener('click', outsideClickListener);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', outsideClickListener);
        });
    }
}

const paperItemElements = document.querySelectorAll(".paper-item");

function blogEngineSearch(searchText) {
    showMore();

    if (!searchText) {
        paperItemElements.forEach(paperItemElement => {
            paperItemElement.classList.remove("paper-item__hidden");
        })
        return;
    }

    searchText = searchText.toLowerCase();
    const paperIds = pagesSearchData
        .filter(data => {
            const foundTag = data.meta.tags?.find(tag => tag.toLowerCase().includes(searchText));
            const fit =
                data.link.toLowerCase().includes(searchText) ||
                data.meta.description.toLowerCase().includes(searchText) ||
                data.meta.title.toLowerCase().includes(searchText) ||
                data.pageSearchData.toLowerCase().includes(searchText) ||
                foundTag;
            return fit;
        })
        .map(data => data.link);

    console.log(`searchText=${searchText}, paperIds:`, paperIds);

    paperItemElements.forEach(paperItemElement => {
        if (paperIds.includes(paperItemElement.id)) {
            paperItemElement.classList.remove("paper-item__hidden");
        } else {
            paperItemElement.classList.add("paper-item__hidden");
        }
    });
}

function showMore() {
    document.querySelectorAll('.blogEngine .content .papers .paper-item.hidden').forEach(el => {
        el.classList.remove("hidden");
    });
    document.getElementById('showMoreButton').classList.add("hidden");
    //e.preventDefault();
    return false;
}