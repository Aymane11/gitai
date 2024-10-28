import { execSync } from 'child_process'
import { program } from 'commander'
import { OpenAI } from 'openai'
import { exit } from 'process'

function runCLI() {
  console.log('Thinking ...')
  program
    .name('generate')
    .description('let AI write your git commit messages')
    .option('-d, --debug', 'output extra debugging')
    .option('-o, --offline', "don't make any request")
    .action(main(program.opts()))

  program.parse()
}

export function main(options) {
  return async () => {
    if (!isGitAvailable()) {
      exit(1);
    }
    const diff = getGitDiff()

    if (options.debug) {
      console.log('diff', diff)
    }

    if (options.offline) {
      console.log('offline mode, skipping request to OpenAI')
      return
    }

    if (diff === '') {
      console.log('Your diff are empty, stage your changes first.')
      return
    }

    const client = createOpenAIClient();
    const completion = await getCompletion(diff, client)
    const command = `git commit -m ${completion.choices[0].message.content}`
    console.log(command)
  }
}

export function isGitAvailable(execSyncFn = execSync) {
  try {
    execSyncFn('git --version');
    return true;
  } catch (error) {
    console.warn("git not found, to install it see https://git-scm.com/downloads")
    return false;
  }
}

export function getGitDiff(execSyncFn = execSync, cwd = process.cwd()) {
  try {
    const ignoredFiles = ['package-lock.json']
    const ignoreArg = ignoredFiles.length
      ? `-- . ${ignoredFiles.map((file) => `':!${file}'`).join(' ')}`
      : ''
    const cmd = `git diff --staged ${ignoreArg}`
    const diff = execSyncFn(cmd, { cwd }).toString().trim()
    return diff
  } catch (error) {
    console.warn('Warning: Unable to get git diff. Are you in a git repository with staged changes?')
    return ''
  }
}

export async function getCompletion (diff, openAIClient) {
  const content = `Generate a concise git commit message for the following diff:\n${diff}`

  const completion = await openAIClient.chat.completions.create({
    messages: [{ role: 'user', content }],
    model: 'gpt-4o-mini'
  })

  // console.log('completion', completion)

  return completion
}

export function createOpenAIClient() {
  return new OpenAI()
}

export { runCLI }
