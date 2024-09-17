//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $(".dropdown").hide();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de contacts</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Mathieu Leroux
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}
async function renderBookmarks() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    $(".dropdown").show();
    let bookmarks = await API_GetBookmarks();
    eraseContent();
    if (bookmarks !== null) {
        let categories = [...new Set(bookmarks.map(bookmark => bookmark.Category))];
        updateDropDownMenu(categories);
        
        if (selectedCategory !== "") {
            bookmarks = bookmarks.filter(bookmark => bookmark.Category === selectedCategory);
        }

        bookmarks.forEach(bookmark => {
            $("#content").append(renderBookmark(bookmark));
        });
        restoreContentScrollPosition();

        $(".category-link").on("click", function () {
            selectedCategory = $(this).data("category");
            renderBookmarks();
        });

        $(".appLogo").on("click", function () {
            selectedCategory = "";
            renderBookmarks();
        });

        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
        });
        // $(".dataRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    console.log(bookmark)
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favori introuvable!");
}
async function renderDeleteBookmarkForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        const favicon = SiteFavicon(bookmark.Url);
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="dataRow" bookmark_id=${bookmark.Id}">
                <div class="dataContainer noselect">
                    <div>
                        <div class="dataLayout">
                            <span>${favicon}</span>
                            <span class="siteName">${bookmark.Title}</span>
                        </div>
                        <div class="dataLayout">
                            <span class="category">${bookmark.Category}</span>
                            <span></span>
                        </div>
                    </div>
                    <div></div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteBookmark').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Favori introuvable!");
    }
}
function newBookmark() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newBookmark();
    $("#actionTitle").text(create ? "Création" : "Modification");
    const favicon = SiteFavicon(bookmark.Url);
    $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            <div class="editFavicon">${favicon}</div>
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control Url"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer votre téléphone" 
                InvalidMessage="Veuillez entrer un téléphone valide"
                value="${bookmark.Url}" 
            />
            <label for="Category" class="form-label">Courriel </label>
            <input 
                class="form-control Category"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer une Catégorie" 
                InvalidMessage="Veuillez entrer une Catégorie valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderBookmark(bookmark) {
    const favicon = SiteFavicon(bookmark.Url);
    return $(`
        <div class="dataRow" bookmark_id=${bookmark.Id}">
            <div class="dataContainer noselect">
                <div>
                    <div class="dataLayout">
                        <a href=${bookmark.Url} target="_blank">${favicon}</a>
                        <span class="siteName">${bookmark.Title}</span>
                    </div>
                    <div class="dataLayout">
                        <span class="category-link category" data-category="${bookmark.Category}">
                            ${bookmark.Category}
                        </span>
                        <span></span>
                    </div>
                </div>
                <div class="dataCommandPanel">
                    <div class="editCmd cmdIcon fa fa-pencil"  editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}">
                    <div class="deleteCmd cmdIcon fa fa-trash"  deleteBookmarkId="${bookmark.Id}" title="Supprimer ${bookmark.Title}">
                </div>
            </div>
        </div>     
    `);
}

const FaviconGoogleServiceURL = "http://www.google.com/s2/favicons?sz=64&domain=";
function SiteFavicon(url) {
    if (!/^https?:\/\//i.test(url)) {
        url = 'http://' + url;
    }

    try {
        const faviconUrl = FaviconGoogleServiceURL + new URL(url).hostname;
        return `<img class='favicon' src='${faviconUrl}' alt='favicon'>`;
    } catch (error) {
        console.error("Invalid URL provided for favicon:", url);
        return `<img class='favicon' src='./favicon-standard.png' alt='default favicon'>`;
    }
}


let selectedCategory = "";
function updateDropDownMenu(categories) {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append(
        $(`
            <div class="dropdown-item menuItemLayout" id="allCatCmd">
                <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
            </div>
        `)
    );
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach((category) => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append(
            $(`
                <div class="dropdown-item menuItemLayout category" id="allCatCmd">
                    <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
                </div>
            `)
        );
    });
    DDMenu.append($(`<div class="dropdown-divider"></div> `));
    DDMenu.append(
        $(`
            <div class="dropdown-item menuItemLayout" id="aboutCmd">
                <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
            </div>
        `)
    );
    $("#aboutCmd").on("click", function () {
        renderAbout();
    });
    $("#allCatCmd").on("click", function () {
        selectedCategory = "";
        renderBookmarks();
    });
    $(".category").on("click", function () {
        selectedCategory = $(this).text().trim();
        renderBookmarks();
    });
}