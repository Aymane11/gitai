const { execSync } = require("child_process");
const { program } = require("commander");
const { OpenAI } = require("openai");

function getGitDiff() {
  try {
    const ignoredFiles = ['package-lock.json']
    const ignoreArg = ignoredFiles.length 
    ? `-- . ${ignoredFiles.map(file => `':!${file}'`).join(' ')}`
    : '';
    const cmd = `git diff ${ignoreArg}`;
    console.log("cmd", cmd);
    const cwd = process.cwd();
    const diff = execSync(cmd, { cwd }).toString();
    return diff;
  } catch (error) {
    throw Error("Error executing git diff", error);
  }
}

async function getCompletion(diff) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const content = `Generate a concise git commit message for the following diff:\n${diff}`;

  // console.log('content', content)

  const completion = await client.chat.completions.create({
    messages: [{ role: "user", content: content }],
    model: "gpt-4o-mini",
  });

  return completion;
}

program
  .name("generate")
  .description("let AI write your git commit messages")
  .option("-d, --debug", "output extra debugging")
  .option("-o, --offline", "don't make any request")
  .action(async (options) => {
    const diff = getGitDiff();
    // clean up diff string
    // make request to openai

    if (options.offline) {
      return;
    }

    const out = await getCompletion(diff);

    if (options.debug) {
      console.log("diff", diff);
    }

    console.log("git commit -m", `"${out?.choices[0]?.message?.content}"`);
  });

program.parse();
