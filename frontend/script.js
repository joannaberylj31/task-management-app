const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");


// ================= REGISTER =================

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    phone: phone,
                    password: password
                })
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {
            registerForm.reset();
        }

    } catch (error) {
        message.textContent = "Unable to connect to server";
    }
});


// ================= LOGIN / REGISTER SWITCH =================

const loginSection = document.getElementById("loginSection");
const registerSection = document.getElementById("registerSection");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

showRegister.addEventListener("click", (event) => {
    event.preventDefault();

    loginSection.style.display = "none";
    registerSection.style.display = "block";

    message.textContent = "";
});

showLogin.addEventListener("click", (event) => {
    event.preventDefault();

    registerSection.style.display = "none";
    loginSection.style.display = "block";

    message.textContent = "";
});


// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch(
            "http://localhost:5000/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        if (response.ok) {

            localStorage.setItem("token", data.token);

            document.getElementById("authContainer").style.display = "none";
            document.getElementById("dashboard").style.display = "block";

            loadTasks();
        }

    } catch (error) {
        message.textContent = "Unable to connect to server";
    }
});


// ================= LOAD TASKS =================

async function loadTasks() {

    const token = localStorage.getItem("token");

    if (!token) {
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/tasks",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const tasks = await response.json();


        // ================= UPDATE TASK STATISTICS =================

        const totalTasks = tasks.length;

        const pendingTasks = tasks.filter(
            task => task.status === "pending"
        ).length;

        const completedTasks = tasks.filter(
            task => task.status === "completed"
        ).length;


        document.getElementById("totalTasks").textContent =
            totalTasks;

        document.getElementById("pendingTasks").textContent =
            pendingTasks;

        document.getElementById("completedTasks").textContent =
            completedTasks;


        // ================= DISPLAY TASKS =================

        const taskList = document.getElementById("taskList");

        taskList.innerHTML = "";

        if (tasks.length === 0) {

            taskList.innerHTML =
                "<p>No tasks yet. Add your first task! 🌸</p>";

            return;
        }


        tasks.forEach(task => {

            const taskCard = document.createElement("div");

            taskCard.className = "task-card";

            taskCard.innerHTML = `
                <h3>${task.title}</h3>

                <p>${task.description || "No description"}</p>

                <span class="task-status">
                    ${task.status}
                </span>

                <div class="task-actions">

                    <button
                        class="edit-btn"
                        onclick="editTask(${task.id})">
                        ✏️ Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})">
                        🗑️ Delete
                    </button>

                </div>
            `;

            taskList.appendChild(taskCard);
        });

    } catch (error) {

        document.getElementById("taskList").innerHTML =
            "<p>Unable to load tasks.</p>";
    }
}


// ================= ADD TASK =================

const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title =
        document.getElementById("taskTitle").value;

    const description =
        document.getElementById("taskDescription").value;

    const status =
        document.getElementById("taskStatus").value;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            "http://localhost:5000/api/tasks",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    title: title,
                    description: description,
                    status: status
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            taskForm.reset();

            loadTasks();

        } else {

            alert(data.message);
        }

    } catch (error) {

        alert("Unable to connect to server");
    }
});


// ================= DELETE TASK =================

async function deleteTask(taskId) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            "http://localhost:5000/api/tasks/" + taskId,
            {
                method: "DELETE",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const data = await response.json();

        if (response.ok) {

            loadTasks();

        } else {

            alert(data.message);
        }

    } catch (error) {

        alert("Unable to connect to server");
    }
}


// ================= EDIT TASK =================

let editingTaskId = null;

async function editTask(taskId) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            "http://localhost:5000/api/tasks",
            {
                method: "GET",

                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const tasks = await response.json();

        const task = tasks.find(
            task => task.id === taskId
        );

        if (!task) {

            alert("Task not found");

            return;
        }

        editingTaskId = taskId;


        document.getElementById("editTaskTitle").value =
            task.title;

        document.getElementById("editTaskDescription").value =
            task.description || "";

        document.getElementById("editTaskStatus").value =
            task.status;


        document.getElementById("editTaskCard").style.display =
            "block";


        document.getElementById("editTaskCard").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        alert("Unable to load task");
    }
}


// ================= SAVE EDITED TASK =================

const editTaskForm =
    document.getElementById("editTaskForm");

editTaskForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const title =
        document.getElementById("editTaskTitle").value;

    const description =
        document.getElementById("editTaskDescription").value;

    const status =
        document.getElementById("editTaskStatus").value;

    const token =
        localStorage.getItem("token");


    try {

        const response = await fetch(
            "http://localhost:5000/api/tasks/" + editingTaskId,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },

                body: JSON.stringify({
                    title: title,
                    description: description,
                    status: status
                })
            }
        );

        const data = await response.json();


        if (response.ok) {

            editTaskForm.reset();

            document.getElementById("editTaskCard").style.display =
                "none";

            editingTaskId = null;

            loadTasks();

        } else {

            alert(data.message);
        }

    } catch (error) {

        alert("Unable to connect to server");
    }
});


// ================= CANCEL EDIT =================

const cancelEdit =
    document.getElementById("cancelEdit");

cancelEdit.addEventListener("click", () => {

    editTaskForm.reset();

    document.getElementById("editTaskCard").style.display =
        "none";

    editingTaskId = null;
});


// ================= LOGOUT =================

const logoutButton =
    document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {

    localStorage.removeItem("token");

    document.getElementById("dashboard").style.display =
        "none";

    document.getElementById("authContainer").style.display =
        "flex";

    loginSection.style.display = "block";

    registerSection.style.display = "none";

    message.textContent = "";

    loginForm.reset();
});