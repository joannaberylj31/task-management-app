const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title) {
        return res.status(400).json({
            message: "Task title is required"
        });
    }

    const sql = `
        INSERT INTO tasks (title, description, user_id)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [title, description || null, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to create task"
                });
            }

            res.status(201).json({
                message: "Task created successfully",
                taskId: result.insertId
            });
        }
    );
});

router.get("/", authMiddleware, (req, res) => {
    const userId = req.user.id;

    const sql = "SELECT * FROM tasks WHERE user_id = ?";

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to fetch tasks"
            });
        }

        res.json(results);
    });
});

router.put("/:id", authMiddleware, (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;
    const { title, description, status } = req.body;

    const sql = `
        UPDATE tasks
        SET title = ?, description = ?, status = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(
        sql,
        [title, description, status, taskId, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Failed to update task"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Task not found"
                });
            }

            res.json({
                message: "Task updated successfully"
            });
        }
    );
});

router.delete("/:id", authMiddleware, (req, res) => {
    const taskId = req.params.id;
    const userId = req.user.id;

    const sql = `
        DELETE FROM tasks
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [taskId, userId], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to delete task"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });
    });
});

module.exports = router;