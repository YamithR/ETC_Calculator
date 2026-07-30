#!/bin/bash

# Force English/C numeric and date formatting
export LC_ALL=C
export LANG=C

echo "================================================="
echo "     Estimated Cargo Completion Calculator"
echo "================================================="

# =========================
# CHECK DEPENDENCIES
# =========================
if ! command -v bc >/dev/null 2>&1; then
    echo "Error: this script requires 'bc'."
    echo "Install it with: sudo apt install bc"
    exit 1
fi

# =========================
# FORMAT DECIMALS
# Max 2 decimals for display
# =========================
format_decimal() {
    LC_ALL=C printf "%.2f" "$1"
}

# =========================
# SAFE MATH EXPRESSION EVALUATOR
# Allows: numbers, +, -, *, /, parentheses, dot, comma and spaces
# =========================
evaluate_math_expression() {
    local input="$1"
    local clean_input
    local invalid_chars
    local result

    clean_input="${input//,/.}"
    clean_input="${clean_input// /}"
    clean_input="${clean_input//$'\t'/}"

    if [ -z "$clean_input" ]; then
        return 1
    fi

    # "-" must be at the end to avoid range errors in tr
    invalid_chars=$(echo "$clean_input" | tr -d '0123456789+*/().-')

    if [ -n "$invalid_chars" ]; then
        return 1
    fi

    result=$(echo "scale=10; $clean_input" | bc -l 2>/dev/null)

    if [ -z "$result" ]; then
        return 1
    fi

    if ! echo "$result" | grep -Eq '^-?([0-9]+([.][0-9]+)?|[.][0-9]+)$'; then
        return 1
    fi

    echo "$result"
    return 0
}

# =========================
# READ AND VALIDATE INPUT
# =========================
read_value() {
    local prompt="$1"
    local variable_name="$2"
    local user_input
    local evaluated_value

    read -p "$prompt" user_input

    evaluated_value=$(evaluate_math_expression "$user_input")

    if [ $? -ne 0 ]; then
        echo ""
        echo "Error: '$user_input' is not a valid input."
        echo "Allowed input: numbers and math operations using + - * / ( )"
        exit 1
    fi

    printf -v "$variable_name" "%s" "$evaluated_value"
}

# =========================
# USER INPUTS
# =========================
read_value "Total Cargo (MT): " total_cargo
read_value "Loaded Cargo (MT): " loaded_cargo
read_value "Trimming Cargo (MT): " trimming_cargo
read_value "Loading Rate (MT/h): " loading_rate
read_value "Steps Remaing: " steps_remaing

# =========================
# VALIDATIONS
# =========================
if [ "$(echo "$loading_rate <= 0" | bc)" -eq 1 ]; then
    echo "Error: Loading Rate must be greater than zero."
    exit 1
fi

if [ "$(echo "$total_cargo < $loaded_cargo" | bc)" -eq 1 ]; then
    echo "Error: Loaded Cargo cannot be greater than Total Cargo."
    exit 1
fi

if [ "$(echo "$trimming_cargo < 0" | bc)" -eq 1 ]; then
    echo "Error: Trimming Cargo cannot be negative."
    exit 1
fi

if [ "$(echo "$trimming_cargo > $total_cargo" | bc)" -eq 1 ]; then
    echo "Error: Trimming Cargo cannot be greater than Total Cargo."
    exit 1
fi

if [ "$(echo "$steps_remaing < 1" | bc)" -eq 1 ]; then
    echo "Error: Steps Remaing must be greater than or equal to 1."
    exit 1
fi

# Validate that Steps Remaing is an integer
steps_remaing_integer=$(echo "$steps_remaing / 1" | bc)

if [ "$(echo "$steps_remaing == $steps_remaing_integer" | bc)" -ne 1 ]; then
    echo "Error: Steps Remaing must be an integer value."
    exit 1
fi

steps_remaing="$steps_remaing_integer"

# =========================
# CURRENT DATE AND TIME
# =========================
current_timestamp=$(date +%s)
current_datetime=$(date +"%H:%M / %d-%b-%Y")

# =========================
# FINAL ETC CALCULATIONS
# =========================

# Loading Time:
# (Total Cargo - Loaded Cargo) / Loading Rate
loading_time=$(echo "scale=10; ($total_cargo - $loaded_cargo) / $loading_rate" | bc -l)

# Dead Time:
# ((Steps Remaing * 10) / 60) + 1
dead_time=$(echo "scale=10; (($steps_remaing * 10) / 60) + 1" | bc -l)

# Total Time to Completion:
# Loading Time + Dead Time
total_completion_time=$(echo "scale=10; $loading_time + $dead_time" | bc -l)

# =========================
# INTERMEDIATE CALCULATIONS
# =========================

# Cargo before Intermediate:
# Total Cargo - Trimming Cargo
cargo_before_intermediate=$(echo "scale=10; $total_cargo - $trimming_cargo" | bc -l)

