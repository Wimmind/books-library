let books = JSON.parse(localStorage.getItem('books')) || [];

let favoriteBooks = JSON.parse(localStorage.getItem('favoriteBooks')) || [];

let currentIdEditBook = null;

const addBookForm = document.querySelector('.add-book-form');
const allBooksList = document.querySelector('.books-list');

const uploadContent = document.querySelector('.upload-content');
const commonBooksList = document.querySelector('.books-list_common');
const favoriteBooksList = document.querySelector('.books-list_favorite');

addBookForm.addEventListener('click',(e)=>{
    const target = e.target;
    if (target.classList.contains('method')){
        addBookForm.querySelectorAll('.indicator').forEach((item)=>{
            item.style.backgroundColor = 'gray';
        })
        target.querySelector('.indicator').style.backgroundColor = 'green';
        uploadContent.innerHTML = '';
        if (target.getAttribute('data') === 'write'){
            uploadContent.innerHTML = `
                <div>
                    <textarea class="content-book"></textarea>
                    <button class="add-book-btn">Добавить</button>
                </div>`;
        } else {
            uploadContent.innerHTML =`
            <form method="post" enctype="multipart/form-data" class="add-book-btn-file">
                <input type="file" name="files[]" multiple>
                <input type="submit" value="Upload File" name="submit">
            </form>`;
        }
    }
    if (target.classList.contains('add-book-btn')){
        addBook();
    }
    if (target.classList.contains('add-book-btn-file')){
        const url = 'process.php';
        const form = document.querySelector('form');

        form.addEventListener('submit', e => {
            e.preventDefault();

            const files = document.querySelector('[type=file]').files;
            const formData = new FormData();

            for (let i = 0; i < files.length; i++) {
                let file = files[i];

                formData.append('files[]', file);
            }

            fetch(url, {
                method: 'POST',
                body: formData
            }).then(response => {
                return response.text();
            }).then(data => {
                console.log(data);
            });
        });
    }
})

function addBook( ) {
    const nameBook = document.querySelector('.title-input').value;
    const contentBook = document.querySelector('.content-book').value;
    if (nameBook && contentBook){
        const book = {
            id : Date.now(),
            name: nameBook,
            text: contentBook,
            read: false
        }
        books.push(book)
        updateBooksList()
    }
    document.querySelector('.title-input').value = '';
    document.querySelector('.content-book').value = '';
}
function sortBooks (books){
    const readBooks = books.filter(book => {
        return book.read
    })
    const notReadBooks =  books.filter(book => {
        return !book.read
    })
    return [...readBooks,...notReadBooks];
}

function updateBooksList( ){
    commonBooksList.innerHTML='';
    sortBooks(books).forEach((item)=>{
        commonBooksList.innerHTML += `
        <div class="books-list_item" id=${item.id} style="background-color:${item.read?'green':'transparent'}" draggable="true">
                <span>${item.name}</span>
                <span class="delete-book">удалить</span>
                <span class="mark-book">отм. прочит.</span>
                <span class="edit-book">редакт.</span>
        </div>`
    })
    currentIdEditBook = null;
    localStorage.setItem('books',JSON.stringify(books));



    favoriteBooksList.innerHTML='';
    sortBooks(favoriteBooks).forEach((item)=>{
        favoriteBooksList.innerHTML += `
        <div class="books-list_item" id=${item.id} style="background-color:${item.read?'green':'transparent'}" draggable="true">
                <span>${item.name}</span>
                <span class="delete-book">удалить</span>
                <span class="mark-book">отм. прочит.</span>
                <span class="edit-book">редакт.</span>
        </div>`
    })

    localStorage.setItem('favoriteBooks',JSON.stringify(favoriteBooks));
}

window.onload = () => {
    document.querySelector('.method[data=write]').click();
    updateBooksList();
}

allBooksList.addEventListener('click',(e)=>{
    const target = e.target;
    if (target.classList.contains('books-list_item')){
        document.querySelector('.books-action_read').innerHTML = '';
        let text;
        books.forEach((item)=>{
            if (item.id === +target.getAttribute('id')){
                text = item.text;
            }
        })
        document.querySelector('.books-action_read').innerHTML = text;
    }
    if (target.classList.contains('delete-book')){
        books = books.filter(book => {
            return book.id !== (+target.parentNode.getAttribute('id'));
        })
        updateBooksList();
    }
    if (target.classList.contains('mark-book')){
        books.forEach((item)=>{
            if (item.id === +target.parentNode.getAttribute('id')){
                item.read = true;
            }
        })
        updateBooksList();
    }
    if (target.classList.contains('edit-book')){
        let text;
        books.forEach((item)=>{
            if (item.id === +target.parentNode.getAttribute('id')){
                text = item.text;
            }
        })
        document.querySelector('.books-action_read').innerHTML = ''
        document.querySelector('.books-action_edit').innerHTML = `
        <textarea class="new-book-text">${text}</textarea>
        <button class="save-text">Сохранить</button>`;
        currentIdEditBook = +target.parentNode.getAttribute('id');
    }
})

document.querySelector('.books-action_edit').addEventListener('click',(e)=>{
    const target = e.target;
    if (target.classList.contains('save-text')){
        books.forEach((item)=>{
            if (item.id === currentIdEditBook){
                item.text = document.querySelector('.new-book-text').value;
            }
        })
        updateBooksList();
        document.querySelector('.books-action_edit').innerHTML = ''
    }
})


allBooksList.addEventListener('dragstart', event=>{
    let bookId = JSON.stringify(event.target.getAttribute('id'));
    event.dataTransfer.setData('id', bookId);
})

allBooksList.addEventListener('dragover', event=>{
    event.preventDefault();
    return false;
})

allBooksList.addEventListener('drop', event=>{
    event.preventDefault();
    
    let id = JSON.parse(event.dataTransfer.getData("id"));
    if (event.target.classList.contains('books-list_favorite')){
        moveBook(+id);
    }
})

function moveBook(id){
    let currentBook;
    books.forEach(item=>{
        if (item.id===id){
            currentBook=item;
        }
    })
    books = books.filter(book => {
        return book.id !== id;
    })
    favoriteBooks.push(currentBook)
}