const form = document.getElementsByTagName("form")[0];


const getAllTodos = async ()=>{
  const res = await axios.get("/todo/all");
  renderTodos(res.data.todos)
}

getAllTodos()

form.addEventListener("submit",(e)=>{
  e.preventDefault();
  // const input = form.children[0];
  // const task = input.value;
  const task = form.children[0].value;
  createTodo(task)
  form.children[0].value = ""
})

const createTodo = async (task)=>{
  let res = await axios.post("/todo/create",{task:task});
  console.log(res.data);
  renderTodos(res.data.todos)
}

const todoContainer = document.getElementById("todo-container");

const renderTodos = (todos)=>{
  todoContainer.innerHTML = "";
  todos.forEach(todo => {
    const div = document.createElement("div");
    div.innerHTML = `<h3></h3>
    <div id=${todo.id}>
      <button onClick='updateTodo("${todo.id}")'>${todo.status?"Undo":"Complete"}</button>
      <button onClick='deleteTodo("${todo.id}")'>Delete</button>
    </div>`
    div.querySelector("h3").textContent = todo.task;
    todoContainer.append(div);
  });
}


async function updateTodo(id){
  const res = await axios.put(`/todo/${id}/update`);
  renderTodos(res.data.todos)
}

async function deleteTodo(id){
  const res = await axios.delete(`/todo/${id}/delete`);
  renderTodos(res.data.todos)
}