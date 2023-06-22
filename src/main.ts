import express from "express";
import cors from "cors";
import db from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// CRUD = Create Read Update Delete
// POST GET DELETE PUT
// http:://localhost:3000/todos READ
// http:://localhost:3000/todos CREATE
// http:://localhost:3000/todos/:id UPDATE
// http:://localhost:3000/todos/:id DELETE

type Todo = {
  id: number;
  task: string;
  isCompleted: boolean;
};

// Get All Todos
app.get("/todos", async (_, res) => {
  try {
    const todos = await db.getData("/todos");
    res.send({
      message: "All Todos",
      todos: todos,
    });
  } catch (err) {
    res.status(404).send({
      message: "Not Found",
    });
  }
});

// Create Todo
app.post("/todos", async (req, res) => {
  const { task } = req.body;

  if (!task) {
    res.status(403).send({
      message: "'task' is required",
    });
    return;
  }
  if (!task.length) {
    res.status(403).send({
      message: "task hech bo'lmasa 3 ta belgidan kam bo'lmasligi kerak",
    });
    return;
  }

  const id = (await db.getData("/id")) as number;
  const newId = id + 1;
  await db.push("/id", newId);

  const newTask = {
    id: newId,
    isCompleted: false,
    task,
  };

  await db.push("/todos[]", newTask);

  res.send({
    message: "Task Yaratildi",
    task: newTask,
  });
});

// http://localhost:3000/todos/4
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const index = await db.getIndex("/todos", +id);
  if (index < 0) {
    res.send({
      message: "Bu id bo`yicha malumot yoq",
    });
    return;
  }
  await db.delete(`/todos[${index}]`);
  res.send({
    message: "Task o`chirildi",
    taskId: id,
  });
});

// Update
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  const find = await db.find<Todo>(
    "/todos",
    (value, index) => value.id === +id
  );

  if (!find) {
    res.send({
      message: "Bunday malumot yoq",
    });
    return;
  }

  const allTodos = (await db.getData("/todos")) as Todo[];
  const todos = allTodos.map((todo) => {
    if (todo.id === +id) {
      return {
        ...todo,
        task: task,
      };
    }
    return todo;
  });

  await db.push("/todos", todos);

  res.send({
    message: "Malumot yangilandi",
    task: {
      ...find,
      task: task,
    },
  });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

// http://localhost:3000/todos
// endpoint = route

// request, response
// request => params, body
// response => send, status
