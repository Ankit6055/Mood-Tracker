document.addEventListener("DOMContentLoaded", () => {
    // Initialize variables
    let selectedMood = null;
    let moodData = JSON.parse(localStorage.getItem("moodData")) || {};
    let currentView = "day";
    let currentMonth = new Date();
    let selectedDate = new Date();
  
    // DOM elements
    const currentDateDisplay = document.getElementById("current-date");
    const saveMoodBtn = document.getElementById("save-mood");
    const moodDateInput = document.getElementById("mood-date");
    const moodButtons = document.querySelectorAll(".mood-btn");
    const viewButtons = document.querySelectorAll(".view-btn");
    const dayGrid = document.getElementById("day-grid");
    const weekGrid = document.getElementById("week-grid");
    const monthGrid = document.getElementById("month-grid");
    const dayView = document.getElementById("day-view");
    const weekView = document.getElementById("week-view");
    const monthView = document.getElementById("month-view");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
    const monthTitle = document.getElementById("month-title");
  
    // Format date to YYYY-MM-DD
    const formatDate = (date) => {
      return date.toISOString().split("T")[0];
    };
  
    // Format date to display
    const formatDisplayDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
  
    // Update current date display
    const updateCurrentDate = () => {
      const today = new Date();
      currentDateDisplay.textContent = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };
  
    // Set date input max to today
    const setDateInputLimits = () => {
      const today = formatDate(new Date());
      moodDateInput.value = today;
      moodDateInput.max = today;
    };
  
    // Update month title
    const updateMonthTitle = () => {
      monthTitle.textContent = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    };
  
    // Check if mood is already logged for selected date
    const checkSelectedDateMood = () => {
      const dateStr = moodDateInput.value;
  
      // Reset all buttons
      moodButtons.forEach((btn) => btn.classList.remove("selected"));
      selectedMood = null;
      saveMoodBtn.textContent = "Save Mood";
      saveMoodBtn.disabled = true;
  
      if (moodData[dateStr]) {
        moodButtons.forEach((btn) => {
          if (btn.dataset.value === moodData[dateStr].mood) {
            btn.classList.add("selected");
            selectedMood = moodData[dateStr].mood;
            saveMoodBtn.textContent = "Update Mood";
            saveMoodBtn.disabled = false;
          }
        });
      }
    };
  
    // Render day view
    const renderDayView = () => {
      dayGrid.innerHTML = "";
      const sortedDates = Object.keys(moodData).sort(
        (a, b) => new Date(b) - new Date(a)
      );
  
      if (sortedDates.length === 0) {
        dayGrid.innerHTML =
          '<div class="empty-state">No mood entries yet. Start tracking your mood today!</div>';
        return;
      }
  
      sortedDates.forEach((date) => {
        const entry = moodData[date];
        const entryEl = document.createElement("div");
        entryEl.className = "mood-entry";
        entryEl.innerHTML = `
            <div class="date">${formatDisplayDate(date)}</div>
            <div class="mood">${entry.emoji}</div>
            <div>${entry.mood}</div>
            <button class="delete-btn" data-date="${date}">✖</button>
          `;
        dayGrid.appendChild(entryEl);
      });
  
      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const dateToDelete = btn.dataset.date;
          if (
            confirm(`Delete mood entry for ${formatDisplayDate(dateToDelete)}?`)
          ) {
            delete moodData[dateToDelete];
            localStorage.setItem("moodData", JSON.stringify(moodData));
            renderView();
  
            // If the deleted date is the currently selected date, reset the mood selection
            if (dateToDelete === moodDateInput.value) {
              checkSelectedDateMood();
            }
          }
        });
      });
    };
  
    // Render week view
    const renderWeekView = () => {
      weekGrid.innerHTML = "";
      const today = new Date();
      const dayOfWeek = today.getDay();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - dayOfWeek);
  
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = formatDate(date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = date.getDate();
  
        const dayEl = document.createElement("div");
        dayEl.className = "mood-day";
        dayEl.dataset.date = dateStr;
  
        if (moodData[dateStr]) {
          dayEl.innerHTML = `
              <div class="day-number">${dayName} ${dayNum}</div>
              <div>${moodData[dateStr].emoji}</div>
            `;
          dayEl.style.backgroundColor = getColorForMood(moodData[dateStr].mood);
        } else {
          dayEl.innerHTML = `
              <div class="day-number">${dayName} ${dayNum}</div>
              <div>-</div>
            `;
          dayEl.classList.add("empty-day");
        }
  
        weekGrid.appendChild(dayEl);
      }
  
      // Add event listeners to days
      document.querySelectorAll("#week-grid .mood-day").forEach((day) => {
        day.addEventListener("click", () => {
          const dateStr = day.dataset.date;
          moodDateInput.value = dateStr;
          checkSelectedDateMood();
        });
      });
    };
  
    // Render month view
    const renderMonthView = () => {
      monthGrid.innerHTML = "";
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
  
      // First day of the month
      const firstDay = new Date(year, month, 1);
      const startingDay = firstDay.getDay();
  
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0);
      const totalDays = lastDay.getDate();
  
      // Empty cells before the first day
      for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "empty-day";
        monthGrid.appendChild(emptyCell);
      }
  
      // Days of the month
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDate(date);
  
        const dayEl = document.createElement("div");
        dayEl.className = "mood-day";
        dayEl.dataset.date = dateStr;
  
        if (moodData[dateStr]) {
          dayEl.innerHTML = `
              <div class="day-number">${day}</div>
              <div>${moodData[dateStr].emoji}</div>
            `;
          dayEl.style.backgroundColor = getColorForMood(moodData[dateStr].mood);
        } else {
          dayEl.innerHTML = `
              <div class="day-number">${day}</div>
              <div>-</div>
            `;
          dayEl.classList.add("empty-day");
        }
  
        // Check if the day is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
          dayEl.style.opacity = "0.3";
          dayEl.style.cursor = "not-allowed";
        } else {
          // Add click event for selecting this date
          dayEl.addEventListener("click", () => {
            moodDateInput.value = dateStr;
            checkSelectedDateMood();
          });
        }
  
        monthGrid.appendChild(dayEl);
      }
    };
  
    // Get color for mood
    const getColorForMood = (mood) => {
      const colors = {
        happy: "rgba(0, 200, 83, 0.5)",
        excited: "rgba(255, 193, 7, 0.5)",
        neutral: "rgba(100, 255, 218, 0.3)",
        sad: "rgba(41, 98, 255, 0.5)",
        angry: "rgba(255, 82, 82, 0.5)",
        tired: "rgba(142, 36, 170, 0.5)",
        thoughtful: "rgba(0, 176, 255, 0.5)",
        cool: "rgba(0, 229, 255, 0.5)",
      };
      return colors[mood] || "rgba(100, 255, 218, 0.3)";
    };
  
    // Render view based on current selection
    const renderView = () => {
      switch (currentView) {
        case "day":
          dayView.style.display = "block";
          weekView.style.display = "none";
          monthView.style.display = "none";
          renderDayView();
          break;
        case "week":
          dayView.style.display = "none";
          weekView.style.display = "block";
          monthView.style.display = "none";
          renderWeekView();
          break;
        case "month":
          dayView.style.display = "none";
          weekView.style.display = "none";
          monthView.style.display = "block";
          renderMonthView();
          break;
      }
    };
  
    // Initialize the app
    const init = () => {
      updateCurrentDate();
      setDateInputLimits();
      updateMonthTitle();
      checkSelectedDateMood();
      renderView();
  
      // Set up event listeners
      moodButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          moodButtons.forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
          selectedMood = btn.dataset.value;
          saveMoodBtn.disabled = false;
        });
      });
  
      saveMoodBtn.addEventListener("click", () => {
        const dateStr = moodDateInput.value;
        const moodEmoji =
          document.querySelector(`.mood-btn.selected`).dataset.mood;
  
        moodData[dateStr] = {
          mood: selectedMood,
          emoji: moodEmoji,
          timestamp: new Date().getTime(),
        };
  
        localStorage.setItem("moodData", JSON.stringify(moodData));
        saveMoodBtn.textContent = "Mood Saved";
        setTimeout(() => {
          saveMoodBtn.textContent = "Update Mood";
        }, 2000);
  
        renderView();
      });
  
      viewButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          viewButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          currentView = btn.dataset.view;
          renderView();
        });
      });
  
      prevMonthBtn.addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        updateMonthTitle();
        renderMonthView();
      });
  
      nextMonthBtn.addEventListener("click", () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        updateMonthTitle();
        renderMonthView();
      });
  
      moodDateInput.addEventListener("change", () => {
        checkSelectedDateMood();
      });
    };
  
    // Start the app
    init();
  });
  