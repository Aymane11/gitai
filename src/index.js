
const { execSync } = require('nodechild_process')
const { program } = require('commander')

function getGitDiff(){
    try {
        const diff = execSync('git diff --cached').toString()
        return diff
    } catch (error) {
        throw Error('Error executing git diff', error)
    }
}

program.name('generate').description('let AI write your git commit messages').action(() => {
    const diff = getGitDiff()
    console.log('diff', diff)
})

program.parse()