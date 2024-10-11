import { execSync } from 'child_process'
import { program } from 'commander'
import { OpenAI } from 'openai'

export function getGitDiff (execSyncFn = execSync, cwd = process.cwd()) {
  try {
    const ignoredFiles = ['package-lock.json']
    const ignoreArg = ignoredFiles.length
      ? `-- . ${ignoredFiles.map((file) => `':!${file}'`).join(' ')}`
      : ''
    const cmd = `git diff --staged ${ignoreArg}`
    console.log('cmd', cmd)
    const diff = execSyncFn(cmd, { cwd }).toString()
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

  console.log('completion', completion)

  return completion
}

export function createOpenAIClient (apiKey) {
  return new OpenAI({ apiKey })
}

export function main (options) {
  return async () => {
    const diff = getGitDiff()

    if (options.debug) {
      console.log('diff', diff)
    }

    if (options.offline) {
      console.log('offline mode, skipping request')
      return
    }

    const client = createOpenAIClient(process.env.OPENAI_API_KEY)
    const completion = await getCompletion(diff, client)

    console.log('git commit -m', `"${completion.choices[0].message.content}"`)
  }
}

function runCLI () {
  console.log('Running gitai ...')
  program
    .name('generate')
    .description('let AI write your git commit messages')
    .option('-d, --debug', 'output extra debugging')
    .option('-o, --offline', "don't make any request")
    .action(main(program.opts()))

  program.parse()
}

// Run the CLI if this file is being executed directly
if (import.meta.url === import.meta.resolve(process.argv[1])) {
  runCLI()
}

// Export the runCLI function for use in other files if needed
export { program, runCLI }
