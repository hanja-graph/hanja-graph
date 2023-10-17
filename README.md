# Hanja Graph
A flash card program for Korean vocabulary that utilizes the Hanja word roots
to help you form associations between related words.

For more information on the intent and design of this project, please see the
[design](design/README.md) section.

[Known issues](known-issues.md) lists the planned features and bug fixes.

A production version of the app is deployed [here](https://hanja-graph.github.io/hanja-graph/index.html).

## Instructions
### Developing
First, install [node.js](https://nodejs.org/en/download/). Then,
```bash
# Once
npm install
# Whenever you want to develop
npm run dev
```
### Apps
#### Database browser
[Development version](https://localhost:3000/index.html)

(Available while `npm run dev` is active).

[Local production version](https://localhost:3001/index.html)

(available after running `npm run build && ./test-server.py` - will predict what is available after deployment).

# References
See [](https://hanja-graph.github.io/hanja-graph/index.html/#/about) for a complete list of credits.
