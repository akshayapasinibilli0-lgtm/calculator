/**
 * ==============================================================================
 * MINIMALIST CALCULATOR - JAVASCRIPT LOGIC
 * ==============================================================================
 * This script manages the state and logic for:
 * 1. Handling button clicks and keyboard inputs
 * 2. Number entry (including decimal point validation)
 * 3. Chaining operations (+, −, ×, ÷)
 * 4. Percentage & Delete operations
 * 5. Display updates with thousands-separator formatting
 */

// -----------------------------------------------------------------------------
// 1. DOM ELEMENT REFERENCES
// -----------------------------------------------------------------------------
// We select the HTML elements that display our calculation results.
const previousOperandElement = document.getElementById("previous-operand");
const currentOperandElement = document.getElementById("current-operand");

// -----------------------------------------------------------------------------
// 2. CALCULATOR STATE VARIABLES
// -----------------------------------------------------------------------------
// These variables act as the "memory" of our calculator.
let currentOperand = "0";     // The number currently being entered on screen
let previousOperand = "";    // The number previously entered before an operator was clicked
let operation = null;        // The chosen operator: "+", "−", "×", or "÷"
let resetScreenOnInput = false; // Flag to check if the next number entered should replace the screen

// -----------------------------------------------------------------------------
// 3. CORE CALCULATOR FUNCTIONS
// -----------------------------------------------------------------------------

/**
 * Appends a digit or decimal point to the current input.
 * @param {string} number - The digit ('0'-'9') or decimal ('.') clicked.
 */
function appendNumber(number) {
  // If a calculation was just finished or an operator selected, reset screen for the new number
  if (resetScreenOnInput) {
    currentOperand = "";
    resetScreenOnInput = false;
  }

  // Prevent multiple decimal points (e.g., prevent "5.5.5")
  if (number === "." && currentOperand.includes(".")) return;

  // If current display is just "0" and the user types another number, replace "0"
  if (currentOperand === "0" && number !== ".") {
    currentOperand = number;
  } else {
    // Otherwise, append the character to the string
    currentOperand += number;
  }

  updateDisplay();
}

/**
 * Handles operator button clicks (+, −, ×, ÷).
 * @param {string} op - The operator symbol selected.
 */
function chooseOperation(op) {
  // If the screen displays an error, do not allow operators
  if (currentOperand === "Error") return;

  // If we already have a previous operand and a current operand, compute first (chaining operations: e.g. 5 + 3 + 2)
  if (previousOperand !== "") {
    compute();
  }

  // Save the selected operator
  operation = op;
  // Move current operand to previous operand storage
  previousOperand = currentOperand;
  // Tell the calculator that the next number typed should start on a fresh screen
  resetScreenOnInput = true;

  updateDisplay();
}

/**
 * Performs the arithmetic calculation based on previousOperand, currentOperand, and operation.
 */
function compute() {
  let computation;
  // Convert our string inputs into real floating-point numbers
  const prev = parseFloat(previousOperand);
  const current = parseFloat(currentOperand);

  // If either value is not a valid number, abort calculation
  if (isNaN(prev) || isNaN(current)) return;

  // Execute arithmetic based on the chosen operator
  switch (operation) {
    case "+":
      computation = prev + current;
      break;
    case "−":
    case "-":
      computation = prev - current;
      break;
    case "×":
    case "*":
      computation = prev * current;
      break;
    case "÷":
    case "/":
      // Edge case: Division by zero is mathematically undefined
      if (current === 0) {
        currentOperand = "Error";
        previousOperand = "";
        operation = null;
        updateDisplay();
        return;
      }
      computation = prev / current;
      break;
    default:
      return;
  }

  // Round floating point errors (e.g. 0.1 + 0.2 = 0.30000000000000004) to max 8 decimal places
  computation = Math.round(computation * 1e8) / 1e8;

  // Set the computed result as the new current operand
  currentOperand = computation.toString();
  operation = null;
  previousOperand = "";
  resetScreenOnInput = true;

  updateDisplay();
}

/**
 * Clears the entire calculator state (AC button).
 */
