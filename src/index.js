const books = JSON.parse(localStorage.getItem('books')) || [];

const addBookForm = document.querySelector('.add-book-form');

const uploadContent = document.querySelector('.upload-content');
const booksList = document.querySelector('.books-list');

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
            uploadContent.innerHTML = '<button>Загрузить файл</button>';
        }
    }
    if (target.classList.contains('add-book-btn')){
        addBook();
    }
})

function addBook( ) {
    const nameBook = document.querySelector('.title-input').value;
    const contentBook = document.querySelector('.content-book').value;
    if (nameBook && contentBook){
        const book = {
            id : Date.now(),
            name: nameBook,
            content: contentBook
        }
        books.push(book)
        localStorage.setItem('books',JSON.stringify(books));
        updateBooksList()
    }
}


function updateBooksList( ){
    booksList.innerHTML='';
    books.forEach((item)=>{
        booksList.innerHTML += `
        <div class="books-list_item">
            ${item.name}
        </div>`
    })
}

window.onload = () => {
    updateBooksList();
}