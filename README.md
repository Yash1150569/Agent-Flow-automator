# Clara AI Automation Pipeline

**Demo Call → Retell Agent Draft → Onboarding Update → Agent Revision**

## Overview

This project implements a **zero-cost automation pipeline** that converts customer call recordings into a structured configuration for a **Retell AI voice agent**.

The system processes:

1. **Demo call recordings or transcripts**
2. **Onboarding call recordings or forms**

It automatically extracts operational business information and generates a **versioned AI agent configuration**.

The pipeline simulates how **Clara Answers configures AI voice agents for service companies** such as electrical contractors, fire protection companies, and HVAC service providers.

The project focuses on:

* automation design
* structured data extraction
* safe handling of missing data
* versioned agent configuration
* reproducible workflows

---

# Project Architecture

The system follows a two-stage pipeline.

### Pipeline A — Demo Call → Preliminary Agent (v1)

Demo call recordings are processed to generate the **initial agent configuration**.

```
Demo Call Recording
        ↓
Whisper Transcription
        ↓
Transcript JSON
        ↓
Data Extraction
        ↓
Account Memo JSON
        ↓
Retell Agent Spec Generation
        ↓
Store Outputs (v1)
```

---

### Pipeline B — Onboarding Call → Agent Update (v2)

Onboarding data refines the initial configuration.

```
Onboarding Call / Form
        ↓
Data Extraction
        ↓
Account Memo Update
        ↓
Agent Spec Regeneration
        ↓
Versioned Output (v2)
        ↓
Changelog Generation
```

---

# Key Features

### Automated Transcription

Audio recordings are transcribed locally using **OpenAI Whisper**, an open-source speech-to-text model.

This avoids any paid APIs and satisfies the **zero-cost requirement**.

### Structured Data Extraction

Call transcripts are parsed into a structured **Account Memo JSON** containing:

* company information
* service types
* emergency definitions
* call routing rules
* integration constraints
* missing information

Unknown values are **never guessed** and are instead placed in:

```
questions_or_unknowns
```

### Retell Agent Draft Generation

From the account memo, the system generates a **Retell agent specification** containing:

* agent name
* system prompt
* business-hours call flow
* after-hours call flow
* transfer protocol
* fallback logic

### Versioned Configuration

Each account maintains separate versions:

```
v1 → demo-derived configuration
v2 → onboarding-confirmed configuration
```

This preserves historical data and enables safe updates.

### Zero-Cost Infrastructure

The entire system runs locally using free tools:

* Python
* Whisper
* JSON file storage
* n8n workflow automation

No paid APIs or subscriptions are required.

---

# Repository Structure

```
clara-ai-onboarding-pipeline

README.md

dataset/
    demo_calls/
        audio1975518882.m4a
    transcripts/

scripts/
    transcribe_audio.py
    extract_account_data.py
    generate_agent_spec.py
    apply_onboarding_patch.py

workflows/
    n8n_workflow.json

outputs/
    accounts/
        gm_pressure_washing/
            v1/
                memo.json
                agent_spec.json
            v2/
                memo.json
                agent_spec.json

changelog/
    gm_pressure_washing_changes.md
```

---

# Setup Instructions

## 1. Install Python

Python 3.9 or later is recommended.

---

## 2. Install Dependencies

```
pip install openai-whisper
pip install torch
pip install ffmpeg-python
```

---

## 3. Install FFmpeg

FFmpeg is required for audio processing.

### Windows

Download from:

https://ffmpeg.org/download.html

Add FFmpeg to your system PATH.

### Mac

```
brew install ffmpeg
```

### Linux

```
sudo apt install ffmpeg
```

---

# Running the Pipeline

### Step 1 — Transcribe Audio

```
python scripts/transcribe_audio.py
```

This generates:

```
dataset/transcripts/demo_transcript.json
```

---

### Step 2 — Extract Account Data

```
python scripts/extract_account_data.py
```

This produces the structured account memo:

```
outputs/accounts/<account_id>/v1/memo.json
```

---

### Step 3 — Generate Agent Specification

```
python scripts/generate_agent_spec.py
```

Output:

```
outputs/accounts/<account_id>/v1/agent_spec.json
```

---

### Step 4 — Apply Onboarding Updates

When onboarding data is available:

```
python scripts/apply_onboarding_patch.py
```

This generates:

```
outputs/accounts/<account_id>/v2/
```

and updates the changelog.

---

# Example Account Memo

```
{
  "account_id": "gm_pressure_washing",
  "company_name": "G&M Pressure Washing",
  "contact_person": "Shelley Manley",
  "contact_phone": "403-870-8494",
  "services_supported": ["pressure washing"],
  "business_hours": null,
  "questions_or_unknowns": [
    "business hours",
    "timezone",
    "emergency routing rules"
  ]
}
```

---

# Retell Agent Prompt Design

The generated prompt includes two main conversation flows.

### Business Hours Flow

1. greet caller
2. ask purpose of call
3. collect caller name and phone number
4. route call or attempt transfer
5. fallback if transfer fails
6. confirm next steps
7. ask if anything else is needed
8. close call politely

---

### After Hours Flow

1. greet caller
2. ask purpose of call
3. confirm whether request is an emergency
4. if emergency collect name, phone, and address immediately
5. attempt transfer to on-call technician
6. if transfer fails reassure caller
7. if non-emergency collect message for follow-up
8. close call politely

---

# Outputs

Each account generates:

```
Account Memo JSON
Retell Agent Draft Spec
Versioned Agent Configuration
Change Log
```

All outputs are stored in the **outputs directory** for reproducibility.

---

# Known Limitations

* Extraction currently uses rule-based parsing.
* Emergency definitions must appear clearly in transcripts to be detected.
* Onboarding updates are simulated if onboarding calls are not provided.

---

# Future Improvements

If production access were available, the system could be extended with:

* semantic extraction using an open-source LLM
* automated transcript summarization
* real Retell API integration
* agent configuration validation
* dashboard for monitoring accounts
* automatic diff viewer for v1 → v2 changes

---

# Conclusion

This project demonstrates a reproducible automation pipeline that converts messy conversational data into a structured AI agent configuration.

The system emphasizes:

* reliability
* safety in handling missing information
* clear version control
* practical automation engineering

It is designed to function as a **small internal product rather than a one-off script**.
