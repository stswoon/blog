const paperItemElements = document.querySelectorAll(".paper-item");

function blogEngineSearch(searchText) {
    if (!searchText) {
        paperItemElements.forEach(paperItemElement => {
            paperItemElement.classList.remove("paper-item__hidden");
        })
        return;
    }

    const paperIds = papersSearchData
        .filter(data => {
            const foundTag = data.tags?.find(tag => tag.includes(searchText));
            const fit =
                data.link.includes(searchText) ||
                data.description.includes(searchText) ||
                data.title.includes(searchText) ||
                data.html.includes(searchText) ||
                foundTag;
            return fit;
        })
        .map(data => data.id);

    console.log(`searchText=${searchText}, paperIds:`, paperIds);

    paperItemElements.forEach(paperItemElement => {
        if (paperIds.includes(paperItemElement.id)) {
            paperItemElement.classList.remove("paper-item__hidden");
        } else {
            paperItemElement.classList.add("paper-item__hidden");
        }
    });
}