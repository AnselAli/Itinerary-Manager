"use client";

import { useState, useEffect, useCallback } from "react";

interface Task {
  id: number;
  name: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

interface DateInfo {
  formatted: string;
  isOverdue: boolean;
  isToday: boolean;
}

type FilterType = "all" | "completed" | "pending";

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [taskInput, setTaskInput] = useState<string>("");
  const [dateInput, setDateInput] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("itineraryTasks");
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading tasks:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when tasks change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("itineraryTasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const notification = document.createElement("div");
      notification.className = `notification ${type}`;
      notification.textContent = message;
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = "fadeOutNotif 0.3s ease";
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    },
    []
  );

  const formatDate = useCallback((dateString: string): DateInfo | null => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now && date.toDateString() !== now.toDateString();

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };

    return {
      formatted: date.toLocaleDateString("en-US", options),
      isOverdue,
      isToday: date.toDateString() === now.toDateString(),
    };
  }, []);

  const addTask = useCallback(() => {
    const taskName = taskInput.trim();
    const taskDate = dateInput;

    if (!taskName) {
      showNotification("Please enter a task name", "error");
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      name: taskName,
      date: taskDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev: Task[]) => [newTask, ...prev]);
    setTaskInput("");
    setDateInput("");
    showNotification("Task added successfully!", "success");
  }, [taskInput, dateInput, showNotification]);

  const deleteTask = useCallback(
    (id: number) => {
      const taskElement = document.querySelector(`[data-task-id="${id}"]`);
      if (taskElement) {
        taskElement.classList.add("fade-out");
        setTimeout(() => {
          setTasks((prev: Task[]) => prev.filter((task) => task.id !== id));
          showNotification("Task deleted", "info");
        }, 300);
      }
    },
    [showNotification]
  );

  const toggleComplete = useCallback(
    (id: number) => {
      setTasks((prev: Task[]) => {
        const task = prev.find((t) => t.id === id);
        if (task && !task.completed) {
          showNotification("Task completed! 🎉", "success");
        }
        return prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
      });
    },
    [showNotification]
  );

  const clearAllTasks = useCallback(() => {
    if (tasks.length === 0) return;

    if (confirm("Are you sure you want to delete all tasks?")) {
      setTasks([]);
      showNotification("All tasks cleared", "info");
    }
  }, [tasks.length, showNotification]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        addTask();
      }
    },
    [addTask]
  );

  const getFilteredTasks = useCallback(() => {
    switch (filter) {
      case "completed":
        return tasks.filter((t) => t.completed);
      case "pending":
        return tasks.filter((t) => !t.completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const filteredTasks = getFilteredTasks();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  // Set minimum date for datetime input
  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() - minDate.getTimezoneOffset());
  const minDateString = minDate.toISOString().slice(0, 16);

  if (!isLoaded) {
    return (
      <div className="container">
        <div
          className="app-card"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>📋 Itinerary / Task Manager</h1>
        <p>Organize your life, one task at a time</p>
      </header>

      <div className="app-card">
        {/* Input Section */}
        <div className="input-section">
          <div className="input-group">
            <div className="input-row">
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="What needs to be done?"
                autoComplete="off"
              />
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                min={minDateString}
              />
            </div>
            <button className="btn btn-primary" onClick={addTask}>
              <span>➕</span>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-tabs">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "pending" ? "active" : ""}`}
              onClick={() => setFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`filter-btn ${filter === "completed" ? "active" : ""}`}
              onClick={() => setFilter("completed")}
            >
              Completed
            </button>
          </div>
          <button className="clear-btn" onClick={clearAllTasks}>
            🗑️ Clear All
          </button>
        </div>

        {/* Task List */}
        <div className="task-list" id="taskList">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No tasks found</h3>
              <p>
                {filter === "all"
                  ? "Add your first task above to get started!"
                  : "No tasks match the current filter."}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const dateInfo = formatDate(task.date);
              let dateClass = "";
              let dateText = "";

              if (dateInfo) {
                if (dateInfo.isOverdue && !task.completed) {
                  dateClass = "overdue";
                  dateText = `⏰ ${dateInfo.formatted} (Overdue)`;
                } else if (dateInfo.isToday) {
                  dateClass = "upcoming";
                  dateText = `📅 Today, ${dateInfo.formatted.split(",")[1]}`;
                } else {
                  dateText = `📅 ${dateInfo.formatted}`;
                }
              }

              return (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                  data-task-id={task.id}
                >
                  <div
                    className={`checkbox ${task.completed ? "checked" : ""}`}
                    onClick={() => toggleComplete(task.id)}
                  />
                  <div className="task-content">
                    <h3>{task.name}</h3>
                    {dateInfo && (
                      <div className="task-meta">
                        <span className={`task-date ${dateClass}`}>
                          {dateText}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Stats Footer */}
        <div className="stats-footer">
          <div className="stat-item">
            <span>Total:</span>
            <span className="stat-badge">{total}</span>
          </div>
          <div className="stat-item">
            <span>Pending:</span>
            <span
              className="stat-badge"
              style={{ background: "var(--color-warning)" }}
            >
              {pending}
            </span>
          </div>
          <div className="stat-item">
            <span>Completed:</span>
            <span
              className="stat-badge"
              style={{ background: "var(--color-success)" }}
            >
              {completed}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}