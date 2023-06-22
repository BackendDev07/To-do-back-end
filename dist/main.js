"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./db"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// Get All Todos
app.get("/todos", async (_, res) => {
    try {
        const todos = await db_1.default.getData("/todos");
        res.send({
            message: "All Todos",
            todos: todos,
        });
    }
    catch (err) {
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
    const id = (await db_1.default.getData("/id"));
    const newId = id + 1;
    await db_1.default.push("/id", newId);
    const newTask = {
        id: newId,
        isCompleted: false,
        task,
    };
    await db_1.default.push("/todos[]", newTask);
    res.send({
        message: "Task Yaratildi",
        task: newTask,
    });
});
// http://localhost:3000/todos/4
app.delete("/todos/:id", async (req, res) => {
    const { id } = req.params;
    const index = await db_1.default.getIndex("/todos", +id);
    if (index < 0) {
        res.send({
            message: "Bu id bo`yicha malumot yoq",
        });
        return;
    }
    await db_1.default.delete(`/todos[${index}]`);
    res.send({
        message: "Task o`chirildi",
        taskId: id,
    });
});
// Update
app.put("/todos/:id", async (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    const find = await db_1.default.find("/todos", (value, index) => value.id === +id);
    if (!find) {
        res.send({
            message: "Bunday malumot yoq",
        });
        return;
    }
    const allTodos = (await db_1.default.getData("/todos"));
    const todos = allTodos.map((todo) => {
        if (todo.id === +id) {
            return Object.assign(Object.assign({}, todo), { task: task });
        }
        return todo;
    });
    await db_1.default.push("/todos", todos);
    res.send({
        message: "Malumot yangilandi",
        task: Object.assign(Object.assign({}, find), { task: task }),
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
