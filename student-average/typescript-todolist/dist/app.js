"use strict";
class TodoApp {
    constructor() {
        this.todos = [];
        this.inputEl = document.getElementById("todo-input");
        this.listEl = document.getElementById("todo-list");
        this.addBtn = document.getElementById("add-btn");
        this.addBtn.addEventListener("click", () => this.addTodo());
        this.loadTodos();
        this.render();
    }
    addTodo() {
        const text = this.inputEl.value.trim();
        if (!text)
            return;
        const newTodo = {
            id: Date.now(),
            text,
            completed: false,
        };
        this.todos.push(newTodo);
        this.saveTodos();
        this.render();
        this.inputEl.value = "";
    }
    toggleTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }
    render() {
        this.listEl.innerHTML = "";
        this.todos.forEach(todo => {
            const li = document.createElement("li");
            if (todo.completed)
                li.classList.add("completed");
            const span = document.createElement("span");
            span.textContent = todo.text;
            span.addEventListener("click", () => this.toggleTodo(todo.id));
            const delBtn = document.createElement("button");
            delBtn.textContent = "X";
            delBtn.addEventListener("click", () => this.deleteTodo(todo.id));
            li.appendChild(span);
            li.appendChild(delBtn);
            this.listEl.appendChild(li);
        });
    }
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }
    saveTodos() {
        localStorage.getItem("todos"), JSON.stringify(this.todos);
    }
    loadTodos() {
        const data = localStorage.getItem("todo");
        this.todos = data ? JSON.parse(data) : [];
    }
}
new TodoApp();
