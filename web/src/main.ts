import { addBook, deleteBook, listBooks, setRead, type Book } from './api';

const form = document.querySelector<HTMLFormElement>('#add-form')!;
const titleInput = document.querySelector<HTMLInputElement>('#title')!;
const authorInput = document.querySelector<HTMLInputElement>('#author')!;
const errorEl = document.querySelector<HTMLElement>('#error')!;
const listEl = document.querySelector<HTMLUListElement>('#books')!;

function showError(err: unknown) {
  errorEl.textContent = err instanceof Error ? err.message : String(err);
}

async function run(action: () => Promise<unknown>) {
  errorEl.textContent = '';
  try {
    await action();
  } catch (err) {
    showError(err);
  }
  await refresh();
}

function render(books: Book[]) {
  listEl.replaceChildren(
    ...books.map((book) => {
      const li = document.createElement('li');
      li.className = book.read ? 'read' : '';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = book.read;
      checkbox.setAttribute('aria-label', `Mark "${book.title}" as read`);
      checkbox.addEventListener('change', () => run(() => setRead(book.id, checkbox.checked)));

      const text = document.createElement('span');
      text.className = 'text';
      text.textContent = `${book.title} by ${book.author}`;

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.addEventListener('click', () => run(() => deleteBook(book.id)));

      li.append(checkbox, text, del);
      return li;
    }),
  );
}

async function refresh() {
  try {
    render(await listBooks());
  } catch (err) {
    showError(err);
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  run(async () => {
    await addBook(titleInput.value.trim(), authorInput.value.trim());
    form.reset();
    titleInput.focus();
  });
});

refresh();
