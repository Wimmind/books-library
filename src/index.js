const state = {
    books: JSON.parse(localStorage.getItem('books')) || [],
    favoriteBooks: JSON.parse(localStorage.getItem('favoriteBooks')) || [],
    currentEditBook: {
        id : null,
        data : ''
    }
}

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
        state.books.push(book)
        updateBooksList(state.books,'books');
    }
    document.querySelector('.title-input').value = '';
    document.querySelector('.content-book').value = '';
}

function sortBooks (list){
    list.sort((a, b)=>{
        return a.id - b.id;
    });
    const readBooks = list.filter(book => {
        return book.read
    })
    const notReadBooks =  list.filter(book => {
        return !book.read
    })
    return [...readBooks,...notReadBooks];
}

function filBooksList(containerBooks,arrayBooks){
    containerBooks.innerHTML='';
    sortBooks(arrayBooks).forEach((item)=>{
        containerBooks.innerHTML += `
        <div class="books-list_item" id=${item.id} style="background-color:${item.read?'green':'transparent'}" draggable="true">
                <span>${item.name}</span>
                <span class="delete-book">удалить</span>
                <span class="mark-book">отм. прочит.</span>
                <span class="edit-book">редакт.</span>
        </div>`
    })
}

function updateBooksList(){
    filBooksList(commonBooksList,state.books)
    filBooksList(favoriteBooksList,state.favoriteBooks)
    state.currentEditBook = {
        id : null,
        data : ''
    };
    localStorage.setItem('books',JSON.stringify(state.books));
    localStorage.setItem('favoriteBooks',JSON.stringify(state.favoriteBooks));
}

window.onload = () => {
    document.querySelector('.method[data=write]').click();
    updateBooksList();
}

function showTextBook(data,id){
    document.querySelector('.books-action_read').innerHTML = '';
    let text;
    state[data].forEach((item)=>{
        if (item.id === id){
            text = item.text;
        }
    })
    document.querySelector('.books-action_read').innerHTML = text;
}

function deleteBook(list,id){
    return list.filter(book => {
        return book.id !== id;
    })
}

function markBook(list,id){
    list.forEach((item)=>{
        if (item.id === id){
            item.read = true;
        }
    })
    return list;
}

allBooksList.addEventListener('click',(e)=>{
    const target = e.target;
    if (target.classList.contains('books-list_item')){
        showTextBook(target.parentNode.getAttribute('data'),+target.getAttribute('id'))
    }
    if (target.classList.contains('delete-book')){
        const data = target.parentNode.parentNode.getAttribute('data');
        state[data] = deleteBook(state[data],+target.parentNode.getAttribute('id'))
        updateBooksList()
    }
    if (target.classList.contains('mark-book')){
        const data = target.parentNode.parentNode.getAttribute('data');
        state[data] = markBook(state[data],+target.parentNode.getAttribute('id'))
        updateBooksList()
    }
    if (target.classList.contains('edit-book')){
        const data = target.parentNode.parentNode.getAttribute('data');
        let text;
        const id = +target.parentNode.getAttribute('id');
        state[data].forEach((item)=>{
            if (item.id === id){
                text = item.text;
            }
        })
        document.querySelector('.books-action_read').innerHTML = ''
        document.querySelector('.books-action_edit').innerHTML = `
        <textarea class="new-book-text">${text}</textarea>
        <button class="save-text">Сохранить</button>`;
        state.currentEditBook.id = id;
        state.currentEditBook.data = data;
    }
})

document.querySelector('.books-action_edit').addEventListener('click',(e)=>{
    const target = e.target;
    if (target.classList.contains('save-text')){
        state[state.currentEditBook.data].forEach((item)=>{
            if (item.id === state.currentEditBook.id){
                item.text = document.querySelector('.new-book-text').value;
            }
        })
        updateBooksList();
        document.querySelector('.books-action_edit').innerHTML = ''
    }
})

allBooksList.addEventListener('dragstart', event=>{
    let book = JSON.stringify({
        bookId: event.target.getAttribute('id'),
        data: event.target.parentNode.getAttribute('data')
    });

    event.dataTransfer.setData('book', book);
})

allBooksList.addEventListener('dragover', event=>{
    event.preventDefault();
    return false;
})

allBooksList.addEventListener('drop', event=>{
    event.preventDefault();
    
    const { bookId, data } = JSON.parse(event.dataTransfer.getData('book'));
   
    if (data !== event.target.getAttribute('data') && event.target.getAttribute('data')!==null){
        moveBook(+bookId,data,event.target.getAttribute('data'))
    }
})

function moveBook(id,fromData,toData){
    let book;
    state[fromData].forEach(item=>{
        if(item.id === id){
            book = item;
        }
    })
    console.log(book)
    console.log(toData)
    console.log(fromData)
    state[toData].push(book)
    state[fromData] = deleteBook(state[fromData],id);
    updateBooksList()
}