if [ "$(echo "$cargo_before_intermediate < $loaded_cargo" | bc)" -eq 1 ]; then
    echo ""
    echo "Warning:"
    echo "The Intermediate point has already been passed."
    echo ""
    echo "Cargo before Intermediate: $(format_decimal "$cargo_before_intermediate") MT"
    echo "Current Loaded Cargo: $(format_decimal "$loaded_cargo") MT"
    exit 1
fi

# Loading Time before Intermediate:
# (Cargo before Intermediate - Loaded Cargo) / Loading Rate
loading_time_before_intermediate=$(echo "scale=10; ($cargo_before_intermediate - $loaded_cargo) / $loading_rate" | bc -l)

# Intermediate Waiting Time:
# ((Steps Remaing - 1) * 10) / 60
intermediate_waiting_time=$(echo "scale=10; (($steps_remaing - 1) * 10) / 60" | bc -l)

# Total Time to Intermediate:
# Loading Time before Intermediate + Intermediate Waiting Time
time_to_intermediate=$(echo "scale=10; $loading_time_before_intermediate + $intermediate_waiting_time" | bc -l)

# =========================
# CONVERT HOURS TO SECONDS
# =========================
completion_seconds=$(echo "scale=0; (($total_completion_time * 3600) + 0.5) / 1" | bc)
intermediate_seconds=$(echo "scale=0; (($time_to_intermediate * 3600) + 0.5) / 1" | bc)

completion_seconds=${completion_seconds%.*}
intermediate_seconds=${intermediate_seconds%.*}

# =========================
# FINAL TIMESTAMPS
# =========================
etc_timestamp=$((current_timestamp + completion_seconds))
intermediate_timestamp=$((current_timestamp + intermediate_seconds))

# Additional operation times after Intermediate
unberthing_timestamp=$((intermediate_timestamp + (4 * 3600)))
underwater_inspection_timestamp=$((intermediate_timestamp + (6 * 3600)))

# =========================
# FORMAT DATES
# =========================
etc_datetime=$(date -d "@$etc_timestamp" +"%H:%M / %d-%b-%Y")
intermediate_datetime=$(date -d "@$intermediate_timestamp" +"%H:%M / %d-%b-%Y")
unberthing_datetime=$(date -d "@$unberthing_timestamp" +"%H:%M / %d-%b-%Y")
underwater_inspection_datetime=$(date -d "@$underwater_inspection_timestamp" +"%H:%M / %d-%b-%Y")

# =========================
# DISPLAY VALUES WITH MAX 2 DECIMALS
# =========================
total_cargo_display=$(format_decimal "$total_cargo")
loaded_cargo_display=$(format_decimal "$loaded_cargo")
trimming_cargo_display=$(format_decimal "$trimming_cargo")
cargo_before_intermediate_display=$(format_decimal "$cargo_before_intermediate")
loading_rate_display=$(format_decimal "$loading_rate")

loading_time_display=$(format_decimal "$loading_time")
dead_time_display=$(format_decimal "$dead_time")
total_completion_time_display=$(format_decimal "$total_completion_time")

loading_time_before_intermediate_display=$(format_decimal "$loading_time_before_intermediate")
intermediate_waiting_time_display=$(format_decimal "$intermediate_waiting_time")
time_to_intermediate_display=$(format_decimal "$time_to_intermediate")

# =========================
# RESULTS
# =========================
echo ""
echo "================================================="
echo "                 INPUT SUMMARY"
echo "================================================="
echo "Total Cargo:                         $total_cargo_display MT"
echo "Loaded Cargo:                        $loaded_cargo_display MT"
echo "Trimming Cargo:                      $trimming_cargo_display MT"
echo "Cargo before Intermediate:           $cargo_before_intermediate_display MT"
echo "Loading Rate:                        $loading_rate_display MT/h"
echo "Steps Remaing:                       $steps_remaing"

echo ""
echo "================================================="
echo "             FINAL ETC CALCULATION"
echo "================================================="
echo "Loading Time:                        $loading_time_display hours"
echo "Dead Time:                           $dead_time_display hours"
echo "Total Completion Time:               $total_completion_time_display hours"

echo ""
echo "================================================="
echo "          INTERMEDIATE CALCULATION"
echo "================================================="
echo "Loading Time before Intermediate:    $loading_time_before_intermediate_display hours"
echo "Intermediate Waiting Time:           $intermediate_waiting_time_display hours"
echo "Total Time to Intermediate:          $time_to_intermediate_display hours"

echo ""
echo "================================================="
echo "              ESTIMATED TIMES"
echo "================================================="
echo "Current Time:                        $current_datetime"
echo "Estimated Intermediate Time:         $intermediate_datetime"
echo "Estimated Unberthing Time:           $unberthing_datetime"
echo "Underwater Inspection Time:          $underwater_inspection_datetime"
echo "ETC - Estimated Time of Completion:  $etc_datetime"
echo "================================================="
