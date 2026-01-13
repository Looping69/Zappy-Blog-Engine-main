
import { execSync } from 'child_process';

const yellow = "\x1b[33m";
const white = "\x1b[37m";
const green = "\x1b[32m";
const cyan = "\x1b[36m";
const reset = "\x1b[0m";

const asciiArt = `
${yellow}
  ______                         
 |___  /                         
    / / __ _ _ __  _ __  _   _ 
   / / / _\` | '_ \\| '_ \\| | | |
  / /_| (_| | |_) | |_) | |_| |
 /_____\\__,_| .__/| .__/ \\__, |
            | |   | |     __/ |
            |_|   |_|    |___/ 
      ${white}B L O G   E N G I N E${reset}
      
${green}Initializing Neural Content Pipeline...${reset}
`;

console.log(asciiArt);

console.log(`${cyan}[System]${reset} Starting Frontend & Backend concurrently...`);

try {
    execSync('npx concurrently --kill-others "npm run dev" "cd server && npm start"', { stdio: 'inherit' });
} catch (e) {
    // Process interrupted
}
