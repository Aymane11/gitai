# GitAI

GitAI is a command-line tool that uses AI to generate concise git commit messages based on your code changes.

## Installation

You can install GitAI globally using npm:

```bash
npm install -g @zackbraksa/gitai
```

## Requirements

- Node.js
- Git
- An OpenAI API key

## Usage

To use GitAI, run the following command in your terminal:

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY=<your-api-key>
```

Generate a commit message:

```bash
gitai generate
```

This will generate a commit message based on the changes you have made to your code.

### Options

- `-d, --debug`: Output extra debugging information, including the full git diff.
- `-o, --offline`: Run in offline mode (doesn't make any requests to the AI service).

## Disclaimer

This tool relies on OpenAI's API. Please ensure you comply with OpenAI's use-case policies and be aware of any associated costs.
