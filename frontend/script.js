// ========================================
// MEMORYVERSE AI
// Complete JavaScript Application
// ========================================

const API_URL = "http://127.0.0.1:8000";

// HTML ELEMENTS
const memoryText = document.getElementById("memoryText");
const charCount = document.getElementById("charCount");
const saveBtn = document.getElementById("saveBtn");
const saveButtonText = document.getElementById("saveButtonText");
const memoryList = document.getElementById("memoryList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const recordBtn = document.getElementById("recordBtn");
const recordHint = document.getElementById("recordHint");
const toast = document.getElementById("toast");
const newMemoryBtn = document.getElementById("newMemoryBtn");

let memories = [];
let editingMemoryId = null;
let recognition = null;
let isRecording = false;


// ========================================
// NOTIFICATION
// ========================================

function showToast(message) {
    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}


// ========================================
// CHARACTER COUNTER
// ========================================

if (memoryText && charCount) {
    memoryText.addEventListener("input", () => {
        charCount.textContent = memoryText.value.length;
    });
}


// ========================================
// LOAD MEMORIES FROM BACKEND
// ========================================

async function loadMemories() {
    if (!memoryList) return;

    try {
        const response = await fetch(`${API_URL}/memories`);

        if (!response.ok) {
            throw new Error("Unable to load memories");
        }

        memories = await response.json();

        displayMemories(memories);

    } catch (error) {
        console.error("Loading error:", error);

        memoryList.innerHTML = `
            <div class="empty-state">
                <p>Unable to connect to the backend.</p>
                <p>Please check your server.</p>
            </div>
        `;
    }
}


// ========================================
// DISPLAY MEMORIES
// ========================================

function displayMemories(memoryArray) {
    if (!memoryList) return;

    if (!memoryArray || memoryArray.length === 0) {
        memoryList.innerHTML = `
            <div class="empty-state">
                <p>No memories found.</p>
                <p>Start creating your first memory!</p>
            </div>
        `;
        return;
    }

    memoryList.innerHTML = memoryArray.map(memory => `
        <div class="memory-card" data-id="${memory.id}">

            <h3>${escapeHTML(memory.title || "Untitled Memory")}</h3>

            <p>${escapeHTML(memory.content)}</p>

            <small>
                ${memory.created_at
                    ? new Date(memory.created_at).toLocaleString()
                    : ""}
            </small>

            <div class="memory-actions">

                <button class="edit-memory-btn"
                        data-id="${memory.id}">
                    Edit
                </button>

                <button class="delete-memory-btn"
                        data-id="${memory.id}">
                    Delete
                </button>

            </div>

        </div>
    `).join("");
}


// ========================================
// PREVENT HTML INJECTION
// ========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


// ========================================
// SAVE MEMORY
// ========================================

if (saveBtn) {

    saveBtn.addEventListener("click", async () => {

        const content = memoryText.value.trim();

        if (!content) {
            showToast("Please write a memory first!");
            memoryText.focus();
            return;
        }

        // Ask for memory title
        const existingMemory = editingMemoryId !== null
            ? memories.find(memory => memory.id === editingMemoryId)
            : null;

        const title = prompt(
            "Enter a title for your memory:",
            existingMemory ? existingMemory.title : ""
        );

        if (title === null) {
            return;
        }

        if (!title.trim()) {
            showToast("Please enter a memory title!");
            return;
        }

        const memoryData = {
            title: title.trim(),
            content: content
        };

        try {

            saveBtn.disabled = true;

            if (saveButtonText) {
                saveButtonText.textContent = "Saving...";
            }

            let response;

            // UPDATE EXISTING MEMORY
            if (editingMemoryId !== null) {

                response = await fetch(
                    `${API_URL}/memories/${editingMemoryId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(memoryData)
                    }
                );

            }

            // CREATE NEW MEMORY
            else {

                response = await fetch(`${API_URL}/memories`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(memoryData)
                });

            }

            if (!response.ok) {
                const errorDetails = await response.text();
                throw new Error(errorDetails || "Memory could not be saved");
            }

            // RESET FORM
            memoryText.value = "";

            if (charCount) {
                charCount.textContent = "0";
            }

            editingMemoryId = null;

            if (saveButtonText) {
                saveButtonText.textContent = "Save Memory";
            }

            showToast("Your memory has been saved successfully!");

            await loadMemories();

        } catch (error) {

            console.error("Save error:", error);

            showToast("Unable to save memory. Check the backend.");

        } finally {

            saveBtn.disabled = false;

            if (saveButtonText) {
                saveButtonText.textContent = "Save Memory";
            }

        }

    });

}


// ========================================
// NEW MEMORY
// ========================================

if (newMemoryBtn) {

    newMemoryBtn.addEventListener("click", () => {

        memoryText.value = "";

        if (charCount) {
            charCount.textContent = "0";
        }

        editingMemoryId = null;

        if (saveButtonText) {
            saveButtonText.textContent = "Save Memory";
        }

        memoryText.focus();

    });

}


// ========================================
// EDIT AND DELETE MEMORIES
// ========================================

if (memoryList) {

    memoryList.addEventListener("click", async (event) => {

        const editButton = event.target.closest(".edit-memory-btn");
        const deleteButton = event.target.closest(".delete-memory-btn");

        // EDIT MEMORY
        if (editButton) {

            const id = Number(editButton.dataset.id);

            const memory = memories.find(item => item.id === id);

            if (!memory) return;

            memoryText.value = memory.content;

            if (charCount) {
                charCount.textContent = memory.content.length;
            }

            editingMemoryId = id;

            if (saveButtonText) {
                saveButtonText.textContent = "Update Memory";
            }

            memoryText.focus();

            showToast("Memory loaded for editing.");

        }


        // DELETE MEMORY
        if (deleteButton) {

            const id = Number(deleteButton.dataset.id);

            const confirmed = confirm(
                "Are you sure you want to delete this memory?"
            );

            if (!confirmed) return;

            try {

                const response = await fetch(
                    `${API_URL}/memories/${id}`,
                    {
                        method: "DELETE"
                    }
                );

                if (!response.ok) {
                    throw new Error("Delete failed");
                }

                showToast("Memory deleted successfully!");

                await loadMemories();

            } catch (error) {

                console.error("Delete error:", error);

                showToast("Unable to delete memory.");

            }

        }

    });

}


// ========================================
// SEARCH MEMORIES
// ========================================

async function searchMemories() {

    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    if (!query) {
        displayMemories(memories);
        return;
    }

    const results = memories.filter(memory => {

        const title = (memory.title || "").toLowerCase();
        const content = (memory.content || "").toLowerCase();

        return title.includes(query) || content.includes(query);

    });

    displayMemories(results);

}

if (searchBtn) {
    searchBtn.addEventListener("click", searchMemories);
}

if (searchInput) {

    searchInput.addEventListener("input", searchMemories);

    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchMemories();
        }
    });

}


// ========================================
// VOICE RECORDING
// ========================================

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition && recordBtn) {

    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => {

        isRecording = true;

        recordBtn.textContent = "Stop Recording";

        if (recordHint) {
            recordHint.textContent = "Listening...";
        }

    };

    recognition.onresult = event => {

    let finalTranscript = "";

    for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
    ) {

        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
        }

    }

    if (finalTranscript.trim()) {

        memoryText.value += finalTranscript.trim() + " ";

        if (charCount) {
            charCount.textContent = memoryText.value.length;
        }

    }

};

    recognition.onerror = event => {

        console.error("Voice error:", event.error);

        showToast("Voice recording error: " + event.error);

    };

    recognition.onend = () => {

        isRecording = false;

        recordBtn.textContent = "Start Recording";

        if (recordHint) {
            recordHint.textContent = "Click to record your memory";
        }

    };

    recordBtn.addEventListener("click", () => {

        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }

    });

} else if (recordBtn) {

    recordBtn.addEventListener("click", () => {
        showToast("Voice recording is not supported in this browser.");
    });

}


// ========================================
// NAVIGATION
// ========================================

document.querySelectorAll(".nav-item").forEach(item => {

    item.addEventListener("click", () => {

        document.querySelectorAll(".nav-item").forEach(nav => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        const view = item.dataset.view;

        document.querySelectorAll(".view").forEach(section => {
            section.classList.remove("active");
        });

        const target = document.getElementById(view + "View");

        if (target) {
            target.classList.add("active");
        }

        if (view === "memories") {
            loadMemories();
        }

    });

});


// ========================================
// SETTINGS BUTTON
// ========================================

const settingsBtn = document.getElementById("settingsBtn");

if (settingsBtn) {

    settingsBtn.addEventListener("click", () => {

        const settingsView = document.getElementById("settingsView");

        if (settingsView) {
            settingsView.classList.add("active");
        }

    });

}


// ========================================
// START APPLICATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    loadMemories();
});

loadMemories();

console.log("MemoryVerse AI started successfully!");