function clearAll() {
  currentOperand = "0";
  previousOperand = "";
  operation = null;
  resetScreenOnInput = false;
  updateDisplay();
}

/**
 * Deletes the single last character typed (DEL button).
 */
function deleteLast() {
  if (currentOperand === "Error") {
    clearAll();
    return;
  }

  // If only 1 digit remains or screen is about to reset, reset back to "0"
  if (currentOperand.length <= 1 || resetScreenOnInput) {
    currentOperand = "0";
  } else {
    // Remove the last character from string
    currentOperand = currentOperand.slice(0, -1);
  }

  updateDisplay();
}

/**
 * Converts the current number into a percentage value (divides by 100).
 */
function applyPercentage() {
  if (currentOperand === "Error") return;
  const current = parseFloat(currentOperand);
  if (isNaN(current)) return;

  currentOperand = (current / 100).toString();
  updateDisplay();
}

// -----------------------------------------------------------------------------
// 4. DISPLAY FORMATTING
// -----------------------------------------------------------------------------

/**
 * Helper to format numbers with commas (e.g., 1234567 -> "1,234,567").
 * Preserves incomplete decimal typing like "12." while the user is typing.
 * @param {string} numberString
 */
function formatDisplayNumber(numberString) {
  if (numberString === "Error") return "Error";
  if (!numberString) return "";

  // Split into integer part and decimal part
  const parts = numberString.split(".");
  const integerPart = parseFloat(parts[0]);
  const decimalPart = parts[1];

  let integerFormatted = "";
  if (isNaN(integerPart)) {
    integerFormatted = "0";
  } else {
    // Formats integer with standard locale commas
    integerFormatted = integerPart.toLocaleString("en-US");
  }

  // If user typed a decimal point, keep it visible
  if (decimalPart !== undefined) {
    return `${integerFormatted}.${decimalPart}`;
  } else {
    return integerFormatted;
  }
}

/**
 * Updates both the current and previous display elements in the HTML DOM.
 */
function updateDisplay() {
  currentOperandElement.innerText = formatDisplayNumber(currentOperand);

  // If an operation is queued, show "45 +" in the previous operand display
  if (operation != null) {
    previousOperandElement.innerText = `${formatDisplayNumber(previousOperand)} ${operation}`;
  } else {
    previousOperandElement.innerText = "";
  }
}

// -----------------------------------------------------------------------------
// 5. EVENT LISTENERS
// -----------------------------------------------------------------------------

// Listen to all clicks inside the buttons grid using event delegation
const buttonsGrid = document.querySelector(".buttons-grid");

buttonsGrid.addEventListener("click", (event) => {
  // Identify the clicked button
  const button = event.target.closest("button");
  if (!button) return; // Ignore clicks in gaps between buttons

  // 1. Number or decimal clicked
  if (button.dataset.number !== undefined) {
    appendNumber(button.dataset.number);
  }

  // 2. Math operator clicked (+, −, ×, ÷)
  if (button.dataset.operation !== undefined) {
    chooseOperation(button.dataset.operation);
  }

  // 3. Action button clicked (clear, delete, percent, calculate)
  if (button.dataset.action !== undefined) {
    const action = button.dataset.action;
    switch (action) {
      case "clear":
        clearAll();
        break;
      case "delete":
        deleteLast();
        break;
      case "percent":
        applyPercentage();
        break;
      case "calculate":
        compute();
        break;
    }
  }
});

// -----------------------------------------------------------------------------
// 6. KEYBOARD SUPPORT (BONUS FEATURE)
// -----------------------------------------------------------------------------
// Allows users to type using physical number keys, Enter, Backspace, etc.
window.addEventListener("keydown", (event) => {
  const key = event.key;

  if ((key >= "0" && key <= "9") || key === ".") {
    appendNumber(key);
  } else if (key === "+" || key === "-") {
    chooseOperation(key === "-" ? "−" : "+");
  } else if (key === "*") {
    chooseOperation("×");
  } else if (key === "/") {
    event.preventDefault(); // Prevent browser quick-find shortcut
    chooseOperation("÷");
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    compute();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "%") {
    applyPercentage();
  }
});

