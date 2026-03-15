import json
import os
import sys
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEAM_DIR = os.path.join(ROOT, ".antigravity", "team")
TASKS_PATH = os.path.join(TEAM_DIR, "tasks.json")
BROADCAST_PATH = os.path.join(TEAM_DIR, "broadcast.msg")
LOCKS_DIR = os.path.join(TEAM_DIR, "locks")
MAILBOX_DIR = os.path.join(TEAM_DIR, "mailbox")


def now_iso():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def ensure_team_dirs():
    os.makedirs(TEAM_DIR, exist_ok=True)
    os.makedirs(LOCKS_DIR, exist_ok=True)
    os.makedirs(MAILBOX_DIR, exist_ok=True)

    if not os.path.exists(TASKS_PATH):
        with open(TASKS_PATH, "w", encoding="utf-8") as f:
            json.dump({"tasks": [], "active_locks": []}, f, indent=2)

    if not os.path.exists(BROADCAST_PATH):
        with open(BROADCAST_PATH, "w", encoding="utf-8") as f:
            f.write("")


def load_tasks():
    with open(TASKS_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_tasks(data):
    with open(TASKS_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=True)


def append_broadcast(message):
    line = f"[{now_iso()}] {message}\n"
    with open(BROADCAST_PATH, "a", encoding="utf-8") as f:
        f.write(line)
    print(line.strip())


def cmd_init():
    ensure_team_dirs()
    print("Team infrastructure ready")


def cmd_broadcast(args):
    if not args:
        raise ValueError("broadcast requires a message")
    ensure_team_dirs()
    append_broadcast(" ".join(args))


def cmd_start_iteration(args):
    if not args:
        raise ValueError("start-iteration requires an objective")

    ensure_team_dirs()
    objective = " ".join(args)

    append_broadcast(f"BOOSTER ITERATION START: {objective}")

    data = load_tasks()
    for t in data.get("tasks", []):
        if t.get("status") == "in-progress":
            t["status"] = "pending"

    seed_tasks = [
        ("Arquitectura y contratos", "Architect"),
        ("Implementacion backend", "Backend"),
        ("Implementacion frontend", "Frontend"),
        ("Validacion y seguridad", "Reviewer"),
    ]

    existing_ids = [t.get("id", "task-000") for t in data.get("tasks", [])]
    next_number = 1
    if existing_ids:
        nums = []
        for tid in existing_ids:
            try:
                nums.append(int(str(tid).split("-")[-1]))
            except ValueError:
                pass
        if nums:
            next_number = max(nums) + 1

    for title, assignee in seed_tasks:
        data.setdefault("tasks", []).append(
            {
                "status": "pending",
                "title": title,
                "assignee": assignee,
                "dependencies": [],
                "id": f"task-{next_number:03d}",
            }
        )
        next_number += 1

    save_tasks(data)
    print("Iteration tasks created")


def lock_file_path(file_path):
    safe = file_path.replace("/", "_").replace("\\", "_").replace(":", "_")
    return os.path.join(LOCKS_DIR, f"{safe}.lock")


def cmd_lock(args):
    if len(args) < 2:
        raise ValueError("lock requires <owner> <file_path>")
    ensure_team_dirs()
    owner = args[0]
    file_path = args[1]
    lock_path = lock_file_path(file_path)
    if os.path.exists(lock_path):
        raise ValueError("lock already exists")
    with open(lock_path, "w", encoding="utf-8") as f:
        f.write(f"owner={owner}\nfile={file_path}\ncreated_at={now_iso()}\n")
    print(f"Lock created: {file_path}")


def cmd_unlock(args):
    if not args:
        raise ValueError("unlock requires <file_path>")
    ensure_team_dirs()
    file_path = args[0]
    lock_path = lock_file_path(file_path)
    if os.path.exists(lock_path):
        os.remove(lock_path)
        print(f"Lock released: {file_path}")
    else:
        print("No lock found")


def cmd_done(args):
    if len(args) < 1:
        raise ValueError("done requires <task_id>")
    ensure_team_dirs()
    task_id = args[0]
    data = load_tasks()
    for t in data.get("tasks", []):
        if t.get("id") == task_id:
            t["status"] = "completed"
            save_tasks(data)
            print(f"Task completed: {task_id}")
            return
    raise ValueError("task not found")


def cmd_end_iteration(args):
    ensure_team_dirs()
    summary = " ".join(args) if args else "Cierre de iteracion sin resumen"
    append_broadcast(f"BOOSTER ITERATION END: {summary}")
    print("Iteration closed")


def main():
    if len(sys.argv) < 2:
        print(
            "Usage: team_manager.py <init|broadcast|start-iteration|lock|unlock|done|end-iteration> [args...]"
        )
        sys.exit(1)

    cmd = sys.argv[1]
    args = sys.argv[2:]

    commands = {
        "init": cmd_init,
        "broadcast": cmd_broadcast,
        "start-iteration": cmd_start_iteration,
        "lock": cmd_lock,
        "unlock": cmd_unlock,
        "done": cmd_done,
        "end-iteration": cmd_end_iteration,
    }

    fn = commands.get(cmd)
    if not fn:
        raise ValueError("unknown command")
    fn(args)


if __name__ == "__main__":
    main()
